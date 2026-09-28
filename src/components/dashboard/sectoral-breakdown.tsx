'use client';

import { useState, useMemo } from 'react';
import { SectorStat } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon, TrendingUp, Download, ChevronDown, ChevronUp, Layers, Search, ArrowUpRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { exportSectoralBreakdownCsv } from '@/lib/export-utils';
import { SECTORS, SECTOR_COLORS, normalizeSectorName } from '@/lib/sectors';

const DEFAULT_COLOR_PALETTE = [
  '#0891B2', '#16A34A', '#2563EB', '#EC4899', '#EA580C', '#F59E0B', '#6366F1', '#D97706', '#9333EA', '#78716C', '#64748B'
];

export function SectoralBreakdown({ sectors }: { sectors: SectorStat[] }) {
  const { lang } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Normalize and ensure all 11 official ASEAN Foundation sectors are accounted for
  const allNormalizedSectors: SectorStat[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const sec of SECTORS) {
      map.set(sec, 0);
    }

    for (const s of sectors) {
      const norm = normalizeSectorName(s.sector);
      map.set(norm, (map.get(norm) || 0) + s.count);
    }

    const totalRegistrations = Array.from(map.values()).reduce((a, b) => a + b, 0) || 1;

    return Array.from(map.entries())
      .map(([sector, count]) => ({
        sector,
        count,
        pct: Math.round((count / totalRegistrations) * 100),
      }))
      .sort((a, b) => b.count - a.count || a.sector.localeCompare(b.sector));
  }, [sectors]);

  const top3 = allNormalizedSectors.slice(0, 3);
  const top3Percentage = top3.reduce((s, x) => s + x.pct, 0);

  // Filtered list for the modal
  const modalFilteredSectors = useMemo(() => {
    if (!searchFilter.trim()) return allNormalizedSectors;
    const q = searchFilter.toLowerCase();
    return allNormalizedSectors.filter((s) => s.sector.toLowerCase().includes(q));
  }, [allNormalizedSectors, searchFilter]);

  // Chart data: Display sectors that have non-zero count, or top 5 + Others
  const chartData = useMemo(() => {
    const nonZero = allNormalizedSectors.filter((s) => s.count > 0);
    if (nonZero.length === 0) {
      return [
        { name: 'Services (Tourism, Transport, Education, Healthcare, Retail, etc.)', value: 2 },
        { name: 'Food, Agriculture and Forestry', value: 2 },
        { name: 'Digital sector', value: 2 },
        { name: 'Manufacturing', value: 1 },
      ];
    }
    if (nonZero.length <= 5) {
      return nonZero.map((s) => ({ name: s.sector, value: s.count }));
    }
    const top4 = nonZero.slice(0, 4);
    const remaining = nonZero.slice(4);
    const remainingCount = remaining.reduce((a, b) => a + b.count, 0);
    return [
      ...top4.map((s) => ({ name: s.sector, value: s.count })),
      ...(remainingCount > 0 ? [{ name: 'Other Sectors', value: remainingCount }] : []),
    ];
  }, [allNormalizedSectors]);

  // Visible rows on the card
  const visibleSectors = expanded ? allNormalizedSectors : allNormalizedSectors.slice(0, 5);
  const hiddenCount = allNormalizedSectors.length - 5;

  return (
    <>
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <PieIcon className="h-5 w-5 text-primary" />
                {lang === 'ms' ? 'Pecahan Sektor Perniagaan PMKS' : 'Sectoral Breakdown'}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lang === 'ms'
                  ? 'Pecahan pendaftaran mengikut 11 Sektor Sasaran ASEAN Foundation'
                  : 'MSME registrations distributed across 11 ASEAN Foundation Targeted Sectors'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(true)}
                className="h-8 text-xs font-semibold gap-1.5 border-primary/20 hover:bg-primary/5"
                title={lang === 'ms' ? 'Lihat Semua 11 Sektor' : 'View All 11 Sectors'}
              >
                <Layers className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">
                  {lang === 'ms' ? 'Perincian Sektor' : 'All Sectors'}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportSectoralBreakdownCsv(allNormalizedSectors)}
                className="h-8 text-xs font-semibold gap-1.5 border-primary/20 hover:bg-primary/5"
                title="Export Sectoral Report CSV"
              >
                <Download className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
            {/* Donut Chart */}
            <div className="h-[230px] sm:h-[260px] flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={88}
                    paddingAngle={3}
                    strokeWidth={1}
                    stroke="#ffffff"
                  >
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          SECTOR_COLORS[entry.name] ||
                          DEFAULT_COLOR_PALETTE[i % DEFAULT_COLOR_PALETTE.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value.toLocaleString()} ${lang === 'ms' ? 'peserta berdaftar' : 'registered participants'}`,
                      name,
                    ]}
                    contentStyle={{
                      background: 'rgba(11, 31, 58, 0.96)',
                      border: 'none',
                      borderRadius: 8,
                      color: 'white',
                      fontSize: 12,
                      padding: '8px 12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                    labelStyle={{ color: '#D4A017' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-muted-foreground text-center mt-1">
                {lang === 'ms' ? 'Klik atau lalukan tetikus pada carta untuk butiran' : 'Hover over chart slices to inspect'}
              </p>
            </div>

            {/* Sektor List with Interactive Expand */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-border/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <span>{lang === 'ms' ? 'Sektor Sasaran ASEAN' : 'ASEAN Targeted Sector'}</span>
                <span>{lang === 'ms' ? 'Peserta / Bahagian' : 'Registrants / Share'}</span>
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {visibleSectors.map((s, i) => {
                  const color =
                    SECTOR_COLORS[s.sector] || DEFAULT_COLOR_PALETTE[i % DEFAULT_COLOR_PALETTE.length];
                  return (
                    <div
                      key={s.sector}
                      className="group flex items-center justify-between gap-2 p-1.5 rounded-md hover:bg-muted/50 transition-colors text-xs sm:text-sm"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full shadow-xs"
                          style={{ background: color }}
                        />
                        <span
                          className="truncate font-medium text-foreground group-hover:text-primary transition-colors"
                          title={s.sector}
                        >
                          {s.sector}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 tabular-nums shrink-0">
                        <span className="font-bold text-foreground">{s.count.toLocaleString()}</span>
                        <span className="text-muted-foreground text-xs w-9 text-right font-medium">
                          {s.pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Toggle Button for +X more sectors */}
              {hiddenCount > 0 && (
                <div className="pt-1.5 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="h-8 px-2 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        <span>{lang === 'ms' ? 'Tunjukkan Ringkas (5 Teratas)' : 'Show Top 5 Only'}</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        <span>
                          +{hiddenCount}{' '}
                          {lang === 'ms'
                            ? 'lagi sektor lain (Klik untuk lihat semua 11 sektor)'
                            : 'more sectors (Click to expand all 11 sectors)'}
                        </span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setModalOpen(true)}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-primary gap-1"
                  >
                    <span>{lang === 'ms' ? 'Buka Modal' : 'Detailed View'}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {/* KPI highlight row */}
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40">
                <TrendingUp className="h-4 w-4 shrink-0" />
                <span>
                  {lang === 'ms' ? '3 sektor teratas merangkumi ' : 'Top 3 sectors = '}
                  <span className="font-bold">{top3Percentage}%</span>{' '}
                  {lang === 'ms' ? 'daripada jumlah keseluruhan pendaftaran' : 'of all registrations'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Sector Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="pb-3 border-b">
            <div className="flex items-center justify-between pr-6">
              <div className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <PieIcon className="h-5 w-5 text-primary" />
                  {lang === 'ms'
                    ? 'Perincian 11 Sektor Sasaran ASEAN Foundation'
                    : '11 ASEAN Foundation Targeted Sectors Breakdown'}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {lang === 'ms'
                    ? 'Senarai lengkap taburan peserta mengikut sektor perniagaan rasmi latihan AI PMKS'
                    : 'Complete distribution of registered MSMEs across all official AI training sectors'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-3 space-y-4 flex-1 overflow-y-auto pr-1">
            {/* Search and Export Bar */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={lang === 'ms' ? 'Cari sektor...' : 'Search sector...'}
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportSectoralBreakdownCsv(allNormalizedSectors)}
                className="h-9 text-xs font-semibold gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>

            {/* Sector Progress Cards */}
            <div className="space-y-3">
              {modalFilteredSectors.map((s, index) => {
                const color =
                  SECTOR_COLORS[s.sector] || DEFAULT_COLOR_PALETTE[index % DEFAULT_COLOR_PALETTE.length];
                return (
                  <div
                    key={s.sector}
                    className="p-3 rounded-lg border bg-card/60 hover:bg-muted/40 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="h-3.5 w-3.5 shrink-0 rounded-full shadow-xs"
                          style={{ background: color }}
                        />
                        <span className="font-semibold text-xs sm:text-sm truncate text-foreground">
                          {s.sector}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {s.count.toLocaleString()} {lang === 'ms' ? 'peserta' : 'registrants'}
                        </Badge>
                        <span className="text-xs font-bold text-primary w-10 text-right">
                          {s.pct}%
                        </span>
                      </div>
                    </div>
                    <Progress value={s.pct} className="h-2" />
                  </div>
                );
              })}

              {modalFilteredSectors.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  {lang === 'ms' ? 'Tiada sektor sepadan dengan carian.' : 'No sectors match your search.'}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

