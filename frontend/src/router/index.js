import { createRouter, createWebHistory } from 'vue-router';


import HomeView from '../views/HomeView.vue';
import ProfileView from '../views/ProfileView.vue';

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
    }
  ]
});

export default router;

