import { SITE, brands } from '../data/site';
import { ancestors, node } from '../data/cocoon';
import { type Phone, overall, phones } from '../data/phones';
import { mainImage } from '../data/images';

export const abs = (path: string) => new URL(path, SITE.url).href;

export const ORG_ID = `${SITE.url}/#organization`;
export const WEBSITE_ID = `${SITE.url}/#website`;
export const PERSON_ID = `${SITE.url}${SITE.author.url}#person`;
export const pageId = (path: string) => `${abs(path)}#webpage`;
const LOGO_ID = `${SITE.url}/#logo`;
const METHODOLOGY = abs('/methodologie/');

/** Modèle dont le test se trouve à cette adresse */
export const phoneAt = (path: string) => phones.find((p) => p.path === path);

/** URL absolue de la photo principale d'un modèle */
export function phoneImageUrl(p: Phone): string | undefined {
  const img = mainImage(p.id);
  return img ? abs(img.src.src) : undefined;
}

const FORMAT_LABELS: Record<Phone['format'], string> = { livre: 'Format livre', clapet: 'Clapet', 'tri-pliant': 'Tri-pliant' };
const frNum = (n: number) => String(n).replace('.', ',');

export interface CitedSource {
  media: string;
  url: string;
  title?: string;
  /** AAAA-MM-JJ */
  date?: string;
}

/** Sources citées (tests de la presse, communiqués) au format schema.org */
export function citations(sources: CitedSource[]) {
  return sources.map((s) => ({
    '@type': 'CreativeWork',
    url: s.url,
    ...(s.title ? { name: s.title } : {}),
    ...(s.date ? { datePublished: s.date } : {}),
    publisher: { '@type': 'Organization', name: s.media },
  }));
}

const notes = (items: string[]) => ({
  '@type': 'ItemList',
  itemListElement: items.map((name, i) => ({ '@type': 'ListItem', position: i + 1, name })),
});

export function person() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE.author.name,
    url: abs(SITE.author.url),
    image: abs(SITE.author.avatar),
    jobTitle: SITE.author.jobTitle,
    description: SITE.author.bio,
    knowsAbout: ['Smartphones pliants', 'Smartphones', 'Autonomie et recharge des smartphones', 'Photographie sur smartphone'],
    worksFor: { '@id': ORG_ID },
  };
}

/** Avis éditorial (synthèse sourcée) associé à la fiche produit. Points forts et faibles : ceux affichés sur la page. */
export function review(p: Phone, path: string = p.path, proscons?: { pros: string[]; cons: string[] }) {
  return {
    '@type': 'Review',
    '@id': `${abs(path)}#review`,
    name: `Test du ${p.fullName}`,
    itemReviewed: { '@id': `${abs(p.path)}#product` },
    author: { '@id': PERSON_ID },
    publisher: { '@id': ORG_ID },
    datePublished: SITE.published,
    dateModified: SITE.updated,
    inLanguage: 'fr-FR',
    reviewBody: p.verdict,
    reviewRating: { '@type': 'Rating', ratingValue: overall(p), bestRating: 10, worstRating: 0 },
    ...(proscons?.pros.length ? { positiveNotes: notes(proscons.pros) } : {}),
    ...(proscons?.cons.length ? { negativeNotes: notes(proscons.cons) } : {}),
  };
}

export function organization() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: SITE.url,
    logo: { '@type': 'ImageObject', '@id': LOGO_ID, url: abs('/logo.png'), width: 512, height: 512, caption: SITE.name },
    image: { '@id': LOGO_ID },
    description: SITE.description,
    publishingPrinciples: METHODOLOGY,
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

interface WebPageInput {
  path: string;
  name: string;
  description: string;
  updated: string;
  breadcrumb?: boolean;
  image?: string;
}

/** Page générique (ajoutée par BaseLayout quand la page ne déclare pas son propre type *Page) */
export function webPage({ path, name, description, updated, breadcrumb: hasBreadcrumb, image }: WebPageInput) {
  return {
    '@type': 'WebPage',
    '@id': pageId(path),
    url: abs(path),
    name,
    description,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': WEBSITE_ID },
    datePublished: SITE.published,
    dateModified: updated,
    ...(hasBreadcrumb ? { breadcrumb: { '@id': `${abs(path)}#breadcrumb` } } : {}),
    ...(image ? { primaryImageOfPage: { '@type': 'ImageObject', url: image } } : {}),
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
  /** Modèles comparés ou cités (hors modèle testé sur la page) */
  phones?: Phone[];
  /** Tests et sources cités sur la page */
  sources?: CitedSource[];
}

export function article({ path, title, description, updated = SITE.updated, published = SITE.published, about = [], phones: cited = [], sources = [] }: ArticleInput) {
  const tested = phoneAt(path);
  const image = tested ? phoneImageUrl(tested) : cited.map(phoneImageUrl).find(Boolean);
  const aboutNodes = [...(tested ? [{ '@id': `${abs(tested.path)}#product` }] : []), ...about.map((name) => ({ '@type': 'Thing', name }))];
  return {
    '@type': 'Article',
    '@id': `${abs(path)}#article`,
    headline: title,
    description,
    inLanguage: 'fr-FR',
    datePublished: published,
    dateModified: updated,
    mainEntityOfPage: { '@id': pageId(path) },
    author: { '@id': PERSON_ID },
    publisher: { '@id': ORG_ID },
    publishingPrinciples: METHODOLOGY,
    ...(image ? { image } : {}),
    ...(aboutNodes.length ? { about: aboutNodes } : {}),
    ...(cited.length ? { mentions: cited.map((p) => ({ '@type': 'Thing', name: p.fullName, url: abs(p.path) })) } : {}),
    ...(sources.length ? { citation: citations(sources) } : {}),
  };
}

export function product(p: Phone) {
  const image = phoneImageUrl(p);
  const specs: [string, string | null | undefined][] = [
    ['Format', FORMAT_LABELS[p.format]],
    ['Écran intérieur', `${frNum(p.innerScreen)} pouces`],
    ['Écran extérieur', `${frNum(p.outerScreen)} pouces`],
    ['Taux de rafraîchissement', p.refresh],
    ['Processeur', p.chip],
    ['Mémoire vive', p.ram],
    ['Stockage', p.storage],
    ['Batterie', p.battery ? `${p.battery.toLocaleString('fr-FR')} mAh` : p.batteryLabel],
    ['Recharge filaire', p.wired],
    ['Recharge sans fil', p.wireless],
    ['Appareils photo', p.cameras],
    ['Zoom', p.zoom],
    ['Poids', `${p.weight} g`],
    ['Épaisseur plié', p.foldedMm ? `${frNum(p.foldedMm)} mm` : null],
    ['Épaisseur déplié', p.unfoldedMm ? `${frNum(p.unfoldedMm)} mm` : null],
    ['Indice de protection', p.ip],
    ['Système', p.os],
    ['Prix de lancement en France', `${p.launchPrice.toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(p.launchPrice) ? 0 : 2 })} € (${p.launchConfig})`],
  ];
  return {
    '@type': 'Product',
    '@id': `${abs(p.path)}#product`,
    name: p.fullName,
    url: abs(p.path),
    ...(image ? { image } : {}),
    brand: { '@type': 'Brand', name: brands[p.brand].name },
    category: 'Smartphone pliant',
    releaseDate: p.release,
    description: p.verdict,
    review: { '@id': `${abs(p.path)}#review` },
    additionalProperty: specs
      .filter((s): s is [string, string] => Boolean(s[1]))
      .map(([name, value]) => ({ '@type': 'PropertyValue', name, value })),
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
