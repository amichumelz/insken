'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { StatsResponse } from '@/lib/types';
import { DashboardTopRow } from '@/components/dashboard/dashboard-top-row';
import { LiveAttendanceTracking } from '@/components/dashboard/live-attendance-tracking';
import { SectoralBreakdown } from '@/components/dashboard/sectoral-breakdown';
import { RegionalProgressGrid } from '@/components/dashboard/regional-progress-grid';
import { DataHygienePanel } from '@/components/dashboard/data-hygiene-panel';
import { KpiCards } from '@/components/dashboard/kpi-cards';
import { ParticipantsTable } from '@/components/dashboard/participants-table';
import { RegistrationTrend } from '@/components/dashboard/registration-trend';
import { TrainerPerformance } from '@/components/dashboard/trainer-performance';
import { ScreenQrModal } from '@/components/dashboard/screen-qr-modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  LayoutDashboard,
  UserPlus,
  QrCode,
  Users,
  RefreshCw,
  Sparkles,
  GraduationCap,
  ExternalLink,
  LogOut,
  LogIn,
  Loader2,
} from 'lucide-react';
import { useLanguage, LanguageToggle } from '@/lib/i18n';

type TabId = 'dashboard' | 'trainers' | 'registry';

export default function AdminPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState<TabId>('dashboard');
  const [refreshTick, setRefreshTick] = useState(0);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);

  const TABS: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'trainers',  label: t.navTrainers, icon: GraduationCap },
    { id: 'registry',  label: t.navRegistry, icon: Users },
  ];

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

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
        loadStats();
      } else {
        setCurrentUser(null);
        router.replace('/login');
      }
    } catch {
      setCurrentUser(null);
      router.replace('/login');
    } finally {
      setAuthLoading(false);
    }
  }, [router, loadStats]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      toast.success(lang === 'ms' ? 'Log keluar berjaya.' : 'Logged out successfully.');
      router.replace('/login');
    } catch {
      toast.error(lang === 'ms' ? 'Ralat semasa log keluar.' : 'Error during logout.');
    }
  };

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {lang === 'ms' ? 'Mengesahkan akses pentadbir...' : 'Verifying administrator access...'}
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background">
      <div>
        <Header
          onRefresh={loadStats}
          refreshing={loading}
          stats={stats}
          user={currentUser}
          onLogout={handleLogout}
        />

        {/* Sticky Tab Subnav */}
        <nav className="sticky top-[53px] sm:top-[57px] z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 overflow-x-auto px-3 sm:px-4 py-1.5 sm:py-2 scroll-styled">
            <div className="flex items-center gap-1 shrink-0">
              {TABS.map((tabItem) => {
                const Icon = tabItem.icon;
                const isActive = tab === tabItem.id;
                return (
                  <button
                    key={tabItem.id}
                    onClick={() => setTab(tabItem.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tabItem.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Event Day Tools: Hall Screen QR Display & Coach Portal Link */}
            <div className="flex items-center gap-1.5 shrink-0 border-l pl-2 sm:pl-3 ml-1">
              <ScreenQrModal />
              <Link
                href="/coach"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-md border border-indigo-300 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-900 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
              >
                <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
                <span>{lang === 'ms' ? 'Portal Jurulatih (Coach)' : 'Coach Portal'}</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </Link>
            </div>

            {/* Quick links to Public Portals */}
            <div className="flex items-center gap-1.5 shrink-0 border-l pl-2 sm:pl-3 ml-1">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
              >
                <UserPlus className="h-3.5 w-3.5 text-amber-600" />
                <span>{t.navPublicRegister}</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Admin Content */}
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 sm:px-4 py-4 sm:py-6">
          {!stats && loading ? (
            <DashboardSkeleton />
          ) : stats ? (
            <>
              {tab === 'dashboard' && <DashboardView stats={stats} refreshTick={refreshTick} />}
              {tab === 'trainers' && (
                <div className="space-y-4">
                  <SectionHeader
                    title={t.dashTrainerPerformance}
                    subtitle="Per-coach KPIs, performance trends, and Pre/Post-Session feedback."
                  />
                  <TrainerPerformance refreshTick={refreshTick} />
                </div>
              )}
              {tab === 'registry' && (
                <div className="space-y-4">
                  <SectionHeader
                    title={t.dashMasterRegistry}
                    subtitle="Live database view — IC is the unique primary key per PRD section 2."
                  />
                  <ParticipantsTable />
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
      </div>

      <Footer />
    </div>
  );
}

function Header({
  onRefresh,
  refreshing,
  stats,
  user,
  onLogout,
}: {
  onRefresh: () => void;
  refreshing: boolean;
  stats: StatsResponse | null;
  user: { id: string; name: string; email: string; role: string } | null;
  onLogout: () => void;
}) {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b bg-[#0B1F3A] text-white">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 sm:h-10 items-center justify-center rounded-lg bg-white p-1 px-1.5 shadow shrink-0">
            <img
              src="/insken-logo.png"
              alt="INSKEN Logo"
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 sm:gap-2 truncate">
              <h1 className="truncate text-xs sm:text-base font-semibold">
                INSKEN · Operations &amp; Intelligence
              </h1>
              <span className="hidden md:inline shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white/80">
                ASEAN MSME A.I.
              </span>
            </div>
            <p className="truncate text-[10px] sm:text-[11px] text-white/60 hidden sm:block">
              Autonomous operations agent · 5,000 participants across 5 regions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {stats && (
            <div className="hidden lg:flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-[#D4A017]" />
                <span className="font-semibold tabular-nums">{stats.global.total.toLocaleString()}</span>
                <span className="text-white/60">/ 5,000</span>
              </div>
              <span className="h-3 w-px bg-white/15" />
              <div className={cn('flex items-center gap-1', stats.global.criticalAlerts > 0 ? 'text-rose-300' : 'text-emerald-300')}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span className="text-white/80">
                  {stats.global.criticalAlerts > 0 ? `${stats.global.criticalAlerts} ${t.dashActiveAlerts}` : t.dashSystemsHealthy}
                </span>
              </div>
            </div>
          )}

          {/* Real D1 Connected indicator */}
          <div className="inline-flex items-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-[11px] sm:text-xs font-medium text-emerald-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold uppercase tracking-wider">Live DB</span>
          </div>

          <LanguageToggle />

          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="h-8 px-2 text-white hover:bg-white/10 hover:text-white"
            title={t.navRefresh}
          >
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
            <span className="ml-1 hidden sm:inline">{t.navRefresh}</span>
          </Button>

          {/* User Profile / Logout */}
          {user ? (
            <div className="flex items-center gap-1.5 border-l border-white/20 pl-2 ml-1">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-medium text-white truncate max-w-[110px]">{user.name}</span>
                <span className="text-[9px] text-[#D4A017] font-semibold">{user.role}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="h-8 border-white/20 bg-white/10 px-2 text-xs text-white hover:bg-rose-500/20 hover:border-rose-400 hover:text-rose-200"
                title={t.navLogout}
              >
                <LogOut className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline">{t.navLogout}</span>
              </Button>
            </div>
          ) : (
            <Link href="/login" className="border-l border-white/20 pl-2 ml-1">
              <Button
                size="sm"
                className="h-8 bg-[#D4A017] text-[#0B1F3A] hover:bg-[#F59E0B] font-semibold text-xs gap-1"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{t.navLogin}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-base sm:text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function DashboardView({ stats, refreshTick }: { stats: StatsResponse; refreshTick: number }) {
  return (
    <div className="space-y-6">
      {/* 1. Top KPI Row: Global KPI (2 cols) + 4 Live KPI Cards */}
      <DashboardTopRow global={stats.global} refreshTick={refreshTick} />

      {/* 2. Live Attendance Tracking Bar + Check-in Velocity Chart + Live Feed (Full Width) */}
      <LiveAttendanceTracking refreshTick={refreshTick} />

      {/* 3. Sectoral Breakdown (Full Width) */}
      <SectoralBreakdown sectors={stats.sectors} />

      {/* 4. 2-Column Row: Regional Attendance Overview (Left) + Data Hygiene Panel (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
        <RegionalProgressGrid regions={stats.regions} />
        <DataHygienePanel duplicateBlocked={stats.global.duplicateBlocked} refreshTick={refreshTick} />
      </div>

      {/* 5. Bottom 3 KPI Cards Row: Pending Check-in, Data Hygiene, Active Alerts */}
      <KpiCards global={stats.global} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <div className="h-28 rounded-lg bg-muted/40 md:col-span-2 lg:col-span-1 xl:col-span-2" />
        <div className="h-28 rounded-lg bg-muted/40" />
        <div className="h-28 rounded-lg bg-muted/40" />
        <div className="h-28 rounded-lg bg-muted/40" />
        <div className="h-28 rounded-lg bg-muted/40" />
      </div>
      <div className="h-80 rounded-lg bg-muted/40" />
      <div className="h-80 rounded-lg bg-muted/40" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-80 rounded-lg bg-muted/40" />
        <div className="h-80 rounded-lg bg-muted/40" />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full border-t bg-card py-3.5 text-xs text-muted-foreground mt-12">
      <div className="mx-auto flex max-w-[1600px] flex-col sm:flex-row items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2">
          <span className="rounded bg-[#1E3A8A] px-1.5 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
            INSKEN
          </span>
          <span className="text-[11px]">Operations &amp; Data Intelligence Agent · v1.0</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground/80">
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
