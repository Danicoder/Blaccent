<script setup>
import { onMounted, ref } from 'vue'
import { checkSupabaseConnection } from './services/supabase.js'

const status = ref('checking')

onMounted(async () => {
  try {
    await checkSupabaseConnection()
    status.value = 'ok'
  } catch {
    status.value = 'error'
  }
})
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