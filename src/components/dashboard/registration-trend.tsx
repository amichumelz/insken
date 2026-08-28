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

export function RegistrationTrend({ trend }: { trend: TrendPoint[] }) {
  const total12 = trend.reduce((s, t) => s + t.total, 0);
  const peakMonth = trend.reduce(
    (max, t) => (t.total > max.total ? t : max),
    { month: '—', total: 0, physical: 0, online: 0 },
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" />
            Registration Velocity
          </CardTitle>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Peak month</div>
            <div className="text-sm font-semibold tabular-nums">
              {peakMonth.month} <span className="text-muted-foreground">·</span>{' '}
              <span className="text-primary">{peakMonth.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Monthly registrations · last 12 months ({total12.toLocaleString()} total)</p>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="physicalBarReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0.55} />
                </linearGradient>
                <linearGradient id="onlineBarReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4A017" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#D4A017" stopOpacity={0.55} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.12)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                width={32}
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
                  `${value.toLocaleString()} regs`,
                  name === 'physical' ? 'Physical' : 'Online',
                ]}
                labelFormatter={(label) => `Month ${label}`}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
                formatter={(value) => (value === 'physical' ? 'Physical' : 'Online')}
              />
              <Bar dataKey="physical" stackId="a" fill="url(#physicalBarReg)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="online" stackId="a" fill="url(#onlineBarReg)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
