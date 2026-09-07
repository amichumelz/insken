'use client';

import { useEffect, useState } from 'react';
import { Trainer, TrainerFeedback } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from 'recharts';
import {
  Presentation,
  Users,
  CheckCircle2,
  Star,
  TrendingUp,
  Award,
  MessageSquare,
  Quote,
  Calendar,
  RefreshCw,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportTrainerPerformanceCsv } from '@/lib/export-utils';

const fmt = (n: number) => n.toLocaleString('en-US');

export function TrainerPerformance({ refreshTick = 0 }: { refreshTick?: number }) {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [activeId, setActiveId] = useState<string>('coach-mohsin');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/trainers', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) {
          setTrainers(data.trainers ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  if (loading || trainers.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading trainer performance…
      </div>
    );
  }

  const active = trainers.find((t) => t.id === activeId) ?? trainers[0];
  const allTestimonies = [...(active.postFeedback || []), ...(active.preFeedback || [])];

  return (
    <div className="space-y-6">
      {/* Coach Toggle */}
      <CoachToggle
        trainers={trainers}
        activeId={activeId}
        onSelect={setActiveId}
      />

      {/* Coach Profile Header with Export Report Button */}
      <CoachProfileHeader trainer={active} />

      {/* KPI Cards (4 Cards: Sessions, Participants, Attendance, Completion) */}
      <TrainerKpiCards kpi={active.kpi} />

      {/* Performance Trend */}
      <TrainerPerformanceChart performance={active.performance} />

      {/* Unified Single Section: Participant Testimony */}
      <ParticipantTestimonyPanel testimonies={allTestimonies} trainerName={active.name} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Coach Toggle — buttons with active highlighted
// ─────────────────────────────────────────────────────────────────────

function CoachToggle({
  trainers,
  activeId,
  onSelect,
}: {
  trainers: Trainer[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-sm">
      <span className="ml-1 mr-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Select Coach:
      </span>
      {trainers.map((t) => {
        const isActive = t.id === activeId;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={cn(
              'group flex flex-1 items-center gap-2.5 rounded-lg border px-3.5 py-2 text-left transition-all sm:flex-none',
              isActive
                ? 'border-primary bg-primary text-primary-foreground shadow-md'
                : 'border-border bg-background hover:border-primary/40 hover:bg-muted/40',
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white',
                t.color,
              )}
            >
              {t.initials}
            </div>
            <div className="min-w-0">
              <div
                className={cn(
                  'truncate text-xs font-bold',
                  isActive ? 'text-primary-foreground' : 'text-foreground',
                )}
              >
                {t.name}
              </div>
              <div
                className={cn(
                  'truncate text-[10px]',
                  isActive ? 'text-primary-foreground/80' : 'text-muted-foreground',
                )}
              >
                {t.role}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Coach Profile Header — name, role, specialty, Avg Rating & Export
// ─────────────────────────────────────────────────────────────────────

function CoachProfileHeader({ trainer }: { trainer: Trainer }) {
  return (
    <Card className="relative overflow-hidden border shadow-sm">
      <div className="absolute inset-0 bg-navy-gradient pointer-events-none" />
      <CardContent className="relative flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:gap-4">
        <div
          className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-base font-bold text-white shadow-md',
            trainer.color,
          )}
        >
          {trainer.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">{trainer.name}</h2>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Lead Coach
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {trainer.role} · {trainer.specialty}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" /> Assigned Programme: ASEAN MSMEs AI Skills Training Programme
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50/60 px-3 py-2 dark:border-amber-900/60 dark:bg-amber-950/20">
            <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Avg Rating</div>
              <div className="text-base font-bold tabular-nums">
                {trainer.kpi.avgRating > 0 ? trainer.kpi.avgRating.toFixed(1) : '—'}
              </div>
            </div>
          </div>

          <Button
            onClick={() => exportTrainerPerformanceCsv(trainer)}
            size="sm"
            className="h-10 bg-[#0B1F3A] hover:bg-[#112D55] text-white text-xs font-semibold gap-1.5 shadow-sm px-3.5"
            title={`Export ${trainer.name} Evaluation Report`}
          >
            <Download className="h-3.5 w-3.5 text-[#D4A017]" />
            <span>Export Report (CSV)</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Trainer KPI Cards (4 Balanced Cards)
// ─────────────────────────────────────────────────────────────────────

function TrainerKpiCards({ kpi }: { kpi: Trainer['kpi'] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
      <Card className="relative overflow-hidden p-4 border shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Presentation className="h-3.5 w-3.5 text-indigo-600" />
              Sessions Conducted
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold tabular-nums text-foreground">
              {kpi.sessionsConducted}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">across regional training halls</div>
          </div>
          <div className="shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 p-2">
            <Presentation className="h-5 w-5 text-indigo-600" />
          </div>
        </div>
      </Card>

      <Card className="p-4 border shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Participants Trained
          </div>
          <div className="rounded-lg bg-sky-500/10 p-1.5">
            <Users className="h-4 w-4 text-sky-600" />
          </div>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-bold tabular-nums text-foreground">{fmt(kpi.totalParticipants)}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">MSME business owners</div>
      </Card>

      <Card className="p-4 border shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Attendance Rate
          </div>
          <div className="rounded-lg bg-emerald-500/10 p-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-bold tabular-nums text-emerald-600">
          {kpi.attendanceRate}%
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">average session turnout</div>
      </Card>

      <Card className="p-4 border shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Completion Rate
          </div>
          <div className="rounded-lg bg-amber-500/10 p-1.5">
            <Award className="h-4 w-4 text-amber-600" />
          </div>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-bold tabular-nums text-amber-600">
          {kpi.completionRate}%
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">finished full 4-module syllabus</div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Performance Trend Chart — composed chart (bars + line)
// ─────────────────────────────────────────────────────────────────────

function TrainerPerformanceChart({ performance }: { performance: Trainer['performance'] }) {
  const totalSessions = performance.reduce((s, p) => s + p.sessions, 0);
  const activeMonths = performance.filter((p) => p.sessions > 0);
  const avgAttendance = activeMonths.length > 0
    ? Math.round(activeMonths.reduce((s, p) => s + p.attendance, 0) / activeMonths.length)
    : 0;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              12-Month Performance Trend
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Monthly tracking of sessions conducted, attendance percentage & evaluation rating.
            </p>
          </div>
          <div className="flex items-center gap-4 self-end sm:self-auto text-xs">
            <span className="text-muted-foreground">
              Total Sessions: <strong className="text-foreground">{totalSessions}</strong>
            </span>
            <span className="text-muted-foreground">
              Avg Attendance: <strong className="text-emerald-600">{avgAttendance}%</strong>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-5">
        <div className="h-[260px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={performance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.12)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 5]} tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(11, 31, 58, 0.96)',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 12,
                  padding: '8px 12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar yAxisId="left" dataKey="sessions" name="Sessions" fill="#1E3A8A" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Line yAxisId="left" type="monotone" dataKey="attendance" name="Attendance %" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: '#10B981' }} activeDot={{ r: 5 }} />
              <Line yAxisId="right" type="monotone" dataKey="rating" name="Rating (out of 5)" stroke="#D4A017" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3, fill: '#D4A017' }} activeDot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Single Unified Section: Participant Testimony Panel
// ─────────────────────────────────────────────────────────────────────

function ParticipantTestimonyPanel({
  testimonies,
  trainerName,
}: {
  testimonies: TrainerFeedback[];
  trainerName: string;
}) {
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState('all');

  const filtered = testimonies.filter((t) => {
    const matchesSearch =
      t.participantName.toLowerCase().includes(search.toLowerCase()) ||
      t.participantId.toLowerCase().includes(search.toLowerCase()) ||
      t.comment.toLowerCase().includes(search.toLowerCase()) ||
      t.session.toLowerCase().includes(search.toLowerCase());

    const matchesRating = filterRating === 'all' || t.rating === parseInt(filterRating, 10);
    return matchesSearch && matchesRating;
  });

  const avgRating =
    testimonies.length > 0
      ? (testimonies.reduce((s, f) => s + f.rating, 0) / testimonies.length).toFixed(1)
      : '5.0';

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3 px-4 sm:px-6 pt-5 bg-muted/20 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Quote className="h-5 w-5 text-[#D4A017]" />
              <CardTitle className="text-base sm:text-lg font-bold">
                Participant Testimony
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-semibold bg-background">
                {testimonies.length} Testimonials
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Direct participant reviews, ratings & feedback from the ASEAN MSMEs AI Skills Training Programme for {trainerName}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>Avg Rating: {avgRating} / 5.0</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2">
          <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
            <Input
              placeholder="Search testimony or participant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">⭐⭐⭐⭐⭐ (5 Star)</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ (4 Star)</SelectItem>
                <SelectItem value="3">⭐⭐⭐ (3 Star)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No participant testimonies match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filtered.map((f) => (
              <TestimonyCard key={f.id} testimony={f} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TestimonyCard({ testimony }: { testimony: TrainerFeedback }) {
  return (
    <div className="rounded-xl border bg-card p-4 transition-all hover:shadow-md flex flex-col justify-between space-y-3 relative overflow-hidden group border-border hover:border-amber-300">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3.5 w-3.5',
                  i < testimony.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-muted text-muted',
                )}
              />
            ))}
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            {new Date(testimony.submittedAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        <p className="text-xs text-foreground/90 leading-relaxed italic">
          "{testimony.comment}"
        </p>
      </div>

      <div className="pt-2.5 border-t border-border/60 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="font-semibold text-xs text-foreground truncate">
            {testimony.participantName}
          </div>
          <Badge variant="outline" className="font-mono text-[10px] shrink-0 text-primary">
            {testimony.participantId}
          </Badge>
        </div>
        <div className="text-[10px] text-muted-foreground truncate">
          {testimony.session}
        </div>
      </div>
    </div>
  );
}
