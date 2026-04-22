import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const httpClient = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let authToken = '';

export function setAuthToken(token) {
  authToken = token || '';
}

httpClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export default httpClient;

