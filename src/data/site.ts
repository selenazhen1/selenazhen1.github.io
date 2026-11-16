/** Site-wide facts. Everything public-facing about Selena reads from here. */
export const SITE = {
  name: 'Selena Zhen',
  title: 'Selena Zhen — Mechanical Engineering Portfolio',
  description:
    'Portfolio of Selena Zhen, mechanical engineering student at UCLA focused on aerodynamics: CAD, CFD, and composite fabrication.',
  tagline:
    'Mechanical engineering student at UCLA focused on aerodynamics — from CFD to carbon fiber.',
  location: 'Los Angeles, CA',
  email: 'selenazhen0@gmail.com',
  linkedin: 'https://www.linkedin.com/in/selenazhen',
  resume: '/Selena-Zhen-Resume.pdf',
  ogImage: '/og.png',
} as const;

/**
 * Visitor analytics (GoatCounter — no cookies, no personal data). The dashboard is at
 * https://<goatcounter>.goatcounter.com. Set `goatcounter` to null to turn analytics off.
 */
export const ANALYTICS: { goatcounter: string | null } = {
  goatcounter: 'selenazhen',
};

/** Project sections. Each has its own index page, header copy, and interactive background. */
export const SECTIONS = {
  design: {
    title: 'Design & Simulation',
    kicker: 'Work · CAD / CFD / FEA',
    lede: 'CAD models, CFD studies, and structural analysis — how each design was explored, tested, and refined.',
    background: 'mesh',
    annotation: 'O-grid · 112 × 26 · S1223 inv.',
  },
  fabrication: {
    title: 'Fabrication',
    kicker: 'Work · Composites / Shop',
    lede: 'Hands-on work — composite layups, mold preparation, and finishing parts that leave the shop and go on the car.',
    background: 'weave',
    annotation: '2×2 twill · carbon',
  },
} as const;

export type SectionId = keyof typeof SECTIONS;

export const SECTION_IDS = Object.keys(SECTIONS) as SectionId[];

export const NAV_LINKS = [
  { label: SECTIONS.design.title, href: '/design/' },
  { label: SECTIONS.fabrication.title, href: '/fabrication/' },
] as const;
