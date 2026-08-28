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
 * Drives the "live" feel of the whole dashboard. Every TICK_INTERVAL_MS,
 * posts to /api/live/tick which mutates the DB (new registrations, check-ins,
 * duplicate attempts, trainer feedback, KPI nudges). The current tick's
 * events are surfaced so callers can fire toasts and trigger refetches.
 */
export function useLiveTicker(opts?: { silent?: boolean }) {
  const [lastTick, setLastTick] = useState<LiveTickResponse | null>(null);
  const [running, setRunning] = useState(true);
  const silentRef = useRef(opts?.silent);

  useEffect(() => {
    silentRef.current = opts?.silent;
  }, [opts?.silent]);

  useEffect(() => {
    if (!running) return;

    let cancelled = false;

    const tick = async () => {
      try {
        const res = await fetch('/api/live/tick', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = (await res.json()) as LiveTickResponse;
        if (cancelled) return;
        setLastTick(data);

        if (!silentRef.current && data.events.length > 0) {
          const priority: LiveTickEvent['kind'][] = [
            'duplicate',
            'feedback',
            'trainer_kpi',
            'checkin',
            'register',
          ];
          for (const kind of priority) {
            const ev = data.events.find((e) => e.kind === kind);
            if (ev) {
              const toastType =
                kind === 'duplicate'
                  ? 'error'
                  : kind === 'feedback'
                    ? 'info'
                    : kind === 'trainer_kpi'
                      ? 'info'
                      : 'success';
              const icon =
                kind === 'duplicate' ? '🛡️' : kind === 'feedback' ? '💬' : kind === 'trainer_kpi' ? '📈' : '✅';
              const toastFn = (toast as unknown as Record<string, (msg: string, opts?: { duration?: number }) => void>)[toastType];
              if (toastFn) toastFn(`${icon} ${ev.detail}`, { duration: 4000 });
              break;
            }
          }
        }
      } catch {
        // silent — network errors don't break the UI
      }
    };

    const initial = setTimeout(tick, 800);
    const interval = setInterval(tick, TICK_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [running]);

  const pause = () => setRunning(false);
  const resume = () => setRunning(true);

  return { lastTick, running, pause, resume };
}
