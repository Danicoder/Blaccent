import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const allowedEmailDomain = (import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN || 'accenture.com')
  .trim()
  .toLowerCase()

export function isAllowedAccentureEmail(email) {
  if (typeof email !== 'string') return false
  const domain = email.trim().toLowerCase().split('@')[1]
  return Boolean(domain && domain === allowedEmailDomain)
}

export async function signInWithOtp(email) {
  if (!isAllowedAccentureEmail(email)) {
    throw new Error(`Solo se permiten correos @${allowedEmailDomain}`)
  }

const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: siteUrl,
    },
  })
  if (error) throw error
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

function getLocalDemoTrips() {
  const savedTrips = localStorage.getItem('blaccent-demo-trips')
  if (!savedTrips) return []

  const trips = JSON.parse(savedTrips)
  if (!Array.isArray(trips)) {
    throw new Error('Los viajes locales de demostracion no tienen un formato valido')
  }
  return trips
}

function saveLocalDemoTrip(trip) {
  const outbound = trip.mode === 'outbound' || trip.mode === 'both'
  const inbound = trip.mode === 'inbound' || trip.mode === 'both'
  const trips = getLocalDemoTrips()
  const latestCreatedAt = trips.reduce((latest, savedTrip) => {
    const timestamp = Date.parse(savedTrip.created_at || '')
    return Number.isFinite(timestamp) ? Math.max(latest, timestamp) : latest
  }, 0)
  const createdAt = Math.max(Date.now(), latestCreatedAt + 1)
  const demoTrip = {
    id: `demo-${createdAt}-${Math.random().toString(36).slice(2)}`,
    created_at: new Date(createdAt).toISOString(),
    origin: trip.origin.trim(),
    destination: 'Panoramis',
    travel_date: trip.travelDate,
    departure_time: trip.departureTime,
    arrival_time: null,
    return_time: trip.mode === 'both' ? trip.returnTime || null : null,
    mode: trip.mode,
    outbound_seats: outbound ? trip.seats : 0,
    return_seats: inbound ? trip.seats : 0,
    parking: trip.parking,
    distance_km: trip.distanceKm ?? trip.distance_km ?? null,
    outbound_distance_km: trip.outboundDistanceKm ?? trip.outbound_distance_km ?? null,
    return_distance_km: trip.returnDistanceKm ?? trip.return_distance_km ?? null,
  }
  trips.push(demoTrip)
  localStorage.setItem('blaccent-demo-trips', JSON.stringify(trips))
  return demoTrip
}

export async function publishTrip(trip) {
  if (!trip.origin?.trim()) throw new Error('Indica el origen')
  if (!trip.travelDate) throw new Error('Indica la fecha')
  if (!trip.departureTime) throw new Error('Indica la hora de salida')
  if (!Number.isInteger(trip.seats) || trip.seats < 1) {
    throw new Error('Indica al menos una plaza')
  }

  const mode = trip.mode
  const outbound = mode === 'outbound' || mode === 'both'
  const inbound = mode === 'inbound' || mode === 'both'

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!sessionData.session) {
    if (import.meta.env.DEV) return saveLocalDemoTrip(trip)
    throw new Error('Debes iniciar sesion')
  }

  const { data, error } = await supabase
    .from('trips')
    .insert({
      origin: trip.origin.trim(),
      destination: 'Panoramis',
      travel_date: trip.travelDate,
      departure_time: trip.departureTime,
      arrival_time: trip.arrivalTime || null,
      return_time: trip.returnTime || null,
      mode,
      seats: trip.seats,
      outbound_seats: outbound ? trip.seats : 0,
      return_seats: inbound ? trip.seats : 0,
      parking: trip.parking,
      distance_km: trip.distanceKm ?? trip.distance_km ?? null,
      outbound_distance_km: trip.outboundDistanceKm ?? trip.outbound_distance_km ?? null,
      return_distance_km: trip.returnDistanceKm ?? trip.return_distance_km ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getPublishedTrips() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!sessionData.session) {
    if (import.meta.env.DEV) {
      return getLocalDemoTrips()
        .sort((left, right) => {
          const leftCreatedAt = Date.parse(left.created_at || '') || 0
          const rightCreatedAt = Date.parse(right.created_at || '') || 0
          return rightCreatedAt - leftCreatedAt
        })
    }
    throw new Error('Debes iniciar sesion')
  }

  const { data, error } = await supabase
    .from('trips')
    .select('id, origin, destination, travel_date, departure_time, arrival_time, return_time, mode, outbound_seats, return_seats, parking, distance_km, outbound_distance_km, return_distance_km, created_at')
    .eq('destination', 'Panoramis')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function searchTrips({ origin, travelDate }) {
  if (!origin?.trim()) throw new Error('Indica el origen')
  if (!travelDate) throw new Error('Indica la fecha')

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!sessionData.session) {
    if (import.meta.env.DEV) {
      return getLocalDemoTrips()
        .filter((trip) => trip.travel_date === travelDate
          && trip.origin.toLowerCase().includes(origin.trim().toLowerCase()))
        .sort((left, right) => left.departure_time.localeCompare(right.departure_time))
    }
    throw new Error('Debes iniciar sesion')
  }

  const { data, error } = await supabase
    .from('trips')
    .select('id, origin, destination, travel_date, departure_time, arrival_time, return_time, mode, outbound_seats, return_seats, parking, distance_km, outbound_distance_km, return_distance_km, created_at')
    .eq('destination', 'Panoramis')
    .eq('travel_date', travelDate)
    .ilike('origin', `%${origin.trim()}%`)
    .order('departure_time', { ascending: true })

  if (error) throw error
  return data
}

// Comprueba que el proyecto responde y acepta la clave pública, sin depender de ninguna tabla.
export async function checkSupabaseConnection() {
  const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
    headers: { apikey: supabaseAnonKey },
  })
  if (!response.ok) throw new Error(`Supabase respondió ${response.status}`)
}

const demoOriginFavoritesKey = 'blaccent-demo-origin-favorites'

function getDemoOriginFavorites() {
  const favorites = JSON.parse(localStorage.getItem(demoOriginFavoritesKey) || '[]')
  if (!Array.isArray(favorites)) {
    throw new Error('Los favoritos locales no tienen un formato válido')
  }
  return favorites
}

function saveDemoOriginFavorites(favorites) {
  localStorage.setItem(demoOriginFavoritesKey, JSON.stringify(favorites))
  return favorites
}

async function getFavoritesSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  if (data.session) return data.session
  if (import.meta.env.DEV) return null
  throw new Error('Debes iniciar sesión para gestionar tus ubicaciones favoritas')
}

export async function getOriginFavorites() {
  const session = await getFavoritesSession()
  if (!session) return getDemoOriginFavorites()

  const { data, error } = await supabase
    .from('origin_favorites')
    .select('id, label, address, lat, lng, created_at')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function saveOriginFavorite({ label, address, lat, lng }) {
  const normalizedLabel = label?.trim()
  const normalizedAddress = address?.trim()
  if (!normalizedLabel) throw new Error('Indica un nombre para la ubicación favorita')
  if (!normalizedAddress) throw new Error('Indica una dirección para la ubicación favorita')
  if (normalizedLabel.length > 60) throw new Error('El nombre del favorito no puede superar 60 caracteres')
  if (normalizedAddress.length > 300) throw new Error('La dirección del favorito no puede superar 300 caracteres')
  if (!Number.isFinite(lat) || lat < -90 || lat > 90
    || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new Error('Selecciona una ubicación válida en el mapa')
  }

  const session = await getFavoritesSession()
  if (!session) {
    const favorites = getDemoOriginFavorites()
    const favorite = {
      id: `demo-favorite-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      label: normalizedLabel,
      address: normalizedAddress,
      lat,
      lng,
      created_at: new Date().toISOString(),
    }
    saveDemoOriginFavorites([...favorites, favorite])
    return favorite
  }

  const { data, error } = await supabase
    .from('origin_favorites')
    .insert({
      label: normalizedLabel,
      address: normalizedAddress,
      lat,
      lng,
    })
    .select('id, label, address, lat, lng, created_at')
    .single()
  if (error) throw error
  return data
}

export async function renameOriginFavorite(id, label) {
  const normalizedLabel = label?.trim()
  if (!normalizedLabel) throw new Error('Indica un nombre para la ubicación favorita')
  if (normalizedLabel.length > 60) throw new Error('El nombre del favorito no puede superar 60 caracteres')
  if (!id) throw new Error('No se pudo identificar la ubicación favorita')

  const session = await getFavoritesSession()
  if (!session) {
    const favorites = getDemoOriginFavorites()
    const updated = favorites.map((favorite) =>
      favorite.id === id ? { ...favorite, label: normalizedLabel } : favorite)
    if (!favorites.some((favorite) => favorite.id === id)) {
      throw new Error('No se encontró la ubicación favorita')
    }
    saveDemoOriginFavorites(updated)
    return updated.find((favorite) => favorite.id === id)
  }

  const { data, error } = await supabase
    .from('origin_favorites')
    .update({ label: normalizedLabel })
    .eq('id', id)
    .select('id, label, address, lat, lng, created_at')
    .single()
  if (error) throw error
  return data
}

export async function deleteOriginFavorite(id) {
  if (!id) throw new Error('No se pudo identificar la ubicación favorita')

  const session = await getFavoritesSession()
  if (!session) {
    const favorites = getDemoOriginFavorites()
    const updated = favorites.filter((favorite) => favorite.id !== id)
    if (favorites.length === updated.length) throw new Error('No se encontró la ubicación favorita')
    saveDemoOriginFavorites(updated)
    return
  }

  const { error } = await supabase
    .from('origin_favorites')
    .delete()
    .eq('id', id)
  if (error) throw error
}
