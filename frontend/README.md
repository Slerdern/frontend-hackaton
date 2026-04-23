# Frontend Vue.js - Hackaton

Interface Vue 3 (Vite) mobile-first connectee au backend Spring Boot du projet, avec adaptation responsive desktop.

## Fonctionnalites

- Ecran principal inspire de la maquette mobile (navbar, hero image, chips, sections cartes, footer).
- Authentification via `/auth/signup`, `/auth/login`, `/auth/logout`.
- Chatbot IA via `/ai/welcome` et `/ai/search`.
- Recherche classique via `/restaurants/search`.
- Stockage du token access en `localStorage` et envoi automatique du Bearer token.

## Structure

- `src/views/HomeView.vue` : page unique complete.
- `src/components/` : navigation, hero, cartes, panneaux auth/chatbot, footer.
- `src/services/` : clients API backend.
- `src/stores/authStore.js` : etat session/auth.
- `src/utils/formatters.test.js` : test Vitest minimal.

## Lancer en local

Prerequis: backend accessible (Render par defaut, ou backend local si `VITE_API_BASE_URL` est configuree).

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Par defaut, le frontend cible le backend Render `https://guide-michelin.onrender.com`.

Pour surcharger l'endpoint API, definir la variable `VITE_API_BASE_URL`.

## Verification rapide

```bash
cd frontend
npm run test
npm run build
```

