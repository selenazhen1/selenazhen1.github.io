# Content guide

How a project goes from a folder of images and notes to a page on the site.
The three existing projects are complete examples to copy from:

| Example                                    | Shows                                                  |
| ------------------------------------------ | ------------------------------------------------------ |
| `src/content/projects/beam-wing-flaps/`    | CFD results as a data table, a wide CAD screenshot     |
| `src/content/projects/driver-seat-repair/` | Phone photos, a portrait cover with a card focal point |
| `src/content/projects/doomscroll/`         | Hand sketches, a parts table, a "Next steps" section   |

## 1. The raw folder

Each project arrives as a folder of images plus a description file — usually inside a zip
downloaded from Google Drive. Unzip it **outside this repository** (double-click the zip in Finder,
or `unzip <file>.zip -d ~/Documents/portfolio-content`). Raw photos are large and can carry location
metadata, so they never go into the repo directly.

The description file follows this shape (either one-line or heading style is fine):

```
PROJECT
[Project name]

ORGANIZATION
[Organization]

Dates: [Month Year – Present]
Role: [Role]
Tools: [Tool, Tool, …]
Status: [Complete / In progress — optional note]

SUMMARY
[A paragraph]

STORY
The problem
What I did
Results
What I learned

IMAGES
[image file name]  [COVER IMAGE]
[Description]

[image file name]
[Description]
```

Selena also says which page the project belongs on: **Design & Simulation** (`design`) or
**Fabrication** (`fabrication`). Everything in the description is approved for publishing.

## 2. Add the project

1. **Choose a slug** — short kebab-case, e.g. `carbon-fiber-nosecone`. It becomes the folder
   `src/content/projects/<slug>/` and the URL `/design/<slug>/` or `/fabrication/<slug>/`.

2. **Clean the images** into that folder. Output file names come from the input names, so copy the
   raw files somewhere temporary with short kebab-case names first:

   ```bash
   npm run image -- /path/to/renamed/*.{jpg,png,heic} --out src/content/projects/<slug>
   ```

   This strips all metadata, caps the long edge at 2400 px, converts HEIC, and picks the smaller of
   PNG or JPEG for screenshots and drawings. To crop a photo, crop it before this step.

3. **Write `src/content/projects/<slug>/index.md`** — the facts go in the frontmatter (reference
   below), the story in Markdown:
   - `## Overview` from the summary, then `## The problem`, `## What I did`, `## Results`,
     `## What I learned`, and `## Next steps` for work in progress. Each `##` heading is numbered
     automatically and listed in the page's contents sidebar; use `###` for sub-steps.
   - Light edits only: keep her first-person voice and every fact and number. Fix flow, split long
     sections, use American spelling.
   - Put numeric results in a Markdown table (use only her numbers).
   - `summary` (shown on cards and link previews) is a 1–2 sentence condensed version of her
     summary. Ask her to approve it.
   - Image captions are 1–2 sentences; the rest of a long image description belongs in the story.
     `alt` text describes what the image shows, for screen readers.
   - Body-text typography: STAR‑CCM+ uses a non-breaking hyphen (U+2011), and numbers join their
     units with a non-breaking space (U+00A0).

4. **Check it:** run `npm run dev`, open the new page and the page that lists it, at desktop and
   phone width. Then run `npm run verify` — it must pass before anything is pushed.

## Frontmatter reference

```markdown
---
title: Rear Wing Beam Wing Flaps
section: design # design | fabrication
organization: Bruin Formula Racing
dates: Jun 2026 – Present # shown exactly as written
startDate: 2026-06-01 # used for ordering (newest first)
role: Responsible Engineer, Rear Wing Aerodynamics
tools: [SolidWorks (CAD), Simcenter STAR-CCM+ (CFD)]
status: in-progress # complete | in-progress
summary: One or two sentences for cards and link previews.
cover: ./cfd-velocity-map.jpg
coverAlt: What the cover image shows, for screen readers
coverCaption: Optional caption under the cover # optional
coverPosition: 50% 45% # optional: focal point when a card crops the cover
gallery: # optional; images appear in this order
  - src: ./cad-assembly.jpg
    alt: What this image shows
    caption: Optional caption
    wide: true # optional: span the full width (good for landscape screenshots)
featured: true # optional: show under "Selected work" on the home page
order: 1 # optional: position within its page (lower first)
---

## Overview

Markdown body…
```

The build checks every field against `src/content.config.ts` and stops with a clear message if
something is missing, misspelled, or points to an image that doesn't exist.
