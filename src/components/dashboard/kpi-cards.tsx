'use client';

import { GlobalStats } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import {
  ShieldCheck,
  QrCode,
  AlertTriangle,
} from 'lucide-react';

interface KpiCardsProps {
  global: GlobalStats;
}

const fmt = (n: number) => n.toLocaleString('en-US');

/**
 * Second-row KPI cards — Pending Check-in, Data Hygiene, Active Alerts.
 * (Global KPI moved to DashboardTopRow alongside the live attendance KPIs.)
 *
 * Grid: 3 columns on lg+ so the 3 cards sit side by side at full width.
 */
export function KpiCards({ global }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-3">
      {/* Pending check-in */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Pending Check-in
          </div>
          <div className="rounded-lg bg-amber-500/10 p-1.5">
            <QrCode className="h-4 w-4 text-amber-600" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold tabular-nums">
          {fmt(global.registeredPhysical + global.registeredOnline)}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Awaiting Phase 3 attendance
        </div>
      </Card>

      {/* Data hygiene: duplicates blocked */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Data Hygiene
          </div>
          <div className="rounded-lg bg-primary/10 p-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold tabular-nums text-primary">
          {fmt(global.duplicateBlocked)}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Duplicate IC entries blocked
        </div>
      </Card>

      {/* Active alerts */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Active Alerts
          </div>
          <div className="rounded-lg bg-rose-500/10 p-1.5">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums">{global.activeAlerts}</span>
          {global.criticalAlerts > 0 && (
            <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              {global.criticalAlerts} critical
            </span>
          )}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Capacity · Lag · Milestone
        </div>
      </Card>
    </div>
  );
}
