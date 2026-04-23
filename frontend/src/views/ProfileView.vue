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
              <dt>Segments preferes</dt>
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

      <section class="profile-validated-reservations">
        <div class="profile-reservations-header">
          <div>
            <h3>Lieux validés</h3>
            <p>Retrouvez les lieux confirmés, leur image, leur nom et leur statut de réservation.</p>
          </div>
        </div>

        <div v-if="validatedReservationsLoading" class="profile-reservations-empty">
          Chargement des lieux validés...
        </div>

        <div v-else-if="validatedReservationsError" class="profile-reservations-empty profile-error">
          {{ validatedReservationsError }}
        </div>

        <template v-else>
          <div v-if="validatedPlaceCards.length" class="profile-places-list">
            <article
              v-for="place in validatedPlaceCards"
              :key="`${place.kind}-${place.placeId}`"
              class="profile-place-card"
            >
              <div class="profile-place-media">
                <img :src="place.imageUrl" :alt="place.placeName" class="profile-place-image" />
              </div>

              <div class="profile-place-body">
                <p class="profile-reservation-kind">{{ place.kindLabel }}</p>
                <h4>{{ place.placeName }}</h4>
                <p class="profile-place-location">{{ place.placeLocation }}</p>

                <button
                  type="button"
                  class="profile-review-btn profile-review-btn-primary profile-place-review-trigger"
                  @click="handleReviewClick(place)"
                >
                  Laisser un avis
                </button>

                <div v-if="reviewingReservationId === `${place.kind}-${place.placeId}`" class="profile-review-form">
                  <h5>Laisser un avis</h5>
                  <textarea
                    v-model="reviewText"
                    placeholder="Décrivez votre expérience (minimum 10 caractères)..."
                    class="profile-review-textarea"
                    rows="4"
                  ></textarea>
                  <div class="profile-review-actions">
                    <button
                      type="button"
                      class="profile-review-btn profile-review-btn-submit"
                      :disabled="submitReviewLoading || reviewText.trim().length < 10"
                      @click="submitReview(place.placeId, place.kind)"
                    >
                      {{ submitReviewLoading ? 'Envoi...' : 'Envoyer mon avis' }}
                    </button>
                    <button
                      type="button"
                      class="profile-review-btn profile-review-btn-cancel"
                      :disabled="submitReviewLoading"
                      @click="reviewingReservationId = null; reviewText = ''"
                    >
                      Annuler
                    </button>
                  </div>
                  <div v-if="submitReviewError" class="profile-review-error">
                    {{ submitReviewError }}
                  </div>
                  <div v-if="reviewSubmitted" class="profile-review-success">
                    Votre avis a été envoyé avec succès!
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="profile-reservations-empty">
            Aucun lieu validé pour le moment.
          </div>

          <div class="profile-comments-section">
            <div class="profile-reservations-header profile-reservations-header--stacked">
              <div>
                <h3>Derniers commentaires laissés</h3>
                <p>Les avis déjà déposés sur vos lieux confirmés.</p>
              </div>
            </div>

            <div v-if="recentCommentCards.length" class="profile-comments-list">
              <article
                v-for="comment in recentCommentCards"
                :key="`${comment.kind}-${comment.placeId}-comment`"
                class="profile-comment-card"
              >
                <div class="profile-comment-top">
                  <span class="profile-reservation-kind">{{ comment.kindLabel }}</span>
                  <span class="profile-comment-date">{{ formatReservationDate(comment.reviewDate) }}</span>
                </div>
                <h4>{{ comment.placeName }}</h4>
                <p class="profile-place-location">{{ comment.placeLocation }}</p>
                <p class="profile-comment-text">{{ comment.reviewText }}</p>
              </article>
            </div>

            <div v-else class="profile-reservations-empty">
              Aucun commentaire laissé pour le moment.
            </div>
          </div>
        </template>
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
import { toAbsoluteImageUrl } from '../utils/formatters';
import { getHotelWelcomeMessage, getWelcomeMessage, searchHotelWithAi, searchWithAi } from '../services/aiService';
import { useAuthStore } from '../stores/authStore';
import { fetchUserReservations, normalizeReservation } from '../services/reservationService';
import { getUserRestaurantReservations, canReviewRestaurantReservation, postRestaurantReview } from '../services/restaurantService';
import { getUserHotelReservations, canReviewHotelReservation, postHotelReview } from '../services/hotelService';

const authStore = useAuthStore();
const router = useRouter();
const RESERVATIONS_STORAGE_KEY = 'hackaton_reservations';
const activeReservationsTab = ref('hotels');
const reservations = ref([]);
const reservationsLoading = ref(false);
const reservationsError = ref('');
const validatedRestaurants = ref([]);
const validatedHotels = ref([]);
const validatedReservationsLoading = ref(false);
const validatedReservationsError = ref('');
const reviewingReservationId = ref(null);
const reviewText = ref('');
const submitReviewLoading = ref(false);
const submitReviewError = ref('');
const reviewSubmitted = ref(false);
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

const validatedPlaceCards = computed(() => {
  const restaurantCards = validatedRestaurants.value.map((reservation) => buildValidatedPlaceCard(reservation, 'restaurant'));
  const hotelCards = validatedHotels.value.map((reservation) => buildValidatedPlaceCard(reservation, 'hotel'));

  return [...restaurantCards, ...hotelCards].sort((left, right) => right.sortDate - left.sortDate);
});

const recentCommentCards = computed(() =>
  validatedPlaceCards.value
    .filter((place) => place.hasReview)
    .sort((left, right) => right.reviewDateValue - left.reviewDateValue)
    .slice(0, 6)
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

function toTimestamp(value) {
  if (!value) {
    return 0;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function compactValue(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  return Array.isArray(value) ? value.filter(Boolean).join(', ') : String(value);
}

function addDetail(entries, label, value) {
  const formattedValue = compactValue(value);
  if (!formattedValue) {
    return;
  }

  entries.push({ label, value: formattedValue });
}

function formatDateParts(day, month, year) {
  const parts = [day, month, year].filter(Boolean);
  return parts.length ? parts.join(' ') : '';
}

function getReservationStatusMeta(reservation) {
  const rawStatus = `${reservation?.reservation_status || reservation?.status || ''}`.trim().toLowerCase();

  if (reservation?.is_canceled || rawStatus.includes('cancel')) {
    return { label: 'Annulé', tone: 'danger', value: 'cancelled' };
  }

  if (rawStatus.includes('pending') || rawStatus.includes('wait')) {
    return { label: 'En attente', tone: 'warning', value: 'pending' };
  }

  if (!rawStatus || rawStatus.includes('book') || rawStatus.includes('confirm') || rawStatus.includes('accept') || rawStatus.includes('paid') || rawStatus.includes('done') || rawStatus.includes('complete')) {
    return { label: 'Confirmé', tone: 'success', value: 'confirmed' };
  }

  return { label: rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1), tone: 'neutral', value: rawStatus };
}

function getReservationDisplayLocation(reservation) {
  return compactValue(reservation?.location || reservation?.city || reservation?.country || reservation?.address || reservation?.destination) || 'Lieu non renseigne';
}

function getReservationDisplayImage(reservation, fallbackName) {
  return toAbsoluteImageUrl(
    reservation?.photoUrl || reservation?.photo_url || reservation?.imageUrl || reservation?.image_url || reservation?.picture || reservation?.thumbnail || reservation?.image || '',
    fallbackName
  );
}

function getRestaurantDisplayName(reservation) {
  return reservation.restaurant_name || reservation.restaurant || reservation.name || reservation.restaurantName || `Réservation #${reservation.id || reservation.bookingId}`;
}

function getHotelDisplayName(reservation) {
  return reservation.hotel || reservation.name || reservation.hotelName || `Hébergement #${reservation.id || reservation.bookingId}`;
}

function getRestaurantDetailEntries(reservation) {
  const entries = [];

  addDetail(entries, 'Lieu', getReservationDisplayLocation(reservation));
  addDetail(entries, "Date de réservation", formatDateParts(reservation.arrival_date_day || reservation.arrival_date_day_of_month, reservation.arrival_date_month, reservation.arrival_date_year) || reservation.reservation_date || reservation.created_at);
  addDetail(entries, 'Heure', reservation.reservation_time);
  addDetail(entries, 'Nombre de personnes', reservation.party_size || reservation.adults);
  addDetail(entries, 'Cuisine', reservation.cuisine);
  addDetail(entries, 'Durée estimée', reservation.duration_minutes ? `${reservation.duration_minutes} minutes` : '');
  addDetail(entries, 'Demandes spéciales', reservation.special_requests);

  return entries;
}

function getHotelDetailEntries(reservation) {
  const entries = [];

  addDetail(entries, 'Lieu', getReservationDisplayLocation(reservation));
  addDetail(entries, "Date d'arrivée", formatDateParts(reservation.arrival_date_day_of_month || reservation.arrival_date_day, reservation.arrival_date_month, reservation.arrival_date_year));

  const travelers = [];
  if (reservation.adults !== undefined && reservation.adults !== null) {
    travelers.push(`${reservation.adults} adulte${Number(reservation.adults) > 1 ? 's' : ''}`);
  }
  if (reservation.children !== undefined && reservation.children !== null && Number(reservation.children) > 0) {
    travelers.push(`${reservation.children} enfant${Number(reservation.children) > 1 ? 's' : ''}`);
  }
  if (reservation.babies !== undefined && reservation.babies !== null && Number(reservation.babies) > 0) {
    travelers.push(`${reservation.babies} bébé${Number(reservation.babies) > 1 ? 's' : ''}`);
  }
  addDetail(entries, 'Voyageurs', travelers.join(' • '));

  const stayParts = [];
  if (reservation.stays_in_week_nights !== undefined && reservation.stays_in_week_nights !== null) {
    stayParts.push(`${reservation.stays_in_week_nights} nuit${Number(reservation.stays_in_week_nights) > 1 ? 's' : ''} en semaine`);
  }
  if (reservation.stays_in_weekend_nights !== undefined && reservation.stays_in_weekend_nights !== null) {
    stayParts.push(`${reservation.stays_in_weekend_nights} nuit${Number(reservation.stays_in_weekend_nights) > 1 ? 's' : ''} le week-end`);
  }
  addDetail(entries, 'Séjour', stayParts.join(' • '));

  addDetail(entries, 'Type de chambre', reservation.reserved_room_type || reservation.assigned_room_type);
  addDetail(entries, 'ADR', reservation.adr !== undefined && reservation.adr !== null ? `${reservation.adr}` : '');

  return entries;
}

function getReviewText(reservation) {
  return compactValue(reservation?.avis || reservation?.review || reservation?.reviewText || reservation?.comment || '');
}

function getReviewDate(reservation) {
  return (
    reservation?.reviewedAt ||
    reservation?.reviewed_at ||
    reservation?.updatedAt ||
    reservation?.updated_at ||
    reservation?.confirmedAt ||
    reservation?.confirmed_at ||
    reservation?.createdAt ||
    reservation?.created_at ||
    null
  );
}

function buildValidatedPlaceCard(reservation, kind) {
  const status = getReservationStatusMeta(reservation);
  const name = kind === 'hotel' ? getHotelDisplayName(reservation) : getRestaurantDisplayName(reservation);
  const location = getReservationDisplayLocation(reservation);
  const reviewText = getReviewText(reservation);
  const reviewDate = getReviewDate(reservation);
  const hasReview = Boolean(reviewText);
  const canLeaveReview = status.value === 'confirmed' && !hasReview;

  return {
    kind,
    kindLabel: kind === 'hotel' ? 'Hébergement' : 'Restaurant',
    reservation,
    placeId: reservation.id || reservation.bookingId,
    placeName: name,
    placeLocation: location,
    imageUrl: getReservationDisplayImage(reservation, name),
    statusLabel: status.label,
    statusTone: status.tone,
    statusValue: status.value,
    hasReview,
    canLeaveReview,
    reviewText,
    reviewDate,
    reviewDateValue: toTimestamp(reviewDate),
    placeDetails: kind === 'hotel' ? getHotelDetailEntries(reservation) : getRestaurantDetailEntries(reservation),
    sortDate: toTimestamp(reviewDate || reservation?.updatedAt || reservation?.updated_at || reservation?.createdAt || reservation?.created_at)
  };
}

function handleReservationsUpdate() {
  if (!reservationsLoading.value) {
    refreshReservations();
  }
}

function parseCanReviewResponse(response) {
  if (typeof response === 'boolean') {
    return response;
  }

  if (typeof response === 'string') {
    const normalized = response.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  if (typeof response === 'number') {
    return response === 1;
  }

  if (!response || typeof response !== 'object') {
    return false;
  }

  if (typeof response.canReview === 'boolean') {
    return response.canReview;
  }

  if (typeof response.can_review === 'boolean') {
    return response.can_review;
  }

  if (typeof response.reviewable === 'boolean') {
    return response.reviewable;
  }

  if (typeof response.allowed === 'boolean') {
    return response.allowed;
  }

  return false;
}

async function handleReviewClick(place) {
  submitReviewError.value = '';
  reviewSubmitted.value = false;

  try {
    if (!place?.placeId) {
      submitReviewError.value = 'Impossible de vérifier cette réservation (ID manquant).';
      window.alert('Impossible de vérifier cette réservation (ID manquant).');
      return;
    }

    let canReview = false;

    if (place.kind === 'hotel') {
      const data = await canReviewHotelReservation(place.placeId);
      canReview = parseCanReviewResponse(data);
    } else {
      const data = await canReviewRestaurantReservation(place.placeId);
      canReview = parseCanReviewResponse(data);
    }

    if (!canReview) {
      submitReviewError.value = "Vous devez vivre l'expérience pour laisser un avis";
      window.alert("Vous devez vivre l'expérience pour laisser un avis");
      return;
    }

    reviewingReservationId.value = `${place.kind}-${place.placeId}`;
    reviewText.value = '';
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Impossible de vérifier la réservation pour le moment.';
    submitReviewError.value = message;
    window.alert(message);
  }
}

async function refreshValidatedReservations() {
  validatedReservationsLoading.value = true;
  validatedReservationsError.value = '';

  try {
    const userEmail = displayUser.value?.email;
    if (!userEmail) {
      throw new Error('Email utilisateur non disponible');
    }

    const extractList = (response, fallbackKey) => {
      if (Array.isArray(response)) {
        return response;
      }

      return response?.[fallbackKey] || response?.reservations || response?.bookings || response?.items || response?.data || [];
    };

    const loadValidatedList = async (loader, reviewer, fallbackKey, kind) => {
      const response = await loader(userEmail);
      const list = extractList(response, fallbackKey);

      return Promise.all(
        list.map(async (reservation) => {
          let canReview = false;

          try {
            const reservationId = reservation.id || reservation.reservationId || reservation.bookingId;
            const reviewResponse = await reviewer(reservationId);
            canReview = parseCanReviewResponse(reviewResponse);
          } catch {
            canReview = false;
          }

          return {
            ...reservation,
            canReview,
            type: kind
          };
        })
      );
    };

    const [restaurantsList, hotelsList] = await Promise.all([
      loadValidatedList(getUserRestaurantReservations, canReviewRestaurantReservation, 'reservations', 'restaurant'),
      loadValidatedList(getUserHotelReservations, canReviewHotelReservation, 'bookings', 'hotel')
    ]);

    validatedRestaurants.value = restaurantsList;
    validatedHotels.value = hotelsList;
  } catch (error) {
    validatedReservationsError.value = error?.message || 'Erreur de chargement des réservations validées.';
  } finally {
    validatedReservationsLoading.value = false;
  }
}

async function submitReview(reservationId, type) {
  if (!reviewText.value.trim()) {
    submitReviewError.value = 'Veuillez entrer un avis avant de le soumettre.';
    return;
  }

  submitReviewLoading.value = true;
  submitReviewError.value = '';
  reviewSubmitted.value = false;

  try {
    const review = reviewText.value.trim();
    
    if (type === 'restaurant') {
      await postRestaurantReview(reservationId, review);
    } else {
      await postHotelReview(reservationId, review);
    }

    const updatedAt = new Date().toISOString();
    const targetList = type === 'restaurant' ? validatedRestaurants.value : validatedHotels.value;
    const targetReservation = targetList.find((reservation) => String(reservation.id || reservation.bookingId) === String(reservationId));

    if (targetReservation) {
      targetReservation.avis = review;
      targetReservation.review = review;
      targetReservation.reviewText = review;
      targetReservation.reviewedAt = updatedAt;
      targetReservation.reviewed_at = updatedAt;
      targetReservation.updatedAt = updatedAt;
      targetReservation.updated_at = updatedAt;
      targetReservation.canReview = false;
    }

    reviewSubmitted.value = true;
    reviewText.value = '';
    reviewingReservationId.value = null;
    
    // Recharger les réservations validées après la soumission
    setTimeout(() => {
      refreshValidatedReservations();
      reviewSubmitted.value = false;
    }, 2000);
  } catch (error) {
    submitReviewError.value = error?.message || 'Erreur lors de la soumission de l\'avis.';
  } finally {
    submitReviewLoading.value = false;
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
  refreshValidatedReservations();
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
  padding: 0 1.25rem 4rem;
  background:
    radial-gradient(circle at top left, rgba(195, 0, 57, 0.12), transparent 28%),
    linear-gradient(180deg, #f9f5ef 0%, #ffffff 42%);
  color: #171717;
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

.profile-places-list,
.profile-comments-list {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.profile-places-list {
  align-items: stretch;
}

.profile-place-card,
.profile-comment-card {
  overflow: hidden;
  border-radius: 1rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
}

.profile-place-media {
  position: relative;
  min-height: 170px;
  background: linear-gradient(135deg, rgba(195, 0, 57, 0.12), rgba(201, 157, 90, 0.12));
}

.profile-place-image {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 170px;
  object-fit: cover;
}

.profile-place-badge {
  position: absolute;
  top: 0.85rem;
  left: 0.85rem;
  padding: 0.32rem 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: #fff;
  backdrop-filter: blur(8px);
}

.profile-place-badge--success {
  background: rgba(22, 163, 74, 0.9);
}

.profile-place-badge--warning {
  background: rgba(214, 158, 46, 0.92);
}

.profile-place-badge--danger {
  background: rgba(220, 38, 38, 0.92);
}

.profile-place-badge--neutral {
  background: rgba(92, 92, 92, 0.92);
}

.profile-place-body {
  padding: 1rem;
}

.profile-place-location {
  margin: 0.35rem 0 0;
  color: #5d5d5d;
  line-height: 1.45;
}

.profile-place-reviewed,
.profile-place-muted {
  margin: 0.85rem 0 0;
  font-size: 0.92rem;
  color: #6d6a65;
}

.profile-place-reviewed {
  color: #16803d;
  font-weight: 700;
}

.profile-place-review-trigger {
  margin-top: 0.85rem;
}

.profile-comments-section {
  margin-top: 1.35rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.profile-reservations-header--stacked {
  align-items: flex-start;
  margin-top: 0;
}

.profile-comment-card {
  padding: 1rem;
}

.profile-comment-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.profile-comment-date {
  color: #8b8b8b;
  font-size: 0.82rem;
  font-weight: 600;
}

.profile-comment-card h4 {
  margin: 0.5rem 0 0;
  font-size: 1rem;
}

.profile-comment-text {
  margin: 0.75rem 0 0;
  color: #4b4b4b;
  line-height: 1.55;
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

.profile-place-subtitle {
  margin: 0.25rem 0 0;
  color: #7a7a7a;
  font-size: 0.9rem;
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

.profile-validated-reservations {
  margin-top: 1.5rem;
  padding: 1.1rem;
  border-radius: 1.1rem;
  border: 1px solid rgba(195, 0, 57, 0.2);
  background: rgba(255, 255, 255, 0.9);
}

.profile-validated-card {
  position: relative;
}

.profile-review-btn {
  min-height: 40px;
  padding: 0 1rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  color: #4b3f35;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.85rem;
}

.profile-review-btn:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: rgba(0, 0, 0, 0.12);
}

.profile-review-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.profile-review-btn-primary {
  background: linear-gradient(135deg, #c30039, #8e0029);
  color: #fff;
  border-color: transparent;
}

.profile-review-btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #a8002f, #7a0024);
  box-shadow: 0 4px 12px rgba(195, 0, 57, 0.3);
}

.profile-review-btn-submit {
  background: linear-gradient(135deg, #c30039, #8e0029);
  color: #fff;
  border-color: transparent;
}

.profile-review-btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #a8002f, #7a0024);
  box-shadow: 0 4px 12px rgba(195, 0, 57, 0.3);
}

.profile-review-btn-cancel {
  background: #f5f5f5;
  color: #4b3f35;
  margin-left: 0.5rem;
}

.profile-review-btn-cancel:hover:not(:disabled) {
  background: #ebebeb;
}

.profile-review-form {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0.8rem;
  background: rgba(195, 0, 57, 0.05);
  border: 1px solid rgba(195, 0, 57, 0.1);
}

.profile-review-form h5 {
  margin: 0 0 0.85rem;
  font-size: 0.95rem;
  color: #4b3f35;
}

.profile-review-textarea {
  width: 100%;
  padding: 0.85rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  color: #171717;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.profile-review-textarea:focus {
  outline: none;
  border-color: rgba(195, 0, 57, 0.3);
  box-shadow: 0 0 0 3px rgba(195, 0, 57, 0.1);
}

.profile-review-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.85rem;
}

.profile-review-error {
  margin-top: 0.85rem;
  padding: 0.75rem;
  border-radius: 0.6rem;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  color: #b91c1c;
  font-size: 0.9rem;
}

.profile-review-success {
  margin-top: 0.85rem;
  padding: 0.75rem;
  border-radius: 0.6rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #16a34a;
  font-size: 0.9rem;
}

.profile-error {
  color: #b91c1c;
}

@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-places-list,
  .profile-comments-list,
  .profile-reservations-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .profile-comment-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-place-media,
  .profile-place-image {
    min-height: 200px;
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
