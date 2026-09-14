// Outils du blog « Actualités » (hors cocon).
import { getCollection, type CollectionEntry } from 'astro:content';
import formats from '../data/blog-formats.json';

export type Article = CollectionEntry<'actualites'>;

export const FORMAT_LABELS: Record<string, string> = Object.fromEntries(formats.map((f) => [f.key, f.label]));

export const CATEGORY_LABELS: Record<string, string> = {
  actualite: 'Actualité',
  question: 'Question',
  guide: 'Guide',
  analyse: 'Analyse',
  comparatif: 'Comparatif',
  astuce: 'Astuce',
  dossier: 'Dossier',
};

/** Build de contrôle (workflow publish-article) : BLOG_INCLUDE_FUTURE=1 rend aussi les articles programmés pour vérifier leurs liens. */
const includeFuture = process.env.BLOG_INCLUDE_FUTURE === '1';

/** Articles publiés : non brouillons et dont l'heure de publication est passée (au moment du build). */
export async function publishedArticles(now: Date = new Date()): Promise<Article[]> {
  const all = await getCollection('actualites', ({ data }) => !data.draft && (includeFuture || data.pubDate.getTime() <= now.getTime()));
  return all.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export const articlePath = (a: Article) => `/actualites/${a.id}/`;

const dateTimeFmt = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Paris',
});

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });

/** « 12 septembre 2026 à 14:37 » (heure de Paris) */
export const frDateTime = (d: Date) => dateTimeFmt.format(d).replace(' ', ' ');
export const frDay = (d: Date) => dateFmt.format(d);

export function readingMinutes(body: string | undefined): number {
  const words = (body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 230));
}
