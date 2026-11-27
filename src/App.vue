<script setup>
import { onMounted, ref } from 'vue'
import {
  checkSupabaseConnection,
  getCurrentSession,
  getPublishedTrips,
  publishTrip,
  searchTrips,
  signOut,
  supabase,
} from './services/supabase.js'

// Magic Link desactivado temporalmente para desarrollo local y despliegues.
const accessEnabled = false
const status = ref('checking')
const session = ref(null)
const tripMessage = ref('')
const searchMessage = ref('')
const publishing = ref(false)
const searching = ref(false)
const searchResults = ref([])
const publishedTrips = ref([])
const publishedTripsMessage = ref('')
const selectedTrip = ref(null)
const loadingPublishedTrips = ref(false)
const activeTab = ref('search')
const form = ref({
  origin: '',
  travelDate: '',
  departureTime: '',
  arrivalTime: '',
  returnTime: '',
  mode: 'both',
  seats: 3,
  parking: 'panoramis',
})
const search = ref({
  origin: '',
  travelDate: '',
})

onMounted(async () => {
  try {
    await checkSupabaseConnection()
    status.value = 'ok'
    if (accessEnabled) {
      // Restaurar este bloque al reactivar Magic Link; suscribirse antes de
      // recuperar sesión para recibir el retorno del enlace de correo.
      supabase.auth.onAuthStateChange((_event, nextSession) => {
        session.value = nextSession
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
}

async function createTrip() {
  tripMessage.value = ''
  publishing.value = true
  try {
    await publishTrip({
      ...form.value,
      seats: Number(form.value.seats),
    })
    tripMessage.value = 'Viaje publicado.'
    await loadPublishedTrips()
  } catch (error) {
    tripMessage.value = error.message
  } finally {
    publishing.value = false
  }
}

async function loadPublishedTrips() {
  loadingPublishedTrips.value = true
  publishedTripsMessage.value = ''
  try {
    publishedTrips.value = await getPublishedTrips()
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

function parkingLabel(parking) {
  return parking === 'panoramis' ? 'Parking Panoramis' : 'Parking gratuito'
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
          id="publish-tab"
          type="button"
          role="tab"
          aria-controls="publish-panel"
          :aria-selected="activeTab === 'publish'"
          :class="[$style.tab, activeTab === 'publish' && $style.activeTab]"
          @click="activeTab = 'publish'"
        >
          Publicar viaje
        </button>
      </div>

      <section
        v-if="activeTab === 'search'"
        id="search-panel"
        role="tabpanel"
        aria-labelledby="search-tab"
      >
        <form :class="$style.card" @submit.prevent="findTrips">
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
            <p>{{ trip.travel_date }} · Salida {{ trip.departure_time }}</p>
            <p v-if="trip.arrival_time">Llegada aproximada {{ trip.arrival_time }}</p>
            <p v-if="trip.return_time">Vuelta aproximada {{ trip.return_time }}</p>
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
        </section>

        <section :class="$style.publishedTrips" aria-labelledby="published-title">
          <h2 id="published-title" :class="$style.sectionTitle">Viajes publicados</h2>
          <p v-if="loadingPublishedTrips" role="status">Cargando viajes publicados…</p>
          <p v-else-if="publishedTripsMessage" role="alert">{{ publishedTripsMessage }}</p>
          <p v-else-if="publishedTrips.length === 0" :class="$style.emptyState">
            Todavía no hay viajes publicados.
          </p>
          <div v-else :class="$style.results">
            <article
              v-for="trip in publishedTrips"
              :key="trip.id"
              :class="[$style.resultCard, selectedTrip?.id === trip.id && $style.selectedCard]"
            >
              <h3>{{ trip.origin }} → {{ trip.destination }}</h3>
              <p>{{ trip.travel_date }} · Salida {{ trip.departure_time }}</p>
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
                @click="selectedTrip = trip"
              >
                {{ selectedTrip?.id === trip.id ? 'Viaje seleccionado' : 'Seleccionar viaje' }}
              </button>
            </article>
          </div>
          <article v-if="selectedTrip" :class="[$style.resultCard, $style.tripDetails]" aria-live="polite">
            <h3>Viaje seleccionado</h3>
            <p>{{ selectedTrip.origin }} → {{ selectedTrip.destination }}</p>
            <p>{{ selectedTrip.travel_date }} · Salida {{ selectedTrip.departure_time }}</p>
            <p v-if="selectedTrip.arrival_time">Llegada aproximada {{ selectedTrip.arrival_time }}</p>
            <p v-if="selectedTrip.return_time">Vuelta aproximada {{ selectedTrip.return_time }}</p>
            <p>{{ parkingLabel(selectedTrip.parking) }}</p>
          </article>
        </section>
      </section>

      <section
        v-else
        id="publish-panel"
        role="tabpanel"
        aria-labelledby="publish-tab"
      >
        <form :class="$style.card" @submit.prevent="createTrip">
          <h2 :class="$style.sectionTitle">Publicar viaje</h2>
          <label>
            Origen
            <input v-model="form.origin" required placeholder="Ej. San Vicente" />
          </label>
          <div :class="$style.row">
            <label>Fecha <input v-model="form.travelDate" type="date" required /></label>
            <label>Plazas <input v-model="form.seats" type="number" min="1" max="8" required /></label>
          </div>
          <label>
            Hora de salida (ida)
            <input v-model="form.departureTime" type="time" required />
          </label>
          <label>
            Hora estimada de llegada
            <input v-model="form.arrivalTime" type="time" />
          </label>
          <label>
            Modalidad
            <select v-model="form.mode">
              <option value="outbound">Solo ida</option>
              <option value="inbound">Solo vuelta</option>
              <option value="both">Ida y vuelta</option>
            </select>
          </label>
          <label v-if="form.mode !== 'outbound'">
            Hora prevista de regreso
            <input v-model="form.returnTime" type="time" />
          </label>
          <label>
            Aparcamiento
            <select v-model="form.parking">
              <option value="panoramis">Parking Panoramis</option>
              <option value="free">Gratuito</option>
            </select>
          </label>
          <p :class="$style.destination">Destino: Panoramis, Alicante</p>
          <button type="submit" :disabled="publishing">
            {{ publishing ? 'Publicando…' : 'Publicar viaje' }}
          </button>
          <p v-if="tripMessage" role="status">{{ tripMessage }}</p>
        </form>
      </section>
    </template>
  </main>
</template>

<style module>
.page {
  min-height: 100vh;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: var(--space-lg) var(--space-md);
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.title {
  margin: 0;
  font-size: clamp(2rem, 8vw, 3rem);
  color: var(--color-primary);
}

.subtitle {
  margin: var(--space-sm) 0 var(--space-lg);
  color: var(--color-muted);
}

.status {
  margin: 0;
  font-size: 0.95rem;
}

.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
  padding: 0.75rem 0.5rem;
  background: transparent;
  color: var(--color-muted);
  font-weight: 600;
}

.activeTab {
  background: white;
  color: var(--color-primary);
  box-shadow: 0 1px 3px #0000001a;
}

.card {
  width: 100%;
  display: grid;
  gap: var(--space-md);
  margin-top: var(--space-lg);
  text-align: left;
  border: 1px solid #e5e5e5;
  border-radius: 0.75rem;
  padding: var(--space-lg) var(--space-md);
  background: white;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
  font-size: 1.2rem;
}

.results {
  width: 100%;
  display: grid;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.publishedTrips {
  margin-top: var(--space-lg);
  text-align: left;
}

.publishedTrips > .sectionTitle {
  margin-bottom: var(--space-md);
}

.emptyState {
  color: var(--color-muted);
  font-size: 0.9rem;
}

.resultCard {
  border: 1px solid #dfe5e3;
  border-radius: 0.75rem;
  padding: var(--space-md);
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

@media (max-width: 480px) {
  .row {
    grid-template-columns: 1fr;
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
