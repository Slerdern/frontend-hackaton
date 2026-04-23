import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { login, logout, signup } from '../services/authService';
import { setAuthToken } from '../services/httpClient';

const TOKEN_KEY = 'hackaton_access_token';
const USER_KEY = 'hackaton_user';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '');
  const user = ref(
    (() => {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    })()
  );
  const loading = ref(false);

  setAuthToken(token.value);

  const isAuthenticated = computed(() => Boolean(token.value));

  function persistToken(nextToken) {
    token.value = nextToken || '';
    setAuthToken(token.value);

    if (token.value) {
      localStorage.setItem(TOKEN_KEY, token.value);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  function persistUser(nextUser) {
    user.value = nextUser || null;
    if (user.value) {
      localStorage.setItem(USER_KEY, JSON.stringify(user.value));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  async function signupUser(payload) {
    loading.value = true;
    try {
      const data = await signup(payload);
      if (data.access_token) {
        persistToken(data.access_token);
      }
      const nextUser = {
        email: data.email || data.user?.email || payload.email,
        id: data.user_id || null
      };
      persistUser(nextUser);
      return data;
    } finally {
      loading.value = false;
    }
  }

  async function loginUser(payload) {
    loading.value = true;
    try {
      const data = await login(payload);
      if (!data.access_token) {
        throw new Error('Token de session manquant.');
      }
      persistToken(data.access_token);
      const nextUser = data.user || {
        email: data.email || payload.email,
        id: data.user_id || null
      };
      persistUser(nextUser);
      return data;
    } finally {
      loading.value = false;
    }
  }

  async function logoutUser() {
    loading.value = true;
    try {
      if (token.value) {
        return await logout();
      }
      return { message: 'Session locale fermee.' };
    } finally {
      persistToken('');
      persistUser(null);
      loading.value = false;
    }
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    signupUser,
    loginUser,
    logoutUser
  };
});

