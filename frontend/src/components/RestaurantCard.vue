<template>
  <a
    v-if="destinationUrl"
    class="restaurant-card restaurant-card-link"
    :href="destinationUrl"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="`Voir ${displayName} sur son site`"
  >
    <img :src="imageSrc" :alt="restaurant.name" @error="handleImageError" />
    <div class="restaurant-card-footer">
      <img src="/img/key.png" alt="Clef du Guide MICHELIN">
      <strong>{{ displayName }}</strong>
      <div class="card-detail">
      <p>{{ locationLabel }}</p>
      <p class="card-detail-muted">{{ metadataLabel }}</p>
      </div>
    </div>
  </a>

  <article v-else class="restaurant-card">
    <div class="image-link">
      <img :src="imageSrc" :alt="restaurant.name" @error="handleImageError" />
    </div>
    <div class="restaurant-card-footer">
      <img src="/img/key.png" alt="Clef du Guide MICHELIN">
      <strong>{{ displayName }}</strong>
      <p class="card-detail">{{ locationLabel }}</p>
      <p class="card-detail card-detail-muted">{{ metadataLabel }}</p>
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

const frenchCityToRegion = {
  paris: 'ile-de-france',
  lyon: 'auvergne-rhone-alpes',
  marseille: 'provence-alpes-cote-d-azur',
  nice: 'provence-alpes-cote-d-azur',
  bordeaux: 'nouvelle-aquitaine',
  lille: 'hauts-de-france',
  nantes: 'pays-de-la-loire',
  strasbourg: 'grand-est',
  toulouse: 'occitanie',
  metz: 'grand-est',
  bayonne: 'nouvelle-aquitaine',
  cassis: 'provence-alpes-cote-d-azur',
  'mont-de-marsan': 'nouvelle-aquitaine'
};

function normalizeText(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function toSlug(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readCityAndCountry() {
  const explicitCountry = props.restaurant.country || '';
  const location = props.restaurant.location || '';

  if (location.includes(',')) {
    const [cityPart, countryPart] = location.split(',');
    return {
      city: cityPart?.trim() || '',
      country: countryPart?.trim() || explicitCountry
    };
  }

  return {
    city: location.trim(),
    country: explicitCountry
  };
}

function buildMichelinRestaurantUrl() {
  const { city, country } = readCityAndCountry();
  const normalizedCountry = normalizeText(country);

  if (normalizedCountry !== 'france') {
    return '';
  }

  const citySlug = toSlug(city);
  const regionSlug = frenchCityToRegion[citySlug];
  const restaurantSlug = toSlug(props.restaurant.name || '');

  if (!citySlug || !regionSlug || !restaurantSlug) {
    return '';
  }

  return `https://guide.michelin.com/fr/fr/${regionSlug}/${citySlug}/restaurant/${restaurantSlug}`;
}

function buildMichelinFallbackUrl() {
  const canonicalRestaurantUrl = buildMichelinRestaurantUrl();
  if (canonicalRestaurantUrl) {
    return canonicalRestaurantUrl;
  }

  const query = `${props.restaurant.name || ''} ${props.restaurant.location || props.restaurant.country || ''}`.trim();
  return query ? `https://guide.michelin.com/fr/fr/search?q=${encodeURIComponent(query)}` : '';
}

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

  return toSafeExternalLink(rawUrl) || buildMichelinFallbackUrl();
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
