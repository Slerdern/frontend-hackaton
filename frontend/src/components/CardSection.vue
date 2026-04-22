<template>
  <section class="card-section">
    <h2 class="section-title">{{ title }}</h2>
    <div class="card-row">
      <RestaurantCard v-for="restaurant in items" :key="restaurant.id || restaurant.name" :restaurant="restaurant" />
      <div v-if="!items.length" class="empty-state">Aucun resultat pour le moment.</div>
    </div>
  </section>
</template>

<script setup>
import RestaurantCard from './RestaurantCard.vue';

defineProps({
  title: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  }
});
</script>

