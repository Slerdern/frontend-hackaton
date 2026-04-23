<template>
  <section class="card-section">
    <h2 class="section-title">{{ title }}</h2>
    <div class="card-grid" @wheel.prevent="scrollHorizontally">
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

const fallbackByTitle = {
  'Recommandes des experts certifies par le Guide Michelin': [
    {
      id: 'fallback-expert-1',
      name: 'Osmera',
      location: 'Bayonne, France',
      cuisine: 'Cuisine moderne',
      price: '€€',
      photoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'fallback-expert-2',
      name: 'Omasake',
      location: 'Paris, France',
      cuisine: 'Cuisine japonaise',
      price: '€€',
      photoUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'fallback-expert-3',
      name: 'Aroma',
      location: 'Paris, France',
      cuisine: 'Cuisine creative',
      price: '€€€',
      photoUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'fallback-expert-4',
      name: 'Clair Obscur',
      location: 'Lille, France',
      cuisine: 'Cuisine gastronomique',
      price: '€€€',
      photoUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80'
    }
  ],
  'Nos dernieres selections - Restaurants': [
    {
      id: 'fallback-latest-1',
      name: 'Bistrot Marceau',
      location: 'Lyon, France',
      cuisine: 'Cuisine francaise',
      price: '€€',
      photoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'fallback-latest-2',
      name: 'Casa Nera',
      location: 'Marseille, France',
      cuisine: 'Cuisine mediterraneenne',
      price: '€€€',
      photoUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'fallback-latest-3',
      name: 'Le Sillage',
      location: 'Nantes, France',
      cuisine: 'Cuisine de saison',
      price: '€€',
      photoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'fallback-latest-4',
      name: 'Nonna Blu',
      location: 'Toulouse, France',
      cuisine: 'Cuisine italienne',
      price: '€€',
      photoUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80'
    }
  ],
  'Autres adresses a decouvrir': [
    {
      id: 'fallback-extra-1',
      name: 'Maison Alba',
      location: 'Bordeaux, France',
      cuisine: 'Cuisine creative',
      price: '€€',
      photoUrl: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'fallback-extra-2',
      name: 'Le Rivage',
      location: 'Nice, France',
      cuisine: 'Poissons et fruits de mer',
      price: '€€€',
      photoUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'fallback-extra-3',
      name: 'Maison Sora',
      location: 'Strasbourg, France',
      cuisine: 'Cuisine fusion',
      price: '€€',
      photoUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'fallback-extra-4',
      name: 'Le Jardin',
      location: 'Montpellier, France',
      cuisine: 'Cuisine vegetale',
      price: '€€',
      photoUrl: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80'
    }
  ]
};

const defaultFallback = [
  {
    id: 'fallback-default-1',
    name: 'Atelier Gourmet',
    location: 'Paris, France',
    cuisine: 'Cuisine contemporaine',
    price: '€€',
    photoUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'fallback-default-2',
    name: 'La Table Claire',
    location: 'Paris, France',
    cuisine: 'Cuisine de saison',
    price: '€€',
    photoUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'fallback-default-3',
    name: 'Maison Verre',
    location: 'Paris, France',
    cuisine: 'Cuisine bistronomique',
    price: '€€€',
    photoUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'fallback-default-4',
    name: 'Le Comptoir',
    location: 'Paris, France',
    cuisine: 'Cuisine francaise',
    price: '€€',
    photoUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'
  }
];

const displayedItems = computed(() => {
  const fallbackItems = fallbackByTitle[props.title] || defaultFallback;

  if (!props.items.length) {
    return fallbackItems;
  }

  return [...props.items, ...fallbackItems].slice(0, 4);
});

function scrollHorizontally(event) {
  const container = event.currentTarget;
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  container.scrollLeft += delta;
}
</script>
