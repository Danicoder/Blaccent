<script setup>
import { onMounted, ref } from 'vue'
import {
  checkSupabaseConnection,
  getCurrentSession,
  publishTrip,
  signInWithOtp,
  signOut,
  supabase,
} from './services/supabase.js'

const status = ref('checking')
const session = ref(null)
const email = ref('')
const authMessage = ref('')
const tripMessage = ref('')
const publishing = ref(false)
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

onMounted(async () => {
  try {
    await checkSupabaseConnection()
    status.value = 'ok'
    session.value = await getCurrentSession()
    if (supabase?.auth?.onAuthStateChange) {
      supabase.auth.onAuthStateChange((_event, nextSession) => {
        session.value = nextSession
      })
    }
  } catch {
    status.value = 'error'
  }
})

async function requestAccess() {
  authMessage.value = ''
  try {
    await signInWithOtp(email.value)
    authMessage.value = 'Revisa tu correo y abre el enlace para iniciar sesion.'
  } catch (error) {
    authMessage.value = error.message
  }
}

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
  } catch (error) {
    tripMessage.value = error.message
  } finally {
    publishing.value = false
  }
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

    <template v-if="status === 'ok' && !session">
      <form :class="$style.card" @submit.prevent="requestAccess">
        <label>
          Correo de Accenture
          <input v-model="email" type="email" autocomplete="email" placeholder="nombre@accenture.com" required />
        </label>
        <button type="submit">Enviar Magic Link</button>
        <p v-if="authMessage" role="status">{{ authMessage }}</p>
      </form>
    </template>

    <template v-if="status === 'ok' && session">
      <div :class="$style.user">
        <span>{{ session.user.email }}</span>
        <button type="button" @click="logout">Cerrar sesion</button>
      </div>

      <form :class="$style.card" @submit.prevent="createTrip">
        <label>
          Origen
          <input v-model="form.origin" required placeholder="Ej. San Vicente" />
        </label>
        <div :class="$style.row">
          <label>Fecha <input v-model="form.travelDate" type="date" required /></label>
          <label>Plazas <input v-model="form.seats" type="number" min="1" max="8" required /></label>
        </div>
        <div :class="$style.row">
          <label>Salida <input v-model="form.departureTime" type="time" required /></label>
          <label>Llegada <input v-model="form.arrivalTime" type="time" /></label>
        </div>
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