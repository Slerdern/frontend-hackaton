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
  const safeName = encodeURIComponent(name || 'Restaurant');
  return `https://placehold.co/600x400/e5e5e5/111111?text=${safeName}`;
}

export function toSafeExternalLink(value) {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^\/[\w\-./?=#%&+~:]*$/i.test(trimmed)) {
    return `https://guide.michelin.com${trimmed}`;
  }

  if (/^[a-z]{2}\/[\w\-./?=#%&+~:]*$/i.test(trimmed)) {
    return `https://guide.michelin.com/${trimmed}`;
  }

  if (/^[\w.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return '';
}

