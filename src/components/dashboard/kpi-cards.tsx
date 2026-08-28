'use client';

import { GlobalStats } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  ShieldCheck,
  QrCode,
  AlertTriangle,
  Target,
} from 'lucide-react';

interface KpiCardsProps {
  global: GlobalStats;
}

const fmt = (n: number) => n.toLocaleString('en-US');

export function KpiCards({ global }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-5">
      {/* Total registrations + global progress */}
      <Card className="relative overflow-hidden p-4 md:col-span-2 lg:col-span-1 xl:col-span-2">
        <div className="absolute inset-0 bg-navy-gradient pointer-events-none" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              Global KPI
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                {fmt(global.total)}
              </span>
              <span className="text-sm text-muted-foreground">/ {fmt(global.target)}</span>
            </div>
            <div className="mt-1.5 text-xs text-muted-foreground">{global.pct}% of target</div>
          </div>
          <div className="shrink-0 rounded-lg bg-primary/10 p-2">
            <Users className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="relative mt-3">
          <Progress value={global.pct} className="h-2" />
          <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
            {global.milestones.map((m) => (
              <span key={m.pct} className={cn(m.reached ? 'font-semibold text-foreground' : '')}>
                {m.pct}%
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Registered (not yet attended) */}
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
