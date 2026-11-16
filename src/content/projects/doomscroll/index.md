---
title: Doomscroll — 3 lb Beetleweight Combat Robot
section: design
organization: ASME at UCLA
dates: Oct 2026 – Present
startDate: 2026-10-01
role: Chassis & Weapon Design
tools: [SolidWorks, GoodNotes (concept sketching), 3D printing (planned)]
status: in-progress
summary: >-
  A 3 lb beetleweight vertical spinner built to SPARC rules. I'm leading the robot's design — concept
  sketches, electronics layout and selection, and the first SolidWorks revision of the chassis frame.
cover: ./concept-sketch.png
coverAlt: >-
  Hand-drawn concept sketch of the robot in top, side, and isometric views on grid paper, color-coded
  with a legend: chassis in black, wheels in pink, long forks in red, weapon plates in purple, and
  the weapon in green.
coverCaption: >-
  Top, side, and isometric concept views, color-coded: chassis (black), wheels (pink), long forks
  (red), weapon plates (purple), and weapon (green).
gallery:
  - src: ./weapon-sketch.png
    alt: >-
      Sketch of the single-tooth weapon profile with a shaft hole, annotated "AR500: 3/8 in", "shaft
      center to tip: 2.4 in", and a 0.9 in spike width.
    caption: >-
      The single-tooth weapon profile, cut from 3/8 in AR500 steel: 2.4 in from shaft center to tip,
      with a 0.9 in wide spike. The mass opposite the tip is the counterweight.
    wide: true
  - src: ./interior-layout.png
    alt: >-
      Top-view sketch of the chassis interior with color-coded blocks for the battery, two
      gearmotors, weapon motor, ESCs, power distribution board, and receiver.
    caption: >-
      Rough placement of every electronic part inside the chassis. This layout set the interior at
      7 × 4 × 2 in.
    wide: true
  - src: ./chassis-frame-rev1.jpg
    alt: >-
      SolidWorks screenshot of the first chassis frame revision: a gray U-shaped frame with thick side
      walls, wheel pockets with axle holes, and a slanted front.
    caption: >-
      First revision of the chassis frame in SolidWorks (DS-CH-Frame-Rev1): wheel pockets and axle
      holes in each side wall, and a slanted front that works as a wedge.
    wide: true
featured: true
order: 2
---

## Overview

Doomscroll is a 3 lb beetleweight combat robot I'm designing with a team of four in UCLA's ASME
club, built to SPARC beetleweight rules. The team split the robot into four subsystems — chassis,
weapon, drivetrain, and electronics. I'm responsible for the chassis and weapon, and so far I've been
driving the design of the whole robot.

The robot is a vertical spinner with a single-tooth AR500 steel weapon, a 3D-printed chassis frame
with a slanted front wedge, side forks, and four wheels. So far I've sketched the full concept, laid
out and selected the electronics, and modeled the first revision of the chassis frame in SolidWorks.

## The problem

We started from a blank page with a hard limit: the whole robot — weapon, armor, motors, and battery
— had to stay under 3 lb and still survive being hit by other robots. Every choice affects weight,
durability, and where the center of mass ends up. Before I could CAD anything, I had to know the size
of every part and justify every dimension.

## What I did

### Weapon type

I chose a vertical spinner. A vertical spinner hits upward, so each hit can flip or launch the
opponent, which suits an aggressive, attacking style. Horizontal spinners usually hit sideways and
can leave the robot easier to flip with a wedge.

### Weapon shape

The weapon is a single tooth cut from 3/8 in AR500 steel. It measures 2.4 in from the shaft center to
the tip, and the spike is 0.9 in wide. With only one tooth, the tooth has more time to travel between
hits, so it bites deeper and puts more energy into each hit. A single tooth makes the weapon
unbalanced, so I added mass on the side opposite the tip as a counterweight. The weapon is held
between two weapon plates on either side of its shaft.

### Weapon drive

The weapon motor is a 2200 kV brushless outrunner. On a 3S battery it spins at around 24,000 RPM with
no load, but it doesn't have much torque — and a heavy steel weapon needs torque to get up to speed.
I'm now evaluating a gear or belt reduction between the motor and the weapon, and working out whether
it fits inside the chassis.

### Chassis

The chassis frame will be 3D printed. I'm using PLA in CAD for now; the final material is still
undecided. The interior is 7 × 4 × 2 in, sized from my sketch of the electronics layout. The frame
walls start at 3/8 in thick, with top and bottom plates about 1/16 in thick. Pockets in the side walls
hold the wheels, with axle holes through the walls. I modeled the first revision of the frame in
SolidWorks (DS-CH-Frame-Rev1).

### Front wedge and forks

At first I wanted two short forks in the middle near the weapon, but they would have been hard to
manufacture and mount. Instead, I slanted the entire front of the chassis frame so it works as a
wedge to get under other robots and lift them into the weapon. Long 0.4 in thick forks run along each
side of the robot, and the front will be armored with roughly 1/4 in aluminum plates.

### Wheels and weight balance

The AR500 weapon and the aluminum front armor put a lot of weight at the front, which would shift the
center of mass forward. To pull it back toward the middle, I gave each side two wheels: a 1.75 in
driven wheel in front and a 1.25 in wheel in back, both 0.6 in thick. The back wheels add a little
weight toward the rear and aren't powered — powering them would need belts or pulleys and would split
the drive motor's power between two wheels, adding weight for little benefit.

### Weight budget

My starting budget is about 1 lb for the weapon, 1 lb for the chassis, and 1 lb for the wheels and
electronics. I'll refine these numbers as the CAD and part choices are finalized.

## Electronics

Every part is sized to fit the interior layout and compatible with a 3S battery.

| Component          | Part                                                    | Key specs                                                              |
| ------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| Drive motors (×2)  | Just ’Cuz Robotics Blitz Pro 24 mm, brushless gearmotor | 5.2:1 gearbox, ~1500 RPM output on 3S, 70.5 g each, 6 mm steel D-shaft |
| Drive ESCs (×2)    | JCR-RC Mini 35A, AM32 firmware                          | Recommended by the manufacturer for the Blitz gearmotors               |
| Weapon motor       | 2200 kV brushless outrunner (A2212-class)               | Rated for 2–3S, 3.17 mm shaft, ~49 g                                   |
| Weapon ESC         | Readytosky 35A, BLHeli_S firmware                       | Rated for 2–6S, 13 × 29 mm                                             |
| Battery            | 3S 2200 mAh LiPo                                        | XT60 connector                                                         |
| Power distribution | Just ’Cuz Basic PD Board                                | 32 × 20 mm, XT30 outputs                                               |
| Power switch       | FingerTech Mini Switch                                  | 12.7 × 12.7 × 6.35 mm, 2.15 g                                          |
| Receiver           | FlySky FS-iA6B                                          | 6 channels, 14.9 g                                                     |

## Results

- A complete concept design with color-coded top, side, and isometric sketches
- An interior layout of every electronic component, used to set the chassis interior size
- An electronics package where every part is sized and compatible with a 3S battery
- The first CAD revision of the chassis frame, ready for the initial design review

## What I learned

This project taught me the engineering design process from the ground up: defining requirements,
justifying each decision, and checking how one choice affects everything else before starting CAD. I
learned to treat weight, center of mass, durability, and manufacturability as one connected problem —
moving the front forks into a slanted frame and adding passive rear wheels are both examples of that.

I also learned that a weapon motor's speed is only part of the picture. Torque and gear ratio decide
whether a heavy weapon can get up to speed at all. Since this is a first prototype, I expect parts of
it to change after testing, and I've designed it to make those changes easy.

## Next steps

- **Initial design review** — late November 2026
- **Final design review** — January 2027
- Decide on a gear or belt reduction for the weapon, and whether it fits inside the chassis
- Choose the final chassis material and refine the weight budget as CAD and parts are finalized
