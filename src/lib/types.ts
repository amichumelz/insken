// Shared TypeScript types for the Operations & Intelligence dashboard.

export interface GlobalStats {
  total: number;
  target: number;
  pct: number;
  attended: number;
  attendedPhysical: number;
  attendedOnline: number;
  registeredPhysical: number;
  registeredOnline: number;
  duplicateBlocked: number;
  activeAlerts: number;
  criticalAlerts: number;
  milestones: Array<{ pct: number; target: number; reached: boolean }>;
}

export interface RegionStat {
  code: string;
  name: string;
  physical: number;
  online: number;
  total: number;
  physicalCap: number;
  onlineTarget: number;
  totalCap: number;
  attended: number;
  physicalPct: number;
  totalPct: number;
  attendedPct: number;
  state: 'Normal' | 'Warn' | 'Full' | 'LowVelocity';
}

export interface SectorStat {
  sector: string;
  count: number;
  pct: number;
}

export interface TrendPoint {
  date: string;
  total: number;
  physical: number;
  online: number;
}

export interface StatsResponse {
  global: GlobalStats;
  regions: RegionStat[];
  sectors: SectorStat[];
  trend: TrendPoint[];
}

export interface AlertItem {
  id: string;
  type: string;
  region?: string | null;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  metadata?: string | null;
  resolved: boolean;
  triggeredAt: string;
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  region?: string;
  title: string;
  detail: string;
  action: string;
}

export interface Participant {
  id: string;
  participantId: string;
  icNumber: string;
  name: string;
  email: string;
  phone: string;
  sector: string;
  region: string;
  preferredMode: string;
  finalMode: string;
  status: string;
  checkInAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  phase: string;
  step: string;
  status: 'success' | 'rejected' | 'routed';
  detail: string;
  timestamp: string;
}

export interface RegisterResponse {
  ok: boolean;
  participant?: Participant;
  existing?: Participant;
  qrSeed?: string;
  capacityRouted?: boolean;
  capacityNote?: string;
  message?: string;
  status?: string;
  error?: string;
  workflow: WorkflowStep[];
}
