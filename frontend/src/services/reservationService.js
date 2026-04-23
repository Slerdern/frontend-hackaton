import axios from 'axios';

import httpClient from './httpClient';

const RESERVATION_ENDPOINTS = [
  '/reservations/me',
  '/bookings/me',
  '/me/reservations',
  '/me/bookings',
  '/reservations',
  '/bookings'
];

function extractReservations(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.reservations || data?.bookings || data?.items || data?.data || [];
}

export function normalizeReservation(reservation) {
  if (!reservation) {
    return null;
  }

  return {
    bookingId: reservation.bookingId || reservation.id || reservation.reservationId || reservation.code || `${Date.now()}`,
    kind: reservation.kind || reservation.type || reservation.category || 'restaurant',
    name: reservation.name || reservation.title || reservation.hotelName || reservation.restaurantName || 'Reservation',
    location: reservation.location || reservation.city || reservation.country || reservation.address || '',
    cuisine: reservation.cuisine || '',
    marketSegment: reservation.marketSegment || reservation.segment || '',
    price: reservation.price || reservation.priceRange || '',
    rating: reservation.rating ?? null,
    summary: reservation.summary || reservation.message || reservation.notes || '',
    createdAt:
      reservation.createdAt ||
      reservation.created_at ||
      reservation.confirmedAt ||
      reservation.confirmed_at ||
      reservation.updatedAt ||
      reservation.updated_at ||
      null,
    source: reservation.source || 'backend'
  };
}

function normalizeReservationList(data) {
  return extractReservations(data).map(normalizeReservation).filter(Boolean);
}

function getErrorStatus(error) {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  return error.response?.status || null;
}

export async function fetchUserReservations(userId) {
  const endpointCandidates = userId
    ? [`/users/${userId}/reservations`, `/users/${userId}/bookings`, ...RESERVATION_ENDPOINTS]
    : RESERVATION_ENDPOINTS;

  let lastError = null;

  for (const endpoint of endpointCandidates) {
    try {
      const { data } = await httpClient.get(endpoint);
      return normalizeReservationList(data);
    } catch (error) {
      lastError = error;
      const status = getErrorStatus(error);
      if (status !== 404 && status !== 405) {
        throw error;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  return [];
}