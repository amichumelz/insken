'use client';

import { RegionStat } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle, TrendingDown } from 'lucide-react';

const STATE_META: Record<
  RegionStat['state'],
  { label: string; tone: string; icon: React.ElementType }
> = {
  Normal: {
    label: 'Normal',
    tone: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  Warn: {
    label: '80% Warn',
    tone: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    icon: AlertTriangle,
  },
  Full: {
    label: 'Full',
    tone: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    icon: XCircle,
  },
  LowVelocity: {
    label: 'Low Velocity',
    tone: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    icon: TrendingDown,
  },
};

export function RegionStateBadge({ state, size = 'sm' }: { state: RegionStat['state']; size?: 'sm' | 'md' }) {
  const meta = STATE_META[state];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        meta.tone,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {meta.label}
    </span>
  );
}

export { STATE_META };
