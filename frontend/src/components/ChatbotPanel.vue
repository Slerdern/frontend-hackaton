<template>
  <div v-if="open" class="side-panel-backdrop" @click.self="$emit('close')">
    <aside class="side-panel chatbot-panel" role="dialog" aria-label="Assistant IA Michelin">
      <header class="chatbot-header">
        <div class="chatbot-heading-icon">{{ currentConfig.icon }}</div>
        <div class="chatbot-heading-copy">
          <p class="chatbot-title">{{ currentConfig.title }}</p>
          <p class="chatbot-subtitle">{{ currentConfig.subtitle }}</p>
        </div>
        <button class="chatbot-close-btn" type="button" @click="$emit('close')" aria-label="Fermer le chatbot">✕</button>
      </header>

      <div class="chatbot-tabs" role="tablist" aria-label="Type d'assistant">
        <button
          v-for="tab in modeTabs"
          :key="tab.key"
          type="button"
          class="chatbot-tab"
          :class="{ active: activeMode === tab.key }"
          @click="switchMode(tab.key)"
        >
          <span aria-hidden="true">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <section class="chatbot-feed" ref="feedRef">
        <article
          v-for="msg in activeMessages"
          :key="msg.id"
          class="chatbot-msg"
          :class="msg.role === 'user' ? 'chatbot-msg--user' : 'chatbot-msg--assistant'"
        >
          <span v-if="msg.role !== 'user'" class="chatbot-avatar" aria-hidden="true">◆</span>
          <div class="chatbot-msg-body">
            <div class="chatbot-bubble">
              <p v-if="msg.text" class="chatbot-msg-text">{{ msg.text }}</p>
            </div>

            <div v-if="msg.followUps?.length && msg.role !== 'user'" class="chatbot-followups">
              <button
                v-for="item in msg.followUps"
                :key="`${msg.id}-${item}`"
                type="button"
                class="chatbot-chip"
                @click="submitMessage(item)"
              >
                {{ item }}
              </button>
            </div>

            <section v-if="msg.hotels?.length" class="chatbot-results-grid">
              <article v-for="item in msg.hotels" :key="`hotel-${msg.id}-${item.id || item.name}`" class="chatbot-result-card">
                <div class="chatbot-result-top">
                  <div>
                    <p class="chatbot-result-name">{{ item.name }}</p>
                    <p class="chatbot-result-meta">{{ hotelMeta(item) }}</p>
                  </div>
                  <div v-if="item.rating != null" class="chatbot-rating">★ {{ Number(item.rating).toFixed(1) }}</div>
                </div>
                <div class="chatbot-badges">
                  <span v-if="item.familyScore > 0.65" class="chatbot-badge chatbot-badge--green">Family</span>
                  <span v-if="item.businessScore > 0.65" class="chatbot-badge chatbot-badge--blue">Business</span>
                  <span v-if="item.avgAdr != null" class="chatbot-badge chatbot-badge--teal">{{ Math.round(item.avgAdr) }}€/nuit</span>
                </div>
                <button class="chatbot-book-btn" type="button" @click="openBooking(item, 'hotel')">Reserver</button>
              </article>
            </section>

            <section v-if="msg.restaurants?.length" class="chatbot-results-grid">
              <article v-for="item in msg.restaurants" :key="`resto-${msg.id}-${item.id || item.name}`" class="chatbot-result-card">
                <div class="chatbot-result-top">
                  <div>
                    <p class="chatbot-result-name">{{ item.name }}</p>
                    <p class="chatbot-result-meta">{{ restaurantMeta(item) }}</p>
                  </div>
                  <div class="chatbot-rating-wrap">
                    <span v-if="item.rating != null" class="chatbot-rating">★ {{ Number(item.rating).toFixed(1) }}</span>
                    <span v-if="item.price" class="chatbot-price">{{ item.price }}</span>
                  </div>
                </div>
                <div class="chatbot-badges">
                  <span v-if="item.greenStar" class="chatbot-badge chatbot-badge--green">Green Star</span>
                  <span v-if="item.award" class="chatbot-badge chatbot-badge--gold">{{ item.award }}</span>
                </div>
                <button class="chatbot-book-btn" type="button" @click="openBooking(item, 'restaurant')">Reserver</button>
              </article>
            </section>

            <section v-if="msg.preferences && msg.isComplete" class="chatbot-profile-card">
              <p class="chatbot-profile-title">Votre profil de voyage</p>
              <div class="chatbot-profile-block">
                <p>Restaurants</p>
                <div class="chatbot-badges">
                  <span
                    v-for="item in profileSectionValues(msg.preferences, 'restaurants')"
                    :key="`pref-resto-${msg.id}-${item}`"
                    class="chatbot-badge chatbot-badge--gold"
                  >
                    {{ item }}
                  </span>
                </div>
              </div>
              <div class="chatbot-profile-block">
                <p>Hotels</p>
                <div class="chatbot-badges">
                  <span
                    v-for="item in profileSectionValues(msg.preferences, 'hotels')"
                    :key="`pref-hotel-${msg.id}-${item}`"
                    class="chatbot-badge chatbot-badge--gold"
                  >
                    {{ item }}
                  </span>
                </div>
              </div>
              <div class="chatbot-profile-block">
                <p>Voyage</p>
                <div class="chatbot-badges">
                  <span
                    v-for="item in profileSectionValues(msg.preferences, 'travel')"
                    :key="`pref-travel-${msg.id}-${item}`"
                    class="chatbot-badge chatbot-badge--gold"
                  >
                    {{ item }}
                  </span>
                </div>
              </div>
              <button
                class="chatbot-save-btn"
                type="button"
                :disabled="activeState.saving || activeState.saved"
                @click="savePreferences(msg.preferences)"
              >
                {{ activeState.saving ? 'Enregistrement...' : activeState.saved ? 'Préférences enregistrées' : 'Enregistrer mon profil' }}
              </button>
            </section>
          </div>
        </article>

        <article v-if="activeState.loading" class="chatbot-msg chatbot-msg--assistant">
          <span class="chatbot-avatar" aria-hidden="true">◆</span>
          <div class="chatbot-msg-body">
            <div class="chatbot-bubble chatbot-bubble--typing">
              <span class="chatbot-dot"></span>
              <span class="chatbot-dot"></span>
              <span class="chatbot-dot"></span>
            </div>
          </div>
        </article>
      </section>

      <form class="chatbot-form" @submit.prevent="submitMessage()">
        <textarea
          v-model="draft"
          class="chatbot-input"
          :placeholder="currentConfig.placeholder"
          rows="2"
          @keydown.enter.exact.prevent="submitMessage()"
        ></textarea>
        <button class="chatbot-submit" :disabled="activeState.loading || !draft.trim()" type="submit">
          {{ activeState.loading ? '...' : '↑' }}
        </button>
      </form>
    </aside>

    <div v-if="bookingTarget" class="chatbot-booking-overlay" @click.self="closeBooking">
      <section class="chatbot-booking-modal" role="dialog" aria-label="Reservation IA">
        <header class="chatbot-booking-header">
          <div>
            <p class="chatbot-booking-title">Reserver · {{ bookingTarget.name }}</p>
            <p class="chatbot-booking-subtitle">Assistant IA · reservation</p>
          </div>
          <button type="button" class="chatbot-close-btn" @click="closeBooking" aria-label="Fermer la réservation">✕</button>
        </header>

        <section class="chatbot-booking-feed" ref="bookingFeedRef">
          <article
            v-for="msg in bookingMessages"
            :key="msg.id"
            class="chatbot-msg"
            :class="msg.role === 'user' ? 'chatbot-msg--user' : 'chatbot-msg--assistant'"
          >
            <span v-if="msg.role !== 'user'" class="chatbot-avatar" aria-hidden="true">◆</span>
            <div class="chatbot-msg-body">
              <div class="chatbot-bubble">
                <p v-if="msg.text" class="chatbot-msg-text">{{ msg.text }}</p>
              </div>

              <div v-if="msg.summary && msg.status === 'awaiting_confirmation'" class="chatbot-booking-summary">
                <p>Recapitulatif</p>
                <pre>{{ msg.summary }}</pre>
              </div>

              <div v-if="msg.followUps?.length && !bookingConfirmed" class="chatbot-followups">
                <button
                  v-for="item in msg.followUps"
                  :key="`${msg.id}-${item}`"
                  type="button"
                  class="chatbot-chip"
                  @click="sendBookingMessage(item)"
                >
                  {{ item }}
                </button>
              </div>
            </div>
          </article>

          <article v-if="bookingLoading" class="chatbot-msg chatbot-msg--assistant">
            <span class="chatbot-avatar" aria-hidden="true">◆</span>
            <div class="chatbot-msg-body">
              <div class="chatbot-bubble chatbot-bubble--typing">
                <span class="chatbot-dot"></span>
                <span class="chatbot-dot"></span>
                <span class="chatbot-dot"></span>
              </div>
            </div>
          </article>

          <section v-if="bookingConfirmed" class="chatbot-booking-success">
            <p>Reservation confirmee</p>
            <small>Reference #{{ bookingId }}</small>
          </section>
        </section>

        <form v-if="!bookingConfirmed" class="chatbot-form" @submit.prevent="sendBookingMessage()">
          <textarea
            v-model="bookingDraft"
            class="chatbot-input"
            :placeholder="bookingPlaceholder"
            rows="2"
            @keydown.enter.exact.prevent="sendBookingMessage()"
          ></textarea>
          <button class="chatbot-submit" :disabled="bookingLoading || !bookingDraft.trim()" type="submit">↑</button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue';
import {
  bookHotelWithAi,
  bookRestaurantWithAi,
  chatWithProfileAssistant,
  getHotelWelcomeMessage,
  getWelcomeMessage,
  planTravelWithAi,
  saveProfilePreferences,
  searchHotelWithAi,
  searchWithAi,
  startProfileAssistant,
  startTravelPlanning
} from '../services/aiService';

const RESERVATIONS_STORAGE_KEY = 'hackaton_reservations';

const props = defineProps({
  open: Boolean,
  mode: {
    type: String,
    default: 'restaurants'
  }
});

defineEmits(['close']);

const modeTabs = [
  { key: 'restaurants', label: 'Restaurants', icon: '🍽' },
  { key: 'hotels', label: 'Hotels', icon: '🏨' },
  { key: 'travel', label: 'Voyage', icon: '✈' },
  { key: 'profile', label: 'Profil', icon: '◆' }
];

const modeConfig = {
  restaurants: {
    title: 'Restaurants',
    subtitle: 'Guide Michelin · IA',
    placeholder: 'Sushi à Paris, bistrot lyonnais, végétarien...'
  },
  hotels: {
    title: 'Hotels',
    subtitle: 'Recommandations · IA',
    placeholder: 'Hotel avec piscine en Espagne, resort familial...'
  },
  travel: {
    title: 'Voyage',
    subtitle: 'Planificateur · IA',
    placeholder: 'Weekend romantique à Rome, voyage famille Tokyo...'
  },
  profile: {
    title: 'Mon Profil',
    subtitle: 'Préférences · IA',
    placeholder: 'Répondre...'
  }
};

const activeMode = ref(props.mode);
const draft = ref('');
const feedRef = ref(null);
const bookingFeedRef = ref(null);

const bookingTarget = ref(null);
const bookingKind = ref('restaurant');
const bookingMessages = ref([]);
const bookingConversation = ref([]);
const bookingCollected = ref({});
const bookingStatus = ref('collecting');
const bookingId = ref(null);
const bookingLoading = ref(false);
const bookingDraft = ref('');

const stateByMode = reactive({
  restaurants: { messages: [], loading: false, history: [], initialized: false, saving: false, saved: false },
  hotels: { messages: [], loading: false, history: [], initialized: false, saving: false, saved: false },
  travel: { messages: [], loading: false, history: [], initialized: false, saving: false, saved: false },
  profile: { messages: [], loading: false, history: [], initialized: false, saving: false, saved: false }
});

const currentConfig = computed(() => ({ ...modeConfig[activeMode.value], icon: modeTabs.find((tab) => tab.key === activeMode.value)?.icon || '◆' }));
const activeState = computed(() => stateByMode[activeMode.value]);
const activeMessages = computed(() => activeState.value.messages);
const bookingConfirmed = computed(() => bookingStatus.value === 'confirmed' && Boolean(bookingId.value));
const bookingPlaceholder = computed(() => (bookingStatus.value === 'awaiting_confirmation' ? "Tapez 'oui' pour confirmer..." : 'Votre reponse...'));

function normalizeResponse(data, type) {
  if (!data) {
    return { text: 'Je suis là pour vous aider.', followUps: [], hotels: [], restaurants: [] };
  }

  if (type === 'welcome') {
    return {
      text: data.message || 'Bonjour ! Comment puis-je vous aider ?',
      followUps: data.suggestedPrompts || data.suggestedFollowUps || [],
      hotels: [],
      restaurants: []
    };
  }

  if (type === 'profile') {
    return {
      text: data.message || '',
      followUps: data.suggestedReplies || [],
      hotels: [],
      restaurants: [],
      isComplete: data.isComplete,
      preferences: data.extractedPreferences
    };
  }

  if (type === 'travel') {
    if (!data.isReadyToPlan) {
      return {
        text: data.message || '',
        followUps: data.suggestedReplies || [],
        hotels: [],
        restaurants: []
      };
    }

    const text = [data.greeting, data.assistantMessage].filter(Boolean).join('\n\n') || data.message || '';
    return {
      text,
      followUps: data.suggestedReplies || [],
      hotels: data.hotel ? [data.hotel] : [],
      restaurants: data.restaurants || []
    };
  }

  const text = [data.greeting, data.assistantMessage].filter(Boolean).join('\n\n') || data.message || '';
  return {
    text,
    followUps: data.suggestedFollowUps || data.suggestedPrompts || [],
    hotels: data.hotels || [],
    restaurants: data.restaurants || []
  };
}

function profileSectionValues(preferences, section) {
  if (!preferences) {
    return [];
  }

  if (section === 'restaurants') {
    return [
      ...(preferences.restaurants?.cuisines || []),
      ...(preferences.restaurants?.atmosphere || []),
      ...(preferences.restaurants?.priceRange || [])
    ].filter(Boolean);
  }

  if (section === 'hotels') {
    return [
      ...(preferences.hotels?.amenities || []),
      ...(preferences.hotels?.tripTypes || []),
      preferences.hotels?.budgetLevel
    ].filter(Boolean);
  }

  return [
    ...(preferences.travel?.favoriteDestinations || []),
    preferences.travel?.travelStyle
  ].filter(Boolean);
}

function hotelMeta(item) {
  return [item.country, item.marketSegment].filter(Boolean).join(' · ') || 'Hebergement';
}

function restaurantMeta(item) {
  return [item.location, item.cuisine].filter(Boolean).join(' · ') || 'Restaurant';
}

function pushAssistantMessage(mode, payload) {
  stateByMode[mode].messages.push({
    id: `${Date.now()}-${Math.random()}`,
    role: 'assistant',
    ...payload
  });
}

function pushUserMessage(mode, text) {
  stateByMode[mode].messages.push({
    id: `${Date.now()}-${Math.random()}`,
    role: 'user',
    text,
    followUps: [],
    hotels: [],
    restaurants: []
  });
}

async function ensureWelcome(mode) {
  const state = stateByMode[mode];
  if (state.initialized) {
    return;
  }

  state.loading = true;

  try {
    let response;
    let normalizeType = 'welcome';

    if (mode === 'hotels') {
      response = await getHotelWelcomeMessage();
    } else if (mode === 'travel') {
      response = await startTravelPlanning();
      normalizeType = 'travel';
    } else if (mode === 'profile') {
      response = await startProfileAssistant();
      normalizeType = 'profile';
    } else {
      response = await getWelcomeMessage();
    }

    const parsed = normalizeResponse(response, normalizeType);
    pushAssistantMessage(mode, parsed);

    if (mode === 'travel' || mode === 'profile') {
      state.history = [{ role: 'assistant', content: parsed.text }];
    }

    state.initialized = true;
  } catch (error) {
    pushAssistantMessage(mode, {
      text: error?.message || 'Une erreur est survenue.',
      followUps: [],
      hotels: [],
      restaurants: []
    });
  } finally {
    state.loading = false;
    await scrollToBottom();
  }
}

async function submitMessage(forcedText = '') {
  const text = (forcedText || draft.value).trim();
  if (!text || activeState.value.loading) {
    return;
  }

  const mode = activeMode.value;
  const state = stateByMode[mode];

  pushUserMessage(mode, text);
  draft.value = '';
  state.loading = true;

  try {
    const newHistory = [...state.history, { role: 'user', content: text }];
    let response;
    let normalizeType = 'search';

    if (mode === 'hotels') {
      response = await searchHotelWithAi({ message: text, limit: 6 });
    } else if (mode === 'travel') {
      response = await planTravelWithAi({ message: text, history: newHistory });
      normalizeType = 'travel';
    } else if (mode === 'profile') {
      response = await chatWithProfileAssistant({ message: text, history: newHistory });
      normalizeType = 'profile';
    } else {
      response = await searchWithAi({
        message: text,
        latitude: 48.8566,
        longitude: 2.3522,
        radius: 3000,
        limit: 6
      });
    }

    const parsed = normalizeResponse(response, normalizeType);
    pushAssistantMessage(mode, parsed);

    if (mode === 'travel' || mode === 'profile') {
      state.history = [...newHistory, { role: 'assistant', content: parsed.text }];
    }
  } catch (error) {
    pushAssistantMessage(mode, {
      text: `Désolé, une erreur est survenue : ${error?.message || 'Erreur API'}`,
      followUps: [],
      hotels: [],
      restaurants: []
    });
  } finally {
    state.loading = false;
    await scrollToBottom();
  }
}

async function savePreferences(preferences) {
  if (!preferences || activeState.value.saving || activeState.value.saved) {
    return;
  }

  activeState.value.saving = true;
  try {
    await saveProfilePreferences({ preferences });
    activeState.value.saved = true;
  } catch {
    pushAssistantMessage(activeMode.value, {
      text: 'Impossible d’enregistrer vos préférences pour le moment.',
      followUps: [],
      hotels: [],
      restaurants: []
    });
  } finally {
    activeState.value.saving = false;
    await scrollToBottom();
  }
}

async function switchMode(nextMode) {
  if (activeMode.value === nextMode) {
    return;
  }

  activeMode.value = nextMode;
  draft.value = '';
  await ensureWelcome(nextMode);
}

function openBooking(item, kind) {
  bookingTarget.value = item;
  bookingKind.value = kind;
  bookingMessages.value = [];
  bookingConversation.value = [];
  bookingCollected.value = {};
  bookingStatus.value = 'collecting';
  bookingId.value = null;
  bookingDraft.value = '';

  const text =
    kind === 'restaurant'
      ? `Avec plaisir ! Pour reserver chez ${item?.name || 'ce restaurant'}, quand souhaitez-vous venir ?`
      : `Excellent choix ! Pour reserver à l'hotel ${item?.name || ''}, quelle est votre date d'arrivee ?`;

  const followUps = kind === 'restaurant' ? ['Ce soir', 'Demain soir', 'Ce week-end'] : ['Demain', 'Ce week-end', 'Semaine prochaine'];

  const assistantMessage = {
    id: `${Date.now()}-${Math.random()}`,
    role: 'assistant',
    text,
    followUps,
    summary: '',
    status: 'collecting'
  };

  bookingMessages.value = [assistantMessage];
  bookingConversation.value = [{ role: 'assistant', content: text }];
  scrollBookingToBottom();
}

function closeBooking() {
  bookingTarget.value = null;
}

function readStoredReservations() {
  try {
    const raw = window.localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredReservations(reservations) {
  window.localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations));
  window.dispatchEvent(new CustomEvent('reservations-updated'));
}

function persistConfirmedReservation(response) {
  if (response?.status !== 'confirmed' || !response?.bookingId || !bookingTarget.value) {
    return;
  }

  const reservations = readStoredReservations();
  const nextReservation = {
    bookingId: response.bookingId,
    kind: bookingKind.value,
    name: bookingTarget.value.name,
    location: bookingTarget.value.location || bookingTarget.value.country || '',
    cuisine: bookingTarget.value.cuisine || '',
    marketSegment: bookingTarget.value.marketSegment || '',
    price: bookingTarget.value.price || '',
    rating: bookingTarget.value.rating ?? null,
    summary: response.summary || '',
    collected: response.collected || {},
    createdAt: new Date().toISOString()
  };

  const index = reservations.findIndex((item) => item.bookingId === nextReservation.bookingId);

  if (index >= 0) {
    reservations[index] = nextReservation;
  } else {
    reservations.unshift(nextReservation);
  }

  saveStoredReservations(reservations);
}

async function sendBookingMessage(forcedText = '') {
  const text = (forcedText || bookingDraft.value).trim();
  if (!text || bookingLoading.value || !bookingTarget.value || bookingConfirmed.value) {
    return;
  }

  const userMessage = {
    id: `${Date.now()}-${Math.random()}`,
    role: 'user',
    text,
    followUps: [],
    summary: '',
    status: bookingStatus.value
  };

  bookingMessages.value.push(userMessage);
  bookingDraft.value = '';
  bookingLoading.value = true;

  try {
    const newConversation = [...bookingConversation.value, { role: 'user', content: text }];
    const context =
      bookingKind.value === 'hotel'
        ? {
            hotelName: bookingTarget.value?.name,
            roomType: bookingTarget.value?.reservedRoomType || bookingTarget.value?.roomType || 'A',
            adr: bookingTarget.value?.avgAdr ?? bookingTarget.value?.adr ?? null
          }
        : {};

    const payload = {
      message: text,
      conversation: newConversation,
      collected: bookingCollected.value,
      context
    };

    const response =
      bookingKind.value === 'hotel' ? await bookHotelWithAi(payload) : await bookRestaurantWithAi(payload);

    bookingMessages.value.push({
      id: `${Date.now()}-${Math.random()}`,
      role: 'assistant',
      text: response.assistantMessage || '',
      followUps: response.suggestedFollowUps || [],
      summary: response.summary || '',
      status: response.status || 'collecting'
    });

    bookingConversation.value = [...newConversation, { role: 'assistant', content: response.assistantMessage || '' }];
    bookingCollected.value = response.collected || {};
    bookingStatus.value = response.status || 'collecting';
    if (response.bookingId) {
      bookingId.value = response.bookingId;
    }

    persistConfirmedReservation(response);
  } catch (error) {
    bookingMessages.value.push({
      id: `${Date.now()}-${Math.random()}`,
      role: 'assistant',
      text: `Desole, une erreur est survenue : ${error?.message || 'Erreur API'}`,
      followUps: [],
      summary: '',
      status: 'error'
    });
  } finally {
    bookingLoading.value = false;
    await scrollBookingToBottom();
  }
}

async function scrollToBottom() {
  await nextTick();
  if (feedRef.value) {
    feedRef.value.scrollTop = feedRef.value.scrollHeight;
  }
}

async function scrollBookingToBottom() {
  await nextTick();
  if (bookingFeedRef.value) {
    bookingFeedRef.value.scrollTop = bookingFeedRef.value.scrollHeight;
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      return;
    }

    await ensureWelcome(activeMode.value);
    await scrollToBottom();
  },
  { immediate: true }
);

watch(
  () => props.mode,
  async (mode) => {
    if (!mode || !modeConfig[mode]) {
      return;
    }

    activeMode.value = mode;
    if (props.open) {
      await ensureWelcome(mode);
      await scrollToBottom();
    }
  }
);
</script>

<style scoped>
.chatbot-panel {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  background: #050912;
  color: #ede6da;
  border-left: 1px solid rgb(199 157 90 / 0.22);
}

.chatbot-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgb(255 255 255 / 0.06);
}

.chatbot-heading-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgb(199 157 90 / 0.22), rgb(247 243 236 / 0.14));
  border: 1px solid rgb(199 157 90 / 0.3);
  font-size: 1.05rem;
  flex: none;
}

.chatbot-heading-copy {
  min-width: 0;
  flex: 1;
}

.chatbot-title {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.05;
  font-weight: 700;
  font-family: 'Cormorant Garamond', serif;
}

.chatbot-subtitle {
  margin: 0.15rem 0 0;
  color: #7c8da4;
  font-size: 0.74rem;
  letter-spacing: 0.04em;
}

.chatbot-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / 0.16);
  background: #141e35;
  color: #9eb0c8;
  font-size: 0.9rem;
}

.chatbot-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.42rem;
}

.chatbot-tab {
  min-height: 39px;
  border-radius: 10px;
  border: 1px solid rgb(255 255 255 / 0.12);
  background: #0e1628;
  color: #8a9aae;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.02em;
}

.chatbot-tab.active {
  border-color: rgb(199 157 90 / 0.36);
  color: #eadbbf;
  background: rgb(199 157 90 / 0.12);
}

.chatbot-feed {
  flex: 1;
  min-height: 180px;
  overflow-y: auto;
  padding: 0.2rem 0.15rem 0.3rem 0;
}

.chatbot-msg {
  display: flex;
  gap: 0.55rem;
  margin-bottom: 0.8rem;
}

.chatbot-msg--user {
  flex-direction: row-reverse;
}

.chatbot-avatar {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  flex: none;
  font-size: 0.77rem;
  font-weight: 700;
  color: #050912;
  background: linear-gradient(135deg, #f3e5c7, #fff7ea);
}

.chatbot-msg-body {
  max-width: 86%;
  display: grid;
  gap: 0.48rem;
}

.chatbot-msg--user .chatbot-msg-body {
  justify-items: end;
}

.chatbot-bubble {
  background: #0e1628;
  border: 1px solid rgb(255 255 255 / 0.08);
  border-radius: 4px 16px 16px;
  padding: 0.72rem 0.8rem;
}

.chatbot-msg--user .chatbot-bubble {
  background: linear-gradient(135deg, rgb(199 157 90 / 0.18), rgb(247 243 236 / 0.12));
  border-color: rgb(199 157 90 / 0.28);
  border-radius: 16px 16px 4px;
}

.chatbot-msg-text {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.5;
  color: #ede6da;
  font-size: 0.86rem;
}

.chatbot-followups {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.chatbot-chip {
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / 0.15);
  background: transparent;
  color: #8a9aae;
  padding: 0.36rem 0.62rem;
  font-size: 0.72rem;
  font-weight: 600;
}

.chatbot-chip:hover {
  border-color: rgb(199 157 90 / 0.28);
  background: rgb(199 157 90 / 0.08);
  color: #eadbbf;
}

.chatbot-results-grid {
  display: grid;
  gap: 0.42rem;
  width: 100%;
}

.chatbot-result-card {
  background: #141e35;
  border: 1px solid rgb(255 255 255 / 0.08);
  border-radius: 11px;
  padding: 0.62rem 0.7rem;
}

.chatbot-result-top {
  display: flex;
  justify-content: space-between;
  gap: 0.55rem;
}

.chatbot-result-name {
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.02rem;
  font-style: italic;
  line-height: 1.1;
}

.chatbot-result-meta {
  margin: 0.1rem 0 0;
  color: #8a9aae;
  font-size: 0.71rem;
}

.chatbot-rating-wrap {
  display: grid;
  justify-items: end;
  gap: 0.18rem;
}

.chatbot-rating {
  border-radius: 999px;
  padding: 0.2rem 0.48rem;
  background: rgb(199 157 90 / 0.12);
  border: 1px solid rgb(199 157 90 / 0.28);
  color: #eadbbf;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}

.chatbot-price {
  font-size: 0.75rem;
  font-weight: 700;
  color: #28c4b5;
}

.chatbot-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.28rem;
  margin-top: 0.4rem;
}

.chatbot-badge {
  border-radius: 999px;
  padding: 0.16rem 0.45rem;
  font-size: 0.66rem;
  border: 1px solid;
  font-weight: 700;
}

.chatbot-badge--gold {
  background: rgb(199 157 90 / 0.12);
  border-color: rgb(199 157 90 / 0.28);
  color: #eadbbf;
}

.chatbot-badge--green {
  background: rgb(44 184 126 / 0.13);
  border-color: rgb(44 184 126 / 0.38);
  color: #2cb87e;
}

.chatbot-badge--teal {
  background: rgb(40 196 181 / 0.12);
  border-color: rgb(40 196 181 / 0.33);
  color: #28c4b5;
}

.chatbot-badge--blue {
  background: rgb(74 144 245 / 0.13);
  border-color: rgb(74 144 245 / 0.35);
  color: #4a90f5;
}

.chatbot-book-btn {
  margin-top: 0.5rem;
  width: 100%;
  min-height: 32px;
  border: none;
  border-radius: 9px;
  background: linear-gradient(135deg, #f3e5c7, #fff7ea);
  color: #050912;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.chatbot-profile-card {
  width: 100%;
  border-radius: 13px;
  border: 1px solid rgb(199 157 90 / 0.28);
  background: linear-gradient(135deg, rgb(199 157 90 / 0.12), rgb(40 196 181 / 0.08));
  padding: 0.76rem;
}

.chatbot-profile-title {
  margin: 0 0 0.45rem;
  color: #eadbbf;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.12rem;
  font-style: italic;
}

.chatbot-profile-block {
  margin-top: 0.44rem;
}

.chatbot-profile-block p {
  margin: 0;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #7c8da4;
}

.chatbot-save-btn {
  margin-top: 0.55rem;
  width: 100%;
  min-height: 36px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #f3e5c7, #fff7ea);
  color: #050912;
  font-weight: 800;
  font-size: 0.74rem;
}

.chatbot-save-btn:disabled {
  opacity: 0.66;
}

.chatbot-bubble--typing {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.chatbot-dot {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: #8a9aae;
  animation: chatbot-dot 1.3s ease-in-out infinite;
}

.chatbot-dot:nth-child(2) {
  animation-delay: 0.14s;
}

.chatbot-dot:nth-child(3) {
  animation-delay: 0.28s;
}

@keyframes chatbot-dot {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.3;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.chatbot-form {
  display: flex;
  align-items: end;
  gap: 0.48rem;
  padding-top: 0.58rem;
  border-top: 1px solid rgb(255 255 255 / 0.08);
}

.chatbot-input {
  flex: 1;
  min-height: 40px;
  max-height: 110px;
  resize: none;
  border-radius: 10px;
  border: 1px solid rgb(255 255 255 / 0.14);
  background: #0e1628;
  color: #ede6da;
  font-size: 0.84rem;
  padding: 0.55rem 0.62rem;
  font-family: inherit;
}

.chatbot-input::placeholder {
  color: #485a72;
}

.chatbot-input:focus {
  outline: none;
  border-color: rgb(199 157 90 / 0.4);
}

.chatbot-submit {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #f3e5c7, #fff7ea);
  color: #050912;
  font-weight: 900;
}

.chatbot-submit:disabled {
  background: #1b2845;
  color: #485a72;
}

.chatbot-booking-overlay {
  position: fixed;
  inset: 0;
  z-index: 130;
  background: rgb(5 9 18 / 0.78);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: end;
}

.chatbot-booking-modal {
  width: min(480px, 100vw);
  height: min(92vh, 860px);
  border-radius: 22px 22px 0 0;
  background: #050912;
  border-top: 1px solid rgb(199 157 90 / 0.28);
  display: flex;
  flex-direction: column;
  padding: 0.9rem 0.9rem 1rem;
}

.chatbot-booking-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  border-bottom: 1px solid rgb(255 255 255 / 0.08);
  padding-bottom: 0.65rem;
}

.chatbot-booking-title {
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.12rem;
  font-style: italic;
  color: #ede6da;
}

.chatbot-booking-subtitle {
  margin: 0.12rem 0 0;
  color: #7c8da4;
  font-size: 0.72rem;
}

.chatbot-booking-feed {
  flex: 1;
  overflow-y: auto;
  padding: 0.85rem 0.1rem 0.3rem 0;
}

.chatbot-booking-summary {
  width: 100%;
  border-radius: 10px;
  border: 1px solid rgb(199 157 90 / 0.26);
  background: rgb(199 157 90 / 0.1);
  padding: 0.55rem 0.6rem;
}

.chatbot-booking-summary p {
  margin: 0;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #eadbbf;
}

.chatbot-booking-summary pre {
  margin: 0.38rem 0 0;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 0.79rem;
  line-height: 1.45;
  color: #ede6da;
}

.chatbot-booking-success {
  margin-top: 0.5rem;
  border-radius: 12px;
  border: 1px solid rgb(44 184 126 / 0.5);
  background: linear-gradient(135deg, rgb(44 184 126 / 0.16), rgb(199 157 90 / 0.1));
  padding: 0.8rem;
  text-align: center;
}

.chatbot-booking-success p {
  margin: 0;
  color: #2cb87e;
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 1.18rem;
}

.chatbot-booking-success small {
  display: block;
  margin-top: 0.22rem;
  color: #b6c3d6;
  font-size: 0.72rem;
}
</style>
