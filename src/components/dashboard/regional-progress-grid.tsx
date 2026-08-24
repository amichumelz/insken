'use client';

import { RegionStat } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RegionStateBadge } from './region-state-badge';
import { MapPin, Users, Video } from 'lucide-react';

const REGION_FLAG_COLORS: Record<string, string> = {
  KL: 'from-blue-500 to-indigo-600',
  JHR: 'from-emerald-500 to-teal-600',
  PNG: 'from-amber-500 to-orange-600',
  SBH: 'from-rose-500 to-pink-600',
  SWK: 'from-purple-500 to-fuchsia-600',
};

export function RegionalProgressGrid({ regions }: { regions: RegionStat[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-primary" />
            Regional Progress Grid
          </CardTitle>
          <div className="hidden flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground sm:flex">
            <RegionStateBadge state="Normal" />
            <RegionStateBadge state="Warn" />
            <RegionStateBadge state="Full" />
            <RegionStateBadge state="LowVelocity" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {regions.map((r) => {
          const physicalPctVal = Math.min(r.physicalPct, 100);
          const totalPctVal = Math.min(r.totalPct, 100);
          return (
            <div
              key={r.code}
              className={cn(
                'rounded-xl border p-3 transition-all hover:shadow-sm',
                r.state === 'Full' && 'border-rose-200 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/10',
                r.state === 'Warn' && 'border-amber-200 bg-amber-50/40 dark:border-amber-900/60 dark:bg-amber-950/10',
                r.state === 'LowVelocity' && 'border-sky-200 bg-sky-50/40 dark:border-sky-900/60 dark:bg-sky-950/10',
                r.state === 'Normal' && 'border-border bg-card',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-bold uppercase text-white shadow-sm',
                      REGION_FLAG_COLORS[r.code],
                    )}
                  >
                    {r.code}
                  </div>
                  <div>
                    <div className="text-sm font-semibold leading-tight">{r.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {r.total.toLocaleString()} / {r.totalCap.toLocaleString()} total
                    </div>
                  </div>
                </div>
                <RegionStateBadge state={r.state} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    Physical
                    <span className="ml-auto font-medium text-foreground tabular-nums">
                      {r.physical}/{r.physicalCap}
                    </span>
                  </div>
                  <Progress value={physicalPctVal} className="mt-1 h-1.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Video className="h-3 w-3" />
                    Online
                    <span className="ml-auto font-medium text-foreground tabular-nums">
                      {r.online}/{r.onlineTarget}
                    </span>
                  </div>
                  <Progress value={Math.min((r.online / r.onlineTarget) * 100, 100)} className="mt-1 h-1.5" />
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  Attended: <span className="font-semibold text-foreground tabular-nums">{r.attended.toLocaleString()}</span>{' '}
                  ({r.attendedPct}%)
                </span>
                <span className="font-medium tabular-nums">{r.totalPct}% of allocation</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
