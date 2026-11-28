import { describe, expect, it } from 'vitest'
import { estimateForLeg, fareCentsForDistance, parkingCentsForLeg } from './estimates.js'

describe('estimaciones informativas', () => {
  it('aplica los límites aprobados de tarifa por distancia', () => {
    expect(fareCentsForDistance(10)).toBe(100)
    expect(fareCentsForDistance(11)).toBe(200)
    expect(fareCentsForDistance(20)).toBe(200)
    expect(fareCentsForDistance(21)).toBe(300)
    expect(fareCentsForDistance(35)).toBe(300)
    expect(fareCentsForDistance(36)).toBe(400)
    expect(fareCentsForDistance(50)).toBe(400)
    expect(fareCentsForDistance(51)).toBe(500)
  })

  it('calcula parking solo para Panoramis', () => {
    expect(parkingCentsForLeg('panoramis')).toBe(200)
    expect(parkingCentsForLeg('free')).toBe(0)
  })

  it('usa las distancias independientes de ida y vuelta', () => {
    const trip = {
      parking: 'panoramis',
      outbound_distance_km: 15,
      return_distance_km: 42,
    }

    expect(estimateForLeg(trip, 'outbound')).toEqual({
      distanceKm: 15,
      fareCents: 200,
      parkingCents: 200,
    })
    expect(estimateForLeg(trip, 'return').fareCents).toBe(400)
  })
})
