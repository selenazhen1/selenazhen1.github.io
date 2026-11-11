# Content guide

How to hand over a new project for the site.

## 1. Make a folder per project

Keep these folders **outside this repository** (for example in `~/Documents/portfolio-content/`).
Raw photos are large and carry location metadata; only cleaned copies are ever committed.

```
portfolio-content/
  rear-wing-cfd/
    01-beam-wing-cad.png
    02-pressure-contour.png
    image_descriptions.md
  carbon-layup/
    ...
```

Any image format works, including iPhone HEIC.

## 2. Fill in `image_descriptions.md`

```
Project: [project name here]
Organization: [/ Dates / Role / Tools / Status (complete / in progress)]
Summary: [summary here]
Story: [story here: the problem → what she did → results → what she learned]
Images:
  [image file]: description   [state if should be cover for project]
  [image file]: description
```

Say which page the project belongs on: **Design & Simulation** or **Fabrication**.
Everything written here is treated as approved for publishing.

## 3. What happens next

1. Images are cleaned with `npm run image -- <files> --out src/content/projects/<slug>` (metadata
   stripped, long edge capped at 2400 px, HEIC converted).
2. The description becomes `src/content/projects/<slug>/index.md` — frontmatter for the facts,
   Markdown sections for the story, a captioned gallery for the images.
3. `npm run verify` must pass, and the change is reviewed in the browser before it is pushed.

## Project file reference

```markdown
---
title: Rear Wing Aero Concepts
section: design # design | fabrication
organization: Bruin Formula Racing
dates: Sep 2025 – Present # shown as written
startDate: 2025-09-01 # used for ordering
role: Responsible Engineer, Rear Wing Aerodynamics
tools: [SolidWorks, STAR-CCM+]
status: in-progress # complete | in-progress
summary: One or two sentences for cards and link previews.
cover: ./cover.jpg
coverAlt: What the cover image shows, for screen readers
coverCaption: Optional caption under the cover
gallery:
  - src: ./pressure-contour.jpg
    alt: Pressure contour on the main element
    caption: Optional caption
    wide: true # optional: span the full width
featured: true # optional: show on the home page
order: 1 # optional: manual position within its page
---

## Overview

Markdown body. Each `##` heading becomes a numbered section in the contents list.
```
