// Collections de contenu : le blog « Actualités » (hors cocon).
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const actualites = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/actualites' }),
  schema: z.object({
    title: z.string().min(20).max(90),
    description: z.string().min(80).max(200),
    /** Date et heure de publication avec fuseau, ex. 2026-09-12T14:37:00+02:00 ; l'article n'est publié qu'une fois cette heure passée */
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** Clé de src/data/blog-formats.json */
    format: z.string(),
    category: z.enum(['actualite', 'guide', 'analyse', 'comparatif', 'astuce', 'dossier']),
    tags: z.array(z.string()).default([]),
    /** Ids de phones.ts cités : cartes produits en bas d'article */
    phones: z.array(z.string()).default([]),
    /** Id d'un modèle dont la photo sert d'en-tête */
    phone: z.string().optional(),
    /** Tests (dernier niveau du cocon) qui afficheront un lien vers l'article */
    relatedTests: z.array(z.string()).default([]),
    sources: z
      .array(
        z.object({
          media: z.string(),
          url: z.string().url(),
          title: z.string().optional(),
        }),
      )
      .default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { actualites };
