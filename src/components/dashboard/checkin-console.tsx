'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  QrCode,
  ScanLine,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  MapPin,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Participant } from '@/lib/types';

type CheckinResult =
  | { ok: true; participant: Participant; message: string }
  | { ok: false; alreadyCheckedIn?: boolean; participant?: Participant; message: string; error?: string };

export function CheckinConsole() {
  const [mode, setMode] = useState<'Physical' | 'Online'>('Physical');
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CheckinResult | null>(null);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Enter a Participant ID or IC Number');
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const payload: { participantId?: string; icNumber?: string; mode: 'Physical' | 'Online' } = { mode };
      // Heuristic: ASEAN-XXXXX → participantId, otherwise treat as IC
      if (query.startsWith('ASEAN-')) payload.participantId = query.trim();
      else payload.icNumber = query.trim();

      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as CheckinResult;
      setResult(data);
      if (data.ok) {
        toast.success(data.message);
        setQuery('');
      } else if (data.alreadyCheckedIn) {
        toast.warning(data.message);
      } else {
        toast.error(data.message ?? data.error ?? 'Check-in failed');
      }
    } catch {
      toast.error('Network error — please retry');
    } finally {
      setSubmitting(false);
    }
  };

  const quickLookup = (prefix: string) => {
    setQuery(prefix);
    setResult(null);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ScanLine className="h-4 w-4 text-primary" />
            Attendance Check-in (Phase 3)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Scan QR or look up by IC — agent validates Participant_ID and stamps attendance.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckin} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Check-in Mode</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={mode === 'Physical' ? 'default' : 'outline'}
                  onClick={() => setMode('Physical')}
                  className="h-9"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Physical
                </Button>
                <Button
                  type="button"
                  variant={mode === 'Online' ? 'default' : 'outline'}
                  onClick={() => setMode('Online')}
                  className="h-9"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Online
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="query" className="text-xs font-medium">
                QR / Participant ID / IC Number
              </Label>
              <Input
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ASEAN-00001 or 900101-14-1234-5"
                className="font-mono text-sm"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                Live validation against master registry — primary key enforcement.
              </p>
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating…
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  Confirm Check-in
                </>
              )}
            </Button>

            <div className="pt-2">
              <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Quick demo lookup
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['ASEAN-00001', 'ASEAN-00100', 'ASEAN-01000', 'ASEAN-02000'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => quickLookup(p)}
                    className="rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-[10px] text-foreground/70 transition-colors hover:border-primary hover:text-primary"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" />
            Participant Lookup Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!result ? (
            <div className="flex h-[420px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
              <QrCode className="h-10 w-10 text-muted-foreground/60" />
              <div>
                <div className="text-sm font-medium">Awaiting check-in</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  On event day, scan the participant QR or paste their IC to stamp attendance with timestamp.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-4',
                  result.ok
                    ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                    : result.alreadyCheckedIn
                      ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
                      : 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30',
                )}
              >
                {result.ok ? (
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-rose-600" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold">
                    {result.ok ? 'Check-in Confirmed' : result.alreadyCheckedIn ? 'Already Checked In' : 'Check-in Failed'}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{result.message}</p>
                </div>
              </div>

              {result.participant && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Participant Record
                    </span>
                    <span
                      className={cn(
                        'rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        result.participant.status.startsWith('Attended')
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
                      )}
                    >
                      {result.participant.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                    <Row label="Participant ID" value={result.participant.participantId} mono />
                    <Row label="Name" value={result.participant.name} />
                    <Row label="IC Number" value={result.participant.icNumber} mono />
                    <Row label="Region" value={result.participant.region} />
                    <Row label="Sector" value={result.participant.sector} />
                    <Row label="Final Mode" value={result.participant.finalMode.replace(/_/g, ' ')} />
                    {result.participant.checkInAt && (
                      <Row
                        label="Check-in Time"
                        value={new Date(result.participant.checkInAt).toLocaleString('en-MY', { hour12: false })}
                        mono
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded bg-muted/30 px-2 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium', mono && 'font-mono text-[11px]')}>{value}</span>
    </div>
  );
}
