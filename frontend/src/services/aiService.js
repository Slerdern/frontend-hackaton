import httpClient from './httpClient';

export async function getWelcomeMessage() {
  const { data } = await httpClient.get('/ai/welcome');
  return data;
}

export async function searchWithAi(payload) {
  const { data } = await httpClient.post('/ai/search', payload);
  return data;
}

