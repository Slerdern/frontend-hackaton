import { describe, expect, it } from 'vitest';

import { toDisplayPrice, toPhotoFallback, toSafeExternalLink, toShortRating } from './formatters';

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

  it('normalise un lien sans protocole', () => {
    expect(toSafeExternalLink('guide.michelin.com/fr/fr')).toBe('https://guide.michelin.com/fr/fr');
  });

  it('ignore un lien invalide', () => {
    expect(toSafeExternalLink('not a url')).toBe('');
  });

  it('convertit un chemin relatif du Guide Michelin en URL absolue', () => {
    expect(toSafeExternalLink('/fr/fr/ile-de-france/paris/restaurant/test')).toBe(
      'https://guide.michelin.com/fr/fr/ile-de-france/paris/restaurant/test'
    );
  });

  it('convertit un chemin relatif sans slash initial', () => {
    expect(toSafeExternalLink('fr/fr/ile-de-france/paris/restaurant/test')).toBe(
      'https://guide.michelin.com/fr/fr/ile-de-france/paris/restaurant/test'
    );
  });
});

