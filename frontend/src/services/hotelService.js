import httpClient from './httpClient';

export async function searchHotels(payload) {
  const { data } = await httpClient.post('/hotels/search', payload);
  return data;
}

export async function getHotelsHomeFeed(params = {}) {
  const { data } = await httpClient.get('/hotels/home', { params });
  return data;
}

export async function getUserHotelReservations(email) {
  const { data } = await httpClient.get('/hotel/bookings/email', { params: { email } });
  return data;
}

export async function canReviewHotelReservation(bookingId) {
  const { data } = await httpClient.get(`/hotel/bookings/can-review/${bookingId}`);
  return data;
}

export async function postHotelReview(bookingId, review) {
  const payload = { avis: review };
  const endpoints = [`/hotel/bookings/${bookingId}`, `/hotel/bookings/${bookingId}/review`];
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
