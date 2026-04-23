<template>
  <article class="restaurant-card">
    <a
      v-if="destinationUrl"
      class="image-link"
      :href="destinationUrl"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="`Voir ${displayName} sur son site`"
    >
      <img :src="imageSrc" :alt="restaurant.name" @error="handleImageError" />
    </a>
    <img v-else :src="imageSrc" :alt="restaurant.name" @error="handleImageError" />
    <div class="restaurant-card-footer">
      <div class="card-brand-row" aria-hidden="true">
        <img class="card-brand-logo" :src="brandLogoSrc" alt="" />
        <span class="card-brand-label">Guide MICHELIN</span>
      </div>
      <strong>{{ displayName }}</strong>
      <p class="card-detail">{{ locationLabel }}</p>
      <p class="card-detail card-detail--muted">{{ metadataLabel }}</p>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { toAbsoluteImageUrl, toDisplayPrice, toSafeExternalLink } from '../utils/formatters';

const props = defineProps({
  restaurant: {
    type: Object,
    required: true
  }
});

const displayName = computed(() => props.restaurant.name || 'Restaurant');
const imageSrc = ref(toAbsoluteImageUrl(props.restaurant.photoUrl, props.restaurant.name));
const brandLogoSrc = computed(() => props.restaurant.logoUrl || props.restaurant.logo || '/img/logo-favicon.png');
const destinationUrl = computed(() => {
  const rawUrl =
    props.restaurant.websiteUrl ||
    props.restaurant.website_url ||
    props.restaurant.website ||
    props.restaurant.url ||
    props.restaurant.link ||
    props.restaurant.michelinUrl ||
    props.restaurant.michelin_url ||
    props.restaurant.reservationUrl ||
    props.restaurant.reservation_url ||
    props.restaurant.links?.website ||
    props.restaurant.links?.michelin ||
    props.restaurant.links?.reservation ||
    props.restaurant.contact?.website ||
    '';

  return toSafeExternalLink(rawUrl);
});
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
