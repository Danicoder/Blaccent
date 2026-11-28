import { createRequestLimiter } from './requestLimiter.js'

const defaultRouterUrl = 'https://routing.openstreetmap.de/routed-car'
const waitForRequestSlot = createRequestLimiter(1000)

const panoramis = {
  lat: Number(import.meta.env.VITE_PANORAMIS_LAT || 38.3418),
  lng: Number(import.meta.env.VITE_PANORAMIS_LNG || -0.4831),
}

function assertCoordinates(value, name) {
  const lat = value?.lat
  const lng = value?.lng
  if (!Number.isFinite(lat) || lat < -90 || lat > 90
    || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new Error(`Selecciona una ubicacion valida para ${name}`)
  }
}

export async function getRouteDistances({ origin, mode }) {
  assertCoordinates(origin, 'el origen')
  assertCoordinates(panoramis, 'Panoramis')
  if (!['outbound', 'inbound', 'both'].includes(mode)) {
    throw new Error('Selecciona una modalidad de viaje valida')
  }

  const coordinates = mode === 'inbound'
    ? [panoramis, origin]
    : [origin, panoramis]
  if (mode === 'both') coordinates.push(origin)

  const routerUrl = (import.meta.env.VITE_OSRM_BASE_URL || defaultRouterUrl).replace(/\/+$/, '')
  const path = coordinates.map(({ lng, lat }) => `${lng},${lat}`).join(';')
  const url = `${routerUrl}/route/v1/driving/${path}?overview=full&geometries=geojson&steps=false&alternatives=false`

  await waitForRequestSlot()
  const response = await fetch(url)
  if (!response.ok) throw new Error(`OSRM respondio ${response.status}`)

  const result = await response.json()
  if (result.code !== 'Ok' || !Array.isArray(result.routes) || !result.routes[0]) {
    throw new Error('OSRM no encontro una ruta por carretera para esas ubicaciones')
  }

  const route = result.routes[0]
  const expectedLegs = mode === 'both' ? 2 : 1
  if (!Array.isArray(route.legs) || route.legs.length !== expectedLegs
    || route.legs.some((leg) => !Number.isFinite(leg.distance) || leg.distance <= 0)
    || !Array.isArray(route.geometry?.coordinates) || route.geometry.coordinates.length < 2) {
    throw new Error('OSRM devolvio una ruta incompleta')
  }

  return {
    outboundDistanceKm: mode === 'inbound' ? null : route.legs[0].distance / 1000,
    returnDistanceKm: mode === 'inbound'
      ? route.legs[0].distance / 1000
      : mode === 'both' ? route.legs[1].distance / 1000 : null,
    geometry: route.geometry,
  }
}
