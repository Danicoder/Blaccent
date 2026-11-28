import { afterEach, describe, expect, it, vi } from 'vitest'
import { getRouteDistances } from './routing.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getRouteDistances', () => {
  it('obtiene por OSRM las distancias de ida y vuelta en una solicitud', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 'Ok',
        routes: [{
          legs: [{ distance: 12500 }, { distance: 13100 }],
          geometry: { coordinates: [[-0.4, 38.3], [-0.48, 38.34]] },
        }],
      }),
    })
    vi.stubGlobal('fetch', fetch)

    const result = await getRouteDistances({
      origin: { lat: 38.3, lng: -0.4 },
      mode: 'both',
    })

    expect(fetch).toHaveBeenCalledOnce()
    expect(fetch.mock.calls[0][0]).toContain('/route/v1/driving/-0.4,38.3;-0.4831,38.3418;-0.4,38.3')
    expect(result).toEqual({
      outboundDistanceKm: 12.5,
      returnDistanceKm: 13.1,
      geometry: { coordinates: [[-0.4, 38.3], [-0.48, 38.34]] },
    })
  })

  it('usa la dirección Panoramis-origen para un viaje de solo vuelta', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 'Ok',
        routes: [{
          legs: [{ distance: 8700 }],
          geometry: { coordinates: [[-0.48, 38.34], [-0.4, 38.3]] },
        }],
      }),
    }))

    const result = await getRouteDistances({
      origin: { lat: 38.3, lng: -0.4 },
      mode: 'inbound',
    })

    expect(result.outboundDistanceKm).toBeNull()
    expect(result.returnDistanceKm).toBe(8.7)
  })

  it('expone los errores HTTP y las respuestas sin ruta', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    await expect(getRouteDistances({
      origin: { lat: 38.3, lng: -0.4 },
      mode: 'outbound',
    })).rejects.toThrow('OSRM respondio 503')

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 'NoRoute', routes: [] }),
    }))
    await expect(getRouteDistances({
      origin: { lat: 38.3, lng: -0.4 },
      mode: 'outbound',
    })).rejects.toThrow('no encontro una ruta')
  })
})
