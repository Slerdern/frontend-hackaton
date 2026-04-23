<template>
  <main id="top" class="home-page">
    <NavBar :is-authenticated="authStore.isAuthenticated" @toggle-auth="toggleAuth" @toggle-chat="toggleChat" />

    <HeroSection
      :query="query"
      @update:query="query = $event"
      @open-chat="openChat"
      @do-search="runClassicSearch"
    />

    <section class="content-shell">
      <CardSection id="experts" title="Recommandes des experts certifies par le Guide Michelin" :items="sections.experts" />
      <CardSection title="Nos dernieres selections - Restaurants" :items="sections.latest" />
      <CardSection title="Nos dernieres selections - Hebergements" :items="sections.stays" />

      <section id="concepts" class="concepts-section">
        <h2 class="section-title">Nos concepts</h2>
        <article v-for="concept in concepts" :key="concept.title" class="concept-card">
          <div class="concept-thumb" :style="{ backgroundImage: `url(${concept.image})` }"></div>
          <div class="concept-copy">
            <h3>{{ concept.title }}</h3>
            <p>{{ concept.text }}</p>
          </div>
        </article>
      </section>

      <section id="articles" class="articles-section">
        <h2 class="section-title">Nos derniers articles</h2>
        <div class="article-grid">
          <article v-for="article in articles" :key="article.title" class="article-card">
            <img :src="article.image" :alt="article.title" />
            <div class="article-copy">
              <h3>{{ article.title }}</h3>
              <p>{{ article.meta }}</p>
            </div>
          </article>
        </div>
      </section>

      <section id="guide-michelin" class="articles-section info-section">
        <h2 class="section-title">En savoir plus sur le Guide MICHELIN</h2>
        <div class="article-grid">
          <article v-for="item in infoCards" :key="item.title" class="article-card">
            <img :src="item.image" :alt="item.title" />
            <div class="article-copy">
              <h3>{{ item.title }}</h3>
              <p>{{ item.meta }}</p>
            </div>
          </article>
        </div>
      </section>

      <section id="about" class="about-guide">
        <div class="about-guide-visual">
          <img src="/img/guide.png" alt="Guide Michelin Livre">
        </div>
        <h2>En savoir plus sur nous</h2>
        <p>
          Le Guide est un repere fiable avec une voix humaine, basee sur une selection exigeante.
        </p>
        <button type="button">Tout savoir sur le Guide Michelin</button>
      </section>

      <section id="partners" class="partners-section">
        <h2 class="section-title">Nos partenaires</h2>
        <article v-for="partner in partners" :key="partner.name" class="partner-row">
          <div class="partner-logo">{{ partner.logo }}</div>
          <div>
            <h3>{{ partner.name }}</h3>
            <p>{{ partner.role }}</p>
          </div>
        </article>
      </section>
    </section>

    <AppFooter />

    <AuthPanel
      :open="authOpen"
      :loading="authStore.loading"
      :is-authenticated="authStore.isAuthenticated"
      :user-email="authStore.user?.email || ''"
      :message="authMessage"
      @close="authOpen = false"
      @login="handleLogin"
      @signup="handleSignup"
      @logout="handleLogout"
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
import AuthPanel from '../components/AuthPanel.vue';
import CardSection from '../components/CardSection.vue';
import ChatbotPanel from '../components/ChatbotPanel.vue';
import HeroSection from '../components/HeroSection.vue';
import NavBar from '../components/NavBar.vue';
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
  stays: []
});

const concepts = [
  {
    title: 'Les Best-Of',
    text: 'Decouvrez les lieux d exception pour consommer, parfaitement adaptes a vos envies.',
    image:
      'https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?auto=format&fit=crop&w=400&q=80'
  },
  {
    title: 'Les Country by Guide MICHELIN',
    text: 'Le meilleur de nos selections dans des recits inspires.',
    image:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=400&q=80'
  },
  {
    title: 'Le Guide MICHELIN Plus',
    text: 'Un service personnalise et des avantages exclusifs dans nos hubs.',
    image:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80'
  }
];

const articles = [
  {
    title: 'Tour du monde des restaurants les plus originaux de la selection',
    meta: '5 min | 17 avril 2026',
    image:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80'
  },
  {
    title: 'La liste complete des restaurants du Guide MICHELIN 2026',
    meta: '3 min | 19 mars 2026',
    image:
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=500&q=80'
  }
];

const infoCards = [
  {
    title: 'Tour du monde des restaurants les plus originaux de la selection',
    meta: '5 min | 28 novembre 2025',
    image:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=500&q=80'
  },
  {
    title: 'La Clef MICHELIN : le dernier palmares',
    meta: '4 min | 18 septembre 2025',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80'
  }
];

const partners = [
  { logo: 'BL', name: 'Blancpain', role: 'Global Partner' },
  { logo: 'LF', name: 'Lafont', role: 'Global Partner' },
  { logo: 'HM', name: 'Metro', role: 'Official Partner' },
  { logo: 'TF', name: 'TheFork', role: 'Official Booking Partner' }
];

function splitForSections(restaurants) {
  sections.experts = restaurants.slice(0, 2);
  sections.latest = restaurants.slice(2, 4);
  sections.stays = restaurants.slice(4, 6);
}

async function loadInitialFeed() {
  try {
    const results = await searchRestaurants({ latitude: 48.8566, longitude: 2.3522, radius: 3000, limit: 6 });
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
      limit: 6
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
    authMessage.value = 'Connexion reussie.';
  } catch (error) {
    authMessage.value = readError(error);
  }
}

async function handleSignup(payload) {
  authMessage.value = '';
  try {
    await authStore.signupUser(payload);
    authMessage.value = 'Inscription reussie.';
  } catch (error) {
    authMessage.value = readError(error);
  }
}

async function handleLogout() {
  authMessage.value = '';
  try {
    const result = await authStore.logoutUser();
    authMessage.value = result?.message || 'Deconnexion reussie.';
  } catch (error) {
    authMessage.value = readError(error);
  }
}

function readError(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.response?.data?.error || 'Erreur API';
  }
  return 'Une erreur est survenue';
}

onMounted(() => {
  loadInitialFeed();
});
</script>

