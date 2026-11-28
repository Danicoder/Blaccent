import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import {
  checkSupabaseConnection,
  deleteOriginFavorite,
  getOriginFavorites,
  getPublishedTrips,
  isAllowedAccentureEmail,
  renameOriginFavorite,
  publishTrip,
  saveOriginFavorite,
  searchTrips,
  signInWithOtp,
} from './supabase.js'

let localTrips

beforeEach(() => {
  localTrips = new Map()
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key) => localTrips.get(key) ?? null),
    setItem: vi.fn((key, value) => localTrips.set(key, value)),
    clear: vi.fn(() => localTrips.clear()),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

describe('checkSupabaseConnection', () => {
  it('resuelve cuando Supabase responde 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }))

    await expect(checkSupabaseConnection()).resolves.toBeUndefined()
  })

  it('rechaza con error cuando Supabase responde 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))

    await expect(checkSupabaseConnection()).rejects.toThrow('401')
  })
})

describe('Accenture Magic Link', () => {
  it('accepta únicamente direcciones del dominio configurado', () => {
    expect(isAllowedAccentureEmail('empleado@accenture.com')).toBe(true)
    expect(isAllowedAccentureEmail('empleado@gmail.com')).toBe(false)
  })

  it('rechaza el acceso por OTP antes de llamar a Supabase', async () => {
    await expect(signInWithOtp('empleado@gmail.com')).rejects.toThrow('@accenture.com')
  })
})

describe('viajes locales sin autenticacion', () => {
  it('permite publicar, listar y buscar viajes solo en modo desarrollo', async () => {
    vi.stubEnv('DEV', true)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-27T10:00:00Z'))
    const newTrip = await publishTrip({
      origin: 'San Vicente',
      travelDate: '2026-11-28',
      departureTime: '08:00',
      returnTime: '17:00',
      mode: 'both',
      seats: 2,
      parking: 'panoramis',
    })
    vi.setSystemTime(new Date('2026-11-27T10:00:00Z'))
    const newerTrip = await publishTrip({
      origin: 'Alicante',
      travelDate: '2026-11-29',
      departureTime: '09:00',
      mode: 'outbound',
      seats: 1,
      parking: 'free',
    })
    localTrips.set('blaccent-demo-trips', JSON.stringify([
      { id: 'legacy-trip', origin: 'Legacy', travel_date: '2026-11-20' },
      ...JSON.parse(localTrips.get('blaccent-demo-trips')),
    ]))

    expect(newTrip.destination).toBe('Panoramis')
    expect(newTrip.outbound_seats).toBe(2)
    expect(newTrip.return_seats).toBe(2)
    await expect(getPublishedTrips()).resolves.toEqual([newerTrip, newTrip, expect.objectContaining({ id: 'legacy-trip' })])
    await expect(searchTrips({ origin: 'Vicente', travelDate: '2026-11-28' }))
      .resolves.toEqual([newTrip])
    await expect(searchTrips({ origin: 'Alicante', travelDate: '2026-11-28' }))
      .resolves.toEqual([])
  })

  it('permite gestionar favoritos de origen en el modo demo local', async () => {
    vi.stubEnv('DEV', true)
    const favorite = await saveOriginFavorite({
      label: 'Casa',
      address: 'San Vicente',
      lat: 38.3,
      lng: -0.4,
    })

    await expect(getOriginFavorites()).resolves.toEqual([favorite])
    await expect(renameOriginFavorite(favorite.id, 'Casa nueva'))
      .resolves.toEqual({ ...favorite, label: 'Casa nueva' })
    await expect(getOriginFavorites()).resolves.toEqual([
      { ...favorite, label: 'Casa nueva' },
    ])
    await expect(deleteOriginFavorite(favorite.id)).resolves.toBeUndefined()
    await expect(getOriginFavorites()).resolves.toEqual([])
  })

  it('valida los datos de favoritos antes de guardarlos', async () => {
    vi.stubEnv('DEV', true)

    await expect(saveOriginFavorite({
      label: ' ',
      address: 'San Vicente',
      lat: 38.3,
      lng: -0.4,
    })).rejects.toThrow('nombre')
    await expect(saveOriginFavorite({
      label: 'Casa',
      address: 'San Vicente',
      lat: 100,
      lng: -0.4,
    })).rejects.toThrow('ubicación válida')
  })

  it('mantiene el requisito de sesion fuera del modo desarrollo', async () => {
    vi.stubEnv('DEV', false)

    await expect(getPublishedTrips()).rejects.toThrow('Debes iniciar sesion')
    await expect(publishTrip({
      origin: 'San Vicente',
      travelDate: '2026-11-28',
      departureTime: '08:00',
      mode: 'outbound',
      seats: 2,
      parking: 'free',
    })).rejects.toThrow('Debes iniciar sesion')
  })
})
