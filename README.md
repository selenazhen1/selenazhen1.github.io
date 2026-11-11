# Engineering Portfolio — Selena Zhen

Personal engineering portfolio: CAD, CFD, and composite fabrication work.
Static site built with [Astro](https://astro.build), deployed to GitHub Pages.

## Commands

| Command                                    | What it does                                                    |
| ------------------------------------------ | --------------------------------------------------------------- |
| `npm install`                              | Install dependencies (Node 22.12+)                              |
| `npm run dev`                              | Local dev server at `http://localhost:4321`                     |
| `npm run build`                            | Production build to `dist/`                                     |
| `npm run preview`                          | Serve the production build locally                              |
| `npm run verify`                           | **Pre-push gate** — see below                                   |
| `npm run verify:launch`                    | Same, but also fails on placeholders and the style preview page |
| `npm run image -- <files…> --out <folder>` | Clean photos for the repo (strip metadata, resize, HEIC → JPEG) |
| `npm run format`                           | Format everything with Prettier                                 |

## Before every push

Run `npm run verify`. It must pass. It checks:

1. **Formatting** — Prettier
2. **Types & templates** — `astro check`
3. **Production build**
4. **Internal links** — every `href`, `src`, and `srcset` in the built site resolves, including `#fragments`
5. **Leak scan** — over every file git would commit and the built site: image metadata (EXIF/GPS/XMP/IPTC), phone numbers (including inside PDFs), private keys and API tokens, files over 5 MB, unconverted HEIC
6. **Launch readiness** — placeholder content and the style preview page (warnings normally, failures with `verify:launch`)

## Project structure

```
src/
  content/projects/<slug>/  One folder per project: index.md + its images
  content.config.ts         Project schema (validated at build time)
  data/                     Site facts, nav, page copy (site.ts) and résumé timeline/skills (resume.ts)
  assets/images/            Cleaned site images (always via `npm run image`)
  assets/placeholders/      Stand-in graphics — delete before launch
  components/               Page sections and UI pieces
    home/                   Home page sections
    backgrounds/            Interactive canvas backgrounds (flow field, CFD mesh, carbon weave)
    ui/                     Small primitives (buttons, tags, status, dimension lines)
  layouts/                  Base HTML shell (fonts, meta, nav, footer, client router)
  lib/                      Project queries and shared types
  pages/                    Routes: home, /design/, /fabrication/, case studies, 404, /preview/
  scripts/                  Client-side TypeScript (background renderers, lifecycle helpers)
  styles/                   Design tokens and global styles
public/                     Résumé PDF, favicon, social preview image, robots.txt
scripts/                    Node tooling: `verify.mjs`, `prepare-image.mjs`
```

## Adding a project

See [CONTENT_GUIDE.md](CONTENT_GUIDE.md).

## Design system

Dark-only, navy base with an ice-blue accent (warm amber is reserved for "in progress").
Typography is Archivo (variable width — wide cuts for display) with IBM Plex Mono for data labels.
All tokens live in `src/styles/tokens.css`. Run `npm run dev` and open `/preview/` to see every
token and component in one place.

Each interactive background respects `prefers-reduced-motion`, pauses when off-screen, and falls
back to a slow ambient animation on touch devices.
