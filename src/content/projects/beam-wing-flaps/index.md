---
title: Rear Wing Beam Wing Flaps
section: design
organization: Bruin Formula Racing
dates: Jun 2026 – Present
startDate: 2026-06-01
role: Responsible Engineer, Rear Wing Aerodynamics
tools: [SolidWorks (CAD), Simcenter STAR-CCM+ (CFD)]
status: in-progress
summary: >-
  Two outboard S1223 beam wing flaps for the rear wing. In full-car CFD they added downforce while
  cutting drag, raising the lift-to-drag ratio by 4.4%.
cover: ./cfd-velocity-map.jpg
coverAlt: >-
  CFD velocity map of a side cross-section of the rear wing, colored from dark blue at 0 m/s to red
  at 32 m/s, with streamlines flowing left to right around the mainplane, the upper elements, and
  the small beam wing flap below.
coverCaption: >-
  STAR-CCM+ velocity field through a side section of the rear wing. Air flows left to right; the
  beam wing flap is the small airfoil below the mainplane.
gallery:
  - src: ./cad-assembly.jpg
    alt: >-
      SolidWorks assembly of the rear wing mounted behind the color-coded tube-frame chassis, with
      two beam wing flaps low between the endplates and the assembly feature tree on the left.
    caption: >-
      SolidWorks assembly with the chassis model for packaging checks. The beam wing is split into
      two outboard flaps, leaving the center open.
    wide: true
featured: true
order: 1
---

## Overview

I'm designing the beam wing for Bruin Formula Racing's rear wing. The beam wing is a set of airfoil
elements that sits below the rear wing's main elements, low and behind the car. Its job is to add
rear downforce without changing the main wing or interfering with other subsystems. It also works
_with_ the main wing: by speeding up and turning the airflow beneath the main elements, it can help
the whole rear wing assembly work more efficiently.

Instead of a single full-span beam wing, I designed two separate flaps — one on each side of the
car — using the S1223 airfoil. I modeled the design in SolidWorks inside the full car assembly and
evaluated it in STAR‑CCM+ against a baseline rear wing without a beam wing.

## The problem

The team wanted more rear downforce, but the rear wing's four main elements (three main elements
plus an additional element up top) were already set. Any new aerodynamic part had to fit within the
competition rules and around the chassis and other subsystems.

The space under the rear wing is the natural place for a beam wing, but the air in the center of the
car isn't clean. The driver's head and the main roll hoop sit directly upstream of the rear wing, so
the air reaching the middle of a beam wing is turbulent "dirty air" — and an airfoil working in dirty
air produces less downforce for the same size and weight.

## What I did

Because the center section would be working in poor-quality air, I removed it and placed two flaps
outboard, where the incoming air is cleaner. Removing the middle section also cuts the part's
weight.

For the profile I used the **S1223**, a high-lift, highly cambered airfoil designed for low Reynolds
numbers. It's a common Formula SAE choice because FSAE cars run at relatively low speeds, where many
airfoils lose efficiency.

I built the flaps in SolidWorks as part of the full rear wing assembly, with the car's chassis model
included so I could check packaging around the main hoop and frame. Rule-check reference geometry —
a rule-check cone and the aero bounding box — kept the flaps inside the allowed aerodynamic envelope.
I then ran CFD in STAR‑CCM+ and compared the results against the baseline rear wing.

## Results

Full-car CFD, baseline rear wing versus the same car with the beam wing flaps:

| Metric             | Baseline  | With flaps | Change            |
| ------------------ | --------- | ---------- | ----------------- |
| Downforce          | 56.65 lbf | 57.28 lbf  | +0.63 lbf (+1.1%) |
| Drag               | 23.15 lbf | 22.43 lbf  | −0.72 lbf (−3.1%) |
| Lift-to-drag ratio | 2.45      | 2.55       | +4.4%             |
| Side force         | −2.79 lbf | −3.27 lbf  | −0.48 lbf         |

Getting more downforce _and_ less drag at the same time suggests the flaps are interacting favorably
with the main wing's flow rather than simply adding drag.

### Reading the velocity map

The cover image is a 2D side section through the rear wing, with the car facing left and air flowing
left to right. Colors show air speed from 0 m/s (dark blue) to 32 m/s (red), and the thin lines show
flow direction. The large airfoil in the center is the mainplane, with the upper elements stacked
above and behind it; the small airfoil below and behind the mainplane's leading edge is the beam
wing flap.

The yellow-green band along the underside of the mainplane is where the air speeds up the most — on
an inverted wing, that fast, low-pressure air is what creates downforce. The whole flow field bends
upward as it passes the wing, showing how strongly the rear wing turns the air.

The main thing I checked was the flow around the beam wing. The flow lines stay attached and follow
its surface all the way to the trailing edge, with no recirculation or reversed flow — so there's no
separation under the beam wing, and the current placement is a reasonable starting point. The dark
blue region at the lower right is the slower wake behind the car, which the beam wing should stay out
of.

## What I learned

This design is a good start, but the gains aren't yet as large as I want. The flaps' position
relative to the main wing's airflow is what matters most: a beam wing can't be placed on its own — it
has to fit the flow field the main wing creates.

My next step is to move the flaps further into the faster-moving air below the mainplane (the green
region in the velocity map), while keeping enough distance from the mainplane to avoid the two
elements interfering and causing separation. I'll keep iterating on placement in CAD and validating
each change with CFD.
