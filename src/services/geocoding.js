import { createRequestLimiter } from './requestLimiter.js'

const defaultNominatimUrl = 'https://nominatim.openstreetmap.org'
const waitForRequestSlot = createRequestLimiter(1000)
const resultsByQuery = new Map()
const addressesByCoordinates = new Map()

function getNominatimBaseUrl() {
  return (import.meta.env.VITE_NOMINATIM_BASE_URL || defaultNominatimUrl).replace(/\/+$/, '')
}

function cacheResult(cache, key, value) {
  if (cache.size >= 128) cache.delete(cache.keys().next().value)
  cache.set(key, value)
  return value
}

function formatReverseAddress(result) {
  const address = result.address || {}
  const street = [address.road, address.house_number].filter(Boolean).join(' ')
  const neighbourhood = address.neighbourhood || address.suburb || address.quarter
  const city = address.city || address.town || address.village || address.municipality
  const locality = city || address.county || address.state
  const parts = [...new Set([street, neighbourhood, locality])].filter(Boolean)
  return parts.length ? parts.join(', ') : result.display_name
}

function normalizeQuery(query) {
  return query.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es')
}

export async function searchOriginResults(address) {
  if (typeof address !== 'string' || address.trim().length < 3) {
    throw new Error('Escribe una dirección de origen más concreta')
  }

  const query = normalizeQuery(address)
  if (resultsByQuery.has(query)) return resultsByQuery.get(query)

  const url = new URL(`${getNominatimBaseUrl()}/search`)
  url.searchParams.set('q', address.trim())
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '5')

  await waitForRequestSlot()
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    referrerPolicy: 'strict-origin-when-cross-origin',
  })
  if (!response.ok) throw new Error(`Nominatim respondió ${response.status}`)

  const results = await response.json()
  if (!Array.isArray(results)) throw new Error('Nominatim devolvió una respuesta no válida')
  const validResults = results.map((result) => {
    const lat = Number(result.lat)
    const lng = Number(result.lon)
    if (!Number.isFinite(lat) || lat < -90 || lat > 90
      || !Number.isFinite(lng) || lng < -180 || lng > 180
      || typeof result.display_name !== 'string' || !result.display_name.trim()) return null
    return { lat, lng, label: result.display_name }
  }).filter(Boolean)

  if (results.length > 0 && validResults.length === 0) {
    throw new Error('Nominatim devolvió coordenadas no válidas')
  }
  return cacheResult(resultsByQuery, query, validResults)
}

export async function reverseGeocodeOrigin({ lat, lng }) {
  if (!Number.isFinite(lat) || lat < -90 || lat > 90
    || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new Error('Selecciona una ubicación válida en el mapa')
  }

  const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`
  if (addressesByCoordinates.has(cacheKey)) return addressesByCoordinates.get(cacheKey)

  const url = new URL(`${getNominatimBaseUrl()}/reverse`)
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lng))
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('zoom', '18')

  await waitForRequestSlot()
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    referrerPolicy: 'strict-origin-when-cross-origin',
  })
  if (!response.ok) throw new Error(`Nominatim respondió ${response.status}`)

  const result = await response.json()
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error('Nominatim devolvió una respuesta no válida')
  }
  const address = formatReverseAddress(result)
  if (typeof address !== 'string' || !address.trim()) {
    const error = new Error('No se encontró una dirección para este punto')
    error.code = 'NO_REVERSE_GEOCODING_RESULT'
    throw error
  }

  return cacheResult(addressesByCoordinates, cacheKey, address.trim())
}
