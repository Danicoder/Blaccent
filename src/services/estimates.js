export function fareCentsForDistance(distanceKm) {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    throw new Error('La distancia debe ser un numero valido')
  }
  if (distanceKm <= 10) return 100
  if (distanceKm <= 20) return 200
  if (distanceKm <= 35) return 300
  if (distanceKm <= 50) return 400
  return 500
}

export function parkingCentsForLeg(parking) {
  return parking === 'panoramis' ? 200 : 0
}

export function estimateForLeg(trip, leg) {
  const distanceKm = leg === 'outbound'
    ? trip.outbound_distance_km ?? trip.distance_km
    : trip.return_distance_km ?? trip.distance_km

  const hasDistance = Number.isFinite(Number(distanceKm))
  return {
    distanceKm: hasDistance ? Number(distanceKm) : null,
    fareCents: hasDistance ? fareCentsForDistance(Number(distanceKm)) : null,
    parkingCents: parkingCentsForLeg(trip.parking),
  }
}
