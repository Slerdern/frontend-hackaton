import axios from 'axios';

export const API_BASE_URL = 'https://guide-michelin.onrender.com';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
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

