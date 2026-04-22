<template>
  <article class="restaurant-card">
    <img :src="imageSrc" :alt="restaurant.name" />
    <div class="restaurant-card-footer">
      <div class="card-star">*</div>
      <strong>{{ restaurant.name || 'Restaurant' }}</strong>
      <small>{{ restaurant.location || 'Ville non renseignee' }}</small>
      <small>{{ restaurant.cuisine || 'Cuisine non renseignee' }} | Note {{ ratingLabel }}</small>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';

import { toPhotoFallback, toShortRating } from '../utils/formatters';

const props = defineProps({
  restaurant: {
    type: Object,
    required: true
  }
});

const ratingLabel = computed(() => toShortRating(props.restaurant.rating));
const imageSrc = computed(() => props.restaurant.photoUrl || toPhotoFallback(props.restaurant.name));
</script>

