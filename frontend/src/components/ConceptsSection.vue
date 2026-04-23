<template>
  <section class="concepts-section">
    <h2 class="concepts-section__title">Nos concepts</h2>

    <div class="concepts-list">
      <article v-for="concept in concepts" :key="concept.title" class="concept-card">
        <div
          class="concept-card__visual"
          :class="concept.visualClass"
          :style="concept.image ? { backgroundImage: `url('${concept.image}')` } : undefined"
        >
          <span v-if="concept.label" class="concept-card__label">{{ concept.label }}</span>
          <span v-else class="concept-card__emoji">{{ concept.emoji }}</span>
        </div>

        <div class="concept-card__content">
          <h3>{{ concept.title }}</h3>
          <p>{{ concept.description }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
const concepts = [
  {
    title: 'Les Best-Of',
    description: "Decouvrez les lieux d'exception pour consommer, parfaitement adaptes a vos envies.",
    visualClass: 'concept-card__visual--red',
    label: 'BEST\nof\nBEST'
  },
  {
    title: 'Les Country by Guide MICHELIN',
    description: 'Le meilleur de nos adresses dans nos villes coups de coeur',
    visualClass: 'concept-card__visual--red',
    emoji: '🌍'
  },
  {
    title: 'Le Guide MICHELIN Plus',
    description: 'Un service personnalise et des avantages exclusifs dans nos hotels',
    visualClass: 'concept-card__visual--photo',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80'
  }
];
</script>
