// @vitest-environment jsdom
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from './App.vue'
import {
  checkSupabaseConnection,
  getCurrentSession,
  getOriginFavorites,
  getPublishedTrips,
  publishTrip,
  saveOriginFavorite,
  renameOriginFavorite,
  deleteOriginFavorite,
  searchTrips,
} from '../services/supabase.js'
import { getRouteDistances } from '../services/routing.js'
import { reverseGeocodeOrigin, searchOriginResults } from '../services/geocoding.js'

vi.mock('../components/TripMap.vue', () => ({
  default: {
    props: ['origin', 'routeGeometry'],
    emits: ['update:origin'],
    template: '<button id="select-origin" type="button" @click="$emit(\'update:origin\', { lat: 38.3, lng: -0.4 })">Seleccionar origen</button>',
  },
}))

vi.mock('../services/supabase.js', () => ({
  checkSupabaseConnection: vi.fn(),
  getCurrentSession: vi.fn().mockResolvedValue(null),
  getOriginFavorites: vi.fn().mockResolvedValue([]),
  getPublishedTrips: vi.fn().mockResolvedValue([]),
  publishTrip: vi.fn(),
  saveOriginFavorite: vi.fn(),
  renameOriginFavorite: vi.fn(),
  deleteOriginFavorite: vi.fn(),
  searchTrips: vi.fn(),
  signInWithOtp: vi.fn(),
  signOut: vi.fn(),
  supabase: { auth: { onAuthStateChange: vi.fn() } },
}))

vi.mock('../services/routing.js', () => ({
  getRouteDistances: vi.fn().mockResolvedValue({
    outboundDistanceKm: 12.5,
    returnDistanceKm: 13.1,
    geometry: { type: 'LineString', coordinates: [[-0.4, 38.3], [-0.48, 38.34]] },
  }),
}))

vi.mock('../services/geocoding.js', () => ({
  reverseGeocodeOrigin: vi.fn().mockResolvedValue('Calle Mayor 10, Alicante'),
  searchOriginResults: vi.fn().mockResolvedValue([
    { lat: 38.32, lng: -0.5, label: 'Alicante centro, España' },
  ]),
}))

beforeEach(() => {
  getRouteDistances.mockClear()
  publishTrip.mockClear()
  getOriginFavorites.mockResolvedValue([])
  reverseGeocodeOrigin.mockResolvedValue('Calle Mayor 10, Alicante')
  searchOriginResults.mockResolvedValue([
    { lat: 38.32, lng: -0.5, label: 'Alicante centro, España' },
  ])
})

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
    expect(wrapper.get('#trip-mode').element.value).toBe('')
    expect(wrapper.text()).toContain('Elige los tramos que ofrecerás')
    await wrapper.get('#trip-mode').setValue('both')
    expect(wrapper.text()).toContain('Hora de ida')
    expect(wrapper.text()).toContain('Hora de vuelta')
    expect(wrapper.findAll('input[type="time"]')).toHaveLength(2)

    await wrapper.get('#search-tab').trigger('click')

    expect(wrapper.get('[role="tabpanel"]').attributes('id')).toBe('search-panel')
  })

  it('muestra únicamente la hora de ida para un viaje solo de ida', async () => {
    checkSupabaseConnection.mockResolvedValue(undefined)
    getCurrentSession.mockResolvedValue({ user: { email: 'empleado@accenture.com' } })

    const wrapper = mount(App)
    await flushPromises()
    await wrapper.get('#publish-tab').trigger('click')
    await wrapper.get('select').setValue('outbound')

    const departureInput = wrapper.get('input[type="time"]')
    expect(departureInput.element.required).toBe(true)
    expect(wrapper.text()).toContain('Hora de ida')
    expect(wrapper.text()).not.toContain('Hora de vuelta')
    expect(wrapper.findAll('input[type="time"]')).toHaveLength(1)
  })

  it('muestra únicamente la hora de vuelta para un viaje solo de vuelta', async () => {
    checkSupabaseConnection.mockResolvedValue(undefined)

    const wrapper = mount(App)
    await flushPromises()
    await wrapper.get('#publish-tab').trigger('click')
    await wrapper.get('select').setValue('inbound')

    expect(wrapper.text()).toContain('Hora de vuelta')
    expect(wrapper.text()).not.toContain('Hora de ida')
    expect(wrapper.findAll('input[type="time"]')).toHaveLength(1)
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

  it('limita la vista previa y pagina todos los viajes en su pestaña', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    checkSupabaseConnection.mockResolvedValue(undefined)
    getPublishedTrips.mockResolvedValue(Array.from({ length: 7 }, (_, index) => ({
      id: `trip-${index + 1}`,
      origin: `Origen ${index + 1}`,
      destination: 'Panoramis',
      travel_date: '2026-11-28',
      departure_time: '08:00',
      mode: 'outbound',
      outbound_seats: 2,
      return_seats: 0,
      parking: 'free',
    })))

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.findAll('#search-panel section[aria-labelledby="published-title"] article')).toHaveLength(3)
    expect(wrapper.text()).toContain('Ver todos los viajes (7)')

    await wrapper.get('#published-tab').trigger('click')
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    expect(wrapper.findAll('#published-panel article')).toHaveLength(5)
    expect(wrapper.text()).toContain('Mostrando 1–5 de 7 viajes')
    expect(wrapper.text()).toContain('Página 1 de 2')

    await wrapper.get('#published-panel button:last-child').trigger('click')
    expect(wrapper.findAll('#published-panel article')).toHaveLength(2)
    expect(wrapper.text()).toContain('Mostrando 6–7 de 7 viajes')
    expect(wrapper.text()).toContain('Página 2 de 2')
  })

  it('muestra estimaciones informativas y permite retirar por rechazo del parking', async () => {
    checkSupabaseConnection.mockResolvedValue(undefined)
    getCurrentSession.mockResolvedValue({ user: { email: 'empleado@accenture.com' } })
    getPublishedTrips.mockResolvedValue([
      {
        id: 'trip-4',
        origin: 'San Vicente',
        destination: 'Panoramis',
        travel_date: '2026-11-23',
        departure_time: '08:00',
        mode: 'outbound',
        outbound_seats: 3,
        return_seats: 0,
        parking: 'panoramis',
        outbound_distance_km: 15,
      },
    ])

    const wrapper = mount(App)
    await flushPromises()
    await wrapper.get('button[aria-pressed="false"]').trigger('click')

    expect(wrapper.text()).toContain('Estimaciones informativas')
    expect(wrapper.text()).toContain('Desplazamiento:')
    expect(wrapper.text()).toContain('2,00')
    expect(wrapper.text()).toContain('no son gastos reales verificados')

    await wrapper.get('input[type="checkbox"]').setValue(false)
    const withdrawButton = wrapper.findAll('button').find((button) => button.text() === 'Retirar solicitud')
    expect(withdrawButton).toBeDefined()
    await withdrawButton.trigger('click')

    expect(wrapper.text()).toContain('Solicitud retirada')
  })

  it('confirma el viaje publicado y deja listo el formulario para otro', async () => {
    checkSupabaseConnection.mockResolvedValue(undefined)
    publishTrip.mockResolvedValue({ id: 'trip-created' })
    getPublishedTrips.mockResolvedValue([])

    const wrapper = mount(App)
    await flushPromises()
    await wrapper.get('#publish-tab').trigger('click')

    await wrapper.get('input[placeholder="Ej. San Vicente, Alicante"]').setValue('San Vicente')
    await wrapper.get('input[type="date"]').setValue('2026-11-28')
    await wrapper.get('#select-origin').trigger('click')
    await wrapper.get('#calculate-route').trigger('click')
    expect(getRouteDistances).not.toHaveBeenCalled()
    await wrapper.get('#trip-mode').setValue('both')
    await wrapper.get('#calculate-route').trigger('click')
    await flushPromises()
    expect(getRouteDistances).toHaveBeenCalledWith({
      origin: { lat: 38.3, lng: -0.4 },
      mode: 'both',
    })
    const timeInputs = wrapper.findAll('input[type="time"]')
    await timeInputs[0].setValue('08:00')
    await timeInputs[1].setValue('17:00')
    await wrapper.get('#publish-panel form').trigger('submit')
    await flushPromises()

    expect(publishTrip).toHaveBeenCalledWith(expect.objectContaining({
      origin: 'Calle Mayor 10, Alicante',
      travelDate: '2026-11-28',
      departureTime: '08:00',
      returnTime: '17:00',
      distanceKm: 12.5,
      outboundDistanceKm: 12.5,
      returnDistanceKm: 13.1,
    }))
    const confirmation = wrapper.findAll('[role="status"]').find((element) =>
      element.text().includes('Viaje publicado: Calle Mayor 10, Alicante'),
    )
    expect(confirmation.text()).toContain('2026-11-28 · Ida 08:00 · Vuelta 17:00')
    expect(wrapper.get('input[placeholder="Ej. San Vicente, Alicante"]').element.value).toBe('')
    expect(wrapper.get('input[type="date"]').element.value).toBe('')
    expect(wrapper.get('#publish-panel button[type="submit"]').text()).toContain('Publicar otro viaje')
  })

  it('explica los campos pendientes al enviar y mantiene disponible la acción', async () => {
    checkSupabaseConnection.mockResolvedValue(undefined)

    const wrapper = mount(App, { attachTo: document.body })
    await flushPromises()
    await wrapper.get('#publish-tab').trigger('click')

    const submitButton = wrapper.get('#publish-panel button[type="submit"]')
    expect(submitButton.element.disabled).toBe(false)
    await wrapper.get('#publish-panel form').trigger('submit')

    expect(wrapper.get('#trip-mode-error').text()).toContain('Selecciona la modalidad')
    expect(wrapper.get('#trip-mode').attributes('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(wrapper.get('#trip-mode').element)
    expect(publishTrip).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('requiere la hora de vuelta para la modalidad de ida y vuelta', async () => {
    checkSupabaseConnection.mockResolvedValue(undefined)
    const wrapper = mount(App, { attachTo: document.body })
    await flushPromises()
    await wrapper.get('#publish-tab').trigger('click')
    await wrapper.get('#select-origin').trigger('click')
    await flushPromises()
    await wrapper.get('#trip-mode').setValue('both')
    await wrapper.get('#trip-date').setValue('2026-11-28')
    await wrapper.get('#calculate-route').trigger('click')
    await flushPromises()
    await wrapper.get('#departure-time').setValue('08:00')
    await wrapper.get('#publish-panel form').trigger('submit')

    expect(wrapper.get('#return-time').attributes('required')).toBeDefined()
    expect(wrapper.get('#return-time-error').text()).toContain('Indica la hora de vuelta')
    expect(document.activeElement).toBe(wrapper.get('#return-time').element)
    expect(publishTrip).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('busca opciones explícitamente, permite elegir una y ajustar el mapa', async () => {
    checkSupabaseConnection.mockResolvedValue(undefined)
    const fullAddress = 'Calle Mayor 10, San Vicente del Raspeig, Alicante, Comunidad Valenciana, España'
    searchOriginResults.mockResolvedValue([
      { lat: 38.32, lng: -0.5, label: fullAddress },
    ])

    const wrapper = mount(App)
    await flushPromises()
    await wrapper.get('#publish-tab').trigger('click')
    await wrapper.get('input[placeholder="Ej. San Vicente, Alicante"]').setValue('Alicante centro')
    const searchButton = wrapper.findAll('button').find((button) => button.text() === 'Buscar en el mapa')
    await searchButton.trigger('click')
    await flushPromises()

    expect(searchOriginResults).toHaveBeenCalledWith('Alicante centro')
    const resultButton = wrapper.get('[aria-label="Resultados de búsqueda"] button')
    expect(resultButton.attributes('title')).toBe(fullAddress)
    expect(resultButton.attributes('aria-label')).toBe(fullAddress)
    await resultButton.trigger('click')
    expect(wrapper.text()).toContain('Puedes ajustar el marcador arrastrándolo')
    expect(wrapper.get('#calculate-route').element.disabled).toBe(true)
    await wrapper.get('#trip-mode').setValue('both')
    await wrapper.get('#calculate-route').trigger('click')
    await flushPromises()

    expect(getRouteDistances).toHaveBeenLastCalledWith({
      origin: { lat: 38.32, lng: -0.5 },
      mode: 'both',
    })

    await wrapper.get('#select-origin').trigger('click')
    await flushPromises()
    expect(reverseGeocodeOrigin).toHaveBeenCalledWith({ lat: 38.3, lng: -0.4 })
    expect(wrapper.get('input[placeholder="Ej. San Vicente, Alicante"]').element.value)
      .toBe('Calle Mayor 10, Alicante')
    expect(wrapper.text()).toContain('Dirección actualizada')
  })

  it('muestra instrucciones manuales cuando no encuentra resultados', async () => {
    checkSupabaseConnection.mockResolvedValue(undefined)
    searchOriginResults.mockResolvedValue([])

    const wrapper = mount(App)
    await flushPromises()
    await wrapper.get('#publish-tab').trigger('click')
    await wrapper.get('input[placeholder="Ej. San Vicente, Alicante"]').setValue('Lugar desconocido')
    const searchButton = wrapper.findAll('button').find((button) => button.text() === 'Buscar en el mapa')
    await searchButton.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('No encontramos esa dirección')
    expect(wrapper.text()).toContain('marca el punto en el mapa')
    await wrapper.get('#select-origin').trigger('click')
    await flushPromises()
    await wrapper.get('#trip-mode').setValue('both')
    await wrapper.get('#calculate-route').trigger('click')
    await flushPromises()

    expect(searchOriginResults).toHaveBeenCalledWith('Lugar desconocido')
    expect(getRouteDistances).toHaveBeenLastCalledWith({
      origin: { lat: 38.3, lng: -0.4 },
      mode: 'both',
    })
  })

  it('actualiza el campo de dirección al cambiar el punto manual del mapa', async () => {
    checkSupabaseConnection.mockResolvedValue(undefined)
    reverseGeocodeOrigin.mockResolvedValue('Avenida del Puerto, Alicante')

    const wrapper = mount(App)
    await flushPromises()
    await wrapper.get('#publish-tab').trigger('click')
    await wrapper.get('input[placeholder="Ej. San Vicente, Alicante"]').setValue('Calle Mayor')
    await wrapper.get('#select-origin').trigger('click')
    await flushPromises()

    expect(reverseGeocodeOrigin).toHaveBeenCalledWith({ lat: 38.3, lng: -0.4 })
    expect(wrapper.get('input[placeholder="Ej. San Vicente, Alicante"]').element.value)
      .toBe('Avenida del Puerto, Alicante')
  })

  it('no reemplaza una dirección escrita mientras se resuelve la ubicación del mapa', async () => {
    checkSupabaseConnection.mockResolvedValue(undefined)
    let resolveReverseGeocode
    reverseGeocodeOrigin.mockReturnValue(new Promise((resolve) => {
      resolveReverseGeocode = resolve
    }))

    const wrapper = mount(App)
    await flushPromises()
    await wrapper.get('#publish-tab').trigger('click')
    await wrapper.get('#select-origin').trigger('click')
    await wrapper.get('input[placeholder="Ej. San Vicente, Alicante"]').setValue('Dirección corregida')
    resolveReverseGeocode('Dirección antigua')
    await flushPromises()

    expect(wrapper.get('input[placeholder="Ej. San Vicente, Alicante"]').element.value)
      .toBe('Dirección corregida')
  })

  it('guarda, reutiliza, renombra y elimina ubicaciones favoritas', async () => {
    checkSupabaseConnection.mockResolvedValue(undefined)
    const favorite = {
      id: 'favorite-1',
      label: 'Casa',
      address: 'San Vicente',
      lat: 38.3,
      lng: -0.4,
    }
    saveOriginFavorite.mockResolvedValue(favorite)
    renameOriginFavorite.mockResolvedValue({ ...favorite, label: 'Casa nueva' })
    deleteOriginFavorite.mockResolvedValue(undefined)

    const wrapper = mount(App)
    await flushPromises()
    await wrapper.get('#publish-tab').trigger('click')
    await flushPromises()
    await wrapper.get('input[placeholder="Ej. San Vicente, Alicante"]').setValue('San Vicente')
    await wrapper.get('#select-origin').trigger('click')
    const saveButton = wrapper.findAll('button').find((button) =>
      button.text() === 'Guardar origen en favoritos',
    )
    await saveButton.trigger('click')
    await wrapper.get('input[placeholder="Ej. Casa"]').setValue('Casa')
    const confirmSaveButton = wrapper.findAll('button').find((button) =>
      button.text() === 'Guardar ubicación',
    )
    await confirmSaveButton.trigger('click')
    await flushPromises()

    expect(saveOriginFavorite).toHaveBeenCalledWith({
      label: 'Casa',
      address: 'Calle Mayor 10, Alicante',
      lat: 38.3,
      lng: -0.4,
    })
    expect(wrapper.text()).toContain('Casa')

    await wrapper.get('[aria-pressed="true"]').trigger('click')
    expect(wrapper.get('input[placeholder="Ej. San Vicente, Alicante"]').element.value).toBe('San Vicente')
    expect(wrapper.text()).toContain('Este origen ya está guardado como «Casa».')
    expect(wrapper.findAll('button').some((button) =>
      button.text() === 'Guardar origen en favoritos',
    )).toBe(false)
    await wrapper.get('summary[aria-label^="Más opciones"]').trigger('click')
    await wrapper.findAll('button').find((button) => button.text() === 'Renombrar').trigger('click')
    await wrapper.get('[aria-label="Ubicaciones frecuentes"] input').setValue('Casa nueva')
    await wrapper.findAll('button').find((button) => button.text() === 'Guardar').trigger('click')
    await flushPromises()
    expect(renameOriginFavorite).toHaveBeenCalledWith('favorite-1', 'Casa nueva')
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    await wrapper.get('summary[aria-label^="Más opciones"]').trigger('click')
    await wrapper.findAll('button').find((button) => button.text() === 'Eliminar').trigger('click')
    await flushPromises()
    confirm.mockRestore()
    expect(deleteOriginFavorite).toHaveBeenCalledWith('favorite-1')
    expect(wrapper.text()).not.toContain('Casa nueva')
  })
})
