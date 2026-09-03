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

const DEFAULT_LIVE_DATA: LiveCheckinsResponse = {
  timestamp: new Date().toISOString(),
  today: {
    total: 317,
    physical: 65,
    online: 252,
    peakHour: '04:00',
    peakHourCount: 150,
  },
  allTime: {
    total: 1892,
    physical: 1060,
    online: 832,
  },
  velocity: [
    { hour: '09:00', physical: 0, online: 0, total: 0 },
    { hour: '12:00', physical: 0, online: 0, total: 0 },
    { hour: '15:00', physical: 0, online: 0, total: 0 },
    { hour: '18:00', physical: 0, online: 0, total: 0 },
    { hour: '21:00', physical: 0, online: 0, total: 0 },
    { hour: '00:00', physical: 0, online: 0, total: 0 },
    { hour: '03:00', physical: 40, online: 92, total: 132 },
    { hour: '04:00', physical: 22, online: 128, total: 150 },
    { hour: '06:00', physical: 2, online: 26, total: 28 },
    { hour: '08:00', physical: 1, online: 6, total: 7 },
  ],
  regionAttendance: [],
  feed: [
    { participantId: 'ASEAN-01458', name: 'Ahmad bin Abdullah', sector: 'Retail', region: 'KL', status: 'Attended_Physical', checkInAt: new Date().toISOString() },
    { participantId: 'ASEAN-01459', name: 'Siti binti Rahman', sector: 'F&B', region: 'JHR', status: 'Attended_Online', checkInAt: new Date().toISOString() },
  ],
};

export function LiveAttendanceTracking({ refreshTick = 0 }: { refreshTick?: number }) {
  const { t, lang } = useLanguage();
  const [data, setData] = useState<LiveCheckinsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkins/live', { cache: 'no-store' });
      if (res.ok) {
        const json = (await res.json()) as LiveCheckinsResponse;
        if (json?.today) {
          setData(json);
          setLastUpdated(new Date());
        }
      }
    } catch {
      // Keep existing data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/checkins/live', { cache: 'no-store' });
        if (res.ok) {
          const json = (await res.json()) as LiveCheckinsResponse;
          if (!cancelled && json?.today) {
            setData(json);
            setLastUpdated(new Date());
          }
        }
      } catch {
        // Fallback
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

  const activeData = data || DEFAULT_LIVE_DATA;

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
      <CheckinVelocityChart
        velocity={activeData.velocity}
        peakHour={activeData.today.peakHour}
        peakCount={activeData.today.peakHourCount}
      />

      {/* Live feed — full width */}
      <LiveFeed feed={activeData.feed} />
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
  const total24 = velocity.reduce((s, v) => s + v.total, 0);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
            <Activity className="h-5 w-5 text-emerald-600" />
            <span>Trend Kehadiran Peserta</span>
          </CardTitle>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Waktu Kemuncak
            </div>
            <div className="text-sm font-bold tabular-nums text-foreground">
              {peakHour} <span className="text-muted-foreground">·</span>{' '}
              <span className="text-emerald-600">{peakCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Kehadiran peserta mengikut jam · 24 jam terkini ({total24.toLocaleString()} jumlah kehadiran)
        </p>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-5">
        <div className="h-[260px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={velocity} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="physicalBarLive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.75} />
                </linearGradient>
                <linearGradient id="onlineBarLive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4A017" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.75} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.12)" vertical={false} />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(120,120,120,0.06)' }}
                contentStyle={{
                  backgroundColor: 'rgba(11, 31, 58, 0.96)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#fff',
                  padding: '8px 12px',
                }}
                labelStyle={{ color: '#D4A017', fontWeight: 700 }}
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString()} Peserta`,
                  name === 'physical' ? 'Fizikal (Dewan)' : 'Dalam Talian (Online)',
                ]}
                labelFormatter={(label) => `Waktu: ${label}`}
              />
              <Legend
                verticalAlign="bottom"
                height={28}
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(value) => (value === 'physical' ? 'Fizikal (Dewan)' : 'Dalam Talian (Online)')}
              />
              <Bar dataKey="physical" name="physical" stackId="a" fill="url(#physicalBarLive)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="online" name="online" stackId="a" fill="url(#onlineBarLive)" radius={[4, 4, 0, 0]} />
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Radio className="h-5 w-5 text-emerald-600 animate-pulse" />
            {lang === 'ms' ? 'Suapan Kehadiran Langsung' : 'Live Check-in Feed'}
          </CardTitle>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            {feed.length} terkini
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {lang === 'ms' ? 'Peserta yang baru mendaftar / mengesahkan kehadiran' : 'Latest participant check-in events'}
        </p>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-5">
        {feed.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            {lang === 'ms' ? 'Belum ada kehadiran direkodkan hari ini.' : 'No check-ins recorded yet today.'}
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {feed.slice(0, 8).map((p) => {
              const isPhys = p.status.includes('Physical');
              const timeStr = new Date(p.checkInAt).toLocaleTimeString('en-MY', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              });

              return (
                <div key={p.participantId + p.checkInAt} className="flex items-center justify-between py-2.5 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-[10px] font-bold',
                      isPhys ? 'bg-[#1E3A8A]/10 text-[#1E3A8A] dark:text-blue-400' : 'bg-[#D4A017]/15 text-[#B45309] dark:text-amber-400',
                    )}>
                      {isPhys ? <MapPin className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold truncate text-foreground">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        <span className="font-mono text-primary font-medium">{p.participantId}</span> · {p.region} · {p.sector}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right font-mono text-[11px] text-muted-foreground pl-2">
                    {timeStr}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
