'use client';

import { SectorStat } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon, TrendingUp } from 'lucide-react';

const SECTOR_COLORS = [
  '#1E3A8A', // navy
  '#D4A017', // gold
  '#0891B2', // cyan
  '#7C3AED', // violet
  '#DC2626', // red
  '#16A34A', // green
  '#6B7280', // gray
];

export function SectoralBreakdown({ sectors }: { sectors: SectorStat[] }) {
  const top3 = sectors.slice(0, 3);
  const rest = sectors.slice(3);
  const restCount = rest.reduce((s, x) => s + x.count, 0);

  const chartData = [
    ...top3.map((s) => ({ name: s.sector, value: s.count })),
    ...(restCount > 0 ? [{ name: 'Others', value: restCount }] : []),
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <PieIcon className="h-4 w-4 text-primary" />
          Sectoral Breakdown
        </CardTitle>
        <p className="text-xs text-muted-foreground">Top 3 MSME sectors driving registrations</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value.toLocaleString()} registrants`, name]}
                  contentStyle={{
                    background: 'rgba(11, 31, 58, 0.96)',
                    border: 'none',
                    borderRadius: 8,
                    color: 'white',
                    fontSize: 12,
                    padding: '8px 12px',
                  }}
                  labelStyle={{ color: '#D4A017' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, color: '#6b7280' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {sectors.slice(0, 5).map((s, i) => (
              <div key={s.sector} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: SECTOR_COLORS[i % SECTOR_COLORS.length] }}
                  />
                  <span className="truncate font-medium">{s.sector}</span>
                </div>
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="font-semibold">{s.count.toLocaleString()}</span>
                  <span className="text-muted-foreground">{s.pct}%</span>
                </div>
              </div>
            ))}
            {sectors.length > 5 && (
              <div className="pt-1 text-[11px] text-muted-foreground">
                +{sectors.length - 5} more sectors
              </div>
            )}
            <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-50 p-2 text-[11px] text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              <TrendingUp className="h-3 w-3" />
              <span>
                Top 3 sectors ={' '}
                <span className="font-semibold">
                  {top3.reduce((s, x) => s + x.pct, 0)}%
                </span>{' '}
                of all registrations
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
