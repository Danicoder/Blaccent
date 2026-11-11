// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../App.vue'
import { checkSupabaseConnection } from '../services/supabase.js'

vi.mock('../services/supabase.js', () => ({
  checkSupabaseConnection: vi.fn(),
}))

describe('App', () => {
  it('muestra "Conectado con Supabase" cuando la comprobación tiene éxito', async () => {
    checkSupabaseConnection.mockResolvedValue(undefined)

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.text()).toContain('Conectado con Supabase')
  })

  it('muestra un mensaje de error cuando la comprobación falla', async () => {
    checkSupabaseConnection.mockRejectedValue(new Error('Supabase respondió 401'))

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.text()).toContain('No se pudo conectar con Supabase')
    expect(wrapper.text()).not.toContain('Conectado con Supabase')
  })
})