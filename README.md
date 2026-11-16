# Selena Zhen — Engineering Portfolio

Personal engineering portfolio: CAD, CFD, and composite fabrication work.
A static site built with [Astro](https://astro.build), hosted on GitHub Pages at
`https://selenazhen1.github.io` — see [Publishing](#publishing).

## Run it on your computer

### 1. Install the prerequisites (once)

| Tool        | Version                                    | Check with |
| ----------- | ------------------------------------------ | ---------- |
| **Node.js** | **24 LTS** recommended (minimum `22.23.4`) | `node -v`  |
| **npm**     | comes with Node.js                         | `npm -v`   |
| **Git**     | any recent version                         | `git -v`   |

Install Node.js from [nodejs.org](https://nodejs.org) (choose the LTS download), or with Homebrew
(`brew install node`). If you use `nvm`, run `nvm install` in this folder — `.nvmrc` pins the version.

Once the repository is public, anyone can clone it. While it is private, you need to be signed in to
GitHub with an account that has access (the owner's account works).

### 2. Download the code and install dependencies (once)

```bash
git clone https://github.com/selenazhen1/selenazhen1.github.io.git
cd selenazhen1.github.io
npm ci
```

`npm ci` installs the exact dependency versions recorded in `package-lock.json`. It takes about a
minute. A warning about `fsevents` install scripts is harmless and can be ignored.

### 3. Start the local site (every time)

```bash
npm run dev
```

Then open **http://localhost:4321** in a browser. Saving a file updates the page automatically.

How to stop it depends on how it was started:

- **Typed into your own terminal:** the server runs in that window. Press **Ctrl + C** to stop it.
- **Started by an AI assistant or a script** (no interactive terminal): Astro automatically runs the
  server **in the background** and the command returns right away. Manage it with:

  ```bash
  npm run dev:status   # is a server running, and on which port?
  npm run dev:logs     # recent server output, including errors
  npm run dev:stop     # stop it
  ```

Only one dev server runs per project at a time — check `npm run dev:status` before starting another.

### Troubleshooting

| Problem                                                    | Fix                                                                                                                                                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm ci` or `npm run dev` complains about the Node version | Node is too old. Install Node 24 LTS and open a new terminal.                                                                                                                                          |
| `Port 4321 is in use`, or a server is "already running"    | Run `npm run dev:status`; stop the old one with `npm run dev:stop` (or Ctrl + C in its terminal), then start again.                                                                                    |
| Images appear slowly the first time a page opens           | Normal in dev mode — images are optimized on demand. `npm run build && npm run preview` serves the fully optimized site.                                                                               |
| A new or edited project doesn't show up                    | Check the server output (`npm run dev:logs` if it runs in the background) for a validation error — a missing or misspelled field. If you changed `src/content.config.ts`, stop and restart the server. |

## Commands

| Command                                        | What it does                                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| `npm ci`                                       | Install dependencies exactly as locked                                       |
| `npm run dev`                                  | Local dev server at `http://localhost:4321`                                  |
| `npm run dev:status` / `dev:logs` / `dev:stop` | Check, read, or stop a dev server running in the background                  |
| `npm run build`                                | Production build to `dist/`                                                  |
| `npm run preview`                              | Serve the production build locally (run `npm run build` first)               |
| `npm run verify`                               | **Pre-push check** — see [Before every push](#before-every-push)             |
| `npm run verify:launch`                        | Same, but also fails while anything that must not ship still exists          |
| `npm run image -- <files…> --out <folder>`     | Clean images for the repo: strip metadata, cap size at 2400 px, convert HEIC |
| `npm run format`                               | Format every file with Prettier                                              |

## Where things live

| To change…                                   | Edit                                                                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| A project, or add a new one                  | `src/content/projects/<slug>/index.md` + its images — follow [CONTENT_GUIDE.md](CONTENT_GUIDE.md)            |
| The About paragraph                          | `src/components/home/About.astro`                                                                            |
| Experience timeline and skills               | `src/data/resume.ts`                                                                                         |
| Name, tagline, email, LinkedIn, page headers | `src/data/site.ts`                                                                                           |
| The resume PDF                               | Replace `public/Selena-Zhen-Resume.pdf`, keeping the same file name (use the version without a phone number) |
| The headshot                                 | `src/assets/images/headshot.jpg` — always prepared with `npm run image`                                      |
| Colors, fonts, spacing                       | `src/styles/tokens.css`                                                                                      |

When the resume changes, update `src/data/resume.ts` to match.

## Before every push

Run `npm run verify` — it must pass — and look at every changed page in the browser at desktop and
phone width. The script checks:

1. **Formatting** — Prettier (fix with `npm run format`)
2. **Types & templates** — `astro check`
3. **Production build**
4. **Internal links** — every `href`, `src`, and `srcset` in the built site resolves, including `#fragments`
5. **Leak scan** — over every file Git would commit and the built site: image metadata
   (EXIF/GPS/XMP/IPTC), phone numbers (including inside PDFs), private keys and API tokens, files
   over 5 MB, unconverted HEIC. Scanning PDF text needs `pdftotext` (`brew install poppler`);
   without it, that one check is skipped with a warning.
6. **Launch readiness** — reports anything that must not ship (warnings normally, failures with
   `verify:launch`)

## Working conventions

These apply to anyone — person or AI assistant — making changes here.

- **Images:** never commit raw photos or screenshots. Keep raw content outside the repository and
  add only files produced by `npm run image`.
- **Privacy:** the repository is public, and so is its entire Git history. Never commit anything
  sensitive, even temporarily — a later deletion does not remove it from history.
- **Editing Selena's write-ups:** light edits only — keep her first-person voice and every fact and
  number; fix flow and split into sections. Card summaries and image captions are 1–2 sentences;
  longer image descriptions are folded into the story. Use American spelling.
- **Typography:** in body text, write STAR‑CCM+ with a non-breaking hyphen (U+2011) and join numbers to
  their units with a non-breaking space (U+00A0, e.g. `3 lb`) so they never split across lines.
- **Commits:** small and descriptive. No personal names and no attribution trailers in commit
  messages.

## Publishing

The site deploys itself. Every push to `main` runs `.github/workflows/deploy.yml`, which:

1. runs the launch checks (`npm run verify:launch`) — if anything fails, nothing is published;
2. builds the site;
3. publishes it to GitHub Pages at `https://selenazhen1.github.io` (live a minute or two later).

Watch a deployment, or re-run one, from the repository's **Actions** tab ("Deploy to GitHub
Pages" → **Run workflow** deploys the current `main` without a new push).

**One-time setup (repository owner only):**

1. Settings → General → Danger Zone → **Change visibility** → **Public**.
2. Settings → Pages → Build and deployment → Source → **GitHub Actions**.
3. Optional: Settings → General → Features → uncheck **Issues**.

**After launch:** optional analytics — create a free [GoatCounter](https://www.goatcounter.com)
account and add its script.

## Project structure

```
src/
  content/projects/<slug>/  One folder per project: index.md + its images
  content.config.ts         Project schema (validated at build time)
  data/                     site.ts (site facts, nav, page copy), resume.ts (timeline, skills)
  assets/images/            Cleaned site images
  components/               Page sections and UI pieces
    home/                   Home page sections
    backgrounds/            Interactive canvas backgrounds (flow field, CFD mesh, carbon weave)
    ui/                     Small primitives (buttons, tags, status, dimension lines)
  layouts/                  Base HTML shell (fonts, meta, nav, footer, page transitions)
  lib/                      Project queries and shared types
  pages/                    Routes: home, /design/, /fabrication/, case studies, 404
  scripts/                  Client-side TypeScript (background renderers, lifecycle helpers)
  styles/                   Design tokens and global styles
public/                     Resume PDF, favicon, social preview image, robots.txt
scripts/                    Node tooling: verify.mjs, prepare-image.mjs
.github/workflows/deploy.yml  Launch checks, build, and deploy to GitHub Pages
```

## Design system

Dark-only, navy base with an ice-blue accent (warm amber is reserved for "in progress").
Typography is Archivo (variable width — wide cuts for display) with IBM Plex Mono for data labels.
All tokens live in `src/styles/tokens.css`.

Each interactive background respects `prefers-reduced-motion`, pauses when off-screen, and falls
back to a slow ambient animation on touch devices.
