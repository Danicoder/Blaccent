<script setup>
import { onBeforeUnmount, onMounted, watch } from 'vue'
import L from 'leaflet'

const props = defineProps({
  origin: { type: Object, default: null },
  routeGeometry: { type: Object, default: null },
})
const emit = defineEmits(['update:origin'])

const destination = [
  Number(import.meta.env.VITE_PANORAMIS_LAT || 38.3418),
  Number(import.meta.env.VITE_PANORAMIS_LNG || -0.4831),
]
let map
let originMarker
let routeLine

function updateOriginMarker(origin) {
  if (!map) return
  if (!origin) {
    if (originMarker) originMarker.remove()
    originMarker = null
    return
  }
  const position = [origin.lat, origin.lng]
  if (originMarker) originMarker.setLatLng(position)
  else {
    originMarker = L.marker(position, {
      draggable: true,
      icon: L.divIcon({
        className: 'origin-marker-icon',
        html: '<span></span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    }).addTo(map)
    originMarker.on('dragend', () => {
      const { lat, lng } = originMarker.getLatLng()
      emit('update:origin', {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
      })
    })
  }
}

onMounted(() => {
  map = L.map('trip-origin-map').setView(destination, 11)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> · <a href="https://www.openstreetmap.org/fixthemap">Corregir el mapa</a>',
  }).addTo(map)
  L.circleMarker(destination, {
    radius: 8,
    color: '#c1152d',
    fillColor: '#ffffff',
    fillOpacity: 1,
    weight: 3,
  }).addTo(map).bindPopup('Destino: Panoramis')

  if (props.origin) updateOriginMarker(props.origin)
  map.on('click', (event) => {
    const origin = {
      lat: Number(event.latlng.lat.toFixed(6)),
      lng: Number(event.latlng.lng.toFixed(6)),
    }
    updateOriginMarker(origin)
    emit('update:origin', origin)
  })
})

watch(() => props.origin, (origin) => {
  updateOriginMarker(origin)
  if (origin && map) map.setView([origin.lat, origin.lng], 14, { animate: true })
})

watch(() => props.routeGeometry, (geometry) => {
  if (!map) return
  if (routeLine) routeLine.remove()
  routeLine = null
  if (!geometry?.coordinates?.length) return

  const positions = geometry.coordinates.map(([lng, lat]) => [lat, lng])
  routeLine = L.polyline(positions, { color: '#155eef', weight: 5, opacity: 0.8 }).addTo(map)
  map.fitBounds(routeLine.getBounds(), { padding: [24, 24] })
})

onBeforeUnmount(() => {
  if (map) map.remove()
})
</script>

<template>
  <div
    id="trip-origin-map"
    class="trip-map"
    role="application"
    aria-label="Mapa para seleccionar el origen y consultar la ruta"
  />
</template>

<style scoped>
.trip-map {
  width: 100%;
  height: clamp(12.5rem, 28vh, 15rem);
  min-height: 12.5rem;
  border-radius: 0.75rem;
  overflow: hidden;
}

:global(.origin-marker-icon) {
  border: 0;
  background: transparent;
}

:global(.origin-marker-icon span) {
  display: block;
  width: 18px;
  height: 18px;
  border: 3px solid #155eef;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 5px #00000066;
}
</style>
