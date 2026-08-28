'use client';

import { RegionStat } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RegionStateBadge } from './region-state-badge';
import { MapPin, Users, Video } from 'lucide-react';

const REGION_FLAG_COLORS: Record<string, string> = {
  KL: 'from-blue-500 to-indigo-600',
  JHR: 'from-emerald-500 to-teal-600',
  PNG: 'from-amber-500 to-orange-600',
  SBH: 'from-rose-500 to-pink-600',
  SWK: 'from-purple-500 to-fuchsia-600',
};

const fmt = (n: number) => n.toLocaleString('en-US');

export function RegionalProgressGrid({ regions }: { regions: RegionStat[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-primary" />
            Regional Attendance Overview
          </CardTitle>
          <div className="hidden flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground sm:flex">
            <RegionStateBadge state="Normal" />
            <RegionStateBadge state="Full" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {regions.map((r) => {
          const isClosed = r.state === 'Full';
          return (
            <div
              key={r.code}
              className={cn(
                'rounded-xl border p-3 transition-all hover:shadow-sm',
                isClosed
                  ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/10'
                  : 'border-border bg-card',
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
                  </div>
                </div>
                <RegionStateBadge state={r.state} />
              </div>

              {/* Per-category attended counts — single figure, no denominator, no percentage */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Physical</div>
                    <div className="text-base font-bold tabular-nums leading-tight">
                      {fmt(r.attendedPhysical)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10">
                    <Video className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Online</div>
                    <div className="text-base font-bold tabular-nums leading-tight">
                      {fmt(r.attendedOnline)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total attended line — no percentage, just a headcount */}
              <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-2 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Attended: <span className="font-semibold text-foreground tabular-nums">{fmt(r.attended)}</span> people
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
