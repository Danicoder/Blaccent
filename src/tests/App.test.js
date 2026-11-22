// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../App.vue'
import {
  checkSupabaseConnection,
  getCurrentSession,
  getPublishedTrips,
  searchTrips,
} from '../services/supabase.js'

vi.mock('../services/supabase.js', () => ({
  checkSupabaseConnection: vi.fn(),
  getCurrentSession: vi.fn().mockResolvedValue(null),
  getPublishedTrips: vi.fn().mockResolvedValue([]),
  publishTrip: vi.fn(),
  searchTrips: vi.fn(),
  signInWithOtp: vi.fn(),
  signOut: vi.fn(),
  supabase: { auth: { onAuthStateChange: vi.fn() } },
  devTestMode: false,
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

  it('busca viajes y muestra disponibilidad por tramo', async () => {
    checkSupabaseConnection.mockResolvedValue(undefined)
    getCurrentSession.mockResolvedValue({ user: { email: 'empleado@accenture.com' } })
    searchTrips.mockResolvedValue([
      {
        id: 'trip-1',
        origin: 'Alicante',
        destination: 'Panoramis',
        travel_date: '2026-11-23',
        departure_time: '08:00',
        arrival_time: '08:30',
        return_time: '17:30',
        mode: 'both',
        outbound_seats: 2,
        return_seats: 1,
        parking: 'panoramis',
      },
    ])

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.find('#publish-panel').exists()).toBe(false)
    await wrapper.get('input[placeholder="Ej. San Vicente"]').setValue('Alicante')
    await wrapper.get('input[type="date"]').setValue('2026-11-23')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(searchTrips).toHaveBeenCalledWith({
      origin: 'Alicante',
      travelDate: '2026-11-23',
    })
    expect(wrapper.text()).toContain('Alicante → Panoramis')
    expect(wrapper.text()).toContain('Ida: 2 plazas')
    expect(wrapper.text()).toContain('Vuelta: 1 plaza')
  })

  it('muestra la búsqueda y la publicación en pestañas separadas', async () => {
    checkSupabaseConnection.mockResolvedValue(undefined)
    getCurrentSession.mockResolvedValue({ user: { email: 'empleado@accenture.com' } })

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.get('[role="tabpanel"]').attributes('id')).toBe('search-panel')
    expect(wrapper.find('#publish-panel').exists()).toBe(false)

    await wrapper.get('#publish-tab').trigger('click')

    expect(wrapper.get('[role="tabpanel"]').attributes('id')).toBe('publish-panel')
    expect(wrapper.text()).toContain('Hora prevista de regreso')

    await wrapper.get('#search-tab').trigger('click')

    expect(wrapper.get('[role="tabpanel"]').attributes('id')).toBe('search-panel')
  })

  it('mantiene visible y obligatoria la hora de salida para solo ida', async () => {
    checkSupabaseConnection.mockResolvedValue(undefined)
    getCurrentSession.mockResolvedValue({ user: { email: 'empleado@accenture.com' } })

    const wrapper = mount(App)
    await flushPromises()
    await wrapper.get('#publish-tab').trigger('click')
    await wrapper.get('select').setValue('outbound')

    const departureInput = wrapper.get('input[type="time"]')
    expect(departureInput.element.required).toBe(true)
    expect(wrapper.text()).toContain('Hora de salida (ida)')
    expect(wrapper.text()).not.toContain('Hora prevista de regreso')
  })

  it('muestra los viajes publicados y permite seleccionar uno', async () => {
    checkSupabaseConnection.mockResolvedValue(undefined)
    getCurrentSession.mockResolvedValue({ user: { email: 'empleado@accenture.com' } })
    getPublishedTrips.mockResolvedValue([
      {
        id: 'trip-2',
        origin: 'San Vicente',
        destination: 'Panoramis',
        travel_date: '2026-11-23',
        departure_time: '08:00',
        arrival_time: '08:30',
        return_time: '17:30',
        mode: 'both',
        outbound_seats: 3,
        return_seats: 2,
        parking: 'free',
      },
    ])

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.text()).toContain('Viajes publicados')
    expect(wrapper.text()).toContain('Ida: 3 plazas')
    expect(wrapper.text()).toContain('Vuelta: 2 plazas')
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(false)

    await wrapper.get('button[aria-pressed="false"]').trigger('click')

    expect(wrapper.get('[aria-live="polite"]').text()).toContain('Viaje seleccionado')
    expect(wrapper.get('[aria-live="polite"]').text()).toContain('Parking gratuito')
    expect(wrapper.get('button[aria-pressed="true"]').text()).toContain('Viaje seleccionado')
  })
})