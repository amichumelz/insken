'use client';

import { useCallback, useEffect, useState } from 'react';
import { LiveCheckinsResponse } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Activity,
  MapPin,
  Video,
  RefreshCw,
  Radio,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

const REFRESH_INTERVAL_MS = 30000; // 30 seconds

export function LiveAttendanceTracking({ refreshTick = 0 }: { refreshTick?: number }) {
  const { t, lang } = useLanguage();
  const [data, setData] = useState<LiveCheckinsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/checkins/live', { cache: 'no-store' });
      const json = (await res.json()) as LiveCheckinsResponse;
      setData(json);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/checkins/live', { cache: 'no-store' });
        const json = (await res.json()) as LiveCheckinsResponse;
        if (!cancelled) {
          setData(json);
          setLastUpdated(new Date());
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();

    const interval = setInterval(() => {
      load();
    }, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [load]);

  useEffect(() => {
    if (refreshTick === 0) return;
    load();
  }, [refreshTick, load]);

  return (
    <div className="space-y-6">
      {/* Live indicator strip */}
      <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-2.5 dark:border-emerald-900/60 dark:bg-emerald-950/20 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            {lang === 'ms' ? 'PEMANTAUAN KEHADIRAN LANGSUNG' : 'LIVE ATTENDANCE TRACKING'}
          </span>
          <span className="hidden text-[11px] text-muted-foreground sm:inline">
            {lang === 'ms' ? 'Kemas kini automatik setiap 30s' : 'Auto-refreshing every 30s'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="font-mono text-[10px] text-muted-foreground flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {lastUpdated.toLocaleTimeString('en-MY', { hour12: false })}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="h-7 px-2 text-xs">
            <RefreshCw className={cn('h-3 w-3 mr-1', loading && 'animate-spin')} />
            <span>{t.navRefresh}</span>
          </Button>
        </div>
      </div>

      {/* Velocity chart — full width */}
      {data && (
        <CheckinVelocityChart
          velocity={data.velocity}
          peakHour={data.today.peakHour}
          peakCount={data.today.peakHourCount}
        />
      )}

      {/* Live feed — full width */}
      {data && <LiveFeed feed={data.feed} />}
    </div>
  );
}

function CheckinVelocityChart({
  velocity,
  peakHour,
  peakCount,
}: {
  velocity: LiveCheckinsResponse['velocity'];
  peakHour: string;
  peakCount: number;
}) {
  const { lang } = useLanguage();

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Activity className="h-5 w-5 text-emerald-600" />
            {lang === 'ms' ? 'Kelajuan Kehadiran' : 'Check-in Velocity'}
          </CardTitle>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {lang === 'ms' ? 'Waktu Kemuncak' : 'Peak Hour'}
            </div>
            <div className="text-sm font-bold tabular-nums text-foreground">
              {peakHour} <span className="text-muted-foreground">·</span>{' '}
              <span className="text-emerald-600">{peakCount}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {lang === 'ms' ? 'Kehadiran setiap jam · 24 jam lepas' : 'Hourly check-ins · last 24 hours'}
        </p>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-5">
        <div className="h-[260px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={velocity} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="physicalBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0.55} />
                </linearGradient>
                <linearGradient id="onlineBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4A017" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#D4A017" stopOpacity={0.55} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.12)" vertical={false} />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <Tooltip
                cursor={{ fill: 'rgba(120,120,120,0.06)' }}
                contentStyle={{
                  background: 'rgba(11, 31, 58, 0.96)',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 12,
                  padding: '8px 12px',
                }}
                labelStyle={{ color: '#D4A017', fontWeight: 600 }}
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString()} check-ins`,
                  name === 'physical' ? (lang === 'ms' ? 'Fizikal' : 'Physical') : (lang === 'ms' ? 'Online' : 'Online'),
                ]}
                labelFormatter={(label) => `${lang === 'ms' ? 'Jam' : 'Hour'} ${label}`}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
                formatter={(value) => (value === 'physical' ? (lang === 'ms' ? 'Fizikal' : 'Physical') : (lang === 'ms' ? 'Online' : 'Online'))}
              />
              <Bar dataKey="physical" stackId="a" fill="url(#physicalBar)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="online" stackId="a" fill="url(#onlineBar)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function LiveFeed({ feed }: { feed: LiveCheckinsResponse['feed'] }) {
  const { lang } = useLanguage();

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Radio className="h-5 w-5 text-emerald-500 animate-pulse" />
            {lang === 'ms' ? 'Suapan Kehadiran Terkini' : 'Live Check-in Feed'}
          </CardTitle>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            {feed.length} {lang === 'ms' ? 'terkini' : 'recent'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {lang === 'ms' ? 'Peristiwa kehadiran secara langsung semasa ia berlaku' : 'Real-time attendance events as they happen'}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[380px] overflow-y-auto scroll-styled">
          {feed.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
              {lang === 'ms' ? 'Tiada kehadiran direkodkan lagi hari ini.' : 'No check-ins recorded yet today.'}
            </div>
          ) : (
            <ul className="divide-y">
              {feed.map((c, i) => {
                const isPhysical = c.status === 'Attended_Physical';
                const Icon = isPhysical ? MapPin : Video;
                const tone = isPhysical
                  ? 'bg-primary/10 text-primary'
                  : 'bg-amber-500/10 text-amber-600';
                const badgeTone = isPhysical
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold';
                const time = new Date(c.checkInAt);
                const minutesAgo = Math.floor((Date.now() - time.getTime()) / 60000);
                return (
                  <li
                    key={`${c.participantId}-${i}`}
                    className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', tone)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {c.name}
                          <span className="ml-2 font-mono text-[11px] font-normal text-muted-foreground">{c.participantId}</span>
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {c.sector} · {c.region}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                      <span className={cn('rounded px-2 py-0.5 text-[10px] uppercase tracking-wide', badgeTone)}>
                        {isPhysical ? 'PHYSICAL' : 'ONLINE'}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {minutesAgo < 1
                          ? 'just now'
                          : minutesAgo < 60
                            ? `${minutesAgo}m ago`
                            : time.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
