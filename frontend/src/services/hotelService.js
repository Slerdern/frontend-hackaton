import httpClient from './httpClient';

export async function searchHotels(payload) {
  const { data } = await httpClient.post('/hotels/search', payload);
  return data;
}

export async function getHotelsHomeFeed(params = {}) {
  const { data } = await httpClient.get('/hotels/home', { params });
  return data;
}
