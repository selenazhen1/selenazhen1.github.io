import { getCollection, type CollectionEntry } from 'astro:content';
import type { SectionId } from '../data/site';

export type Project = CollectionEntry<'projects'>;

export function projectHref(project: Project): string {
  return `/${project.data.section}/${project.id}/`;
}

/** Manual `order` first (ascending), then newest start date. */
function compareProjects(a: Project, b: Project): number {
  const orderA = a.data.order ?? Number.POSITIVE_INFINITY;
  const orderB = b.data.order ?? Number.POSITIVE_INFINITY;
  if (orderA !== orderB) return orderA - orderB;
  return b.data.startDate.getTime() - a.data.startDate.getTime();
}

export async function getProjects(section?: SectionId): Promise<Project[]> {
  const projects = await getCollection('projects', (project) =>
    section ? project.data.section === section : true,
  );
  return projects.sort(compareProjects);
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const projects = await getCollection('projects', (project) => project.data.featured);
  return projects.sort(compareProjects).slice(0, limit);
}

/**
 * Card layout in a two-column list: the lead card is wide, and so is a final card that would
 * otherwise sit alone in a half-empty row.
 */
export function cardLayout(index: number, total: number): 'wide' | 'standard' {
  const isLead = index === 0;
  const isOrphan = index === total - 1 && (total - 1) % 2 === 1;
  return isLead || isOrphan ? 'wide' : 'standard';
}

/** Two-digit figure label: 1 → "01". */
export function figureNumber(index: number): string {
  return String(index).padStart(2, '0');
}
