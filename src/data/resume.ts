/**
 * Experience timeline and skills for the home page — condensed from the published resume.
 * Keep these in sync when the resume changes.
 */

export interface TimelineEntry {
  organization: string;
  role: string;
  dates: string;
  location: string;
  /** One line. The resume PDF carries the detail. */
  summary: string;
  kind: 'education' | 'experience';
}

export const TIMELINE: TimelineEntry[] = [
  {
    organization: 'ASME at UCLA',
    role: 'Doomscroll Combat Robot — Chassis & Weapon Design',
    dates: 'Oct 2026 – Present',
    location: 'Los Angeles, CA',
    summary:
      'Leading the design of a 3 lb vertical-spinner combat robot in a four-person team; responsible for the chassis and weapon.',
    kind: 'experience',
  },
  {
    organization: 'BYD North America',
    role: 'Engineering Intern, Energy Storage',
    dates: 'Jun – Aug 2026',
    location: 'Pasadena, CA',
    summary:
      'Researched solid-state transformer architecture for data-center power and supported battery-storage field operations.',
    kind: 'experience',
  },
  {
    organization: 'Bruin Formula Racing',
    role: 'Responsible Engineer, Rear Wing Aerodynamics',
    dates: 'Sep 2025 – Present',
    location: 'Los Angeles, CA',
    summary:
      'Owns the rear wing — concept studies in SolidWorks and STAR‑CCM+, through to carbon-fiber manufacturing.',
    kind: 'experience',
  },
  {
    organization: 'Longo Toyota',
    role: 'Automotive Service Intern',
    dates: 'Jul – Aug 2024',
    location: 'El Monte, CA',
    summary:
      'Refinished vehicle components in the shop and presented service-workflow recommendations to leadership.',
    kind: 'experience',
  },
  {
    organization: 'University of California, Los Angeles',
    role: 'B.S. Mechanical Engineering · Interest: Aerodynamics',
    dates: 'Expected Jun 2029',
    location: 'Los Angeles, CA',
    summary: 'Mechanical engineering with a focus on aerodynamics and vehicle design.',
    kind: 'education',
  },
];

export interface SkillGroup {
  label: string;
  items: string[];
}

export const SKILLS: SkillGroup[] = [
  {
    label: 'CAD & Simulation',
    items: ['SolidWorks', 'Engineering drawings', 'STAR‑CCM+ (CFD)', 'SolidWorks Simulation'],
  },
  {
    label: 'Manufacturing',
    items: ['Carbon-fiber layup', 'Fiberglass layup', 'Mold preparation & coating'],
  },
  { label: 'Programming & Data', items: ['C++', 'Microsoft Excel'] },
  { label: 'Languages', items: ['English', 'Mandarin'] },
];
