<template>
  <div v-if="open" class="side-panel-backdrop" @click.self="$emit('close')">
    <aside class="side-panel" v-if="open">
    <div class="panel-header">
      <h3>Inscription / Connexion</h3>
      <button @click="$emit('close')">x</button>
    </div>

    <div class="auth-status">
      <template v-if="isAuthenticated">
        <div v-if="open" class="side-panel-backdrop" @click.self="$emit('close')">
        <p class="hint">Connecté{{ userEmail ? ` : ${userEmail}` : '' }}</p>
        <button :disabled="loading" type="button" @click="emit('logout')">
          {{ loading ? 'Chargement...' : 'Se déconnecter' }}
        </button>
        </div>
      </template>
      <template v-else>
        <p class="hint">Vous n'êtes pas connecté.</p>
        <form class="auth-form" @submit.prevent="handleSubmit">
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            autocomplete="username"
            required
          />
          <input
            v-model="password"
            type="password"
            placeholder="Mot de passe"
            autocomplete="current-password"
            required
          />
          <input
            v-if="mode === 'signup'"
            v-model="fullName"
            type="text"
            placeholder="Nom complet"
            autocomplete="name"
            required
          />
          <div class="auth-actions">
            <button type="submit" :disabled="loading">
              {{ loading ? (mode === 'login' ? 'Connexion...' : 'Inscription...') : (mode === 'login' ? 'Se connecter' : 'Créer un compte') }}
            </button>
            <button type="button" class="switch-auth-mode" @click="toggleMode" :disabled="loading">
              {{ mode === 'login' ? "Créer un compte" : "J'ai déjà un compte" }}
            </button>
          </div>
        </form>
      </template>
    </div>

    <p class="hint" v-if="message">{{ message }}</p>
  </aside>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

defineProps({
  open: Boolean,
  loading: Boolean,
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  userEmail: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'login', 'signup', 'logout']);

const mode = ref('login');
const email = ref('');
const password = ref('');
const fullName = ref('');

function toggleMode() {
  mode.value = mode.value === 'login' ? 'signup' : 'login';
}

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
<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0 0 0;
}
.auth-form input {
  padding: 0.7rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  background: #faf9fa;
  transition: border-color 0.2s;
}
.auth-form input:focus {
  border-color: #c30039;
  outline: none;
}
.auth-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.auth-form button[type="submit"] {
  flex: 1;
  background: #c30039;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.7rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.auth-form button[type="submit"]:hover:not(:disabled) {
  background: #a0002e;
}
.switch-auth-mode {
  background: none;
  border: none;
  color: #c30039;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0.7rem 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;
}
.switch-auth-mode:hover:not(:disabled) {
  background: #f5e6ed;
}
</style>

