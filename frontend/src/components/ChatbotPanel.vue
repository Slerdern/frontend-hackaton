<template>
  <div v-if="open" class="side-panel-backdrop" @click.self="$emit('close')">
    <aside class="side-panel chatbot-panel" role="dialog" aria-label="Assistant Michelin">
      <div class="panel-header chatbot-header">
        <div>
          <p class="chatbot-kicker">Assistant Michelin</p>
          <h3>{{ panelTitle }}</h3>
        </div>
        <button class="chatbot-close-btn" type="button" @click="$emit('close')" aria-label="Fermer le chatbot">x</button>
      </div>

      <div class="chatbot-tabs" role="tablist" aria-label="Type d'assistant">
        <button
          type="button"
          class="chatbot-tab"
          :class="{ active: mode === 'restaurants' }"
          @click="$emit('change-mode', 'restaurants')"
        >
          Restaurants
        </button>
        <button
          type="button"
          class="chatbot-tab"
          :class="{ active: mode === 'hotels' }"
          @click="$emit('change-mode', 'hotels')"
        >
          Hebergements
        </button>
      </div>

      <div class="chatbot-feed">
        <article v-if="welcomeMessage" class="chatbot-bubble chatbot-bubble--bot">
          <span class="chatbot-avatar" aria-hidden="true">◆</span>
          <div>
            <p class="chatbot-label">Guide Michelin</p>
            <p>{{ welcomeMessage }}</p>
          </div>
        </article>

        <article v-if="assistantMessage" class="chatbot-bubble chatbot-bubble--assistant">
          <span class="chatbot-avatar chatbot-avatar--accent" aria-hidden="true">AI</span>
          <div>
            <p class="chatbot-label">Réponse</p>
            <p style="white-space: pre-line">{{ assistantMessage }}</p>
          </div>
        </article>

        <article v-if="loading" class="chatbot-bubble chatbot-bubble--loading">
          <span class="chatbot-avatar" aria-hidden="true">◆</span>
          <div>
            <p class="chatbot-label">Recherche en cours</p>
            <p>Je cherche les meilleures correspondances...</p>
          </div>
        </article>

        <div v-if="followUps.length" class="chatbot-followups">
          <button
            v-for="item in followUps"
            :key="item"
            type="button"
            class="chatbot-chip"
            @click="applyFollowUp(item)"
          >
            {{ item }}
          </button>
        </div>

        <section v-if="results.length" class="chatbot-results">
          <h4>{{ resultsTitle }}</h4>
          <div class="chatbot-results-grid">
            <article v-for="item in results" :key="item.id || item.name" class="chatbot-result-card">
              <div class="chatbot-result-top">
                <div>
                  <p class="chatbot-result-name">{{ item.name }}</p>
                  <p class="chatbot-result-meta">{{ resultMeta(item) }}</p>
                </div>
                <div v-if="item.rating != null" class="chatbot-rating">★ {{ Number(item.rating).toFixed(1) }}</div>
              </div>
              <p class="chatbot-result-submeta">{{ resultSubMeta(item) }}</p>
            </article>
          </div>
        </section>
      </div>

      <form class="chatbot-form" @submit.prevent="submitMessage">
        <textarea
          v-model="message"
          class="chatbot-input"
          :placeholder="placeholder"
          rows="3"
          @keydown.enter.exact.prevent="submitMessage"
        ></textarea>

        <div v-if="mode === 'restaurants'" class="chatbot-locations">
          <input v-model.number="latitude" type="number" step="0.0001" placeholder="Latitude" />
          <input v-model.number="longitude" type="number" step="0.0001" placeholder="Longitude" />
          <input v-model.number="radius" type="number" min="0" step="100" placeholder="Rayon (metres)" />
        </div>

        <button class="chatbot-submit" :disabled="loading || !message.trim()" type="submit">
          {{ loading ? 'Recherche...' : 'Envoyer' }}
        </button>
      </form>
    </aside>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  open: Boolean,
  mode: {
    type: String,
    default: 'restaurants'
  },
  loading: Boolean,
  welcomeMessage: {
    type: String,
    default: ''
  },
  assistantMessage: {
    type: String,
    default: ''
  },
  followUps: {
    type: Array,
    default: () => []
  },
  restaurants: {
    type: Array,
    default: () => []
  },
  hotels: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'send', 'change-mode']);

const message = ref('');
const latitude = ref(48.8566);
const longitude = ref(2.3522);
const radius = ref(3000);

const results = computed(() => (props.mode === 'hotels' ? props.hotels : props.restaurants));
const panelTitle = computed(() => (props.mode === 'hotels' ? 'Assistant Hôtels' : 'Assistant Restaurants'));
const resultsTitle = computed(() => (props.mode === 'hotels' ? 'Suggestions d’hebergements' : 'Suggestions de restaurants'));
const placeholder = computed(() =>
  props.mode === 'hotels'
    ? 'Ex: un hotel romantique à Metz'
    : 'Ex: un sushi autour de Paris'
);

function applyFollowUp(value) {
  message.value = value;
}

function submitMessage() {
  const payload = {
    message: message.value,
    latitude: latitude.value,
    longitude: longitude.value,
    radius: radius.value,
    limit: 6,
    mode: props.mode
  };

  emit('send', payload);
}

function resultMeta(item) {
  if (props.mode === 'hotels') {
    return [item.country, item.marketSegment].filter(Boolean).join(' · ') || 'Hebergement';
  }

  return [item.location, item.cuisine].filter(Boolean).join(' · ') || 'Restaurant';
}

function resultSubMeta(item) {
  if (props.mode === 'hotels') {
    const adr = item.avgAdr != null ? `ADR moyen: ${Math.round(item.avgAdr)}€` : '';
    const score = item.score != null ? `Score: ${Number(item.score).toFixed(1)}` : '';
    return [adr, score].filter(Boolean).join(' · ') || 'Aucun détail complémentaire';
  }

  const price = item.price || '';
  const score = item.score != null ? `Score: ${Number(item.score).toFixed(1)}` : '';
  return [price, score].filter(Boolean).join(' · ') || 'Aucun détail complémentaire';
}
</script>

<style scoped>
.chatbot-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chatbot-header {
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.chatbot-kicker {
  margin: 0 0 0.2rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #8c6b18;
  font-weight: 700;
}

.chatbot-header h3 {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.1;
}

.chatbot-close-btn {
  width: 42px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid #e5d9c7;
  background: #fff;
  color: #463d31;
  font-size: 1rem;
}

.chatbot-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.chatbot-tab {
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid #e4d8c7;
  background: #faf6ef;
  color: #6c655b;
  font-family: Sansita, sans-serif;
  font-weight: 700;
}

.chatbot-tab.active {
  background: #b90f31;
  border-color: #b90f31;
  color: #fff;
}

.chatbot-feed {
  display: grid;
  gap: 10px;
  padding-top: 2px;
}

.chatbot-bubble {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid #e8dcc9;
  background: #fff;
}

.chatbot-bubble--assistant {
  background: linear-gradient(180deg, #fffefb, #f6f0e4);
}

.chatbot-bubble--loading {
  opacity: 0.92;
}

.chatbot-avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  flex: none;
  background: #f3ead8;
  color: #98701b;
  font-size: 0.85rem;
  font-weight: 800;
}

.chatbot-avatar--accent {
  background: linear-gradient(135deg, #c30039, #8b0927);
  color: #fff;
}

.chatbot-label {
  margin: 0 0 0.2rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: #9a8f80;
  font-weight: 700;
}

.chatbot-bubble p {
  margin: 0;
  color: #2e2923;
  line-height: 1.45;
}

.chatbot-followups {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chatbot-chip {
  border: 1px solid #decfb8;
  background: #faf6ef;
  color: #5d5348;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 0.82rem;
  font-weight: 700;
}

.chatbot-results {
  display: grid;
  gap: 10px;
}

.chatbot-results h4 {
  margin: 2px 0 0;
  font-size: 0.95rem;
  color: #2f2a23;
}

.chatbot-results-grid {
  display: grid;
  gap: 8px;
}

.chatbot-result-card {
  padding: 10px 12px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #eadfcf;
}

.chatbot-result-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}

.chatbot-result-name {
  margin: 0;
  font-weight: 800;
  color: #201c18;
}

.chatbot-result-meta,
.chatbot-result-submeta {
  margin: 0.2rem 0 0;
  font-size: 0.82rem;
  color: #6e665b;
}

.chatbot-rating {
  flex: none;
  border-radius: 999px;
  padding: 5px 9px;
  background: #f5e6c4;
  color: #8b5d0c;
  font-weight: 800;
  font-size: 0.82rem;
}

.chatbot-form {
  display: grid;
  gap: 10px;
  padding-top: 0.4rem;
  border-top: 1px solid #eadfcf;
}

.chatbot-input {
  width: 100%;
  min-height: 86px;
  resize: vertical;
  border-radius: 12px;
  border: 1px solid #ded5c6;
  background: #fff;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 0.95rem;
  color: #2a241f;
}

.chatbot-input:focus {
  outline: 2px solid rgba(185, 15, 49, 0.15);
  border-color: #b90f31;
}

.chatbot-locations {
  display: grid;
  gap: 8px;
}

.chatbot-locations input {
  width: 100%;
  min-height: 42px;
  border-radius: 10px;
  border: 1px solid #ded5c6;
  background: #fff;
  padding: 8px 10px;
  font-family: inherit;
}

.chatbot-submit {
  min-height: 44px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #c30039, #8b0927);
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.chatbot-submit:disabled {
  opacity: 0.65;
}
</style>
