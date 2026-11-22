import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  checkSupabaseConnection,
  isAllowedAccentureEmail,
  signInWithOtp,
} from './supabase.js'

afterEach(() => {
  vi.unstubAllGlobals()
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
