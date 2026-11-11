import { describe, it, expect, vi, afterEach } from 'vitest'
import { checkSupabaseConnection } from './supabase.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('checkSupabaseConnection', () => {
  it('resuelve cuando Supabase responde 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }))

    await expect(checkSupabaseConnection()).resolves.toBeUndefined()
  })
})
