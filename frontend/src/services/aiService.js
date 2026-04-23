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

export async function startTravelPlanning() {
  const { data } = await httpClient.post('/ai/travel/start');
  return data;
}

export async function planTravelWithAi(payload) {
  const { data } = await httpClient.post('/ai/travel/plan', payload);
  return data;
}

export async function startProfileAssistant() {
  const { data } = await httpClient.post('/ai/profile/start');
  return data;
}

export async function chatWithProfileAssistant(payload) {
  const { data } = await httpClient.post('/ai/profile/chat', payload);
  return data;
}

export async function saveProfilePreferences(payload) {
  const { data } = await httpClient.post('/ai/profile/save', payload);
  return data;
}

export async function bookRestaurantWithAi(payload) {
  const { data } = await httpClient.post('/ai/restaurant/book', payload);
  return data;
}

export async function bookHotelWithAi(payload) {
  const { data } = await httpClient.post('/ai/hotel/book', payload);
  return data;
}

