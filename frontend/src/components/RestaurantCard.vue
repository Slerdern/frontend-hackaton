<template>
  <article class="restaurant-card">
    <img :src="imageSrc" :alt="restaurant.name" @error="handleImageError" />
    <div class="restaurant-card-footer">
      <div class="card-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="presentation">
          <path
            d="M12.3 2.4a2.2 2.2 0 0 1 1.9 2.9l-.4 1.2 1.2-.4a2.2 2.2 0 0 1 2.9 1.9 2.2 2.2 0 0 1-2.9 1.9l-1.2-.4.4 1.2a2.2 2.2 0 0 1-1.9 2.9 2.2 2.2 0 0 1-1.9-2.9l.4-1.2-1.2.4A2.2 2.2 0 0 1 6.7 8a2.2 2.2 0 0 1 2.9-1.9l1.2.4-.4-1.2a2.2 2.2 0 0 1 1.9-2.9Zm-6 10.4a4.3 4.3 0 1 1 0 8.6 4.3 4.3 0 0 1 0-8.6Zm11.7 1.6 3.6 3.6-4.8.1-.1 4.8-3.6-3.6.1-1.3 2.5-2.5 1.3-.1Z"
          />
        </svg>
      </div>
      <strong>{{ displayName }}</strong>
      <small>{{ locationLabel }}</small>
      <small>{{ metadataLabel }}</small>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { toAbsoluteImageUrl, toDisplayPrice } from '../utils/formatters';

const props = defineProps({
  restaurant: {
    type: Object,
    required: true
  }
});

const displayName = computed(() => props.restaurant.name || 'Restaurant');
const imageSrc = ref(toAbsoluteImageUrl(props.restaurant.photoUrl, props.restaurant.name));
const locationLabel = computed(() => props.restaurant.location || 'Ville non renseignee');
const metadataLabel = computed(() => {
  const price = toDisplayPrice(props.restaurant.price);
  const category = props.restaurant.cuisine || props.restaurant.category || 'Cuisine contemporaine';

  return `${price} • ${category}`;
});

watch(
  () => [props.restaurant.photoUrl, props.restaurant.name],
  () => {
    imageSrc.value = toAbsoluteImageUrl(props.restaurant.photoUrl, props.restaurant.name);
  },
  { immediate: true }
);

function handleImageError() {
  imageSrc.value = toAbsoluteImageUrl('', props.restaurant.name);
}
</script>
