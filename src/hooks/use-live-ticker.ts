'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export interface LiveTickEvent {
  kind: 'register' | 'checkin' | 'duplicate' | 'feedback' | 'trainer_kpi';
  detail: string;
}

export interface LiveTickSummary {
  registrations: number;
  checkins: number;
  duplicates: number;
  feedback: number;
  trainerKpi: number;
}

export interface LiveTickResponse {
  timestamp: string;
  events: LiveTickEvent[];
  summary: LiveTickSummary;
}

const TICK_INTERVAL_MS = 12000; // 12 seconds — slow, deliberate live cadence

/**
 * Passive ticker hook - no fake simulations or dummy toasts.
 */
export function useLiveTicker(_opts?: { silent?: boolean }) {
  const [lastTick] = useState<LiveTickResponse | null>(null);
  const [running, setRunning] = useState(false);

  const pause = () => setRunning(false);
  const resume = () => setRunning(true);

  return { lastTick, running, pause, resume };
}
