import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const allowedEmailDomain = (import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN || 'accenture.com')
  .trim()
  .toLowerCase()

export const devTestMode = import.meta.env.DEV

const devTripsKey = 'blaccent_dev_trips'

function getDevTrips() {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(devTripsKey) || '[]')
  } catch {
    return []
  }
}

function saveDevTrip(trip) {
  if (typeof window === 'undefined') return trip
  const trips = getDevTrips()
  trips.unshift(trip)
  window.localStorage.setItem(devTripsKey, JSON.stringify(trips))
  return trip
}

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

  if (devTestMode) {
    return saveDevTrip({
      id: crypto.randomUUID(),
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
    })
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!sessionData.session) throw new Error('Debes iniciar sesion')

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
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getPublishedTrips() {
  if (devTestMode) {
    return getDevTrips()
      .sort((first, second) =>
        second.travel_date.localeCompare(first.travel_date)
        || second.departure_time.localeCompare(first.departure_time),
      )
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!sessionData.session) throw new Error('Debes iniciar sesion')

  const { data, error } = await supabase
    .from('trips')
    .select('id, origin, destination, travel_date, departure_time, arrival_time, return_time, mode, outbound_seats, return_seats, parking')
    .eq('destination', 'Panoramis')
    .order('travel_date', { ascending: false })
    .order('departure_time', { ascending: false })

  if (error) throw error
  return data
}

export async function searchTrips({ origin, travelDate }) {
  if (!origin?.trim()) throw new Error('Indica el origen')
  if (!travelDate) throw new Error('Indica la fecha')

  if (devTestMode) {
    const normalizedOrigin = origin.trim().toLowerCase()
    return getDevTrips()
      .filter((trip) =>
        trip.destination === 'Panoramis'
        && trip.travel_date === travelDate
        && trip.origin.toLowerCase().includes(normalizedOrigin),
      )
      .sort((first, second) => first.departure_time.localeCompare(second.departure_time))
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!sessionData.session) throw new Error('Debes iniciar sesion')

  const { data, error } = await supabase
    .from('trips')
    .select('id, origin, destination, travel_date, departure_time, arrival_time, return_time, mode, outbound_seats, return_seats, parking')
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