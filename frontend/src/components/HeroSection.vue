<template>
  <section class="hero">
    <div class="hero-visual">
      <div class="hero-overlay">
        <h1>Une nouvelle maniere d'organiser vos voyages</h1>
        <button class="map-badge" type="button">Carte</button>
      </div>

      <div class="hero-search-row">
        <input
          :value="query"
          @input="$emit('update:query', $event.target.value)"
          placeholder="Un restaurant, un hebergement..."
        />
        <button type="button" class="circle-action" @click="$emit('do-search')">Q</button>
        <button type="button" class="circle-action" @click="$emit('open-chat')">AI</button>
      </div>

      <div class="hero-chips">
        <button type="button" @click="$emit('update:query', 'best of')">Best-of</button>
        <button type="button" @click="$emit('update:query', 'country')">Country by</button>
        <button type="button" @click="$emit('update:query', 'guide voyage')">Guides de voyage</button>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  query: {
    type: String,
    default: ''
  }
});

defineEmits(['update:query', 'open-chat', 'do-search']);
</script>

