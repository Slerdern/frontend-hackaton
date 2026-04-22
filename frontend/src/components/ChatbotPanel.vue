<template>
  <aside class="side-panel" v-if="open">
    <div class="panel-header">
      <h3>Assistant Michelin</h3>
      <button @click="$emit('close')">x</button>
    </div>

    <p class="hint" v-if="welcomeMessage">{{ welcomeMessage }}</p>

    <form class="stack" @submit.prevent="submitMessage">
      <textarea
        v-model="message"
        placeholder="Ex: Je veux un sushi autour de Paris"
        rows="3"
        required
      ></textarea>
      <input v-model.number="latitude" type="number" step="0.0001" placeholder="Latitude" />
      <input v-model.number="longitude" type="number" step="0.0001" placeholder="Longitude" />
      <input v-model.number="radius" type="number" min="0" step="100" placeholder="Rayon (metres)" />
      <button :disabled="loading" type="submit">{{ loading ? 'Recherche...' : 'Envoyer' }}</button>
    </form>

    <p class="hint" v-if="assistantMessage">{{ assistantMessage }}</p>
    <ul class="followups" v-if="followUps.length">
      <li v-for="item in followUps" :key="item">{{ item }}</li>
    </ul>
  </aside>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  open: Boolean,
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
  }
});

const emit = defineEmits(['close', 'send']);

const message = ref('');
const latitude = ref(48.8566);
const longitude = ref(2.3522);
const radius = ref(3000);

function submitMessage() {
  emit('send', {
    message: message.value,
    latitude: latitude.value,
    longitude: longitude.value,
    radius: radius.value
  });
}
</script>

