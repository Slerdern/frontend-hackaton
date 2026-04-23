<template>
  <main class="search-results-page">
    <NavBar
      :is-authenticated="authStore.isAuthenticated"
      :user="authStore.user"
      @toggle-auth="toggleAuth"
      @toggle-chat="noop"
      @logout="handleLogout"
    />

    <section class="search-results-shell">
      <header class="search-results-header">
        <h1>Resultats de recherche</h1>
        <p>Restaurants et hebergements pour: "{{ searchTerm || 'toutes les destinations' }}"</p>
      </header>

      <form class="search-form" @submit.prevent="submitSearch">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Restaurant, hebergement, lieu..."
          aria-label="Recherche"
        />
        <button type="submit" :disabled="loading">
          {{ loading ? 'Recherche...' : 'Rechercher' }}
        </button>
      </form>

      <p v-if="errorMessage" class="search-error">{{ errorMessage }}</p>

      <section class="results-section">
        <h2>Restaurants ({{ restaurants.length }})</h2>
        <div v-if="loading" class="results-state">Chargement...</div>
        <div v-else-if="!restaurants.length" class="results-state">Aucun restaurant trouve.</div>
        <div v-else class="results-grid">
          <RestaurantCard
            v-for="item in restaurants"
            :key="`restaurant-${item.id || item.name}`"
            :restaurant="item"
          />
        </div>
      </section>

      <section class="results-section">
        <h2>Hebergements ({{ hotels.length }})</h2>
        <div v-if="loading" class="results-state">Chargement...</div>
        <div v-else-if="!hotels.length" class="results-state">Aucun hebergement trouve.</div>
        <div v-else class="results-grid">
          <RestaurantCard
            v-for="item in hotels"
            :key="`hotel-${item.id || item.name}`"
            :restaurant="item"
          />
        </div>
      </section>
    </section>

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
  </main>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

import AuthPanel from '../components/AuthPanel.vue';
import NavBar from '../components/NavBar.vue';
import RestaurantCard from '../components/RestaurantCard.vue';
import { getHotelsHomeFeed, searchHotels } from '../services/hotelService';
import { searchRestaurants } from '../services/restaurantService';
import { useAuthStore } from '../stores/authStore';
import { toAbsoluteImageUrl } from '../utils/formatters';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const searchTerm = ref('');
const loading = ref(false);
const errorMessage = ref('');
const restaurants = ref([]);
const hotels = ref([]);

const authOpen = ref(false);
const authMessage = ref('');

function noop() {}

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

function mapHotelsToCards(items) {
  return (items || []).map((hotel) => ({
    id: hotel.id,
    name: hotel.name,
    location: hotel.country || 'Lieu non renseigne',
    cuisine: hotel.marketSegment || 'Hebergement',
    price: toHotelPrice(hotel.avgAdr),
    photoUrl: toAbsoluteImageUrl(hotel.photoUrl, hotel.name)
  }));
}

const cityToCountryMap = {
  metz: 'france',
  paris: 'france',
  lyon: 'france',
  marseille: 'france',
  nice: 'france',
  bordeaux: 'france',
  lille: 'france',
  nantes: 'france',
  strasbourg: 'france',
  toulouse: 'france'
};

const cuisineMap = {
  japonais: 'japanese',
  japonaise: 'japanese',
  italien: 'italian',
  italienne: 'italian',
  francais: 'french',
  francaise: 'french',
  mediterraneen: 'mediterranean',
  mediterraneenne: 'mediterranean',
  espagnol: 'spanish',
  espagnole: 'spanish',
  thai: 'thai',
  indien: 'indian',
  indienne: 'indian',
  chinois: 'chinese',
  chinoise: 'chinese',
  vietnamien: 'vietnamese',
  vietnamienne: 'vietnamese'
};

function normalizeTerm(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function resolveCountryFromCity(term) {
  const normalized = normalizeTerm(term);
  return cityToCountryMap[normalized] || null;
}

function resolveCuisineFromTerm(term) {
  const normalized = normalizeTerm(term);
  return cuisineMap[normalized] || null;
}

function buildRestaurantSearchPayload(term) {
  const trimmed = term?.trim();
  const cuisine = resolveCuisineFromTerm(trimmed);

  if (cuisine) {
    return {
      cuisine,
      limit: 24,
      sortBy: 'score',
      sortDirection: 'desc'
    };
  }

  return {
    limit: 24,
    sortBy: 'score',
    sortDirection: 'desc',
    ...(trimmed
      ? {
          name: trimmed,
          location: resolveCountryFromCity(trimmed) ? trimmed : undefined
        }
      : {})
  };
}

function buildSearchPayload(term) {
  const baseSort = {
    limit: 24,
    sortBy: 'score',
    sortDirection: 'desc'
  };

  return {
    restaurantPayload: {
      latitude: 48.8566,
      longitude: 2.3522,
      radius: 3000,
      ...buildRestaurantSearchPayload(term)
    },
    hotelBasePayload: baseSort
  };
}

function dedupeHotelsById(items) {
  const seen = new Set();

  return items.filter((item) => {
    const key = item?.id ?? item?.name;

    if (key == null || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function searchHotelsUnified(term, hotelBasePayload) {
  const trimmed = term?.trim();

  if (!trimmed) {
    return getHotelsHomeFeed({ limit: 24, offset: 0 });
  }

  const inferredCountry = resolveCountryFromCity(trimmed);

  const requests = [
    searchHotels({ ...hotelBasePayload, name: trimmed }),
    searchHotels({ ...hotelBasePayload, country: trimmed })
  ];

  if (inferredCountry && inferredCountry !== normalizeTerm(trimmed)) {
    requests.push(searchHotels({ ...hotelBasePayload, country: inferredCountry }));
  }

  const settledResults = await Promise.allSettled(requests);

  const [byNameResult, byCountryResult, byInferredCountryResult] = settledResults;

  const byName = byNameResult.status === 'fulfilled' ? byNameResult.value || [] : [];
  const byCountry = byCountryResult.status === 'fulfilled' ? byCountryResult.value || [] : [];
  const byInferredCountry = byInferredCountryResult?.status === 'fulfilled' ? byInferredCountryResult.value || [] : [];

  if (
    !byName.length &&
    !byCountry.length &&
    !byInferredCountry.length &&
    byNameResult.status === 'rejected' &&
    byCountryResult.status === 'rejected'
  ) {
    throw byNameResult.reason;
  }

  return dedupeHotelsById([...byName, ...byCountry, ...byInferredCountry]).slice(0, 24);
}

async function fetchResults(term) {
  loading.value = true;
  errorMessage.value = '';

  const { restaurantPayload, hotelBasePayload } = buildSearchPayload(term);

  try {
    const [restaurantsResult, hotelsResult] = await Promise.allSettled([
      searchRestaurants(restaurantPayload),
      searchHotelsUnified(term, hotelBasePayload)
    ]);

    if (restaurantsResult.status === 'rejected' && hotelsResult.status === 'rejected') {
      throw restaurantsResult.reason;
    }

    restaurants.value = restaurantsResult.status === 'fulfilled' ? restaurantsResult.value || [] : [];
    hotels.value = hotelsResult.status === 'fulfilled' ? mapHotelsToCards(hotelsResult.value || []) : [];
  } catch (error) {
    errorMessage.value = readError(error);
  } finally {
    loading.value = false;
  }
}

async function submitSearch() {
  await router.push({
    name: 'search-results',
    query: {
      q: searchTerm.value?.trim() || ''
    }
  });
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

function toggleAuth() {
  authOpen.value = !authOpen.value;
}

async function handleLogin(payload) {
  authMessage.value = '';
  try {
    await authStore.loginUser(payload);
    authOpen.value = false;
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

watch(
  () => route.query.q,
  (nextValue) => {
    searchTerm.value = typeof nextValue === 'string' ? nextValue : '';
    fetchResults(searchTerm.value);
  },
  { immediate: true }
);
</script>

<style scoped>
.search-results-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f4ec 0%, #ffffff 40%);
}

.search-results-shell {
  width: min(1120px, 92vw);
  margin: 0 auto;
  padding: 8rem 0 4rem;
}

.search-results-header h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.6rem);
}

.search-results-header p {
  margin: 0.6rem 0 0;
  color: #4d4d4d;
}

.search-form {
  margin: 1.5rem 0 2.25rem;
  display: flex;
  gap: 0.8rem;
}

.search-form input {
  flex: 1;
  border: 1px solid #d7d0bf;
  border-radius: 999px;
  padding: 0.9rem 1.2rem;
  font-size: 1rem;
}

.search-form button {
  border: none;
  border-radius: 999px;
  padding: 0.9rem 1.4rem;
  background: #c30039;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.search-form button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.search-error {
  margin: 0 0 1rem;
  color: #b50000;
  font-weight: 600;
}

.results-section + .results-section {
  margin-top: 2.5rem;
}

.results-section h2 {
  margin: 0 0 1rem;
  font-size: 1.35rem;
}

.results-state {
  color: #5b5b5b;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 980px) {
  .results-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .search-results-shell {
    padding-top: 6.2rem;
  }

  .search-form {
    flex-direction: column;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>
