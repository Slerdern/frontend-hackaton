<template>
  <section class="card-section">
    <h2 class="section-title">{{ title }}</h2>
    <div class="card-row">
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
      id: 'expert-1',
      name: 'Osméra',
      location: 'Bayonne, France',
      cuisine: 'Cuisine moderne',
      price: '€€',
      photoUrl:
        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'expert-2',
      name: 'OMASAKE',
      location: 'Paris, France',
      cuisine: 'Cuisine japonaise',
      price: '€€',
      photoUrl:
        'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'expert-3',
      name: 'Clair de Table',
      location: 'Lyon, France',
      cuisine: 'Cuisine creative',
      price: '€€€',
      photoUrl:
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80'
    }
  ],
  'Nos dernieres selections - Restaurants': [
    {
      id: 'restaurant-1',
      name: 'Bistrot Marceau',
      location: 'Lyon, France',
      cuisine: 'Cuisine francaise',
      price: '€€',
      photoUrl:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'restaurant-2',
      name: 'Casa Nera',
      location: 'Marseille, France',
      cuisine: 'Cuisine mediterraneenne',
      price: '€€€',
      photoUrl:
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'restaurant-3',
      name: 'Le Sillage',
      location: 'Nantes, France',
      cuisine: 'Cuisine de saison',
      price: '€€',
      photoUrl:
        'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80'
    }
  ],
  'Nos dernieres selections - Hebergements': [
    {
      id: 'stay-1',
      name: 'Villa Mirasol',
      location: 'Mont-de-Marsan, France',
      cuisine: 'Hotel & Spa',
      price: '€€€',
      photoUrl:
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'stay-2',
      name: 'Maison Heler',
      location: 'Metz, France',
      cuisine: 'Sejour design',
      price: '€€€',
      photoUrl:
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'stay-3',
      name: 'Les Roches Blanches',
      location: 'Cassis, France',
      cuisine: 'Hotel en bord de mer',
      price: '€€€€',
      photoUrl:
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    }
  ]
};

const displayedItems = computed(() => {
  const fallbackItems = fallbackByTitle[props.title] || [];

  if (!props.items.length) {
    return fallbackItems;
  }

  return [...props.items, ...fallbackItems].slice(0, 3);
});
</script>
