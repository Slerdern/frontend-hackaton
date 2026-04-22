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

Prerequis verifies seulement au niveau projet: backend configure sur `http://localhost:8000`.

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Le proxy Vite redirige `/api/*` vers `http://127.0.0.1:8000/*`.

## Verification rapide

```bash
cd frontend
npm run test
npm run build
```

