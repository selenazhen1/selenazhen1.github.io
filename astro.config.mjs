// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://selenazhen1.github.io',
  // Keep whitespace between inline elements (tags, inline links) intact.
  compressHTML: true,
  integrations: [
    sitemap({
      // The 404 page never belongs in the sitemap.
      filter: (page) => !/\/404\/?$/.test(new URL(page).pathname),
    }),
  ],
});
