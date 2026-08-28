'use client';

import { RegionStat } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Circle, XCircle } from 'lucide-react';

/**
 * Neutral status badge — shows only Ongoing / Closed with no percentage reference.
 * The underlying state (Normal / Warn / LowVelocity / Full) is still computed from
 * capacity rules in the API, but the visual label is intentionally neutral:
 *   - Full         → "Closed"  (red dot)
 *   - Anything else → "Ongoing" (emerald dot)
 */
const STATE_META: Record<
  RegionStat['state'],
  { label: string; tone: string; icon: React.ElementType; dotTone: string }
> = {
  Normal: {
    label: 'Ongoing',
    tone: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    icon: Circle,
    dotTone: 'bg-emerald-500',
  },
  Warn: {
    label: 'Ongoing',
    tone: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    icon: Circle,
    dotTone: 'bg-emerald-500',
  },
  LowVelocity: {
    label: 'Ongoing',
    tone: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    icon: Circle,
    dotTone: 'bg-emerald-500',
  },
  Full: {
    label: 'Closed',
    tone: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    icon: XCircle,
    dotTone: 'bg-rose-500',
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
