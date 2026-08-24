'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertItem } from '@/lib/types';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Check,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SEVERITY_META = {
  critical: {
    label: 'Critical',
    icon: AlertOctagon,
    tone: 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30',
    iconTone: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  },
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    tone: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30',
    iconTone: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  },
  info: {
    label: 'Info',
    icon: Info,
    tone: 'border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/30',
    iconTone: 'text-sky-600',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  },
  success: {
    label: 'Success',
    icon: CheckCircle2,
    tone: 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30',
    iconTone: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
} as const;

export function AlertsPanel({ onlyUnresolved = false }: { onlyUnresolved?: boolean }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(!onlyUnresolved);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = showResolved ? '/api/alerts' : '/api/alerts?unresolved=1';
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      setAlerts(data.alerts ?? []);
    } finally {
      setLoading(false);
    }
  }, [showResolved]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = showResolved ? '/api/alerts' : '/api/alerts?unresolved=1';
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) {
          setAlerts(data.alerts ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showResolved]);

  const resolve = async (id: string) => {
    const res = await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, resolved: true }),
    });
    if (res.ok) {
      toast.success('Alert marked as resolved');
      load();
    }
  };

  const counts = alerts.reduce(
    (acc, a) => {
      acc[a.severity] += 1;
      return acc;
    },
    { critical: 0, warning: 0, info: 0, success: 0 } as Record<string, number>,
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-primary" />
            Automated Alert System
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="h-7 px-2 text-xs">
            <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
            <span className="ml-1">Refresh</span>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {(Object.keys(SEVERITY_META) as Array<keyof typeof SEVERITY_META>).map((sev) => {
            const meta = SEVERITY_META[sev];
            return (
              <span
                key={sev}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  meta.badge,
                )}
              >
                {counts[sev] ?? 0} {meta.label}
              </span>
            );
          })}
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant={!showResolved ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowResolved(false)}
              className="h-7 px-2 text-xs"
            >
              Unresolved
            </Button>
            <Button
              variant={showResolved ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowResolved(true)}
              className="h-7 px-2 text-xs"
            >
              All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            <p className="text-xs text-muted-foreground">No alerts in this view.</p>
          </div>
        ) : (
          <div className="max-h-[500px] space-y-2 overflow-y-auto scroll-styled pr-1">
            {alerts.map((a) => {
              const meta = SEVERITY_META[a.severity as keyof typeof SEVERITY_META] ?? SEVERITY_META.info;
              const Icon = meta.icon;
              return (
                <div
                  key={a.id}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3 transition-all',
                    meta.tone,
                    a.resolved && 'opacity-60',
                  )}
                >
                  <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', meta.iconTone)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{a.type.replace(/_/g, ' ')}</span>
                      {a.region && (
                        <span className="inline-flex items-center gap-1 rounded bg-foreground/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/70">
                          <MapPin className="h-2.5 w-2.5" />
                          {a.region}
                        </span>
                      )}
                      {a.resolved && (
                        <Badge variant="outline" className="h-4 px-1 text-[10px]">RESOLVED</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-foreground/80">{a.message}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                      {new Date(a.triggeredAt).toLocaleString('en-MY', { hour12: false })}
                    </p>
                  </div>
                  {!a.resolved && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resolve(a.id)}
                      className="h-6 shrink-0 px-2 text-[11px]"
                    >
                      <Check className="h-3 w-3" /> Resolve
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
