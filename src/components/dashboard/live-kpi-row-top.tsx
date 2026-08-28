'use client';

import { useEffect, useState } from 'react';
import { LiveCheckinsResponse } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Users, MapPin, Video, Activity, Radio, ArrowUp, TrendingUp, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Standalone Live KPI Row — rendered on the top row of the Executive Dashboard
 * next to the Global KPI card. Uses a 6-column grid at xl: Global KPI takes 2 cols,
 * the 4 live attendance cards take 1 col each.
 *
 * This component fetches its own live-checkins data so it can render independently
 * of the Live Attendance Tracking section below.
 */
export function LiveKpiRowTop({ refreshTick = 0 }: { refreshTick?: number }) {
  const [data, setData] = useState<LiveCheckinsResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/checkins/live', { cache: 'no-store' });
        const json = (await res.json()) as LiveCheckinsResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  if (!data) {
    // Skeleton state
    return (
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-28 animate-pulse bg-muted/40" />
        ))}
      </div>
    );
  }

  const todayPctOfAllTime = data.allTime.total > 0 ? Math.round((data.today.total / data.allTime.total) * 100) : 0;
  const physicalShare = data.today.total > 0 ? Math.round((data.today.physical / data.today.total) * 100) : 0;
  const onlineShare = data.today.total > 0 ? 100 - physicalShare : 0;

  return (
    <>
      {/* Today's check-ins */}
      <Card className="relative overflow-hidden p-4">
        <div className="absolute inset-0 bg-navy-gradient pointer-events-none" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Radio className="h-3.5 w-3.5 text-emerald-500" />
              Today&apos;s Check-ins
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {data.today.total.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <ArrowUp className="h-3 w-3 text-emerald-500" />
              {todayPctOfAllTime}% of all-time
            </div>
          </div>
          <div className="shrink-0 rounded-lg bg-emerald-500/10 p-2">
            <Users className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
        <div className="relative mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          Peak: <span className="font-semibold text-foreground">{data.today.peakHour}</span> ({data.today.peakHourCount})
        </div>
      </Card>

      {/* Physical today */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Physical Today
          </div>
          <div className="rounded-lg bg-primary/10 p-1.5">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold tabular-nums">{data.today.physical.toLocaleString()}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          {physicalShare}% of today · {data.allTime.physical.toLocaleString()} all-time
        </div>
      </Card>

      {/* Online today */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Online Today
          </div>
          <div className="rounded-lg bg-amber-500/10 p-1.5">
            <Video className="h-4 w-4 text-amber-600" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold tabular-nums">{data.today.online.toLocaleString()}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          {onlineShare}% of today · {data.allTime.online.toLocaleString()} all-time
        </div>
      </Card>

      {/* All-time attended */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            All-time Attended
          </div>
          <div className="rounded-lg bg-sky-500/10 p-1.5">
            <Activity className="h-4 w-4 text-sky-600" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold tabular-nums">{data.allTime.total.toLocaleString()}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          {data.allTime.physical.toLocaleString()} Phys · {data.allTime.online.toLocaleString()} Online
        </div>
      </Card>
    </>
  );
}
