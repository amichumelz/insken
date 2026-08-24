// Shared regional capacity configuration per PRD section 3.
export type RegionCode = 'KL' | 'JHR' | 'PNG' | 'SBH' | 'SWK';

export interface RegionConfig {
  code: RegionCode;
  name: string;
  physicalCap: number;
  onlineTarget: number;
  total: number;
}

export const REGION_CONFIG: Record<RegionCode, RegionConfig> = {
  KL:  { code: 'KL',  name: 'Kuala Lumpur', physicalCap: 400, onlineTarget: 1200, total: 1600 },
  JHR: { code: 'JHR', name: 'Johor',       physicalCap: 200, onlineTarget: 600,  total: 800 },
  PNG: { code: 'PNG', name: 'Penang',       physicalCap: 200, onlineTarget: 600,  total: 800 },
  SBH: { code: 'SBH', name: 'Sabah',        physicalCap: 200, onlineTarget: 700,  total: 900 },
  SWK: { code: 'SWK', name: 'Sarawak',      physicalCap: 200, onlineTarget: 700,  total: 900 },
};

export const REGIONS: RegionConfig[] = Object.values(REGION_CONFIG);

export const GLOBAL_TARGET = 5000;

// PRD section 4: routing logic thresholds.
export const CAPACITY_WARN_PCT = 0.80;
export const MARKETING_LAG_PCT = 0.50;

export type RegionState = 'Normal' | 'Warn' | 'Full' | 'LowVelocity';

export function classifyRegionState(
  physicalCount: number,
  totalCount: number,
  region: RegionConfig,
  daysToEvent: number,
): RegionState {
  const physicalPct = physicalCount / region.physicalCap;
  const totalPct = totalCount / region.total;

  if (physicalCount >= region.physicalCap) return 'Full';
  if (physicalPct >= CAPACITY_WARN_PCT) return 'Warn';
  // Marketing lag: < 50% of total allocation 7 days before event.
  if (daysToEvent <= 7 && totalPct < MARKETING_LAG_PCT) return 'LowVelocity';
  return 'Normal';
}
