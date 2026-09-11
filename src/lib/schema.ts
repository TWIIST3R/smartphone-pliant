import { SITE, brands } from '../data/site';
import { ancestors, node } from '../data/cocoon';
import { type Phone, overall } from '../data/phones';
import { mainImage } from '../data/images';

const abs = (path: string) => new URL(path, SITE.url).href;

export const ORG_ID = `${SITE.url}/#organization`;
export const WEBSITE_ID = `${SITE.url}/#website`;
export const PERSON_ID = `${SITE.url}${SITE.author.url}#person`;

export function person() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE.author.name,
    url: abs(SITE.author.url),
    image: abs(SITE.author.avatar),
    jobTitle: SITE.author.jobTitle,
    description: SITE.author.bio,
    worksFor: { '@id': ORG_ID },
  };
}

/** Avis éditorial (synthèse sourcée) associé à la fiche produit */
export function review(p: Phone, path: string = p.path) {
  return {
    '@type': 'Review',
    '@id': `${abs(path)}#review`,
    itemReviewed: { '@id': `${abs(p.path)}#product` },
    author: { '@id': PERSON_ID },
    publisher: { '@id': ORG_ID },
    datePublished: SITE.published,
    dateModified: SITE.updated,
    inLanguage: 'fr-FR',
    reviewBody: p.verdict,
    reviewRating: { '@type': 'Rating', ratingValue: overall(p), bestRating: 10, worstRating: 0 },
  };
}

export function organization() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: SITE.url,
    logo: abs('/favicon.svg'),
    description: SITE.description,
  };
}

export function website() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE.url,
    name: SITE.name,
    inLanguage: 'fr-FR',
    publisher: { '@id': ORG_ID },
  };
}

export function breadcrumb(path: string) {
  const chain = [...ancestors(path), node(path)];
  return {
    '@type': 'BreadcrumbList',
    '@id': `${abs(path)}#breadcrumb`,
    itemListElement: chain.map((n, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: n.label,
      item: abs(n.path),
    })),
  };
}

interface ArticleInput {
  path: string;
  title: string;
  description: string;
  updated?: string;
  published?: string;
  about?: string[];
}

export function article({ path, title, description, updated = SITE.updated, published = SITE.published, about }: ArticleInput) {
  return {
    '@type': 'Article',
    '@id': `${abs(path)}#article`,
    headline: title,
    description,
    inLanguage: 'fr-FR',
    datePublished: published,
    dateModified: updated,
    mainEntityOfPage: abs(path),
    author: { '@id': PERSON_ID },
    publisher: { '@id': ORG_ID },
    ...(about ? { about: about.map((name) => ({ '@type': 'Thing', name })) } : {}),
  };
}

export function product(p: Phone) {
  const img = mainImage(p.id);
  return {
    '@type': 'Product',
    '@id': `${abs(p.path)}#product`,
    name: p.fullName,
    ...(img ? { image: abs(img.src.src) } : {}),
    brand: { '@type': 'Brand', name: brands[p.brand].name },
    category: 'Smartphone pliant',
    releaseDate: p.release,
    description: p.verdict,
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Écran intérieur', value: `${p.innerScreen} pouces` },
      { '@type': 'PropertyValue', name: 'Écran extérieur', value: `${p.outerScreen} pouces` },
      { '@type': 'PropertyValue', name: 'Processeur', value: p.chip },
      { '@type': 'PropertyValue', name: 'Batterie', value: p.battery ? `${p.battery} mAh` : p.batteryLabel ?? 'n.c.' },
      { '@type': 'PropertyValue', name: 'Poids', value: `${p.weight} g` },
      { '@type': 'PropertyValue', name: 'Indice de protection', value: p.ip },
      { '@type': 'PropertyValue', name: 'Prix de lancement en France', value: `${p.launchPrice} €` },
    ],
  };
}

export function itemList(name: string, items: { name: string; url?: string }[]) {
  return {
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.url ? { url: abs(it.url) } : {}),
    })),
  };
}

export function faqPage(items: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
