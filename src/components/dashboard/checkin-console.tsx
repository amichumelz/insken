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
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Participant } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';

type CheckinResult =
  | { ok: true; participant: Participant; message: string }
  | { ok: false; alreadyCheckedIn?: boolean; participant?: Participant; message: string; error?: string };

export function CheckinConsole() {
  const { t, lang } = useLanguage();
  const [mode, setMode] = useState<'Physical' | 'Online'>('Physical');
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CheckinResult | null>(null);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error(lang === 'ms' ? 'Sila masukkan ID Peserta atau No. Kad Pengenalan' : 'Enter a Participant ID or IC Number');
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const payload: { participantId?: string; icNumber?: string; mode: 'Physical' | 'Online' } = { mode };
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
        toast.success(lang === 'ms' ? 'Kehadiran berjaya disahkan!' : data.message);
        setQuery('');
      } else if (data.alreadyCheckedIn) {
        toast.warning(lang === 'ms' ? 'Peserta ini sudah membuat semakan kehadiran.' : data.message);
      } else {
        toast.error(data.message ?? data.error ?? (lang === 'ms' ? 'Pengesahan kehadiran gagal.' : 'Check-in failed'));
      }
    } catch {
      toast.error(lang === 'ms' ? 'Ralat sambungan rangkaian.' : 'Network error — please retry');
    } finally {
      setSubmitting(false);
    }
  };

  const quickLookup = (prefix: string) => {
    setQuery(prefix);
    setResult(null);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-5">
      {/* Left Input Form */}
      <Card className="lg:col-span-2 border shadow-sm">
        <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ScanLine className="h-5 w-5 text-emerald-600" />
            {t.checkinCounterTitle}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {lang === 'ms'
              ? 'Imbas QR atau masukkan No. IC untuk mengesahkan kehadiran.'
              : 'Scan QR or look up by IC — agent validates and records attendance.'}
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <form onSubmit={handleCheckin} className="space-y-4">
            {/* Mode Select Buttons */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t.checkinModeLabel}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={mode === 'Physical' ? 'default' : 'outline'}
                  onClick={() => setMode('Physical')}
                  className={cn(
                    'h-10 text-xs sm:text-sm font-semibold gap-1.5',
                    mode === 'Physical' ? 'bg-[#0B1F3A] text-white' : ''
                  )}
                >
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  {t.checkinPhysicalBtn}
                </Button>
                <Button
                  type="button"
                  variant={mode === 'Online' ? 'default' : 'outline'}
                  onClick={() => setMode('Online')}
                  className={cn(
                    'h-10 text-xs sm:text-sm font-semibold gap-1.5',
                    mode === 'Online' ? 'bg-[#0B1F3A] text-white' : ''
                  )}
                >
                  <Calendar className="h-4 w-4 text-sky-500" />
                  {t.checkinOnlineBtn}
                </Button>
              </div>
            </div>

            {/* Input field */}
            <div className="space-y-1.5">
              <Label htmlFor="query" className="text-xs font-semibold">
                {t.checkinInputLabel}
              </Label>
              <Input
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.checkinInputPlaceholder}
                className="font-mono text-sm h-11"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                {t.checkinInputHelp}
              </p>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 text-sm font-semibold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.checkinVerifying}
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  {t.checkinSubmitBtn}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Right Result View */}
      <Card className="lg:col-span-3 border shadow-sm">
        <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <User className="h-5 w-5 text-primary" />
            {lang === 'ms' ? 'Keputusan Semakan Kehadiran' : 'Check-in Verification Result'}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          {!result ? (
            <div className="flex h-[280px] sm:h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-semibold">
                  {lang === 'ms' ? 'Menunggu Imbasan / Semakan' : 'Awaiting Check-in'}
                </div>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  {lang === 'ms'
                    ? 'Imbas kod QR pada Pas Digital peserta atau masukkan No. IC untuk mengesahkan kehadiran.'
                    : 'Scan participant QR pass or enter IC to stamp attendance timestamp.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-4 shadow-sm',
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
                  <div className="text-base font-bold text-foreground">
                    {result.ok
                      ? t.checkinSuccessTitle
                      : result.alreadyCheckedIn
                        ? t.checkinAlreadyTitle
                        : t.checkinNotFoundTitle}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{result.message}</p>
                </div>
              </div>

              {result.participant && (
                <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {lang === 'ms' ? 'Maklumat Peserta' : 'Participant Details'}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                        result.participant.status.startsWith('Attended')
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                      )}
                    >
                      {result.participant.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <Row label={t.regParticipantId} value={result.participant.participantId} mono />
                    <Row label={t.regFullName} value={result.participant.name} />
                    <Row label={t.regIcNumber} value={result.participant.icNumber} mono />
                    <Row label={t.checkinRegion} value={result.participant.region} />
                    <Row label={t.checkinSector} value={result.participant.sector} />
                    <Row label={t.regAssignedMode} value={result.participant.finalMode.replace('Registered_', '')} />
                    {result.participant.checkInAt && (
                      <div className="sm:col-span-2">
                        <Row
                          label={t.checkinTime}
                          value={new Date(result.participant.checkInAt).toLocaleString(lang === 'ms' ? 'ms-MY' : 'en-US', { hour12: true })}
                          mono
                        />
                      </div>
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
    <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2">
      <span className="text-muted-foreground text-[11px]">{label}</span>
      <span className={cn('font-semibold text-foreground truncate', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  );
}
