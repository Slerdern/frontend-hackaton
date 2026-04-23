import httpClient from './httpClient';

export async function searchRestaurants(payload) {
  const { data } = await httpClient.post('/restaurants/search', payload);
  return data;
}

export async function getUserRestaurantReservations(email) {
  const { data } = await httpClient.get('/restaurant/reservations/email', { params: { email } });
  return data;
}

export async function canReviewRestaurantReservation(reservationId) {
  const { data } = await httpClient.get(`/restaurant/reservations/can-review/${reservationId}`);
  return data;
}

export async function postRestaurantReview(reservationId, review) {
  const payload = { avis: review };
  const endpoints = [`/restaurant/reservations/${reservationId}`, `/restaurant/reservations/${reservationId}/review`];
  const methods = ['post', 'patch', 'put'];

  let lastError = null;

  for (const endpoint of endpoints) {
    for (const method of methods) {
      try {
        const { data } = await httpClient.request({
          url: endpoint,
          method,
          data: payload
        });
        return data;
      } catch (error) {
        lastError = error;
        const status = error?.response?.status;
        if (status !== 404 && status !== 405) {
          throw error;
        }
      }
    }
  }

  throw lastError;
}

