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

