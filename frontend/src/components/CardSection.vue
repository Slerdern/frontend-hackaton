<template>
  <section class="card-section">
    <h2 class="section-title">{{ title }}</h2>
    <p v-if="!displayedItems.length" class="empty-state card-section-empty-state">
      Aucun contenu disponible pour le moment.
    </p>
    <div v-else class="card-row">
      <RestaurantCard
        v-for="restaurant in displayedItems"
        :key="restaurant.id || restaurant.name"
        :restaurant="restaurant"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

import RestaurantCard from './RestaurantCard.vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  }
});

const displayedItems = computed(() => (props.items || []).slice(0, 3));
</script>
