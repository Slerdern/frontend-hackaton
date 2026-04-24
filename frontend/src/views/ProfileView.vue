<template>
  <main class="profile-page">
    <NavBar
      :is-authenticated="authStore.isAuthenticated"
      :user="authStore.user"
      @toggle-auth="goHome"
      @toggle-chat="toggleChat"
      @logout="handleLogout"
    />

    <section class="profile-hero">
      <p class="profile-kicker">Compte personnel</p>
      <h1>Mon profil</h1>
      <p class="profile-intro">
        Retrouvez ici vos informations de compte et vos préférences de voyage, restaurants et hebergements.
      </p>
    </section>

    <section v-if="displayUser" class="profile-card">
      <div class="profile-summary">
        <div class="profile-avatar" aria-hidden="true">
          {{ initials }}
        </div>
        <div>
          <h2>{{ displayUser.fullName }}</h2>
          <p>{{ displayUser.email }}</p>
          <p class="profile-id">ID: {{ displayUser.id }}</p>
        </div>
      </div>

      <div class="profile-grid">
        <article class="profile-block">
          <h3>Restaurants</h3>
          <dl>
            <div>
              <dt>Cuisines</dt>
              <dd>{{ joinList(displayUser.preferences?.restaurants?.cuisines) }}</dd>
            </div>
            <div>
              <dt>Ambiance</dt>
              <dd>{{ joinList(displayUser.preferences?.restaurants?.atmosphere) }}</dd>
            </div>
            <div>
              <dt>Fourchette de prix</dt>
              <dd>{{ joinList(displayUser.preferences?.restaurants?.priceRange) }}</dd>
            </div>
            <div>
              <dt>Restrictions alimentaires</dt>
              <dd>{{ joinList(displayUser.preferences?.restaurants?.dietaryRestrictions) }}</dd>
            </div>
          </dl>
        </article>

        <article class="profile-block">
          <h3>Hebergements</h3>
          <dl>
            <div>
              <dt>Amenites</dt>
              <dd>{{ joinList(displayUser.preferences?.hotels?.amenities) }}</dd>
            </div>
            <div>
              <dt>Types de voyage</dt>
              <dd>{{ joinList(displayUser.preferences?.hotels?.tripTypes) }}</dd>
            </div>
            <div>
              <dt>Niveau de budget</dt>
              <dd>{{ displayUser.preferences?.hotels?.budgetLevel || 'Non renseigne' }}</dd>
            </div>
            <div>
              <dt>Segments préféres</dt>
              <dd>{{ joinList(displayUser.preferences?.hotels?.preferredSegments) }}</dd>
            </div>
          </dl>
        </article>

        <article class="profile-block">
          <h3>Voyage</h3>
          <dl>
            <div>
              <dt>Style de voyage</dt>
              <dd>{{ displayUser.preferences?.travel?.travelStyle || 'Non renseigne' }}</dd>
            </div>
            <div>
              <dt>Destinations favorites</dt>
              <dd>{{ joinList(displayUser.preferences?.travel?.favoriteDestinations) }}</dd>
            </div>
          </dl>
        </article>
      </div>

      <section class="profile-reservations">
        <div class="profile-reservations-header">
          <div>
            <h3>Vos reservations</h3>
            <p>Consultez ici vos reservations d'hebergement et de restaurant.</p>
          </div>
          <div class="profile-reservations-tabs" role="tablist" aria-label="Reservations utilisateur">
            <button
              type="button"
              class="profile-reservations-tab"
              :class="{ active: activeReservationsTab === 'hotels' }"
              @click="activeReservationsTab = 'hotels'"
            >
              Voir mes reservations d'hebergement
            </button>
            <button
              type="button"
              class="profile-reservations-tab"
              :class="{ active: activeReservationsTab === 'restaurants' }"
              @click="activeReservationsTab = 'restaurants'"
            >
              Voir mes reservations de restaurants
            </button>
          </div>
        </div>

        <div v-if="reservationsLoading" class="profile-reservations-empty">
          Chargement de vos reservations...
        </div>

        <div v-else-if="reservationsError" class="profile-reservations-empty">
          Impossible de charger les reservations depuis le serveur. Affichage des donnees locales si disponibles.
        </div>

        <div v-else-if="filteredReservations.length" class="profile-reservations-list">
          <article v-for="reservation in filteredReservations" :key="reservation.bookingId" class="profile-reservation-card">
            <div class="profile-reservation-top">
              <div>
                <p class="profile-reservation-kind">{{ reservationKindLabel(reservation.kind) }}</p>
                <h4>{{ reservation.name }}</h4>
              </div>
              <span class="profile-reservation-pill">#{{ reservation.bookingId }}</span>
            </div>
            <dl>
              <div v-if="reservation.location">
                <dt>Lieu</dt>
                <dd>{{ reservation.location }}</dd>
              </div>
              <div v-if="reservation.cuisine">
                <dt>Cuisine</dt>
                <dd>{{ reservation.cuisine }}</dd>
              </div>
              <div v-if="reservation.marketSegment">
                <dt>Segment</dt>
                <dd>{{ reservation.marketSegment }}</dd>
              </div>
              <div v-if="reservation.price">
                <dt>Prix</dt>
                <dd>{{ reservation.price }}</dd>
              </div>
              <div>
                <dt>Confirmée le</dt>
                <dd>{{ formatReservationDate(reservation.createdAt) }}</dd>
              </div>
            </dl>
            <p v-if="reservation.summary" class="profile-reservation-summary">{{ reservation.summary }}</p>
          </article>
        </div>

        <div v-else class="profile-reservations-empty">
          Aucune reservation {{ activeReservationsTab === 'hotels' ? "d'hebergement" : 'de restaurant' }} pour le moment.
        </div>
      </section>
    </section>

    <section v-else class="profile-empty">
      <p>Vous n'etes pas connecte.</p>
    </section>

    <ChatbotPanel
      :open="chatOpen"
      :mode="chatMode"
      :loading="chatLoading"
      :welcome-message="welcomeMessages[chatMode]"
      :assistant-message="assistantMessages[chatMode]"
      :follow-ups="followUpsByMode[chatMode]"
      :restaurants="chatRestaurants"
      :hotels="chatHotels"
      @close="chatOpen = false"
      @change-mode="changeChatMode"
      @send="runAiSearch"
    />

    <button
      type="button"
      class="chatbot-fab"
      :class="{ open: chatOpen }"
      :aria-expanded="chatOpen"
      aria-label="Ouvrir le chatbot pour personnaliser votre recherche"
      @click="toggleChat"
    >
      <span class="chatbot-fab-ring" aria-hidden="true"></span>
      <span class="chatbot-fab-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="presentation">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16H11l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-8ZM8 7.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
        </svg>
      </span>
      <span class="chatbot-fab-text">Chatbot pour personnaliser votre recherche</span>
    </button>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

import ChatbotPanel from '../components/ChatbotPanel.vue';
import NavBar from '../components/NavBar.vue';
import { getHotelWelcomeMessage, getWelcomeMessage, searchHotelWithAi, searchWithAi } from '../services/aiService';
import { useAuthStore } from '../stores/authStore';
import { fetchUserReservations, normalizeReservation } from '../services/reservationService';

const authStore = useAuthStore();
const router = useRouter();
const RESERVATIONS_STORAGE_KEY = 'hackaton_reservations';
const activeReservationsTab = ref('hotels');
const reservations = ref([]);
const reservationsLoading = ref(false);
const reservationsError = ref('');
const chatOpen = ref(false);
const chatMode = ref('restaurants');
const chatLoading = ref(false);
const chatRestaurants = ref([]);
const chatHotels = ref([]);
const welcomeMessages = reactive({
  restaurants: '',
  hotels: ''
});
const assistantMessages = reactive({
  restaurants: '',
  hotels: ''
});
const followUpsByMode = reactive({
  restaurants: [],
  hotels: []
});
const fallbackProfile = {
  id: '9f375d22-89ae-4dfd-b1d9-6754cf502729',
  email: 'test30@mail.com',
  fullName: 'Jean Dupont',
  preferences: {
    hotels: {
      amenities: ['piscine', 'spa'],
      tripTypes: ['romantique'],
      budgetLevel: 'medium',
      preferredSegments: []
    },
    travel: {
      travelStyle: 'spontané',
      favoriteDestinations: ['Rome', 'Tokyo']
    },
    restaurants: {
      cuisines: ['italienne', 'japonaise'],
      atmosphere: ['cosy'],
      priceRange: ['€€', '€€€'],
      dietaryRestrictions: []
    }
  }
};

const displayUser = computed(() => {
  if (!authStore.user) {
    return fallbackProfile;
  }

  return {
    ...fallbackProfile,
    ...authStore.user,
    preferences: {
      ...fallbackProfile.preferences,
      ...(authStore.user.preferences || {}),
      hotels: {
        ...fallbackProfile.preferences.hotels,
        ...(authStore.user.preferences?.hotels || {})
      },
      travel: {
        ...fallbackProfile.preferences.travel,
        ...(authStore.user.preferences?.travel || {})
      },
      restaurants: {
        ...fallbackProfile.preferences.restaurants,
        ...(authStore.user.preferences?.restaurants || {})
      }
    }
  };
});

const initials = computed(() => {
  const name = displayUser.value?.fullName || 'Utilisateur';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
});

const filteredReservations = computed(() =>
  reservations.value.filter((reservation) => reservation.kind === activeReservationsTab.value)
);

function readStoredReservations() {
  try {
    const raw = window.localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function normalizeReservationKind(reservation) {
  const rawKind = `${reservation?.kind || reservation?.type || reservation?.category || ''}`.toLowerCase();

  if (rawKind.includes('hotel') || rawKind.includes('stay') || rawKind.includes('room')) {
    return 'hotel';
  }

  return 'restaurant';
}

function normalizeReservations(list) {
  const normalized = (Array.isArray(list) ? list : [])
    .map((reservation) => normalizeReservation(reservation))
    .filter(Boolean)
    .map((reservation) => ({
      ...reservation,
      kind: normalizeReservationKind(reservation)
    }));

  const uniqueReservations = [];
  const seenIds = new Set();

  for (const reservation of normalized) {
    const reservationKey = String(reservation.bookingId);
    if (seenIds.has(reservationKey)) {
      continue;
    }

    seenIds.add(reservationKey);
    uniqueReservations.push(reservation);
  }

  return uniqueReservations;
}

function mergeWithLocalReservations(nextReservations) {
  const localReservations = readStoredReservations();
  return normalizeReservations([...nextReservations, ...localReservations]);
}

async function refreshReservations() {
  reservationsLoading.value = true;
  reservationsError.value = '';

  try {
    const nextReservations = await fetchUserReservations(displayUser.value?.id);
    reservations.value = nextReservations.length ? mergeWithLocalReservations(nextReservations) : normalizeReservations(readStoredReservations());
  } catch (error) {
    reservationsError.value = error?.message || 'Erreur de chargement des reservations.';
    reservations.value = normalizeReservations(readStoredReservations());
  } finally {
    reservationsLoading.value = false;
  }
}

function reservationKindLabel(kind) {
  return kind === 'hotel' ? "Reservation d'hebergement" : 'Reservation de restaurant';
}

function formatReservationDate(value) {
  if (!value) {
    return 'Non renseignee';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function handleReservationsUpdate() {
  if (!reservationsLoading.value) {
    refreshReservations();
  }
}

function goHome() {
  router.push('/');
}

function toggleChat() {
  chatOpen.value = !chatOpen.value;
  if (chatOpen.value) {
    openChat();
  }
}

async function openChat() {
  const mode = chatMode.value;
  if (welcomeMessages[mode]) {
    return;
  }

  try {
    const welcome = mode === 'hotels' ? await getHotelWelcomeMessage() : await getWelcomeMessage();
    welcomeMessages[mode] = welcome.message || '';
    followUpsByMode[mode] = welcome.suggestedPrompts || welcome.suggestedFollowUps || [];
  } catch (error) {
    welcomeMessages[mode] = readError(error);
  }
}

async function runAiSearch(payload) {
  chatLoading.value = true;
  try {
    const mode = chatMode.value;
    const requestBody =
      mode === 'hotels'
        ? {
            message: payload.message,
            limit: payload.limit || 6
          }
        : {
            message: payload.message,
            latitude: payload.latitude,
            longitude: payload.longitude,
            radius: payload.radius,
            limit: payload.limit || 6
          };

    const response = mode === 'hotels' ? await searchHotelWithAi(requestBody) : await searchWithAi(requestBody);
    assistantMessages[mode] = response.assistantMessage || response.intentSummary || '';
    followUpsByMode[mode] = response.suggestedFollowUps || response.suggestedPrompts || [];
    if (mode === 'hotels') {
      chatHotels.value = response.hotels || [];
    } else {
      chatRestaurants.value = response.restaurants || [];
      chatHotels.value = response.hotels || chatHotels.value;
    }
  } catch (error) {
    assistantMessages[chatMode.value] = readError(error);
  } finally {
    chatLoading.value = false;
  }
}

function changeChatMode(nextMode) {
  if (chatMode.value === nextMode) {
    return;
  }

  chatMode.value = nextMode;
  if (nextMode === 'restaurants') {
    chatRestaurants.value = [];
  } else {
    chatHotels.value = [];
  }

  openChat();
}

async function handleLogout() {
  await authStore.logoutUser();
  router.push('/');
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
  refreshReservations();
  window.addEventListener('reservations-updated', handleReservationsUpdate);
  window.addEventListener('storage', handleReservationsUpdate);
});

onBeforeUnmount(() => {
  window.removeEventListener('reservations-updated', handleReservationsUpdate);
  window.removeEventListener('storage', handleReservationsUpdate);
});

function joinList(value) {
  if (!Array.isArray(value) || !value.length) {
    return 'Aucune preference renseignee';
  }

  return value.join(', ');
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding-bottom: 4rem;
}

.profile-hero,
.profile-card,
.profile-empty {
  width: min(980px, 94vw);
  margin: 0 auto;
}

.profile-hero {
  margin-bottom: 1.5rem;
}

.profile-kicker {
  margin: 0 0 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.78rem;
  color: #8f6c11;
  font-weight: 700;
}

.profile-hero h1 {
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  line-height: 1;
}

.profile-intro {
  max-width: 62ch;
  margin: 0.85rem 0 0;
  color: #5d5d5d;
  font-size: 1.05rem;
}

.profile-card {
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.profile-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.profile-avatar {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #c30039, #8e0029);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  flex: none;
}

.profile-summary h2 {
  margin: 0;
  font-size: 1.5rem;
}

.profile-summary p {
  margin: 0.25rem 0 0;
  color: #5d5d5d;
}

.profile-id {
  font-size: 0.9rem;
}

.profile-grid {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.profile-reservations {
  margin-top: 1.5rem;
  padding: 1.1rem;
  border-radius: 1.1rem;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.72);
}

.profile-reservations-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.profile-reservations-header h3 {
  margin: 0;
  font-size: 1.15rem;
}

.profile-reservations-header p {
  margin: 0.25rem 0 0;
  color: #5d5d5d;
}

.profile-reservations-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.profile-reservations-tab {
  min-height: 40px;
  padding: 0 0.95rem;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  color: #4b3f35;
  font-weight: 700;
}

.profile-reservations-tab.active {
  background: linear-gradient(135deg, #f3e5c7, #fff7ea);
  border-color: rgba(201, 157, 90, 0.32);
  color: #7b5c1a;
}

.profile-reservations-list {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.profile-reservation-card {
  padding: 1rem;
  border-radius: 1rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
}

.profile-reservation-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.profile-reservation-top h4 {
  margin: 0.1rem 0 0;
  font-size: 1rem;
}

.profile-reservation-kind {
  margin: 0;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #8f6c11;
  font-weight: 700;
}

.profile-reservation-pill {
  flex: none;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  background: rgba(201, 157, 90, 0.12);
  color: #7b5c1a;
  font-size: 0.72rem;
  font-weight: 700;
}

.profile-reservation-card dl {
  margin: 0.85rem 0 0;
}

.profile-reservation-card dl > div + div {
  margin-top: 0.65rem;
}

.profile-reservation-card dt {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8b8b8b;
  margin-bottom: 0.15rem;
}

.profile-reservation-card dd {
  margin: 0;
  font-weight: 600;
}

.profile-reservation-summary {
  margin: 0.9rem 0 0;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  color: #5d5d5d;
  line-height: 1.5;
}

.profile-reservations-empty {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0.9rem;
  border: 1px dashed rgba(0, 0, 0, 0.12);
  color: #6d6a65;
  background: rgba(255, 255, 255, 0.6);
}

.profile-block {
  padding: 1rem;
  border-radius: 1rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.profile-block h3 {
  margin: 0 0 0.9rem;
  font-size: 1.05rem;
}

.profile-block dl {
  margin: 0;
}

.profile-block dl > div + div {
  margin-top: 0.85rem;
}

.profile-block dt {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8b8b8b;
  margin-bottom: 0.2rem;
}

.profile-block dd {
  margin: 0;
  line-height: 1.45;
  font-weight: 600;
}

.profile-empty {
  padding: 2rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-reservations-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .profile-page {
    padding-top: 5.5rem;
  }

  .profile-summary {
    align-items: flex-start;
  }

  .profile-summary h2 {
    font-size: 1.3rem;
  }
}
</style>
