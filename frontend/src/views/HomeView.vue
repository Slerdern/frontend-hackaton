<template>
  <main class="mobile-wrapper home-page">
    <NavBar :is-authenticated="authStore.isAuthenticated" @toggle-auth="toggleAuth" @toggle-chat="toggleChat" />

    <HeroSection
      :query="query"
      @update:query="query = $event"
      @open-chat="openChat"
      @do-search="runClassicSearch"
    />

    <CardSection title="Recommandes des experts certifies par le Guide Michelin" :items="sections.experts" />
    <CardSection title="Nos dernieres selections - Restaurants" :items="sections.latest" />
    <CardSection title="Autres adresses a decouvrir" :items="sections.extra" />
    <ConceptsSection />
    <ArticlesSection />
    <MichelinGuideSection />
    <AboutSection />
    <PartnersSection />

    <AppFooter />

    <AuthPanel
      :open="authOpen"
      :loading="authStore.loading"
      :message="authMessage"
      @close="authOpen = false"
      @login="handleLogin"
      @signup="handleSignup"
    />

    <ChatbotPanel
      :open="chatOpen"
      :loading="chatLoading"
      :welcome-message="welcomeMessage"
      :assistant-message="assistantMessage"
      :follow-ups="followUps"
      @close="chatOpen = false"
      @send="runAiSearch"
    />
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import axios from 'axios';

import AppFooter from '../components/AppFooter.vue';
import AboutSection from '../components/AboutSection.vue';
import ArticlesSection from '../components/ArticlesSection.vue';
import AuthPanel from '../components/AuthPanel.vue';
import CardSection from '../components/CardSection.vue';
import ChatbotPanel from '../components/ChatbotPanel.vue';
import ConceptsSection from '../components/ConceptsSection.vue';
import HeroSection from '../components/HeroSection.vue';
import MichelinGuideSection from '../components/MichelinGuideSection.vue';
import NavBar from '../components/NavBar.vue';
import PartnersSection from '../components/PartnersSection.vue';
import { getWelcomeMessage, searchWithAi } from '../services/aiService';
import { searchRestaurants } from '../services/restaurantService';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();

const query = ref('');
const authOpen = ref(false);
const chatOpen = ref(false);
const authMessage = ref('');
const welcomeMessage = ref('');
const assistantMessage = ref('');
const chatLoading = ref(false);
const followUps = ref([]);

const sections = reactive({
  experts: [],
  latest: [],
  extra: []
});

function splitForSections(restaurants) {
  sections.experts = restaurants.slice(0, 4);
  sections.latest = restaurants.slice(4, 8);
  sections.extra = restaurants.slice(8, 12);
}

async function loadInitialFeed() {
  try {
    const results = await searchRestaurants({ latitude: 48.8566, longitude: 2.3522, radius: 3000, limit: 12 });
    splitForSections(results || []);
  } catch (error) {
    console.error('Erreur chargement feed', error);
  }
}

async function runClassicSearch() {
  try {
    const payload = {
      latitude: 48.8566,
      longitude: 2.3522,
      radius: 3000,
      name: query.value || undefined,
      limit: 12
    };
    const results = await searchRestaurants(payload);
    splitForSections(results || []);
  } catch (error) {
    authMessage.value = readError(error);
  }
}

function toggleAuth() {
  authOpen.value = !authOpen.value;
}

function toggleChat() {
  chatOpen.value = !chatOpen.value;
  if (chatOpen.value) {
    openChat();
  }
}

async function openChat() {
  chatOpen.value = true;
  if (welcomeMessage.value) {
    return;
  }
  try {
    const welcome = await getWelcomeMessage();
    welcomeMessage.value = welcome.message || '';
    followUps.value = welcome.suggestedPrompts || [];
  } catch (error) {
    welcomeMessage.value = readError(error);
  }
}

async function runAiSearch(payload) {
  chatLoading.value = true;
  try {
    const response = await searchWithAi(payload);
    assistantMessage.value = response.assistantMessage || response.intentSummary || '';
    followUps.value = response.suggestedFollowUps || [];
    splitForSections(response.restaurants || []);
  } catch (error) {
    assistantMessage.value = readError(error);
  } finally {
    chatLoading.value = false;
  }
}

async function handleLogin(payload) {
  authMessage.value = '';
  try {
    await authStore.loginUser(payload);
    authMessage.value = 'Connexion reussie';
  } catch (error) {
    authMessage.value = readError(error);
  }
}

async function handleSignup(payload) {
  authMessage.value = '';
  try {
    await authStore.signupUser(payload);
    authMessage.value = 'Inscription reussie';
  } catch (error) {
    authMessage.value = readError(error);
  }
}

function readError(error) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.response?.data?.error || 'Erreur API';
  }
  return 'Une erreur est survenue';
}

onMounted(() => {
  loadInitialFeed();
});
</script>
