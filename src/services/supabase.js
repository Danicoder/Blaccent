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

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: window.location.origin,
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

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!sessionData.session) throw new Error('Debes iniciar sesion')

  const mode = trip.mode
  const outbound = mode === 'outbound' || mode === 'both'
  const inbound = mode === 'inbound' || mode === 'both'

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

// Comprueba que el proyecto responde y acepta la clave pública, sin depender de ninguna tabla.
export async function checkSupabaseConnection() {
  const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
    headers: { apikey: supabaseAnonKey },
  })
  if (!response.ok) throw new Error(`Supabase respondió ${response.status}`)
}