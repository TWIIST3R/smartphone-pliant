import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { publishedArticles, articlePath } from '../../lib/blog';
import { SITE } from '../../data/site';

export async function GET(context: APIContext) {
  const posts = await publishedArticles();
  return rss({
    title: `${SITE.name} – Actualités`,
    description: 'Actualités, analyses et guides sur les smartphones pliants.',
    site: context.site ?? SITE.url,
    items: posts.slice(0, 50).map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: articlePath(p),
      categories: p.data.tags,
      author: SITE.author.name,
    })),
    customData: '<language>fr-fr</language>',
  });
}
