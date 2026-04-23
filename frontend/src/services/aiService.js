import httpClient from './httpClient';

export async function getWelcomeMessage() {
  const { data } = await httpClient.get('/ai/welcome');
  return data;
}

export async function searchWithAi(payload) {
  const { data } = await httpClient.post('/ai/search', payload);
  return data;
}

export async function getHotelWelcomeMessage() {
  const { data } = await httpClient.get('/ai/hotels/welcome');
  return data;
}

export async function searchHotelWithAi(payload) {
  const { data } = await httpClient.post('/ai/hotels/search', payload);
  return data;
}

