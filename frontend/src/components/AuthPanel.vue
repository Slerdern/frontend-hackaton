<template>
  <div v-if="open" class="side-panel-backdrop" @click.self="$emit('close')">
    <aside class="side-panel">
      <div class="panel-header">
        <h3>Inscription / Connexion</h3>
        <button @click="$emit('close')">x</button>
      </div>

      <div class="auth-tabs">
        <button :class="{ active: mode === 'login' }" @click="mode = 'login'">Connexion</button>
        <button :class="{ active: mode === 'signup' }" @click="mode = 'signup'">Inscription</button>
      </div>

      <form class="stack" @submit.prevent="handleSubmit">
        <input v-if="mode === 'signup'" v-model.trim="fullName" required placeholder="Nom complet" />
        <input v-model.trim="email" required type="email" placeholder="Email" />
        <input v-model="password" required type="password" minlength="8" placeholder="Mot de passe" />
        <button :disabled="loading" type="submit">{{ loading ? 'Chargement...' : submitLabel }}</button>
      </form>

      <p class="hint" v-if="message">{{ message }}</p>
    </aside>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  open: Boolean,
  loading: Boolean,
  message: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'login', 'signup']);

const mode = ref('login');
const email = ref('');
const password = ref('');
const fullName = ref('');

const submitLabel = computed(() => (mode.value === 'login' ? 'Se connecter' : "Creer un compte"));

function handleSubmit() {
  if (mode.value === 'login') {
    emit('login', { email: email.value, password: password.value });
    return;
  }

  emit('signup', {
    email: email.value,
    password: password.value,
    fullName: fullName.value
  });
}
</script>
