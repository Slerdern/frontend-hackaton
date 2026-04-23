<template>
  <main id="top" class="home-page">
    <NavBar
      :is-authenticated="authStore.isAuthenticated"
      :user="authStore.user"
      @toggle-auth="toggleAuth"
      @toggle-chat="toggleChat"
      @logout="handleLogout"
    />

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
            <div class="article-card-gallery">
              <img v-for="image in article.images" :key="image" :src="image" :alt="article.title" />
            </div>
            <div class="article-copy">
              <h3>{{ article.title }}</h3>
              <div class="article-meta">
                <span class="article-meta-item">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 7a1 1 0 0 1 1 1v3.59l2.7 2.7a1 1 0 1 1-1.4 1.42l-3-3A1 1 0 0 1 11 12V8a1 1 0 0 1 1-1Zm0-5a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z" />
                  </svg>
                  {{ article.readTime }}
                </span>
                <span class="article-meta-item">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8ZM5 6a1 1 0 0 0-1 1v1h16V7a1 1 0 0 0-1-1H5Z" />
                  </svg>
                  {{ article.date }}
                </span>
                <span class="article-tag">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M10 3a2 2 0 0 1 1.41.59l8 8a2 2 0 0 1 0 2.82l-5.59 5.59a2 2 0 0 1-2.82 0l-8-8A2 2 0 0 1 2.41 10L3 4a2 2 0 0 1 1.76-1.76L10 2.41V3Zm-4.59 8.59 7 7L18 13l-7-7-4.59.59-.59 4.59ZM8.5 8A1.5 1.5 0 1 0 8.5 5a1.5 1.5 0 0 0 0 3Z" />
                  </svg>
                  {{ article.tag }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="guide-michelin" class="articles-section info-section">
        <h2 class="section-title">En savoir plus sur le Guide MICHELIN</h2>
        <div class="article-grid">
          <article v-for="item in infoCards" :key="item.title" class="article-card">
            <div class="article-card-gallery">
              <img v-for="image in item.images" :key="image" :src="image" :alt="item.title" />
            </div>
            <div class="article-copy">
              <h3>{{ item.title }}</h3>
              <div class="article-meta">
                <span class="article-meta-item">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 7a1 1 0 0 1 1 1v3.59l2.7 2.7a1 1 0 1 1-1.4 1.42l-3-3A1 1 0 0 1 11 12V8a1 1 0 0 1 1-1Zm0-5a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z" />
                  </svg>
                  {{ item.readTime }}
                </span>
                <span class="article-meta-item">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8ZM5 6a1 1 0 0 0-1 1v1h16V7a1 1 0 0 0-1-1H5Z" />
                  </svg>
                  {{ item.date }}
                </span>
                <span class="article-tag">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M10 3a2 2 0 0 1 1.41.59l8 8a2 2 0 0 1 0 2.82l-5.59 5.59a2 2 0 0 1-2.82 0l-8-8A2 2 0 0 1 2.41 10L3 4a2 2 0 0 1 1.76-1.76L10 2.41V3Zm-4.59 8.59 7 7L18 13l-7-7-4.59.59-.59 4.59ZM8.5 8A1.5 1.5 0 1 0 8.5 5a1.5 1.5 0 0 0 0 3Z" />
                  </svg>
                  {{ item.tag }}
                </span>
              </div>
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

    <div v-if="toastMessage" class="toast-bubble" role="status" aria-live="polite">
      {{ toastMessage }}
    </div>
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

import AppFooter from '../components/AppFooter.vue';
import AuthPanel from '../components/AuthPanel.vue';
import CardSection from '../components/CardSection.vue';
import ChatbotPanel from '../components/ChatbotPanel.vue';
import HeroSection from '../components/HeroSection.vue';
import NavBar from '../components/NavBar.vue';
import { getWelcomeMessage, searchWithAi } from '../services/aiService';
import { getHotelsHomeFeed } from '../services/hotelService';
import { searchRestaurants } from '../services/restaurantService';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const router = useRouter();

const query = ref('');
const authOpen = ref(false);
const chatOpen = ref(false);
const authMessage = ref('');
const welcomeMessage = ref('');
const assistantMessage = ref('');
const chatLoading = ref(false);
const followUps = ref([]);
const toastMessage = ref('');

let toastTimeoutId = null;

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
    readTime: '7 min',
    date: '17 avril 2026',
    tag: 'VOYAGE',
    images: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=80'
    ]
  },
  {
    title: 'La liste complete des restaurants du Guide MICHELIN 2026',
    readTime: '16 min',
    date: '16 mars 2026',
    tag: 'ACTU',
    images: [
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=80'
    ]
  }
];

const infoCards = [
  {
    title: 'Tour du monde des restaurants les plus originaux de la selection',
    readTime: '5 min',
    date: '28 novembre 2025',
    tag: 'GUIDE',
    images: [
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80'
    ]
  },
  {
    title: 'La Clef MICHELIN : le dernier palmares',
    readTime: '4 min',
    date: '18 septembre 2025',
    tag: 'HOTELS',
    images: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=700&q=80'
    ]
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
  sections.latest = restaurants.slice(0, 3);
}

function toHotelPrice(avgAdr) {
  if (typeof avgAdr !== 'number') {
    return '€€€';
  }

  if (avgAdr < 90) {
    return '€';
  }

  if (avgAdr < 180) {
    return '€€';
  }

  if (avgAdr < 320) {
    return '€€€';
  }

  return '€€€€';
}

function mapHotelsToCards(hotels) {
  return (hotels || []).map((hotel) => ({
    id: hotel.id,
    name: hotel.name,
    location: hotel.country || 'Lieu non renseigne',
    cuisine: hotel.marketSegment || 'Hebergement',
    price: toHotelPrice(hotel.avgAdr),
    photoUrl: hotel.photoUrl
  }));
}

function splitUnifiedResults(restaurants, hotels) {
  splitForSections(restaurants || []);
  sections.stays = (hotels || []).slice(0, 3);
}

function buildUnifiedSearchPayload(searchText) {
  const trimmed = searchText?.trim();
  const baseSort = {
    limit: 6,
    sortBy: 'score',
    sortDirection: 'desc'
  };

  return {
    restaurantPayload: {
      latitude: 48.8566,
      longitude: 2.3522,
      radius: 3000,
      ...baseSort,
      ...(trimmed
        ? {
            name: trimmed,
            location: trimmed
          }
        : {})
    },
    hotelPayload: {
      ...baseSort,
      ...(trimmed
        ? {
            name: trimmed,
            country: trimmed
          }
        : {})
    }
  };
}

async function loadInitialFeed() {
  const { restaurantPayload } = buildUnifiedSearchPayload('');

  try {
    const [restaurantsResult, hotelsResult] = await Promise.allSettled([
      searchRestaurants(restaurantPayload),
      getHotelsHomeFeed({ limit: 6, offset: 0 })
    ]);

    const restaurants = restaurantsResult.status === 'fulfilled' ? restaurantsResult.value || [] : [];
    const hotels = hotelsResult.status === 'fulfilled' ? mapHotelsToCards(hotelsResult.value || []) : [];

    splitUnifiedResults(restaurants, hotels);
  } catch (error) {
    console.error('Erreur chargement feed', error);
  }
}

async function runClassicSearch() {
  await router.push({
    name: 'search-results',
    query: {
      q: query.value?.trim() || ''
    }
  });
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
    splitUnifiedResults(response.restaurants || [], sections.stays);
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
    authOpen.value = false;
    showToast('Connexion réussie');
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
    authMessage.value = result?.message || 'Deconnexion réussie.';
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

function showToast(message) {
  toastMessage.value = message;

  if (toastTimeoutId) {
    window.clearTimeout(toastTimeoutId);
  }

  toastTimeoutId = window.setTimeout(() => {
    toastMessage.value = '';
    toastTimeoutId = null;
  }, 2000);
}

onMounted(() => {
  loadInitialFeed();
});

onBeforeUnmount(() => {
  if (toastTimeoutId) {
    window.clearTimeout(toastTimeoutId);
  }
});
</script>
