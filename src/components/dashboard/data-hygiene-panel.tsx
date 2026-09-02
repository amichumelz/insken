'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface AuditEntry {
  id: string;
  action: string;
  participant: string | null;
  icNumber: string | null;
  detail: string;
  createdAt: string;
}

export function DataHygienePanel({
  duplicateBlocked,
  refreshTick = 0,
}: {
  duplicateBlocked: number;
  refreshTick?: number;
}) {
  const { t, lang } = useLanguage();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/audit?action=DUPLICATE_BLOCKED&limit=20', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) {
          setEntries(data.logs ?? []);
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

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Data Hygiene Panel
          </CardTitle>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-primary">
            {duplicateBlocked ?? 0} {lang === 'ms' ? 'disekat' : 'blocked'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {lang === 'ms'
            ? 'Perlindungan penduaan No. IC secara langsung — penguatkuasaan kunci unik utama'
            : 'Live IC duplicate protection — primary key enforcement'}
        </p>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-5">
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
              {lang === 'ms' ? 'Integriti data dalam keadaan optimum' : 'Zero data hygiene issues'}
            </span>
            <p className="text-muted-foreground mt-0.5">
              {lang === 'ms'
                ? `Semua ${duplicateBlocked ?? 0} cubaan pendaftaran No. IC bertindih telah disekat secara automatik.`
                : `All ${duplicateBlocked ?? 0} duplicate IC attempts auto-rejected.`}
            </p>
          </div>
        </div>

        <div className="max-h-[220px] space-y-1.5 overflow-y-auto scroll-styled pr-1">
          {loading ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              {lang === 'ms' ? 'Memuatkan suapan audit...' : 'Loading audit feed…'}
            </div>
          ) : entries.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              {lang === 'ms' ? 'Tiada rekod cubaan penduaan dikesan.' : 'No duplicate attempts logged.'}
            </div>
          ) : (
            entries.map((e) => (
              <div
                key={e.id}
                className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/30 p-2 text-xs"
              >
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground">
                    {e.participant ?? 'Unknown'}{' '}
                    <span className="ml-1 font-mono text-[10px] text-muted-foreground">{e.icNumber}</span>
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{e.detail}</div>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(e.createdAt).toLocaleString('en-MY', { hour12: false })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
