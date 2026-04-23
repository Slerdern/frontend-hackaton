<template>
  <main class="profile-page">
    <section class="profile-hero">
      <p class="profile-kicker">Compte personnel</p>
      <h1>Mon profil</h1>
      <p class="profile-intro">
        Retrouvez ici vos informations de compte et vos préférences de voyage, restaurants et hebergements.
      </p>
    </section>

    <section v-if="displayUser" class="profile-card">
      <div class="profile-summary">
        <div class="profile-avatar" aria-hidden="true">
          {{ initials }}
        </div>
        <div>
          <h2>{{ displayUser.fullName }}</h2>
          <p>{{ displayUser.email }}</p>
          <p class="profile-id">ID: {{ displayUser.id }}</p>
        </div>
      </div>

      <div class="profile-grid">
        <article class="profile-block">
          <h3>Restaurants</h3>
          <dl>
            <div>
              <dt>Cuisines</dt>
              <dd>{{ joinList(displayUser.preferences?.restaurants?.cuisines) }}</dd>
            </div>
            <div>
              <dt>Ambiance</dt>
              <dd>{{ joinList(displayUser.preferences?.restaurants?.atmosphere) }}</dd>
            </div>
            <div>
              <dt>Fourchette de prix</dt>
              <dd>{{ joinList(displayUser.preferences?.restaurants?.priceRange) }}</dd>
            </div>
            <div>
              <dt>Restrictions alimentaires</dt>
              <dd>{{ joinList(displayUser.preferences?.restaurants?.dietaryRestrictions) }}</dd>
            </div>
          </dl>
        </article>

        <article class="profile-block">
          <h3>Hebergements</h3>
          <dl>
            <div>
              <dt>Amenites</dt>
              <dd>{{ joinList(displayUser.preferences?.hotels?.amenities) }}</dd>
            </div>
            <div>
              <dt>Types de voyage</dt>
              <dd>{{ joinList(displayUser.preferences?.hotels?.tripTypes) }}</dd>
            </div>
            <div>
              <dt>Niveau de budget</dt>
              <dd>{{ displayUser.preferences?.hotels?.budgetLevel || 'Non renseigne' }}</dd>
            </div>
            <div>
              <dt>Segments preferes</dt>
              <dd>{{ joinList(displayUser.preferences?.hotels?.preferredSegments) }}</dd>
            </div>
          </dl>
        </article>

        <article class="profile-block">
          <h3>Voyage</h3>
          <dl>
            <div>
              <dt>Style de voyage</dt>
              <dd>{{ displayUser.preferences?.travel?.travelStyle || 'Non renseigne' }}</dd>
            </div>
            <div>
              <dt>Destinations favorites</dt>
              <dd>{{ joinList(displayUser.preferences?.travel?.favoriteDestinations) }}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>

    <section v-else class="profile-empty">
      <p>Vous n'etes pas connecte.</p>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue';

import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const fallbackProfile = {
  id: '9f375d22-89ae-4dfd-b1d9-6754cf502729',
  email: 'test30@mail.com',
  fullName: 'Jean Dupont',
  preferences: {
    hotels: {
      amenities: ['piscine', 'spa'],
      tripTypes: ['romantique'],
      budgetLevel: 'medium',
      preferredSegments: []
    },
    travel: {
      travelStyle: 'spontané',
      favoriteDestinations: ['Rome', 'Tokyo']
    },
    restaurants: {
      cuisines: ['italienne', 'japonaise'],
      atmosphere: ['cosy'],
      priceRange: ['€€', '€€€'],
      dietaryRestrictions: []
    }
  }
};

const displayUser = computed(() => {
  if (!authStore.user) {
    return fallbackProfile;
  }

  return {
    ...fallbackProfile,
    ...authStore.user,
    preferences: {
      ...fallbackProfile.preferences,
      ...(authStore.user.preferences || {}),
      hotels: {
        ...fallbackProfile.preferences.hotels,
        ...(authStore.user.preferences?.hotels || {})
      },
      travel: {
        ...fallbackProfile.preferences.travel,
        ...(authStore.user.preferences?.travel || {})
      },
      restaurants: {
        ...fallbackProfile.preferences.restaurants,
        ...(authStore.user.preferences?.restaurants || {})
      }
    }
  };
});

const initials = computed(() => {
  const name = displayUser.value?.fullName || 'Utilisateur';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
});

function joinList(value) {
  if (!Array.isArray(value) || !value.length) {
    return 'Aucune preference renseignee';
  }

  return value.join(', ');
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 6rem 1.25rem 4rem;
  background:
    radial-gradient(circle at top left, rgba(195, 0, 57, 0.12), transparent 28%),
    linear-gradient(180deg, #f9f5ef 0%, #ffffff 42%);
  color: #171717;
}

.profile-hero,
.profile-card,
.profile-empty {
  width: min(980px, 94vw);
  margin: 0 auto;
}

.profile-hero {
  margin-bottom: 1.5rem;
}

.profile-kicker {
  margin: 0 0 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.78rem;
  color: #8f6c11;
  font-weight: 700;
}

.profile-hero h1 {
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  line-height: 1;
}

.profile-intro {
  max-width: 62ch;
  margin: 0.85rem 0 0;
  color: #5d5d5d;
  font-size: 1.05rem;
}

.profile-card {
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.profile-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.profile-avatar {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #c30039, #8e0029);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  flex: none;
}

.profile-summary h2 {
  margin: 0;
  font-size: 1.5rem;
}

.profile-summary p {
  margin: 0.25rem 0 0;
  color: #5d5d5d;
}

.profile-id {
  font-size: 0.9rem;
}

.profile-grid {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.profile-block {
  padding: 1rem;
  border-radius: 1rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.profile-block h3 {
  margin: 0 0 0.9rem;
  font-size: 1.05rem;
}

.profile-block dl {
  margin: 0;
}

.profile-block dl > div + div {
  margin-top: 0.85rem;
}

.profile-block dt {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8b8b8b;
  margin-bottom: 0.2rem;
}

.profile-block dd {
  margin: 0;
  line-height: 1.45;
  font-weight: 600;
}

.profile-empty {
  padding: 2rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .profile-page {
    padding-top: 5.5rem;
  }

  .profile-summary {
    align-items: flex-start;
  }

  .profile-summary h2 {
    font-size: 1.3rem;
  }
}
</style>
