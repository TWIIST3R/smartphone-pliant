import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://smartphone-pliant.fr',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'weekly',
      lastmod: new Date(),
    }),
  ],
});
