'use client';

import { TrendPoint } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Activity } from 'lucide-react';

export function RegistrationTrend({ trend }: { trend: TrendPoint[] }) {
  const total14 = trend.reduce((s, t) => s + t.total, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" />
            Registration Velocity
          </CardTitle>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">14-day intake</div>
            <div className="text-sm font-semibold tabular-nums">{total14.toLocaleString()}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="physicalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="onlineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4A017" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#D4A017" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.12)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => d.slice(5).replace('-', '/')}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <Tooltip
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
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
                formatter={(value) => (value === 'physical' ? 'Physical' : 'Online')}
              />
              <Area
                type="monotone"
                dataKey="physical"
                stackId="1"
                stroke="#1E3A8A"
                strokeWidth={2}
                fill="url(#physicalGrad)"
              />
              <Area
                type="monotone"
                dataKey="online"
                stackId="1"
                stroke="#D4A017"
                strokeWidth={2}
                fill="url(#onlineGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
