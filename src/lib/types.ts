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
  attendedPhysical: number;
  attendedOnline: number;
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
  day: string;
  month?: string;
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

export interface WhatsAppDispatch {
  dispatchedAt: string;
  template: string;
  recipient: string;
  eventDate: string;
  payload: unknown;
}

export interface LiveCheckin {
  participantId: string;
  name: string;
  sector: string;
  region: string;
  status: 'Attended_Physical' | 'Attended_Online';
  checkInAt: string;
}

export interface LiveVelocityPoint {
  hour: string;
  physical: number;
  online: number;
  total: number;
}

export interface LiveRegionAttendance {
  code: string;
  name: string;
  today: number;
  allTime: number;
}

export interface LiveCheckinsResponse {
  timestamp: string;
  today: {
    total: number;
    physical: number;
    online: number;
    peakHour: string;
    peakHourCount: number;
  };
  allTime: {
    total: number;
    physical: number;
    online: number;
  };
  velocity: LiveVelocityPoint[];
  regionAttendance: LiveRegionAttendance[];
  feed: LiveCheckin[];
}

// ─────────────────────────────────────────────────────────────────────
// Trainer Performance types
// ─────────────────────────────────────────────────────────────────────

export interface TrainerKpi {
  sessionsConducted: number;
  totalParticipants: number;
  attendanceRate: number;       // %
  completionRate: number;        // %
  avgRating: number;            // out of 5
  responseTimeMins: number;     // avg time to respond to participant queries
}

export interface TrainerPerformancePoint {
  month: string;
  sessions: number;
  attendance: number;           // %
  rating: number;               // out of 5
}

export interface TrainerFeedback {
  id: string;
  participantName: string;
  participantId: string;
  session: string;
  rating: number;                // out of 5
  comment: string;
  submittedAt: string;
}

export interface Trainer {
  id: string;
  name: string;
  role: string;
  specialty: string;
  initials: string;
  color: string;                // tailwind gradient classes for avatar
  joinedAt: string;
  kpi: TrainerKpi;
  performance: TrainerPerformancePoint[];
  preFeedback: TrainerFeedback[];
  postFeedback: TrainerFeedback[];
}

export interface TrainersResponse {
  trainers: Trainer[];
}

export interface RegisterResponse {
  ok: boolean;
  participant?: Participant;
  existing?: Participant;
  qrSeed?: string;
  qrPayload?: string;
  qrDataUrl?: string;
  whatsapp?: WhatsAppDispatch;
  capacityRouted?: boolean;
  capacityNote?: string;
  message?: string;
  status?: string;
  error?: string;
  workflow: WorkflowStep[];
}
