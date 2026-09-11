import { SITE } from '../data/site';
import type { Phone } from '../data/phones';

/**
 * Lien d'affiliation Amazon.fr.
 * - Si l'ASIN est renseigné dans phones.ts → lien direct vers la fiche produit.
 * - Sinon → lien de recherche Amazon (autorisé par le Programme Partenaires).
 */
export function amazonUrl(target: Phone | string): string {
  if (typeof target !== 'string' && target.asin) {
    return `https://www.amazon.fr/dp/${target.asin}?tag=${SITE.amazonTag}`;
  }
  const query = typeof target === 'string' ? target : target.amazonQuery;
  return `https://www.amazon.fr/s?k=${encodeURIComponent(query)}&tag=${SITE.amazonTag}`;
}

export const AFFILIATE_REL = 'sponsored nofollow noopener';
