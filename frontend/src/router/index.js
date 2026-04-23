import { createRouter, createWebHistory } from 'vue-router';


import HomeView from '../views/HomeView.vue';
import ProfileView from '../views/ProfileView.vue';
import SearchResultsView from '../views/SearchResultsView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/profil',
      name: 'profil',
      component: ProfileView
    },
    {
      path: '/recherche',
      name: 'search-results',
      component: SearchResultsView
    }
  ]
});

export default router;

