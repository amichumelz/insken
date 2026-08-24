'use client';

import { useCallback, useEffect, useState } from 'react';
import { Recommendation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const PRIORITY_META = {
  high: {
    label: 'High Priority',
    tone: 'border-l-rose-500 bg-rose-50/60 dark:bg-rose-950/20',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  },
  medium: {
    label: 'Medium Priority',
    tone: 'border-l-amber-500 bg-amber-50/60 dark:bg-amber-950/20',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  },
  low: {
    label: 'Low Priority',
    tone: 'border-l-sky-500 bg-sky-50/60 dark:bg-sky-950/20',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  },
} as const;

export function IntelligenceRecommendations() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recommendations', { cache: 'no-store' });
      const data = await res.json();
      setRecs(data.recommendations ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/recommendations', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) {
          setRecs(data.recommendations ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Intelligence Recommendations
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={load}
            disabled={loading}
            className="h-7 px-2 text-xs"
          >
            <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
            <span className="ml-1">Refresh</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          AI-driven marketing &amp; capacity shift advice
        </p>
      </CardHeader>
      <CardContent>
        {recs.length === 0 && !loading ? (
          <div className="flex h-[160px] flex-col items-center justify-center gap-2 text-center">
            <Lightbulb className="h-6 w-6 text-emerald-500" />
            <p className="text-xs text-muted-foreground">
              No actionable recommendations — all regions healthy.
            </p>
          </div>
        ) : (
          <div className="max-h-[400px] space-y-2.5 overflow-y-auto scroll-styled pr-1">
            {recs.map((r) => {
              const meta = PRIORITY_META[r.priority];
              return (
                <div
                  key={r.id}
                  className={cn(
                    'rounded-lg border border-l-4 p-3 transition-all hover:shadow-sm',
                    meta.tone,
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide', meta.badge)}>
                      {meta.label}
                    </span>
                    {r.region && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        {r.region}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm font-semibold leading-snug">{r.title}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{r.detail}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <ArrowRight className="h-3 w-3 text-primary" />
                    {r.action}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
