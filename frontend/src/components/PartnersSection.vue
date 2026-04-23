<template>
  <section class="partners-section">
    <h2 class="partners-section__title">Nos partenaires</h2>

    <div class="partners-list">
      <article v-for="partner in partners" :key="partner.name" class="partner-row">
        <div class="partner-row__logo" :class="partner.logoClass">
          <span v-if="partner.symbol" class="partner-row__symbol">{{ partner.symbol }}</span>
          <template v-else>
            <strong>{{ partner.logoText }}</strong>
            <small v-if="partner.logoSubtext">{{ partner.logoSubtext }}</small>
          </template>
        </div>

        <div class="partner-row__content">
          <h3>{{ partner.name }}</h3>
          <p>{{ partner.role }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
const partners = [
  {
    name: 'Blancpain',
    role: 'Global Partner',
    logoText: 'BLANCPAIN',
    logoSubtext: 'JB',
    logoClass: 'partner-row__logo--plain'
  },
  {
    name: 'Lafont',
    role: 'Global Partner',
    logoText: 'lafont.',
    logoSubtext: 'PARIS',
    logoClass: 'partner-row__logo--plain'
  },
  {
    name: 'Metro',
    role: 'Official Partner',
    logoText: 'les halles',
    logoSubtext: 'METRO',
    logoClass: 'partner-row__logo--metro'
  },
  {
    name: 'TheFork',
    role: 'Official Booking Partner',
    symbol: '◔',
    logoClass: 'partner-row__logo--fork'
  }
];
</script>
