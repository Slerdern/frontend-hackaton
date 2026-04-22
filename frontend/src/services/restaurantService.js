import httpClient from './httpClient';

export async function searchRestaurants(payload) {
  const { data } = await httpClient.post('/restaurants/search', payload);
  return data;
}

