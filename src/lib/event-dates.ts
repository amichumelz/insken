export interface RegionEventDate {
  region: string;
  name: string;
  date: string; // YYYY-MM-DD
  forceActive?: boolean;
}

export const DEFAULT_EVENT_DATES: Record<string, string> = {
  KL: '2026-09-02',
  JHR: '2026-09-06',
  PNG: '2026-09-10',
  SBH: '2026-09-15',
  SWK: '2026-09-20',
};

export function getTodayStringMY(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function isEventDateOpen(region: string, configuredDate?: string, forceActive?: boolean): boolean {
  if (forceActive) return true;
  const eventDate = configuredDate || DEFAULT_EVENT_DATES[region] || getTodayStringMY();
  const today = getTodayStringMY();
  return today >= eventDate;
}
