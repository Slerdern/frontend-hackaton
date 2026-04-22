import httpClient from './httpClient';

export async function signup(payload) {
  const { data } = await httpClient.post('/auth/signup', payload);
  return data;
}

export async function login(payload) {
  const { data } = await httpClient.post('/auth/login', payload);
  return data;
}

export async function logout() {
  const { data } = await httpClient.post('/auth/logout');
  return data;
}

