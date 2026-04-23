<template>
  <main class="profile-page">
    <h1>Mon profil</h1>
    <section v-if="user">
      <ul class="profile-list">
        <li><strong>Email :</strong> {{ user.email }}</li>
        <li v-if="user.id"><strong>ID :</strong> {{ user.id }}</li>
      </ul>
    </section>
    <section v-else>
      <p>Vous n'êtes pas connecté.</p>
    </section>
  </main>
</template>

<script setup>
import { useAuthStore } from '../stores/authStore';
const authStore = useAuthStore();
const user = authStore.user;
</script>

<style scoped>
.profile-page {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 16px 0 #0001;
}
.profile-list {
  list-style: none;
  padding: 0;
}
.profile-list li {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}
</style>
