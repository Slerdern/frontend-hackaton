import { describe, expect, it } from 'vitest';

import { toDisplayPrice, toPhotoFallback, toShortRating } from './formatters';

describe('formatters', () => {
  it('formate la note sur un decimal', () => {
    expect(toShortRating(4.28)).toBe('4.3');
  });

  it('retourne un texte par defaut pour le prix', () => {
    expect(toDisplayPrice('')).toBe('Prix non renseigne');
  });

  it('genere une image fallback', () => {
    expect(toPhotoFallback('Le Petit')).toContain('Le%20Petit');
  });
});

