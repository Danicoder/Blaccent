import { afterEach, describe, expect, it, vi } from 'vitest'
import { reverseGeocodeOrigin, searchOriginResults } from './geocoding.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('searchOriginResults', () => {
  it('valida la consulta y reutiliza resultados normalizados en caché', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ lat: '38.345', lon: '-0.482', display_name: 'Alicante, España' }],
    })
    vi.stubGlobal('fetch', fetch)

    await expect(searchOriginResults('  ')).rejects.toThrow('más concreta')
    await expect(searchOriginResults('Alicante, España')).resolves.toHaveLength(1)
    await expect(searchOriginResults('  alicante,   españa ')).resolves.toHaveLength(1)

    expect(fetch).toHaveBeenCalledOnce()
  })

  it('devuelve varios resultados seleccionables y permite continuar si no hay coincidencias', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { lat: '38.345', lon: '-0.482', display_name: 'Alicante, España' },
          { lat: '38.346', lon: '-0.483', display_name: 'Alicante centro, España' },
        ],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
    vi.stubGlobal('fetch', fetch)

    await expect(searchOriginResults('Alicante lugares')).resolves.toEqual([
      { lat: 38.345, lng: -0.482, label: 'Alicante, España' },
      { lat: 38.346, lng: -0.483, label: 'Alicante centro, España' },
    ])
    await expect(searchOriginResults('Lugar sin coincidencias')).resolves.toEqual([])
  })

  it('resuelve una dirección legible desde las coordenadas del mapa y cachea el resultado', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        display_name: 'Calle Mayor 10, Alicante, España',
        address: {
          road: 'Calle Mayor',
          house_number: '10',
          city: 'Alicante',
          state: 'Comunidad Valenciana',
          country: 'España',
        },
      }),
    })
    vi.stubGlobal('fetch', fetch)

    await expect(reverseGeocodeOrigin({ lat: 38.34567, lng: -0.48234 }))
      .resolves.toBe('Calle Mayor 10, Alicante')
    await expect(reverseGeocodeOrigin({ lat: 38.345671, lng: -0.482341 }))
      .resolves.toBe('Calle Mayor 10, Alicante')

    expect(fetch).toHaveBeenCalledOnce()
    const [url, options] = fetch.mock.calls[0]
    expect(String(url)).toContain('/reverse?')
    expect(String(url)).toContain('format=jsonv2')
    expect(options.referrerPolicy).toBe('strict-origin-when-cross-origin')
  })

  it('rechaza coordenadas inválidas antes de llamar al servicio', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    await expect(reverseGeocodeOrigin({ lat: 91, lng: 0 }))
      .rejects.toThrow('ubicación válida')
    expect(fetch).not.toHaveBeenCalled()
  })
})
