'use client';

import { TrendPoint } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Activity } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function RegistrationTrend({ trend }: { trend: TrendPoint[] }) {
  const { lang } = useLanguage();
  const total = trend.reduce((s, t) => s + t.total, 0);
  const peakDay = trend.reduce(
    (max, t) => (t.total > max.total ? t : max),
    { day: '—', total: 0, physical: 0, online: 0 },
  );

  return (
    <Card className="h-full border shadow-sm">
      <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
            <Activity className="h-5 w-5 text-indigo-600" />
            <span>Daily Registration Trend</span>
          </CardTitle>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Peak Day
            </div>
            <div className="text-sm font-bold tabular-nums text-foreground">
              {peakDay.day || peakDay.month} <span className="text-muted-foreground">·</span>{' '}
              <span className="text-indigo-600">{peakDay.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Daily participant registrations · Physical vs Online ({total.toLocaleString()} total registrations)
        </p>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-5">
        <div className="h-[260px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="physicalBarReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.75} />
                </linearGradient>
                <linearGradient id="onlineBarReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4A017" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.75} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.12)" vertical={false} />
              <XAxis
                dataKey="day"
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
                  `${value.toLocaleString()} Participants`,
                  name === 'physical' ? 'Physical (Hall)' : 'Online (Virtual)',
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend
                verticalAlign="bottom"
                height={28}
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(value) => (value === 'physical' ? 'Physical (Hall)' : 'Online (Virtual)')}
              />
              <Bar dataKey="physical" name="physical" stackId="a" fill="url(#physicalBarReg)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="online" name="online" stackId="a" fill="url(#onlineBarReg)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
