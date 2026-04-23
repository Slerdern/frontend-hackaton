import httpClient from './httpClient';
import axios from 'axios';

function readAuthErrorMessage(error, fallbackMessage) {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const status = error.response?.status;
  const data = error.response?.data;
  const apiMessage = data?.message || data?.error;

  if (apiMessage) {
    return apiMessage;
  }

  if (status === 400) {
    return 'Donnees invalides. Verifiez les champs saisis.';
  }

  if (status === 401) {
    return 'Identifiants invalides. Verifiez votre email et mot de passe.';
  }

  if (status === 409) {
    return 'Ce compte existe deja.';
  }

  if (status && status >= 500) {
    return 'Service indisponible pour le moment. Reessayez plus tard.';
  }

  if (error.code === 'ECONNABORTED') {
    return 'Le serveur met trop de temps a repondre. Reessayez.';
  }

  return fallbackMessage;
}

function throwAuthError(error, fallbackMessage) {
  const message = readAuthErrorMessage(error, fallbackMessage);
  const wrapped = new Error(message);
  wrapped.cause = error;
  throw wrapped;
}

export async function signup(payload) {
  try {
    const body = {
      email: payload.email,
      password: payload.password,
      fullName: payload.fullName
    };
    const { data } = await httpClient.post('/auth/signup', body);
    return data;
  } catch (error) {
    throwAuthError(error, 'Inscription impossible pour le moment.');
  }
}

export async function login(payload) {
  try {
    const body = {
      email: payload.email,
      password: payload.password
    };
    const { data } = await httpClient.post('/auth/login', body);
    return data;
  } catch (error) {
    throwAuthError(error, 'Connexion impossible pour le moment.');
  }
}

export async function logout() {
  try {
    const { data } = await httpClient.post('/auth/logout');
    return data;
  } catch (error) {
    throwAuthError(error, 'Deconnexion impossible pour le moment.');
  }
}

