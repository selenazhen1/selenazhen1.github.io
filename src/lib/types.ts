export const PROJECT_STATUSES = ['complete', 'in-progress'] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
