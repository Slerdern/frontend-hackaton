<template>
  <section class="articles-section">
    <h2 class="articles-section__title">Nos derniers articles</h2>

    <div class="articles-list" @wheel.prevent="scrollHorizontally">
      <article v-for="article in articles" :key="article.title" class="article-card">
        <div class="article-card__gallery">
          <div
            v-for="(image, index) in article.images"
            :key="`${article.title}-${index}`"
            class="article-card__image"
            :style="{ backgroundImage: `url('${image}')` }"
          ></div>
        </div>

        <div class="article-card__body">
          <h3>{{ article.title }}</h3>

          <div class="article-card__meta">
            <span>◷ {{ article.readTime }}</span>
            <span>{{ article.date }}</span>
            <span class="article-card__tag">{{ article.tag }}</span>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
const articles = [
  {
    title: 'Tour du monde des restaurants les plus originaux de la selection',
    readTime: '7 min',
    date: '17 avril 2026',
    tag: 'VOYAGE',
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'La liste complete des restaurants ajoutes au Guide MICHELIN 2026',
    readTime: '16 min',
    date: '16 mars 2026',
    tag: 'ACTU',
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Les adresses qui redefinissent le week-end gastronomique',
    readTime: '9 min',
    date: '28 fevrier 2026',
    tag: 'GUIDE',
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80'
    ]
  }
];

function scrollHorizontally(event) {
  const container = event.currentTarget;
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  container.scrollLeft += delta;
}
</script>
