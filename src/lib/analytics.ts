/**
 * Attributes that make GoatCounter count clicks on an element as a named event.
 * Spread them onto a link: `<a href="…" {...trackClick('resume-nav', 'Resume opened from the nav')}>`.
 *
 * `name` is what the dashboard groups by (kebab-case, never starting with "/");
 * `title` is the human-readable description shown next to it.
 */
export function trackClick(name: string, title: string): TrackAttributes {
  return { 'data-goatcounter-click': name, 'data-goatcounter-title': title };
}

export interface TrackAttributes {
  'data-goatcounter-click': string;
  'data-goatcounter-title': string;
}
