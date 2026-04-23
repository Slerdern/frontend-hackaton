import { API_BASE_URL } from '../services/httpClient';

const BEAUTIFUL_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80'
];

function hashString(value) {
  const input = value || '';
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function toShortRating(rating) {
  if (typeof rating !== 'number') {
    return '-';
  }
  return rating.toFixed(1);
}

export function toDisplayPrice(price) {
  if (!price) {
    return 'Prix non renseigne';
  }
  return price;
}

export function toPhotoFallback(name) {
  const seed = hashString(name || 'Restaurant');
  return BEAUTIFUL_FALLBACK_IMAGES[seed % BEAUTIFUL_FALLBACK_IMAGES.length];
}

export function toAbsoluteImageUrl(source, fallbackName = 'Restaurant') {
  const value = typeof source === 'string' ? source.trim() : '';

  if (!value) {
    return toPhotoFallback(fallbackName);
  }

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  if (value.startsWith('//')) {
    return `https:${value}`;
  }

  if (value.startsWith('/')) {
    return `${API_BASE_URL}${value}`;
  }

  return `${API_BASE_URL}/${value}`;
}

