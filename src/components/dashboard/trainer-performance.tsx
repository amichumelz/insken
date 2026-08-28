'use client';

import { useEffect, useState } from 'react';
import { Trainer, TrainerFeedback } from '@/lib/types';
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
  Line,
  LineChart,
  ComposedChart,
} from 'recharts';
import {
  Presentation,
  Users,
  CheckCircle2,
  Star,
  Clock,
  TrendingUp,
  Award,
  MessageSquare,
  Quote,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fmt = (n: number) => n.toLocaleString('en-US');

export function TrainerPerformance({ refreshTick = 0 }: { refreshTick?: number }) {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [activeId, setActiveId] = useState<string>('coach-a');
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

  return (
    <div className="space-y-4">
      {/* Coach Toggle */}
      <CoachToggle
        trainers={trainers}
        activeId={activeId}
        onSelect={setActiveId}
      />

      {/* Coach Profile Header */}
      <CoachProfileHeader trainer={active} />

      {/* KPI Cards */}
      <TrainerKpiCards kpi={active.kpi} />

      {/* Performance Trend */}
      <TrainerPerformanceChart performance={active.performance} />

      {/* Pre / Post Feedback — side-by-side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FeedbackPanel
          title="Pre-Session Feedback"
          subtitle="Participant expectations & onboarding experience"
          feedback={active.preFeedback}
          tone="pre"
        />
        <FeedbackPanel
          title="Post-Session Feedback"
          subtitle="Outcomes, learnings & satisfaction after sessions"
          feedback={active.postFeedback}
          tone="post"
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Coach Toggle — two buttons with active highlighted
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
      <span className="ml-1 mr-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Select Coach
      </span>
      {trainers.map((t) => {
        const isActive = t.id === activeId;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={cn(
              'group flex flex-1 items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-all sm:flex-none',
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
                  'truncate text-sm font-semibold',
                  isActive ? 'text-primary-foreground' : 'text-foreground',
                )}
              >
                {t.id === 'coach-a' ? 'Coach A' : 'Coach B'}
              </div>
              <div
                className={cn(
                  'truncate text-[11px]',
                  isActive ? 'text-primary-foreground/80' : 'text-muted-foreground',
                )}
              >
                {t.name}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Coach Profile Header — name, role, specialty
// ─────────────────────────────────────────────────────────────────────

function CoachProfileHeader({ trainer }: { trainer: Trainer }) {
  return (
    <Card className="relative overflow-hidden">
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
            <h2 className="text-lg font-semibold tracking-tight">{trainer.name}</h2>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              {trainer.id === 'coach-a' ? 'Coach A' : 'Coach B'}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {trainer.role} · {trainer.specialty}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" /> Joined{' '}
            {new Date(trainer.joinedAt).toLocaleDateString('en-MY', {
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50/60 px-3 py-2 dark:border-amber-900/60 dark:bg-amber-950/20">
          <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Rating</div>
            <div className="text-base font-bold tabular-nums">
              {trainer.kpi.avgRating > 0 ? trainer.kpi.avgRating.toFixed(1) : '—'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Trainer KPI Cards
// ─────────────────────────────────────────────────────────────────────

function TrainerKpiCards({ kpi }: { kpi: Trainer['kpi'] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <Card className="relative overflow-hidden p-4 md:col-span-2 lg:col-span-1 xl:col-span-2">
        <div className="absolute inset-0 bg-navy-gradient pointer-events-none" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Presentation className="h-3.5 w-3.5" />
              Sessions Conducted
            </div>
            <div className="mt-2 text-3xl font-bold tabular-nums">{kpi.sessionsConducted}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">across 12-month period</div>
          </div>
          <div className="shrink-0 rounded-lg bg-primary/10 p-2">
            <Presentation className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Participants
          </div>
          <div className="rounded-lg bg-sky-500/10 p-1.5">
            <Users className="h-4 w-4 text-sky-600" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold tabular-nums">{fmt(kpi.totalParticipants)}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">total trained</div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Attendance
          </div>
          <div className="rounded-lg bg-emerald-500/10 p-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">
          {kpi.attendanceRate}%
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">avg session turnout</div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Completion
          </div>
          <div className="rounded-lg bg-amber-500/10 p-1.5">
            <Award className="h-4 w-4 text-amber-600" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold tabular-nums text-amber-600">
          {kpi.completionRate}%
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">finished all modules</div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Avg Rating
          </div>
          <div className="rounded-lg bg-rose-500/10 p-1.5">
            <Star className="h-4 w-4 fill-rose-500 text-rose-500" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-bold tabular-nums">
            {kpi.avgRating > 0 ? kpi.avgRating.toFixed(1) : '—'}
          </span>
          <span className="text-xs text-muted-foreground">/ 5.0</span>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">participant satisfaction</div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Response Time
          </div>
          <div className="rounded-lg bg-violet-500/10 p-1.5">
            <Clock className="h-4 w-4 text-violet-600" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-bold tabular-nums">{kpi.responseTimeMins}</span>
          <span className="text-xs text-muted-foreground">min</span>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">avg reply to queries</div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Performance Trend Chart — composed chart (bars + line)
// ─────────────────────────────────────────────────────────────────────

function TrainerPerformanceChart({ performance }: { performance: Trainer['performance'] }) {
  const totalSessions = performance.reduce((s, p) => s + p.sessions, 0);
  const avgAttendance = Math.round(
    performance.reduce((s, p) => s + p.attendance, 0) / performance.length,
  );
  const ratingSum = performance.reduce((s, p) => s + p.rating, 0);
  const avgRating = ratingSum > 0
    ? (ratingSum / performance.length).toFixed(2)
    : '—';

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Performance Over Time
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Sessions:</span>{' '}
              <span className="font-semibold tabular-nums">{totalSessions}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg Attendance:</span>{' '}
              <span className="font-semibold tabular-nums text-emerald-600">{avgAttendance}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg Rating:</span>{' '}
              <span className="font-semibold tabular-nums text-amber-600">{avgRating}/5</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Monthly sessions conducted, attendance %, and participant rating
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={performance} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="sessionsBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0.55} />
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
                yAxisId="left"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                width={36}
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
                formatter={(value: number, name: string) => {
                  if (name === 'sessions') return [`${value} sessions`, 'Sessions'];
                  if (name === 'attendance')
                    return [`${value}%`, 'Attendance'];
                  return [`${value}/5`, 'Rating'];
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
                formatter={(value) => {
                  if (value === 'sessions') return 'Sessions';
                  if (value === 'attendance') return 'Attendance %';
                  return 'Rating';
                }}
              />
              <Bar yAxisId="left" dataKey="sessions" fill="url(#sessionsBar)" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="attendance"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 3, fill: '#10B981' }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rating"
                stroke="#D4A017"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={{ r: 3, fill: '#D4A017' }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Feedback Panel — Pre or Post
// ─────────────────────────────────────────────────────────────────────

function FeedbackPanel({
  title,
  subtitle,
  feedback,
  tone,
}: {
  title: string;
  subtitle: string;
  feedback: TrainerFeedback[];
  tone: 'pre' | 'post';
}) {
  const avgRating =
    feedback.length > 0
      ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1)
      : '—';

  const toneMeta =
    tone === 'pre'
      ? {
          icon: MessageSquare,
          iconTone: 'text-sky-600',
          headerTone: 'bg-sky-50 dark:bg-sky-950/20',
          badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
          barTone: 'bg-sky-500',
        }
      : {
          icon: Quote,
          iconTone: 'text-emerald-600',
          headerTone: 'bg-emerald-50 dark:bg-emerald-950/20',
          badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
          barTone: 'bg-emerald-500',
        };

  const Icon = toneMeta.icon;

  return (
    <Card className="h-full">
      <CardHeader className={cn('pb-3', toneMeta.headerTone)}>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className={cn('h-4 w-4', toneMeta.iconTone)} />
            {title}
          </CardTitle>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              toneMeta.badge,
            )}
          >
            <Star className="h-2.5 w-2.5 fill-current" />
            {avgRating} / 5
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        {feedback.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">No feedback collected yet.</div>
        ) : (
          <div className="max-h-[460px] space-y-3 overflow-y-auto scroll-styled pr-1">
            {feedback.map((f) => (
              <FeedbackItem key={f.id} feedback={f} barTone={toneMeta.barTone} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FeedbackItem({
  feedback,
  barTone,
}: {
  feedback: TrainerFeedback;
  barTone: string;
}) {
  return (
    <div className={cn('rounded-lg border border-border/60 border-l-4 bg-muted/30 p-3')}>
      <div
        className={cn('mb-2 h-0.5 w-full rounded-full', barTone)}
        style={{ display: 'none' }}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{feedback.participantName}</div>
          <div className="truncate font-mono text-[10px] text-muted-foreground">
            {feedback.participantId}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-3 w-3',
                i < feedback.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-muted text-muted',
              )}
            />
          ))}
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Presentation className="h-3 w-3" />
        {feedback.session}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-foreground/80">{feedback.comment}</p>
      <div className="mt-2 font-mono text-[10px] text-muted-foreground">
        {new Date(feedback.submittedAt).toLocaleString('en-MY', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })}
      </div>
    </div>
  );
}
