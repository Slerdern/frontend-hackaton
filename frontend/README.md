# Frontend Vue.js - Hackaton

Application frontend Vue 3 + Vite du projet Guide Michelin. L'interface reprend une experience mobile-first avec adaptation desktop, authentification, recherche classique, recherche pilotee par IA et consultation du profil.

## Vue d'ensemble

Le projet est organise autour de trois parcours principaux:

- Accueil et navigation vers les contenus editoriaux, les selections et les points d'entree de recherche.
- Recherche de restaurants et d'hebergements, soit par formulaire classique, soit via le chatbot IA.
- Espace profil pour visualiser le compte, les preferences et les reservations validees, avec possibilite de laisser un avis.

## Stack

- Vue 3 avec `<script setup>`.
- Vite pour le build et le serveur de dev.
- Vue Router pour la navigation.
- Pinia pour l'etat d'authentification.
- Axios pour les appels API.
- Vitest pour les tests unitaires.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run test
```

- `npm run dev` lance le serveur local sur `http://localhost:5173`.
- `npm run build` produit la version de production.
- `npm run preview` sert le build localement.
- `npm run test` execute les tests Vitest.

## Configuration

Le client HTTP cible par defaut le backend Render `https://guide-michelin.onrender.com`.

Pour pointer vers une autre API, definir `VITE_API_BASE_URL` avant de lancer Vite:

```bash
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

Le client ajoute automatiquement le Bearer token quand un utilisateur est connecte.

## Pages et routes

Le router expose trois pages:

- `/` -> page d'accueil.
- `/profil` -> page profil et reservations.
- `/recherche` -> resultats de recherche.

## Flux fonctionnels

### Authentification

- Inscription via `/auth/signup`.
- Connexion via `/auth/login`.
- Deconnexion via `/auth/logout`.
- Le token est conserve en `localStorage` et reapplique automatiquement aux requetes.

### Recherche

- Recherche classique de restaurants via `/restaurants/search`.
- Recherche d'hebergements via `/hotels/search` et feed d'accueil via `/hotels/home`.
- La page resultats combine restaurants et hebergements dans une vue unique.

### Assistant IA

- Messages de bienvenue via `/ai/welcome` et `/ai/hotels/welcome`.
- Recherche guidee via `/ai/search` et `/ai/hotels/search`.
- Parcours complementaires pour le profil et la reservation via les routes IA dediees dans `src/services/aiService.js`.

### Profil et avis

- Le profil agrège les informations de compte et les preferences stockees cote backend.
- Les reservations sont normalisees pour pouvoir afficher restaurants et hebergements dans un format commun.
- Les avis peuvent etre envoyes depuis la page profil quand la reservation est validable.

## Structure du projet

- `src/main.js` initialise Vue, Pinia et le router.
- `src/App.vue` sert uniquement de racine et rend la route active.
- `src/views/` contient les trois pages principales.
- `src/components/` regroupe la navigation, le hero, les cartes, les panneaux auth/chatbot et le footer.
- `src/services/` centralise les appels API.
- `src/stores/authStore.js` gere l'utilisateur courant, le token et la persistence locale.
- `src/utils/formatters.js` contient les helpers d'images, de liens et de formatage.
- `src/utils/formatters.test.js` couvre ces helpers avec Vitest.

## Services API

- `src/services/httpClient.js` configure Axios et injecte le token.
- `src/services/authService.js` encapsule l'inscription, la connexion et la deconnexion.
- `src/services/restaurantService.js` gere la recherche restaurants, les reservations et les avis.
- `src/services/hotelService.js` gere la recherche hebergements, le feed d'accueil et les avis.
- `src/services/reservationService.js` normalise plusieurs formats de reservation renvoyes par le backend.
- `src/services/aiService.js` centralise les endpoints IA du projet.

## Donnees et conventions

- Les images backend peuvent etre relatives; `toAbsoluteImageUrl` les convertit en URL absolues.
- Les liens externes du Guide Michelin sont valides via `toSafeExternalLink` avant d'etre rendus cliquables.
- Les objets reservation sont normalises pour tolerer plusieurs noms de champs cote backend.
- Les preferences utilisateur sont lues de facon defensive pour eviter les erreurs quand certaines donnees sont absentes.

## Tests

La base de tests est volontairement minimale mais utile pour les helpers purs.

```bash
npm run test
```

Le test principal couvre le formatage des notes, des prix, des fallback d'image et la normalisation d'URL.

## Build

```bash
npm run build
```

Le build doit rester propre avant toute livraison ou integration.

