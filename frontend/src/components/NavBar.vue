<template>
  <header class="top-shell">
    <nav class="main-nav">
      <button class="icon-btn" aria-label="Accueil">*</button>
      <button class="icon-btn" aria-label="Position">o</button>
      <button class="account-btn" @click="$emit('toggle-auth')">
        {{ isAuthenticated ? 'Mon compte' : 'Inscription / Connexion' }}
      </button>
      <button class="menu-btn" @click="$emit('toggle-chat')" aria-label="Ouvrir le chatbot">=</button>
    </nav>
  </header>
</template>

<script setup>
defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false
  }
});

defineEmits(['toggle-auth', 'toggle-chat']);
</script>

