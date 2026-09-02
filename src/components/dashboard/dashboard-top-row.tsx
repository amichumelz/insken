'use client';

import { GlobalStats } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, Target } from 'lucide-react';
import { LiveKpiRowTop } from './live-kpi-row-top';

import { useLanguage } from '@/lib/i18n';

interface DashboardTopRowProps {
  global: GlobalStats;
  refreshTick?: number;
}

const fmt = (n: number) => n.toLocaleString('en-US');

export function DashboardTopRow({ global, refreshTick = 0 }: DashboardTopRowProps) {
  const { t, lang } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {/* Global KPI — spans 2 columns at xl */}
      <Card className="relative overflow-hidden p-4 sm:col-span-2 lg:col-span-1 xl:col-span-2 border shadow-sm">
        <div className="absolute inset-0 bg-navy-gradient pointer-events-none" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Target className="h-3.5 w-3.5 text-[#D4A017]" />
              {t.dashGlobalKpi}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                {fmt(global.total)}
              </span>
              <span className="text-sm text-muted-foreground">/ {fmt(global.target)}</span>
            </div>
            <div className="mt-1.5 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">{global.pct}%</span> {t.dashOfTarget}
            </div>
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

      {/* 4 live attendance KPI cards — each spans 1 column at xl */}
      <LiveKpiRowTop refreshTick={refreshTick} />
    </div>
  );
}
