// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TripMap from './TripMap.vue'

const leaflet = vi.hoisted(() => {
  const handlers = {}
  const marker = {
    addTo: vi.fn(() => marker),
    on: vi.fn((event, handler) => {
      handlers[`marker:${event}`] = handler
    }),
    setLatLng: vi.fn(),
    getLatLng: vi.fn(),
    remove: vi.fn(),
  }
  const map = {
    setView: vi.fn(() => map),
    on: vi.fn((event, handler) => {
      handlers[`map:${event}`] = handler
    }),
    remove: vi.fn(),
  }
  return { handlers, marker, map, markerOptions: null }
})

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => leaflet.map),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    circleMarker: vi.fn(() => ({ addTo: vi.fn(() => ({ bindPopup: vi.fn() })) })),
    marker: vi.fn((_position, options) => {
      leaflet.markerOptions = options
      return leaflet.marker
    }),
    divIcon: vi.fn(() => ({})),
    polyline: vi.fn(),
  },
}))

describe('TripMap', () => {
  it('creates a draggable origin marker and emits its corrected coordinates', () => {
    const wrapper = mount(TripMap)
    leaflet.handlers['map:click']({ latlng: { lat: 38.3, lng: -0.4 } })
    leaflet.marker.getLatLng.mockReturnValue({ lat: 38.31, lng: -0.41 })
    leaflet.handlers['marker:dragend']()

    expect(leaflet.markerOptions.draggable).toBe(true)
    expect(wrapper.emitted('update:origin')).toEqual([
      [{ lat: 38.3, lng: -0.4 }],
      [{ lat: 38.31, lng: -0.41 }],
    ])
    wrapper.unmount()
  })
})
