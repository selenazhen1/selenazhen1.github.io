// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://selenazhen1.github.io',
  // Keep whitespace between inline elements (tags, inline links) intact.
  compressHTML: true,
});
