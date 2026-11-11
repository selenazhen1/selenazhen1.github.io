import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { SECTION_IDS } from './data/site';
import { PROJECT_STATUSES } from './lib/types';

/**
 * Projects live one per folder:  src/content/projects/<slug>/index.md
 * with their images beside them. The folder name becomes the URL slug.
 */
const projects = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Which page lists the project. */
      section: z.enum(SECTION_IDS as [string, ...string[]]),
      organization: z.string(),
      /** Display string, e.g. "Sep 2025 – Present". */
      dates: z.string(),
      /** Used for ordering when `order` is not set (newest first). */
      startDate: z.coerce.date(),
      role: z.string(),
      tools: z.array(z.string()).min(1),
      status: z.enum(PROJECT_STATUSES),
      summary: z.string(),
      cover: image(),
      coverAlt: z.string(),
      coverCaption: z.string().optional(),
      /** Focal point when a card crops the cover, as CSS object-position, e.g. "50% 35%". */
      coverPosition: z.string().optional(),
      gallery: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
            caption: z.string().optional(),
            /** Span the full gallery width (good for wide CFD plots). */
            wide: z.boolean().default(false),
          }),
        )
        .default([]),
      /** Show on the home page under "Selected work". */
      featured: z.boolean().default(false),
      /** Manual sort position within its section (lower first). */
      order: z.number().optional(),
      /** Stand-in content. `npm run verify:launch` fails while any exist. */
      placeholder: z.boolean().default(false),
    }),
});

export const collections = { projects };
