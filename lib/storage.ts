export const STORAGE_KEYS = {
  start: 'fluisterweek-start',
  progress: 'fluisterweek-progress',
  webhooks: 'fluisterweek-webhooks',
  dayContent: 'fluisterweek-day-content',
  dataVersion: 'fluisterweek-data-version'
} as const;
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const DATA_VERSION = '2024-06-01';
