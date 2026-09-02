'use client';

import { useEffect, useState, useCallback } from 'react';
import { StatsResponse } from '@/lib/types';
import { KpiCards } from '@/components/dashboard/kpi-cards';
import { DashboardTopRow } from '@/components/dashboard/dashboard-top-row';
import { RegionalProgressGrid } from '@/components/dashboard/regional-progress-grid';
import { SectoralBreakdown } from '@/components/dashboard/sectoral-breakdown';
import { RegistrationTrend } from '@/components/dashboard/registration-trend';
import { DataHygienePanel } from '@/components/dashboard/data-hygiene-panel';
import { RegistrationConsole } from '@/components/dashboard/registration-console';
import { CheckinConsole } from '@/components/dashboard/checkin-console';
import { ParticipantsTable } from '@/components/dashboard/participants-table';
import { LiveAttendanceTracking } from '@/components/dashboard/live-attendance-tracking';
import { TrainerPerformance } from '@/components/dashboard/trainer-performance';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  UserPlus,
  QrCode,
  Users,
  RefreshCw,
  Sparkles,
  GraduationCap,
} from 'lucide-react';

type TabId = 'dashboard' | 'trainers' | 'register' | 'checkin' | 'registry';

const TABS: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
  { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
  { id: 'trainers',  label: 'Trainer Performance', icon: GraduationCap },
  { id: 'register',  label: 'Registration',         icon: UserPlus },
  { id: 'checkin',   label: 'Attendance Check-in',   icon: QrCode },
  { id: 'registry',  label: 'Registry',              icon: Users },
];

export default function Home() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>('dashboard');
  const [refreshTick, setRefreshTick] = useState(0);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats', { cache: 'no-store' });
      const data = (await res.json()) as StatsResponse;
      setStats(data);
      setRefreshTick((n) => n + 1);
    } catch {
      toast.error('Failed to load stats — please retry');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        onRefresh={loadStats}
        refreshing={loading}
        stats={stats}
      />

      <nav className="sticky top-[57px] z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-4 py-2 scroll-styled">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
                {t.id === 'alerts' && stats && stats.global.activeAlerts > 0 && (
                  <span
                    className={cn(
                      'ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                      isActive ? 'bg-white/20' : 'bg-rose-100 text-rose-700',
                    )}
                  >
                    {stats.global.activeAlerts}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-4">
        {!stats && loading ? (
          <DashboardSkeleton />
        ) : stats ? (
          <>
            {tab === 'dashboard' && <DashboardView stats={stats} refreshTick={refreshTick} />}
            {tab === 'trainers' && (
              <div className="space-y-4">
                <SectionHeader
                  title="Trainer Performance"
                  subtitle="Per-coach KPIs, performance trends, and Pre/Post-Session feedback."
                />
                <TrainerPerformance refreshTick={refreshTick} />
              </div>
            )}
            {tab === 'register' && <RegistrationConsole />}
            {tab === 'checkin' && (
              <div className="space-y-4">
                <SectionHeader
                  title="Attendance Check-in — Phase 3"
                  subtitle="Scan QR or paste IC. Agent validates Participant_ID and stamps attendance with timestamp."
                />
                <CheckinConsole />
              </div>
            )}
            {tab === 'registry' && (
              <div className="space-y-4">
                <SectionHeader
                  title="Master Participant Registry"
                  subtitle="Live database view — IC is the unique primary key per PRD section 2."
                />
                <ParticipantsTable />
                {/* Registration Velocity chart — moved here from Executive Dashboard */}
                <RegistrationTrend trend={stats.trend} />
              </div>
            )}
          </>
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Failed to load dashboard data.
            <Button variant="outline" size="sm" onClick={loadStats} className="ml-2">
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function Header({
  onRefresh,
  refreshing,
  stats,
}: {
  onRefresh: () => void;
  refreshing: boolean;
  stats: StatsResponse | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b bg-[#0B1F3A] text-white">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#D4A017] to-[#F59E0B] text-sm font-bold text-[#0B1F3A] shadow-md">
            I
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 truncate">
              <h1 className="truncate text-sm font-semibold sm:text-base">
                INSKEN · Operations &amp; Intelligence
              </h1>
              <span className="hidden shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white/80 sm:inline">
                ASEAN MSME A.I. Skills Training
              </span>
            </div>
            <p className="truncate text-[11px] text-white/60">
              Autonomous operations agent · 5,000 participants across 5 regions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stats && (
            <div className="hidden items-center gap-3 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs md:flex">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-[#D4A017]" />
                <span className="font-semibold tabular-nums">{stats.global.total.toLocaleString()}</span>
                <span className="text-white/60">/ 5,000</span>
              </div>
              <span className="h-3 w-px bg-white/15" />
              <div className={cn('flex items-center gap-1', stats.global.criticalAlerts > 0 ? 'text-rose-300' : 'text-emerald-300')}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span className="text-white/80">
                  {stats.global.criticalAlerts > 0 ? `${stats.global.criticalAlerts} critical alerts` : 'All systems healthy'}
                </span>
              </div>
            </div>
          )}

          {/* Real D1 Connected indicator */}
          <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold uppercase tracking-wider">Live DB</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="h-8 px-2 text-white hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
            <span className="ml-1 hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function DashboardView({ stats, refreshTick }: { stats: StatsResponse; refreshTick: number }) {
  return (
    <div className="space-y-4">
      {/* Row 1: Global KPI + 4 live attendance KPI cards (Today's Check-ins, Physical Today, Online Today, All-time Attended) */}
      <DashboardTopRow global={stats.global} refreshTick={refreshTick} />

      {/* Row 2: Live Attendance Tracking banner + velocity chart + live feed */}
      <LiveAttendanceTracking refreshTick={refreshTick} />

      {/* Row 3: Sectoral Breakdown (Registration Velocity moved to Registry tab) */}
      <SectoralBreakdown sectors={stats.sectors} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RegionalProgressGrid regions={stats.regions} />
        </div>
        <div>
          <DataHygienePanel duplicateBlocked={stats.global.duplicateBlocked} refreshTick={refreshTick} />
        </div>
      </div>

      {/* Bottom row: Pending Check-in + Data Hygiene + Active Alerts (moved to bottom of dashboard) */}
      <KpiCards global={stats.global} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted/60" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="h-72 animate-pulse rounded-xl bg-muted/60 xl:col-span-2" />
        <div className="h-72 animate-pulse rounded-xl bg-muted/60" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="h-96 animate-pulse rounded-xl bg-muted/60 xl:col-span-2" />
        <div className="h-96 animate-pulse rounded-xl bg-muted/60" />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/30 py-4">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-2 px-4 text-[11px] text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">INSKEN</span>
          <span>Operations &amp; Data Intelligence Agent · v1.0</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Cron: 00:00 GMT+8</span>
          <span>·</span>
          <span>WhatsApp Business API active</span>
          <span>·</span>
          <span>Webhook listeners online</span>
        </div>
      </div>
    </footer>
  );
}
