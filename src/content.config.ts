// Collections de contenu : le blog « Actualités » (hors cocon).
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const actualites = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/actualites' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(20).max(90),
      description: z.string().min(80).max(200),
      /** Date et heure de publication avec fuseau, ex. 2026-09-12T14:37:00+02:00 ; l'article n'est publié qu'une fois cette heure passée */
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      /** Clé de src/data/blog-formats.json */
      format: z.string(),
      category: z.enum(['actualite', 'question', 'guide', 'analyse', 'comparatif', 'astuce', 'dossier']),
      /** pliant (par défaut) ou smartphone : sujet hors pliant, dans le périmètre du téléphone */
      scope: z.enum(['pliant', 'smartphone']).default('pliant'),
      /** Id du sujet traité dans src/data/blog-sujets.json */
      sujet: z.string().optional(),
      tags: z.array(z.string()).default([]),
      /** Ids de phones.ts cités : cartes produits en bas d'article */
      phones: z.array(z.string()).default([]),
      /** Id d'un modèle dont la photo sert d'en-tête (seulement si l'article porte sur ce modèle) */
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
      /** Questions liées, affichées en FAQ avec le balisage FAQPage */
      faq: z.array(z.object({ q: z.string().min(10), a: z.string().min(20) })).default([]),
      /** Illustration d'en-tête : fichier ./images/<slug>.webp à côté des articles */
      cover: z
        .object({
          src: image(),
          alt: z.string().min(10),
          credit: z.string().min(2),
          kind: z.enum(['illustration-ia', 'photo-presse', 'photo']),
          sourceUrl: z.string().url().optional(),
        })
        .optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { actualites };
