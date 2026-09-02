'use client';

import { SectorStat } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

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
  const { lang } = useLanguage();
  const top3 = sectors.slice(0, 3);
  const rest = sectors.slice(3);
  const restCount = rest.reduce((s, x) => s + x.count, 0);

  const chartData = [
    ...top3.map((s) => ({ name: s.sector, value: s.count })),
    ...(restCount > 0 ? [{ name: 'Others', value: restCount }] : []),
  ];

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <PieIcon className="h-5 w-5 text-primary" />
          {lang === 'ms' ? 'Pecahan Sektor Perniagaan PMKS' : 'Sectoral Breakdown'}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {lang === 'ms' ? '3 sektor utama yang memacu pendaftaran' : 'Top 3 MSME sectors driving registrations'}
        </p>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-center">
          <div className="h-[220px] sm:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={85}
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

          <div className="space-y-2.5">
            {sectors.slice(0, 5).map((s, i) => (
              <div key={s.sector} className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ background: SECTOR_COLORS[i % SECTOR_COLORS.length] }}
                  />
                  <span className="truncate font-medium text-foreground">{s.sector}</span>
                </div>
                <div className="flex items-center gap-2.5 tabular-nums">
                  <span className="font-bold text-foreground">{s.count.toLocaleString()}</span>
                  <span className="text-muted-foreground text-xs">{s.pct}%</span>
                </div>
              </div>
            ))}
            {sectors.length > 5 && (
              <div className="pt-1 text-xs text-muted-foreground">
                +{sectors.length - 5} {lang === 'ms' ? 'lagi sektor lain' : 'more sectors'}
              </div>
            )}
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40">
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span>
                {lang === 'ms' ? '3 sektor teratas merangkumi ' : 'Top 3 sectors = '}
                <span className="font-bold">
                  {top3.reduce((s, x) => s + x.pct, 0)}%
                </span>{' '}
                {lang === 'ms' ? 'daripada jumlah keseluruhan pendaftaran' : 'of all registrations'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
