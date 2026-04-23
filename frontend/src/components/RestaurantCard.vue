<template>
  <article class="restaurant-card">
    <img :src="imageSrc" :alt="restaurant.name" />
    <div class="restaurant-card-footer">
      <div class="card-star">✤</div>
      <strong>{{ restaurant.name || 'Restaurant' }}</strong>
      <small>{{ restaurant.location || 'Ville non renseignee' }}</small>
      <small>{{ metaLine }}</small>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';

import { toDisplayPrice, toPhotoFallback, toShortRating } from '../utils/formatters';

const props = defineProps({
  restaurant: {
    type: Object,
    required: true
  }
});

const imageSrc = computed(() => props.restaurant.photoUrl || toPhotoFallback(props.restaurant.name));
const ratingLabel = computed(() => toShortRating(props.restaurant.rating));
const metaLine = computed(() => {
  const cuisine = props.restaurant.cuisine || 'Cuisine non renseignee';

  if (props.restaurant.price) {
    return `${toDisplayPrice(props.restaurant.price)} • ${cuisine}`;
  }

  if (typeof props.restaurant.rating === 'number') {
    return `${cuisine} • Note ${ratingLabel.value}`;
  }

  return cuisine;
});
</script>
