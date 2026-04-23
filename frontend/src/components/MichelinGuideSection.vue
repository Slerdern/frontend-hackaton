<template>
  <section class="guide-section">
    <h2 class="guide-section__title">En savoir plus sur le Guide MICHELIN</h2>

    <div class="guide-list" @wheel.prevent="scrollHorizontally">
      <article v-for="item in items" :key="item.title" class="guide-card">
        <div
          class="guide-card__media"
          :class="item.mediaClass"
          :style="item.image ? { backgroundImage: `url('${item.image}')` } : undefined"
        >
          <span v-if="item.symbol" class="guide-card__symbol">{{ item.symbol }}</span>
        </div>

        <div class="guide-card__body">
          <h3>{{ item.title }}</h3>

          <div class="guide-card__meta">
            <span>◷ {{ item.readTime }}</span>
            <span>{{ item.date }}</span>
            <span class="guide-card__tag">{{ item.tag }}</span>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
const items = [
  {
    title: 'Tour du monde des restaurants les plus originaux de la selection',
    readTime: '5 minutes',
    date: '28 novembre 2022',
    tag: 'REPORTAGES',
    mediaClass: 'guide-card__media--photo',
    image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'La Clef MICHELIN : La distinction des sejours remarquables',
    readTime: '3 minutes',
    date: '10 septembre 2025',
    tag: 'HOTELS',
    mediaClass: 'guide-card__media--symbol',
    symbol: '✣'
  },
  {
    title: 'Comment sont attribuees les distinctions du Guide MICHELIN',
    readTime: '6 minutes',
    date: '15 janvier 2026',
    tag: 'INSIDE',
    mediaClass: 'guide-card__media--photo',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80'
  }
];

function scrollHorizontally(event) {
  const container = event.currentTarget;
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  container.scrollLeft += delta;
}
</script>
