// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://selenazhen1.github.io',
  // Keep whitespace between inline elements (tags, inline links) intact.
  compressHTML: true,
  integrations: [
    sitemap({
      // Internal pages never belong in the sitemap.
      filter: (page) => !/\/(preview|404)\/?$/.test(new URL(page).pathname),
    }),
  ],
});
