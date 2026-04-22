import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { login, logout, signup } from '../services/authService';
import { setAuthToken } from '../services/httpClient';

const TOKEN_KEY = 'hackaton_access_token';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '');
  const user = ref(null);
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

  async function signupUser(payload) {
    loading.value = true;
    try {
      const data = await signup(payload);
      if (data.access_token) {
        persistToken(data.access_token);
      }
      user.value = {
        email: data.email || payload.email,
        id: data.user_id || null
      };
      return data;
    } finally {
      loading.value = false;
    }
  }

  async function loginUser(payload) {
    loading.value = true;
    try {
      const data = await login(payload);
      persistToken(data.access_token || '');
      user.value = data.user || { email: payload.email };
      return data;
    } finally {
      loading.value = false;
    }
  }

  async function logoutUser() {
    try {
      if (token.value) {
        await logout();
      }
    } finally {
      persistToken('');
      user.value = null;
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

