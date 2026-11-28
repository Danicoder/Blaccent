<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
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
  signOut,
  supabase,
} from '../services/supabase.js'
import { estimateForLeg } from '../services/estimates.js'
import { getRouteDistances } from '../services/routing.js'
import { reverseGeocodeOrigin, searchOriginResults } from '../services/geocoding.js'
import TripMap from '../components/TripMap.vue'

// Magic Link desactivado temporalmente para desarrollo local y despliegues.
const accessEnabled = false
const localDemoMode = import.meta.env.DEV && !accessEnabled
const status = ref('checking')
const session = ref(null)
const tripMessage = ref('')
const fieldErrors = ref({})
const hasPublishedTrip = ref(false)
const searchMessage = ref('')
const publishing = ref(false)
const searching = ref(false)
const calculatingRoute = ref(false)
const searchingOrigins = ref(false)
const resolvingOriginAddress = ref(false)
const originSelectionVersion = ref(0)
const originSuggestions = ref([])
const originMessage = ref('')
const originMessageType = ref('info')
const originFavorites = ref([])
const loadingOriginFavorites = ref(false)
const originFavoritesLoaded = ref(false)
const originFavoritesMessage = ref('')
const favoriteDraftOpen = ref(false)
const favoriteLabelDraft = ref('')
const savingFavorite = ref(false)
const renamingFavoriteId = ref(null)
const favoriteRenameDraft = ref('')
const favoriteActionMessage = ref('')
const searchResults = ref([])
const publishedTrips = ref([])
const publishedTripsMessage = ref('')
const selectedTrip = ref(null)
const selectedLeg = ref('outbound')
const acceptParking = ref(true)
const estimateMessage = ref('')
const routeResult = ref(null)
const loadingPublishedTrips = ref(false)
const activeTab = ref('search')
const publishedPage = ref(1)
const publishedPageSize = 5
const publishedPageCount = computed(() =>
  Math.max(1, Math.ceil(publishedTrips.value.length / publishedPageSize)),
)
const visiblePublishedTrips = computed(() => {
  const start = (publishedPage.value - 1) * publishedPageSize
  return publishedTrips.value.slice(start, start + publishedPageSize)
})
const publishedTripPreview = computed(() => publishedTrips.value.slice(0, 3))
const matchingOriginFavorite = computed(() => {
  const coordinates = form.value.originCoordinates
  if (!coordinates) return null
  return originFavorites.value.find((favorite) =>
    Math.abs(Number(favorite.lat) - coordinates.lat) < 0.00001
    && Math.abs(Number(favorite.lng) - coordinates.lng) < 0.00001)
})
const form = ref({
  origin: '',
  travelDate: '',
  departureTime: '',
  returnTime: '',
  mode: '',
  seats: 3,
  parking: 'panoramis',
  originCoordinates: null,
})
const search = ref({
  origin: '',
  travelDate: '',
})

watch(() => form.value.mode, () => {
  routeResult.value = null
  clearFieldError('mode')
  clearFieldError('departureTime')
  clearFieldError('returnTime')
  clearFieldError('route')
})

function clearFieldError(field) {
  if (!fieldErrors.value[field]) return
  const updatedErrors = { ...fieldErrors.value }
  delete updatedErrors[field]
  fieldErrors.value = updatedErrors
}

async function showFirstFieldError(errors) {
  const firstField = [
    'mode',
    'origin',
    'route',
    'travelDate',
    'departureTime',
    'returnTime',
    'seats',
    'parking',
  ].find((field) => errors[field])
  if (!firstField) return

  const targetId = firstField === 'route' ? 'calculate-route'
    : ({
        mode: 'trip-mode',
        origin: 'origin-address',
        travelDate: 'trip-date',
        departureTime: 'departure-time',
        returnTime: 'return-time',
        seats: 'trip-seats',
        parking: 'trip-parking',
      }[firstField])
  await nextTick()
  const target = document.getElementById(targetId)
  target?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  target?.focus()
}

function validateTrip() {
  const errors = {}
  if (!form.value.mode) errors.mode = 'Selecciona la modalidad del viaje.'
  if (!form.value.origin.trim() || !form.value.originCoordinates) {
    errors.origin = 'Selecciona una dirección y marca el punto de origen en el mapa.'
  }
  if (!routeResult.value || routeResult.value.mode !== form.value.mode) {
    errors.route = 'Calcula la distancia para esta modalidad.'
  }
  if (!form.value.travelDate) errors.travelDate = 'Indica la fecha del viaje.'
  if (!form.value.departureTime) errors.departureTime = 'Indica la hora de salida.'
  if (form.value.mode === 'both' && !form.value.returnTime) {
    errors.returnTime = 'Indica la hora de vuelta.'
  }
  const seats = Number(form.value.seats)
  if (!Number.isInteger(seats) || seats < 1 || seats > 8) {
    errors.seats = 'Indica entre 1 y 8 plazas.'
  }
  if (!['panoramis', 'free'].includes(form.value.parking)) {
    errors.parking = 'Selecciona una opción de aparcamiento.'
  }

  fieldErrors.value = errors
  return errors
}

function onOriginInput() {
  originSelectionVersion.value += 1
  resolvingOriginAddress.value = false
  form.value.originCoordinates = null
  routeResult.value = null
  originSuggestions.value = []
  clearFieldError('origin')
  clearFieldError('route')
  originMessageType.value = 'statusInfo'
  originMessage.value = ''
  favoriteDraftOpen.value = false
}

onMounted(async () => {
  try {
    await checkSupabaseConnection()
    status.value = 'ok'
    await loadPublishedTrips()
    if (accessEnabled) {
      // Restaurar este bloque al reactivar Magic Link; suscribirse antes de
      // recuperar sesión para recibir el retorno del enlace de correo.
      supabase.auth.onAuthStateChange((_event, nextSession) => {
        session.value = nextSession
        originFavorites.value = []
        originFavoritesLoaded.value = false
        originFavoritesMessage.value = ''
        favoriteDraftOpen.value = false
        renamingFavoriteId.value = null
        if (nextSession) loadPublishedTrips()
        else {
          publishedTrips.value = []
          selectedTrip.value = null
        }
      })
      session.value = await getCurrentSession()
      if (session.value) await loadPublishedTrips()
    }
  } catch {
    status.value = 'error'
  }
})

// Formulario y envío del Magic Link temporalmente desactivados.
// Al reactivarlos, restaurar signInWithOtp y esta función:
// async function requestAccess() {
//   authMessage.value = ''
//   try {
//     await signInWithOtp(email.value)
//     authMessage.value = 'Revisa tu correo y abre el enlace para iniciar sesion.'
//   } catch (error) {
//     authMessage.value = error.message
//   }
// }

async function logout() {
  await signOut()
  session.value = null
  originFavorites.value = []
  originFavoritesLoaded.value = false
  originFavoritesMessage.value = ''
  favoriteDraftOpen.value = false
  renamingFavoriteId.value = null
}

async function createTrip() {
  tripMessage.value = ''
  const errors = validateTrip()
  if (Object.keys(errors).length) {
    await showFirstFieldError(errors)
    return
  }

  publishing.value = true
  try {
    const trip = {
      ...form.value,
      seats: Number(form.value.seats),
      distanceKm: routeResult.value.outboundDistanceKm,
      outboundDistanceKm: routeResult.value.outboundDistanceKm,
      returnDistanceKm: routeResult.value.returnDistanceKm,
    }
    await publishTrip(trip)
    const legs = trip.mode === 'both'
      ? `Ida ${trip.departureTime} · Vuelta ${trip.returnTime}`
      : `${trip.mode === 'inbound' ? 'Vuelta' : 'Ida'} ${trip.departureTime}`
    tripMessage.value = `Viaje publicado: ${trip.origin.trim()} · ${trip.travelDate} · ${legs}. El formulario está listo para publicar otro viaje.`
    hasPublishedTrip.value = true
    Object.assign(form.value, {
      origin: '',
      travelDate: '',
      departureTime: '',
      returnTime: '',
      mode: '',
      seats: 3,
      parking: 'panoramis',
      originCoordinates: null,
    })
    originSelectionVersion.value += 1
    resolvingOriginAddress.value = false
    routeResult.value = null
    originSuggestions.value = []
    originMessage.value = ''
    fieldErrors.value = {}
    favoriteDraftOpen.value = false
    await loadPublishedTrips()
  } catch (error) {
    tripMessage.value = error.message
  } finally {
    publishing.value = false
  }
}

function updateOriginCoordinates(coordinates) {
  const selectionVersion = ++originSelectionVersion.value
  form.value.originCoordinates = coordinates
  form.value.origin = 'Buscando dirección cercana…'
  clearFieldError('origin')
  resolvingOriginAddress.value = true
  routeResult.value = null
  originSuggestions.value = []
  originMessageType.value = 'statusInfo'
  originMessage.value = 'Buscando la dirección de este punto…'
  favoriteDraftOpen.value = false
  reverseGeocodeMapOrigin(coordinates, selectionVersion)
}

async function reverseGeocodeMapOrigin(coordinates, selectionVersion) {
  try {
    const address = await reverseGeocodeOrigin(coordinates)
    if (selectionVersion !== originSelectionVersion.value) return
    form.value.origin = address
    originMessageType.value = 'statusSuccess'
    originMessage.value = 'Dirección actualizada. Ajusta el marcador si hace falta.'
  } catch {
    if (selectionVersion !== originSelectionVersion.value) return
    form.value.origin = `Punto del mapa (${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)})`
    originMessageType.value = 'statusWarning'
    originMessage.value = 'No encontramos una dirección para este punto; se guardará su ubicación en el mapa.'
  } finally {
    if (selectionVersion === originSelectionVersion.value) {
      resolvingOriginAddress.value = false
    }
  }
}

async function findOrigin() {
  originMessage.value = ''
  originSuggestions.value = []
  if (form.value.origin.trim().length < 3) {
    originMessageType.value = 'statusInfo'
    originMessage.value = 'Escribe al menos 3 caracteres para buscar. También puedes marcar el punto en el mapa.'
    return
  }

  searchingOrigins.value = true
  try {
    originSuggestions.value = await searchOriginResults(form.value.origin)
    if (originSuggestions.value.length) {
      originMessageType.value = 'statusInfo'
      originMessage.value = 'Elige el resultado más cercano a tu punto de salida.'
    } else {
      originMessageType.value = 'statusWarning'
      originMessage.value = 'No encontramos esa dirección. Prueba con un barrio o lugar cercano, o marca el punto en el mapa.'
    }
  } catch {
    originMessageType.value = 'statusError'
    originMessage.value = 'No se pudo completar la búsqueda ahora. Puedes marcar el punto en el mapa.'
  } finally {
    searchingOrigins.value = false
  }
}

function chooseOriginSuggestion(suggestion) {
  originSelectionVersion.value += 1
  resolvingOriginAddress.value = false
  form.value.origin = suggestion.label
  form.value.originCoordinates = { lat: suggestion.lat, lng: suggestion.lng }
  originSuggestions.value = []
  routeResult.value = null
  favoriteDraftOpen.value = false
  originMessageType.value = 'statusSuccess'
  originMessage.value = 'Ubicación seleccionada. Puedes ajustar el marcador arrastrándolo o haciendo clic en el mapa.'
}

function chooseOriginFavorite(favorite) {
  originSelectionVersion.value += 1
  resolvingOriginAddress.value = false
  form.value.origin = favorite.address
  form.value.originCoordinates = { lat: Number(favorite.lat), lng: Number(favorite.lng) }
  originSuggestions.value = []
  routeResult.value = null
  favoriteDraftOpen.value = false
  originMessageType.value = 'statusSuccess'
  originMessage.value = `«${favorite.label}» seleccionada. Puedes ajustar el marcador en el mapa.`
}

async function loadOriginFavorites() {
  if (loadingOriginFavorites.value) return
  loadingOriginFavorites.value = true
  originFavoritesMessage.value = ''
  try {
    originFavorites.value = await getOriginFavorites()
    originFavoritesLoaded.value = true
  } catch {
    originFavoritesMessage.value = 'No se pudieron cargar tus ubicaciones frecuentes. Puedes buscar una dirección o marcarla en el mapa.'
  } finally {
    loadingOriginFavorites.value = false
  }
}

async function openPublishTab() {
  activeTab.value = 'publish'
  if (!originFavoritesLoaded.value) await loadOriginFavorites()
}

function startSavingFavorite() {
  favoriteLabelDraft.value = form.value.origin.trim().slice(0, 60)
  favoriteDraftOpen.value = true
}

async function saveCurrentOriginFavorite() {
  savingFavorite.value = true
  originFavoritesMessage.value = ''
  try {
    const favorite = await saveOriginFavorite({
      label: favoriteLabelDraft.value,
      address: form.value.origin,
      ...form.value.originCoordinates,
    })
    originFavorites.value = [...originFavorites.value, favorite]
    favoriteDraftOpen.value = false
    originFavoritesMessage.value = 'Ubicación guardada en tus favoritos.'
  } catch {
    originFavoritesMessage.value = 'No se pudo guardar la ubicación. Inténtalo de nuevo.'
  } finally {
    savingFavorite.value = false
  }
}

function startRenamingFavorite(favorite) {
  renamingFavoriteId.value = favorite.id
  favoriteRenameDraft.value = favorite.label
}

async function saveFavoriteName(favorite) {
  try {
    const updated = await renameOriginFavorite(favorite.id, favoriteRenameDraft.value)
    originFavorites.value = originFavorites.value.map((item) =>
      item.id === favorite.id ? updated : item)
    renamingFavoriteId.value = null
    favoriteActionMessage.value = 'Nombre actualizado.'
  } catch {
    favoriteActionMessage.value = 'No se pudo cambiar el nombre. Inténtalo de nuevo.'
  }
}

async function removeOriginFavorite(favorite) {
  if (!window.confirm(`¿Eliminar «${favorite.label}» de tus ubicaciones frecuentes?`)) return
  try {
    await deleteOriginFavorite(favorite.id)
    originFavorites.value = originFavorites.value.filter((item) => item.id !== favorite.id)
    favoriteActionMessage.value = 'Ubicación eliminada.'
  } catch {
    favoriteActionMessage.value = 'No se pudo eliminar la ubicación. Inténtalo de nuevo.'
  }
}

async function calculateRoute() {
  tripMessage.value = ''
  if (!form.value.origin.trim()) {
    tripMessage.value = 'Indica el origen del viaje'
    return
  }

  calculatingRoute.value = true
  try {
    if (!form.value.originCoordinates) {
      originMessageType.value = 'statusWarning'
      originMessage.value = 'Busca la dirección y elige un resultado, o marca el punto de origen directamente en el mapa.'
      return
    }
    if (!form.value.mode) {
      originMessageType.value = 'statusWarning'
      originMessage.value = 'Selecciona si el viaje es solo de ida, solo de vuelta o de ida y vuelta antes de calcular.'
      return
    }
    routeResult.value = {
      ...await getRouteDistances({
        origin: form.value.originCoordinates,
        mode: form.value.mode,
      }),
      mode: form.value.mode,
    }
    clearFieldError('route')
  } catch {
    routeResult.value = null
    fieldErrors.value = {
      ...fieldErrors.value,
      route: 'No se pudo calcular la distancia. Comprueba el punto seleccionado e inténtalo de nuevo.',
    }
  } finally {
    calculatingRoute.value = false
  }
}

function routeDistanceLabel(distanceKm) {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(distanceKm)
}

async function loadPublishedTrips() {
  loadingPublishedTrips.value = true
  publishedTripsMessage.value = ''
  try {
    publishedTrips.value = await getPublishedTrips()
    publishedPage.value = Math.min(publishedPage.value, publishedPageCount.value)
  } catch (error) {
    publishedTripsMessage.value = `No se pudieron cargar los viajes publicados: ${error.message}`
  } finally {
    loadingPublishedTrips.value = false
  }
}

async function findTrips() {
  searchMessage.value = ''
  searchResults.value = []
  searching.value = true
  try {
    searchResults.value = await searchTrips(search.value)
    if (searchResults.value.length === 0) {
      searchMessage.value = 'No se encontraron viajes con esos datos.'
    }
  } catch (error) {
    searchMessage.value = error.message
  } finally {
    searching.value = false
  }
}

function legLabel(trip, leg) {
  const seats = leg === 'outbound' ? trip.outbound_seats : trip.return_seats
  return `${leg === 'outbound' ? 'Ida' : 'Vuelta'}: ${seats} ${seats === 1 ? 'plaza' : 'plazas'}`
}

function departureLabel(trip) {
  return trip.mode === 'inbound' ? 'Hora de vuelta' : 'Hora de ida'
}

function parkingLabel(parking) {
  return parking === 'panoramis' ? 'Parking Panoramis' : 'Parking gratuito'
}

function euros(cents) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

function estimate(trip, leg) {
  return estimateForLeg(trip, leg)
}

function selectTrip(trip) {
  selectedTrip.value = trip
  selectedLeg.value = trip.mode === 'inbound' ? 'return' : 'outbound'
  acceptParking.value = trip.parking === 'panoramis'
  estimateMessage.value = ''
}

function withdrawEstimate() {
  estimateMessage.value = 'Solicitud retirada. Las estimaciones no se aplicaron ni se convirtieron en deuda.'
  acceptParking.value = false
}

function openPublishedTrips() {
  activeTab.value = 'published'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <main :class="$style.page">
    <h1 :class="$style.title">Blaccent</h1>
    <p :class="$style.subtitle">Comparte coche hasta Panoramis</p>
    <p :class="[$style.status, $style[status]]" role="status">
      <template v-if="status === 'checking'">Comprobando conexión…</template>
      <template v-else-if="status === 'ok'">Conectado con Supabase</template>
      <template v-else>No se pudo conectar con Supabase. Revisa la configuración del entorno.</template>
    </p>
    <p v-if="localDemoMode" :class="$style.demoNotice">
      Modo de desarrollo: los viajes se guardan solo en este navegador y no se envían a Supabase.
    </p>

    <!-- Formulario Magic Link desactivado temporalmente en todos los entornos.
    <template v-if="accessEnabled && status === 'ok' && !session">
      <form :class="$style.card" @submit.prevent="requestAccess">
        <label>
          Correo de Accenture
          <input v-model="email" type="email" autocomplete="email" placeholder="nombre@accenture.com" required />
        </label>
        <button type="submit">Enviar Magic Link</button>
        <p v-if="authMessage" role="status">{{ authMessage }}</p>
      </form>
    </template>
    -->

    <template v-if="status === 'ok'">
      <div v-if="session" :class="$style.user">
        <span>{{ session.user.email }}</span>
        <button type="button" @click="logout">Cerrar sesion</button>
      </div>

      <div :class="$style.tabs" role="tablist" aria-label="Funciones de viajes">
        <button
          id="search-tab"
          type="button"
          role="tab"
          aria-controls="search-panel"
          :aria-selected="activeTab === 'search'"
          :class="[$style.tab, activeTab === 'search' && $style.activeTab]"
          @click="activeTab = 'search'"
        >
          Buscar viajes
        </button>
        <button
          id="published-tab"
          type="button"
          role="tab"
          aria-controls="published-panel"
          :aria-selected="activeTab === 'published'"
          :class="[$style.tab, activeTab === 'published' && $style.activeTab]"
          @click="openPublishedTrips"
        >
          Viajes publicados
        </button>
        <button
          id="publish-tab"
          type="button"
          role="tab"
          aria-controls="publish-panel"
          :aria-selected="activeTab === 'publish'"
          :class="[$style.tab, activeTab === 'publish' && $style.activeTab]"
          @click="openPublishTab"
        >
          Publicar viaje
        </button>
      </div>

      <section
        v-if="activeTab === 'search'"
        id="search-panel"
        :class="[$style.searchPanel, searchResults.length > 0 && $style.hasSearchResults]"
        role="tabpanel"
        aria-labelledby="search-tab"
      >
        <form :class="[$style.card, $style.searchForm]" @submit.prevent="findTrips">
          <h2 :class="$style.sectionTitle">Buscar viajes</h2>
          <div :class="$style.row">
            <label>
              Origen
              <input v-model="search.origin" required placeholder="Ej. San Vicente" />
            </label>
            <label>
              Fecha
              <input v-model="search.travelDate" type="date" required />
            </label>
          </div>
          <button type="submit" :disabled="searching">
            {{ searching ? 'Buscando…' : 'Buscar' }}
          </button>
          <p v-if="searchMessage" role="status">{{ searchMessage }}</p>
        </form>

        <section v-if="searchResults.length" :class="$style.results" aria-label="Resultados de viajes">
          <article v-for="trip in searchResults" :key="trip.id" :class="$style.resultCard">
            <h3>{{ trip.origin }} → {{ trip.destination }}</h3>
            <p>{{ trip.travel_date }} · {{ departureLabel(trip) }}: {{ trip.departure_time }}</p>
            <p v-if="trip.mode === 'both' && trip.return_time">
              Hora de vuelta: {{ trip.return_time }}
            </p>
            <div :class="$style.availability">
              <strong v-if="trip.mode === 'outbound' || trip.mode === 'both'">
                {{ legLabel(trip, 'outbound') }}
              </strong>
              <strong v-if="trip.mode === 'inbound' || trip.mode === 'both'">
                {{ legLabel(trip, 'return') }}
              </strong>
            </div>
            <p :class="$style.destination">{{ parkingLabel(trip.parking) }}</p>
            <p v-if="estimate(trip, trip.mode === 'inbound' ? 'return' : 'outbound').fareCents !== null">
              Estimación informativa:
              {{ euros(estimate(trip, trip.mode === 'inbound' ? 'return' : 'outbound').fareCents) }}
              de desplazamiento
              <span v-if="trip.parking === 'panoramis'">
                + {{ euros(estimate(trip, trip.mode === 'inbound' ? 'return' : 'outbound').parkingCents) }} de parking
              </span>
            </p>
          </article>
        </section>

        <section :class="$style.publishedTrips" aria-labelledby="published-title">
          <h2 id="published-title" :class="$style.sectionTitle">Últimos viajes publicados</h2>
          <p v-if="loadingPublishedTrips" role="status">Cargando viajes publicados…</p>
          <p v-else-if="publishedTripsMessage" role="alert">{{ publishedTripsMessage }}</p>
          <p v-else-if="publishedTrips.length === 0" :class="$style.emptyState">
            Todavía no hay viajes publicados.
          </p>
          <div v-else :class="$style.results">
            <article
              v-for="trip in publishedTripPreview"
              :key="trip.id"
              :class="[$style.resultCard, selectedTrip?.id === trip.id && $style.selectedCard]"
            >
              <h3>{{ trip.origin }} → {{ trip.destination }}</h3>
              <p>{{ trip.travel_date }} · {{ departureLabel(trip) }}: {{ trip.departure_time }}</p>
              <p v-if="trip.mode === 'both' && trip.return_time">
                Hora de vuelta: {{ trip.return_time }}
              </p>
              <div :class="$style.availability">
                <strong v-if="trip.mode === 'outbound' || trip.mode === 'both'">
                  {{ legLabel(trip, 'outbound') }}
                </strong>
                <strong v-if="trip.mode === 'inbound' || trip.mode === 'both'">
                  {{ legLabel(trip, 'return') }}
                </strong>
              </div>
              <button
                type="button"
                :aria-pressed="selectedTrip?.id === trip.id"
                @click="selectTrip(trip)"
              >
                {{ selectedTrip?.id === trip.id ? 'Viaje seleccionado' : 'Seleccionar viaje' }}
              </button>
            </article>
          </div>
          <button
            v-if="publishedTrips.length > publishedTripPreview.length"
            type="button"
            :class="$style.viewAllButton"
            @click="openPublishedTrips"
          >
            Ver todos los viajes ({{ publishedTrips.length }})
          </button>
          <article v-if="selectedTrip" :class="[$style.resultCard, $style.tripDetails]" aria-live="polite">
            <h3>Viaje seleccionado</h3>
            <p>{{ selectedTrip.origin }} → {{ selectedTrip.destination }}</p>
            <p>{{ selectedTrip.travel_date }} · {{ departureLabel(selectedTrip) }}: {{ selectedTrip.departure_time }}</p>
            <p v-if="selectedTrip.mode === 'both' && selectedTrip.return_time">
              Hora de vuelta: {{ selectedTrip.return_time }}
            </p>
            <p>{{ parkingLabel(selectedTrip.parking) }}</p>
            <fieldset v-if="selectedTrip.mode === 'both'" :class="$style.legChoice">
              <legend>Tramo solicitado</legend>
              <label>
                <input v-model="selectedLeg" type="radio" value="outbound" />
                Ida
              </label>
              <label>
                <input v-model="selectedLeg" type="radio" value="return" />
                Vuelta
              </label>
            </fieldset>
            <template v-if="estimate(selectedTrip, selectedLeg).fareCents !== null">
              <div :class="$style.estimateBox" aria-label="Estimación informativa">
                <h4>Estimaciones informativas</h4>
                <p>Desplazamiento: <strong>{{ euros(estimate(selectedTrip, selectedLeg).fareCents) }}</strong></p>
                <p v-if="selectedTrip.parking === 'panoramis'">
                  Parking: <strong>{{ euros(estimate(selectedTrip, selectedLeg).parkingCents) }}</strong>
                </p>
                <p>
                  Total orientativo:
                  <strong>
                    {{ euros(
                      estimate(selectedTrip, selectedLeg).fareCents
                      + (acceptParking ? estimate(selectedTrip, selectedLeg).parkingCents : 0)
                    ) }}
                  </strong>
                </p>
              </div>
            </template>
            <template v-else>
              <p :class="$style.estimateBox">
                La distancia por carretera aún no está disponible. No se muestra un importe estimado.
              </p>
            </template>
            <template v-if="selectedTrip.parking === 'panoramis'">
              <label :class="$style.acceptParking">
                <input v-model="acceptParking" type="checkbox" />
                Acepto el parking de Panoramis como estimación informativa
              </label>
              <button
                v-if="!acceptParking"
                type="button"
                @click="withdrawEstimate"
              >
                Retirar solicitud
              </button>
            </template>
            <p :class="$style.disclaimer">
              Estos importes no son gastos reales verificados, una deuda ni una solicitud de pago.
              Los acuerdos económicos se realizan fuera de Blaccent.
            </p>
            <p v-if="estimateMessage" role="status">{{ estimateMessage }}</p>
          </article>
        </section>
      </section>

      <section
        v-else-if="activeTab === 'published'"
        id="published-panel"
        role="tabpanel"
        aria-labelledby="published-tab"
        :class="$style.publishedTrips"
      >
        <h2 :class="$style.sectionTitle">Todos los viajes publicados</h2>
        <p v-if="loadingPublishedTrips" role="status">Cargando viajes publicados…</p>
        <p v-else-if="publishedTripsMessage" role="alert">{{ publishedTripsMessage }}</p>
        <p v-else-if="publishedTrips.length === 0" :class="$style.emptyState">
          Todavía no hay viajes publicados.
        </p>
        <template v-else>
          <p :class="$style.pageSummary">
            Mostrando {{ (publishedPage - 1) * publishedPageSize + 1 }}–{{ Math.min(publishedPage * publishedPageSize, publishedTrips.length) }}
            de {{ publishedTrips.length }} viajes
          </p>
          <div :class="$style.results">
            <article
              v-for="trip in visiblePublishedTrips"
              :key="trip.id"
              :class="$style.resultCard"
            >
              <h3>{{ trip.origin }} → {{ trip.destination }}</h3>
              <p>{{ trip.travel_date }} · {{ departureLabel(trip) }}: {{ trip.departure_time }}</p>
              <p v-if="trip.mode === 'both' && trip.return_time">Hora de vuelta: {{ trip.return_time }}</p>
              <div :class="$style.availability">
                <strong v-if="trip.mode === 'outbound' || trip.mode === 'both'">
                  {{ legLabel(trip, 'outbound') }}
                </strong>
                <strong v-if="trip.mode === 'inbound' || trip.mode === 'both'">
                  {{ legLabel(trip, 'return') }}
                </strong>
              </div>
              <p :class="$style.destination">{{ parkingLabel(trip.parking) }}</p>
            </article>
          </div>
          <nav v-if="publishedPageCount > 1" :class="$style.pagination" aria-label="Paginación de viajes">
            <button
              type="button"
              :disabled="publishedPage === 1"
              @click="publishedPage -= 1"
            >
              Anterior
            </button>
            <span aria-live="polite">Página {{ publishedPage }} de {{ publishedPageCount }}</span>
            <button
              type="button"
              :disabled="publishedPage === publishedPageCount"
              @click="publishedPage += 1"
            >
              Siguiente
            </button>
          </nav>
        </template>
      </section>

      <section
        v-else
        id="publish-panel"
        role="tabpanel"
        aria-labelledby="publish-tab"
      >
        <form :class="[$style.card, $style.publishForm]" novalidate @submit.prevent="createTrip">
          <h2 :class="$style.sectionTitle">Publicar viaje</h2>
          <p :class="$style.requiredNote">Los campos marcados con <span aria-hidden="true">*</span> son obligatorios.</p>
          <label>
            Modalidad del viaje <span :class="$style.requiredMark" aria-hidden="true">*</span>
            <select
              id="trip-mode"
              v-model="form.mode"
              required
              :aria-invalid="Boolean(fieldErrors.mode)"
              :aria-describedby="fieldErrors.mode ? 'trip-mode-help trip-mode-error' : 'trip-mode-help'"
              @change="clearFieldError('mode')"
            >
              <option disabled value="">Selecciona una opción</option>
              <option value="outbound">Solo ida</option>
              <option value="inbound">Solo vuelta</option>
              <option value="both">Ida y vuelta</option>
            </select>
            <span id="trip-mode-help" :class="$style.mapHelp">
              Elige los tramos que ofrecerás; la distancia se calculará para esa modalidad.
            </span>
            <span v-if="fieldErrors.mode" id="trip-mode-error" :class="$style.fieldError" role="alert">
              {{ fieldErrors.mode }}
            </span>
          </label>
          <section :class="$style.originCard" aria-labelledby="origin-title">
            <h3 id="origin-title" :class="$style.originTitle">¿Dónde empieza el viaje?</h3>
            <div :class="$style.favorites" aria-label="Ubicaciones frecuentes">
              <h4>Ubicaciones frecuentes</h4>
              <p v-if="loadingOriginFavorites">Cargando…</p>
              <p v-else-if="originFavoritesLoaded && !originFavorites.length">Aún no tienes ubicaciones guardadas.</p>
              <ul v-if="originFavorites.length">
                <li v-for="favorite in originFavorites" :key="favorite.id">
                  <template v-if="renamingFavoriteId === favorite.id">
                    <label>
                      Nombre
                      <input v-model="favoriteRenameDraft" maxlength="60" />
                    </label>
                    <button type="button" :class="$style.secondaryButton" @click="saveFavoriteName(favorite)">Guardar</button>
                    <button type="button" :class="$style.textButton" @click="renamingFavoriteId = null">Cancelar</button>
                  </template>
                  <template v-else>
                    <button
                      type="button"
                      :class="[$style.favoriteChoice, matchingOriginFavorite?.id === favorite.id && $style.selectedFavorite]"
                      :aria-pressed="matchingOriginFavorite?.id === favorite.id"
                      @click="chooseOriginFavorite(favorite)"
                    >
                      <strong>{{ favorite.label }}</strong>
                      <span :title="favorite.address">{{ favorite.address }}</span>
                    </button>
                    <details :class="$style.favoriteMenu">
                      <summary :aria-label="`Más opciones para ${favorite.label}`">Más</summary>
                      <button type="button" @click="startRenamingFavorite(favorite)">Renombrar</button>
                      <button type="button" @click="removeOriginFavorite(favorite)">Eliminar</button>
                    </details>
                  </template>
                </li>
              </ul>
              <p v-if="favoriteActionMessage" :class="$style.favoriteActionMessage" role="status">
                {{ favoriteActionMessage }}
              </p>
            </div>
            <label>
              Dirección o lugar <span :class="$style.requiredMark" aria-hidden="true">*</span>
              <input
                id="origin-address"
                v-model="form.origin"
                required
                maxlength="300"
                :aria-busy="resolvingOriginAddress"
                :aria-invalid="Boolean(fieldErrors.origin)"
                placeholder="Ej. San Vicente, Alicante"
                :aria-describedby="fieldErrors.origin ? 'origin-help origin-error' : 'origin-help'"
                @input="onOriginInput"
                @keydown.enter.prevent="findOrigin"
              />
            </label>
            <div :class="$style.originActions">
              <button type="button" :class="$style.secondaryButton" :disabled="searchingOrigins" @click="findOrigin">
                {{ searchingOrigins ? 'Buscando…' : 'Buscar en el mapa' }}
              </button>
              <span id="origin-help" :class="$style.mapHelp">También puedes elegir una ubicación frecuente o marcarla en el mapa.</span>
            </div>
            <p v-if="fieldErrors.origin" id="origin-error" :class="$style.fieldError" role="alert">
              {{ fieldErrors.origin }}
            </p>
            <p v-if="originMessage" :class="[$style.originMessage, $style[originMessageType]]" role="status" aria-live="polite">
              {{ originMessage }}
            </p>
            <ul v-if="originSuggestions.length" :class="$style.originSuggestions" aria-label="Resultados de búsqueda">
              <li v-for="suggestion in originSuggestions" :key="`${suggestion.lat}-${suggestion.lng}`">
                <button
                  type="button"
                  :title="suggestion.label"
                  :aria-label="suggestion.label"
                  @click="chooseOriginSuggestion(suggestion)"
                >
                  {{ suggestion.label }}
                </button>
              </li>
            </ul>

            <TripMap
              :origin="form.originCoordinates"
              :route-geometry="routeResult?.geometry"
              @update:origin="updateOriginCoordinates"
            />
            <p :class="$style.mapHelp">
              {{ form.originCoordinates
                ? 'Ajusta el punto arrastrando el marcador o tocando el mapa.'
                : 'Elige un resultado o toca el mapa para marcar el origen.' }}
            </p>
            <button
              id="calculate-route"
              :class="$style.primaryButton"
              type="button"
              :disabled="calculatingRoute || resolvingOriginAddress || !form.originCoordinates || !form.mode"
              :aria-describedby="fieldErrors.route ? 'route-error' : undefined"
              @click="calculateRoute"
            >
              {{ calculatingRoute ? 'Calculando ruta…' : 'Calcular distancia por carretera' }}
            </button>
            <p v-if="fieldErrors.route" id="route-error" :class="$style.fieldError" role="alert">
              {{ fieldErrors.route }}
            </p>
            <p v-if="routeResult" :class="$style.routeInfo" role="status">
              <template v-if="form.mode !== 'inbound'">
                Ida estimada: {{ routeDistanceLabel(routeResult.outboundDistanceKm) }} km
              </template>
              <template v-if="form.mode === 'both'"> · </template>
              <template v-if="form.mode !== 'outbound'">
                Vuelta estimada: {{ routeDistanceLabel(routeResult.returnDistanceKm) }} km
              </template>
            </p>
            <p v-if="matchingOriginFavorite && !favoriteDraftOpen" :class="$style.mapHelp">
              Este origen ya está guardado como «{{ matchingOriginFavorite.label }}».
            </p>
            <button
              v-else-if="form.originCoordinates && !favoriteDraftOpen"
              :class="$style.textButton"
              type="button"
              @click="startSavingFavorite"
            >
              Guardar origen en favoritos
            </button>
            <div v-if="favoriteDraftOpen" :class="$style.favoriteDraft">
              <label>
                Nombre del favorito
                <input v-model="favoriteLabelDraft" maxlength="60" required placeholder="Ej. Casa" />
              </label>
              <button type="button" :disabled="savingFavorite" @click="saveCurrentOriginFavorite">
                {{ savingFavorite ? 'Guardando…' : 'Guardar ubicación' }}
              </button>
              <button type="button" :class="$style.textButton" @click="favoriteDraftOpen = false">Cancelar</button>
            </div>
            <p v-if="originFavoritesMessage" :class="$style.originMessage" role="status" aria-live="polite">
              {{ originFavoritesMessage }}
            </p>
            <p :class="$style.mapHelp">
              Tu dirección se comparte con los servicios de mapas para buscar y calcular la ruta.
            </p>
          </section>
          <div :class="$style.row">
            <label>
              Fecha <span :class="$style.requiredMark" aria-hidden="true">*</span>
              <input
                id="trip-date"
                v-model="form.travelDate"
                type="date"
                required
                :aria-invalid="Boolean(fieldErrors.travelDate)"
                :aria-describedby="fieldErrors.travelDate ? 'trip-date-error' : undefined"
                @input="clearFieldError('travelDate')"
              />
              <span v-if="fieldErrors.travelDate" id="trip-date-error" :class="$style.fieldError" role="alert">
                {{ fieldErrors.travelDate }}
              </span>
            </label>
            <label>
              Plazas disponibles <span :class="$style.requiredMark" aria-hidden="true">*</span>
              <input
                id="trip-seats"
                v-model="form.seats"
                type="number"
                min="1"
                max="8"
                step="1"
                required
                :aria-invalid="Boolean(fieldErrors.seats)"
                :aria-describedby="fieldErrors.seats ? 'trip-seats-error' : undefined"
                @input="clearFieldError('seats')"
              />
              <span v-if="fieldErrors.seats" id="trip-seats-error" :class="$style.fieldError" role="alert">
                {{ fieldErrors.seats }}
              </span>
            </label>
          </div>
          <label v-if="form.mode === 'outbound'">
            Hora de ida <span :class="$style.requiredMark" aria-hidden="true">*</span>
            <input id="departure-time" v-model="form.departureTime" type="time" required :aria-invalid="Boolean(fieldErrors.departureTime)" :aria-describedby="fieldErrors.departureTime ? 'departure-time-error' : undefined" @input="clearFieldError('departureTime')" />
            <span v-if="fieldErrors.departureTime" id="departure-time-error" :class="$style.fieldError" role="alert">{{ fieldErrors.departureTime }}</span>
          </label>
          <label v-if="form.mode === 'inbound'">
            Hora de vuelta <span :class="$style.requiredMark" aria-hidden="true">*</span>
            <input id="departure-time" v-model="form.departureTime" type="time" required :aria-invalid="Boolean(fieldErrors.departureTime)" :aria-describedby="fieldErrors.departureTime ? 'departure-time-error' : undefined" @input="clearFieldError('departureTime')" />
            <span v-if="fieldErrors.departureTime" id="departure-time-error" :class="$style.fieldError" role="alert">{{ fieldErrors.departureTime }}</span>
          </label>
          <label v-if="form.mode === 'both'">
            Hora de ida <span :class="$style.requiredMark" aria-hidden="true">*</span>
            <input id="departure-time" v-model="form.departureTime" type="time" required :aria-invalid="Boolean(fieldErrors.departureTime)" :aria-describedby="fieldErrors.departureTime ? 'departure-time-error' : undefined" @input="clearFieldError('departureTime')" />
            <span v-if="fieldErrors.departureTime" id="departure-time-error" :class="$style.fieldError" role="alert">{{ fieldErrors.departureTime }}</span>
          </label>
          <label v-if="form.mode === 'both'">
            Hora de vuelta <span :class="$style.requiredMark" aria-hidden="true">*</span>
            <input id="return-time" v-model="form.returnTime" type="time" required :aria-invalid="Boolean(fieldErrors.returnTime)" :aria-describedby="fieldErrors.returnTime ? 'return-time-error' : undefined" @input="clearFieldError('returnTime')" />
            <span v-if="fieldErrors.returnTime" id="return-time-error" :class="$style.fieldError" role="alert">{{ fieldErrors.returnTime }}</span>
          </label>
          <label>
            Aparcamiento <span :class="$style.requiredMark" aria-hidden="true">*</span>
            <select id="trip-parking" v-model="form.parking" required :aria-invalid="Boolean(fieldErrors.parking)" :aria-describedby="fieldErrors.parking ? 'trip-parking-error' : undefined" @change="clearFieldError('parking')">
              <option value="panoramis">Parking Panoramis</option>
              <option value="free">Gratuito</option>
            </select>
            <span v-if="fieldErrors.parking" id="trip-parking-error" :class="$style.fieldError" role="alert">
              {{ fieldErrors.parking }}
            </span>
          </label>
          <p :class="$style.destination">Destino: Panoramis, Alicante</p>
          <button type="submit" :disabled="publishing">
            {{ publishing ? 'Publicando…' : hasPublishedTrip ? 'Publicar otro viaje' : 'Publicar viaje' }}
          </button>
          <p v-if="tripMessage" :class="tripMessage.startsWith('Viaje publicado:') ? $style.successMessage : $style.fieldError" :role="tripMessage.startsWith('Viaje publicado:') ? 'status' : 'alert'">
            {{ tripMessage }}
          </p>
        </form>
      </section>
    </template>
  </main>
</template>

<style module>
.page {
  min-height: 100vh;
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: clamp(1rem, 2.5vw, 2.5rem) clamp(0.75rem, 3vw, 2rem);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: center;
}

.title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.1;
  color: var(--color-primary);
}

.subtitle {
  margin: var(--space-sm) 0 var(--space-lg);
  color: var(--color-muted);
}

.demoNotice {
  margin: var(--space-sm) 0 0;
  padding: var(--space-sm);
  border-radius: 0.5rem;
  background: #fff4d6;
  color: #694d00;
  font-size: 0.9rem;
}

.originCard {
  grid-column: 1 / -1;
  display: grid;
  gap: 0.55rem;
  text-align: left;
  min-width: 0;
  padding: clamp(0.75rem, 1.2vw, 1rem);
  border: 1px solid #dfe5e3;
  border-radius: 0.75rem;
  background: #f8fbfa;
}

.originTitle {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.05rem;
}

.originActions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.originMessage {
  margin: 0;
  padding: 0.5rem 0.7rem;
  border-radius: 0.45rem;
  border-left: 3px solid #6b7280;
  background: #f1f3f5;
  color: #333;
  font-size: 0.9rem;
}

.statusSuccess {
  border-color: #16803c;
  background: #edf8f0;
}

.statusWarning {
  border-color: #a15c00;
  background: #fff6e5;
}

.statusError {
  border-color: var(--color-error);
  background: #fff0ef;
}

.statusInfo {
  border-color: var(--color-primary);
  background: #f6edff;
}

.originSuggestions,
.favorites ul {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.originSuggestions {
  max-height: 8rem;
  overflow-y: auto;
}

.originSuggestions button {
  width: 100%;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.favorites {
  display: grid;
  gap: 0.35rem;
}

.favorites h4 {
  margin: 0;
  color: var(--color-primary);
}

.favorites li {
  display: flex;
  align-items: stretch;
  gap: 0.25rem;
  min-width: 0;
  padding: 0.35rem;
  border: 1px solid #e5e5e5;
  border-radius: 0.65rem;
  background: white;
}

.favoriteChoice {
  display: grid;
  flex: 1 1 7rem;
  align-content: center;
  gap: 0.2rem;
  min-width: 0;
  min-height: 3rem;
  padding: 0.4rem 0.55rem;
  border: 0;
  background: transparent;
  color: var(--color-text);
  text-align: left;
}

.selectedFavorite {
  background: #f6edff;
  color: var(--color-primary);
}

.favoriteChoice span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-muted);
  font-size: 0.78rem;
}

.favoriteMenu {
  position: relative;
  align-self: center;
  flex: 0 0 auto;
}

.favoriteMenu summary {
  padding: 0.45rem;
  color: var(--color-muted);
  cursor: pointer;
  font-size: 0.8rem;
  list-style: none;
}

.favoriteMenu summary::-webkit-details-marker {
  display: none;
}

.favoriteMenu summary::after {
  content: " ⋯";
}

.favoriteMenu[open] {
  z-index: 2;
}

.favoriteMenu[open] > button {
  display: block;
  width: 100%;
  min-height: 2.25rem;
  padding: 0.45rem 0.65rem;
  border-radius: 0;
  background: white;
  color: var(--color-text);
  text-align: left;
  white-space: nowrap;
}

.favoriteMenu[open] > button:hover,
.favoriteMenu[open] > button:focus-visible {
  background: #f1f3f5;
}

.favoriteActionMessage {
  font-size: 0.85rem;
}

.primaryButton {
  justify-self: start;
  min-width: min(100%, 15rem);
  font-weight: 700;
}

.secondaryButton {
  background: #f1f3f5;
  color: var(--color-text);
}

.textButton {
  min-height: 2.25rem;
  padding: 0.35rem 0.5rem;
  background: transparent;
  color: var(--color-primary);
}

.favoriteDraft {
  display: flex;
  align-items: end;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.mapHelp {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.82rem;
}

.requiredNote {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.requiredMark {
  color: var(--color-danger, #b42318);
  font-weight: 700;
}

.fieldError {
  display: block;
  margin: 0.35rem 0 0;
  color: var(--color-danger, #b42318);
  font-size: 0.875rem;
}

.successMessage {
  margin: 0;
  color: var(--color-success, #067647);
}

.routeInfo {
  margin: 0;
  font-weight: 600;
}

.status {
  margin: 0;
  font-size: 0.95rem;
}

.tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
  width: 100%;
  margin-top: var(--space-lg);
  padding: 0.25rem;
  border-radius: 0.75rem;
  background: #f0f0f0;
}

.tab {
  border: 0;
  border-radius: 0.55rem;
  min-width: 0;
  padding: 0.65rem clamp(0.25rem, 1vw, 0.75rem);
  background: transparent;
  color: var(--color-muted);
  font-weight: 600;
  line-height: 1.25;
}

.activeTab {
  background: white;
  color: var(--color-primary);
  box-shadow: 0 1px 3px #0000001a;
}

.card {
  width: 100%;
  min-width: 0;
  display: grid;
  gap: var(--space-md);
  margin-top: var(--space-md);
  text-align: left;
  border: 1px solid #e5e5e5;
  border-radius: 0.75rem;
  padding: clamp(1rem, 2vw, 1.75rem);
  background: white;
}

.publishForm > .sectionTitle,
.publishForm > .requiredNote,
.publishForm > .destination,
.publishForm > button,
.publishForm > [role="status"],
.publishForm > [role="alert"] {
  grid-column: 1 / -1;
}

.publishForm > label:first-of-type {
  grid-column: 1 / -1;
}

.row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-md);
}

.destination,
.card p {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.sectionTitle {
  margin: 0;
  color: var(--color-primary);
  font-size: clamp(1.1rem, 1.2vw + 0.85rem, 1.45rem);
}

.results {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  align-items: start;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.searchPanel {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-md);
}

.searchForm {
  grid-column: 1 / -1;
}

.publishedTrips {
  min-width: 0;
  margin-top: var(--space-lg);
  text-align: left;
}

.publishedTrips > .sectionTitle {
  margin-bottom: var(--space-md);
}

.viewAllButton {
  margin-top: var(--space-md);
}

.pageSummary {
  margin: 0;
  color: var(--color-muted);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.pagination span {
  color: var(--color-muted);
  white-space: nowrap;
}

.emptyState {
  color: var(--color-muted);
  font-size: 0.9rem;
}

.resultCard {
  min-width: 0;
  overflow-wrap: anywhere;
  border: 1px solid #dfe5e3;
  border-radius: 0.75rem;
  padding: clamp(0.85rem, 1.5vw, 1.25rem);
  background: white;
  text-align: left;
}

.selectedCard {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.tripDetails {
  margin-top: var(--space-md);
  background: #f8fbfa;
}

.legChoice {
  display: flex;
  gap: var(--space-md);
  border: 0;
  padding: 0;
  margin: var(--space-md) 0;
}

.legChoice label,
.acceptParking {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
}

.estimateBox {
  margin: var(--space-md) 0;
  padding: var(--space-md);
  border-left: 4px solid var(--color-primary);
  border-radius: 0.35rem;
  background: #eef7f3;
}

.estimateBox h4,
.estimateBox p {
  margin: 0 0 0.35rem;
}

.disclaimer {
  color: var(--color-muted);
  font-size: 0.85rem;
}

.resultCard h3,
.resultCard p {
  margin-top: 0;
}

.availability {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin: var(--space-sm) 0;
}

.availability strong {
  border-radius: 999px;
  background: #eef7f3;
  padding: 0.35rem 0.75rem;
  color: var(--color-primary);
  font-size: 0.9rem;
}

.user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  width: 100%;
  margin-top: var(--space-md);
  font-size: 0.9rem;
}

@media (min-width: 40rem) {
  .searchPanel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }

  .searchPanel > .results {
    grid-column: 1;
    margin-top: 0;
  }

  .searchPanel > .publishedTrips {
    grid-column: 1 / -1;
    margin-top: 0;
  }

  .searchPanel.hasSearchResults > .publishedTrips {
    grid-column: 2;
  }

  .publishForm {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: end;
  }
}

@media (max-width: 40rem) {
  .row {
    grid-template-columns: 1fr;
  }

  .tabs {
    gap: 0.15rem;
  }

  .tab {
    font-size: 0.82rem;
  }

  .pagination {
    gap: var(--space-sm);
  }

  .pagination button {
    flex: 1 1 7rem;
  }
}

.checking {
  color: var(--color-muted);
}

.ok {
  color: var(--color-ok);
}

.error {
  color: var(--color-error);
}
</style>
