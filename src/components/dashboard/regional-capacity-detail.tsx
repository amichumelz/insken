'use client';

import { RegionStat } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RegionStateBadge } from './region-state-badge';
import { Users, Video, CalendarCheck, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RegionalCapacityDetail({ regions }: { regions: RegionStat[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {regions.map((r) => {
        const physicalPct = Math.min(r.physicalPct, 100);
        const onlinePct = Math.min((r.online / r.onlineTarget) * 100, 100);
        const totalPct = Math.min(r.totalPct, 100);

        return (
          <Card
            key={r.code}
            className={cn(
              'overflow-hidden',
              r.state === 'Full' && 'border-rose-200 dark:border-rose-900/60',
              r.state === 'Warn' && 'border-amber-200 dark:border-amber-900/60',
              r.state === 'LowVelocity' && 'border-sky-200 dark:border-sky-900/60',
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-xs font-bold uppercase text-primary-foreground">
                    {r.code}
                  </div>
                  <div>
                    <CardTitle className="text-base">{r.name}</CardTitle>
                    <div className="text-[11px] text-muted-foreground">
                      {r.total.toLocaleString()} / {r.totalCap.toLocaleString()} total ({r.totalPct}%)
                    </div>
                  </div>
                </div>
                <RegionStateBadge state={r.state} size="md" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CapRow
                icon={Users}
                label="Physical"
                current={r.physical}
                cap={r.physicalCap}
                pct={physicalPct}
                tone={r.state === 'Full' ? 'rose' : r.state === 'Warn' ? 'amber' : 'primary'}
              />
              <CapRow
                icon={Video}
                label="Online"
                current={r.online}
                cap={r.onlineTarget}
                pct={onlinePct}
                tone="gold"
              />
              <CapRow
                icon={CalendarCheck}
                label="Attended"
                current={r.attended}
                cap={r.total}
                pct={r.attendedPct}
                tone="emerald"
              />

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-2.5 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  Total Allocation Fill
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold tabular-nums">{r.totalPct}%</span>
                  <Progress value={totalPct} className="h-1.5 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

const TONE_MAP = {
  primary: 'text-primary',
  gold: 'text-amber-600',
  emerald: 'text-emerald-600',
  rose: 'text-rose-600',
  amber: 'text-amber-600',
} as const;

const PROGRESS_TONE = {
  primary: '[&_[role=progressbar]]:bg-primary',
  gold: '[&_[role=progressbar]]:bg-amber-500',
  emerald: '[&_[role=progressbar]]:bg-emerald-500',
  rose: '[&_[role=progressbar]]:bg-rose-500',
  amber: '[&_[role=progressbar]]:bg-amber-500',
} as const;

function CapRow({
  icon: Icon,
  label,
  current,
  cap,
  pct,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  current: number;
  cap: number;
  pct: number;
  tone: keyof typeof TONE_MAP;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className={cn('h-3 w-3', TONE_MAP[tone])} />
          {label}
        </div>
        <div className="tabular-nums">
          <span className={cn('font-semibold', TONE_MAP[tone])}>{current.toLocaleString()}</span>
          <span className="text-muted-foreground"> / {cap.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={pct} className={cn('h-2 flex-1', PROGRESS_TONE[tone])} />
        <span className="w-9 text-right text-[10px] font-medium tabular-nums text-muted-foreground">
          {pct}%
        </span>
      </div>
    </div>
  );
}
