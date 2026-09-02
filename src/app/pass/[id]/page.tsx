'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Video,
  Download,
  QrCode,
  Sparkles,
  ShieldCheck,
  Clock,
  Loader2,
  ArrowLeft,
  ScanLine,
  ExternalLink,
} from 'lucide-react';
import { useLanguage, LanguageToggle } from '@/lib/i18n';

interface PassData {
  ok: boolean;
  participant?: {
    id: string;
    participantId: string;
    name: string;
    email: string;
    phone: string;
    sector: string;
    region: string;
    regionName: string;
    finalMode: string;
    status: string;
    checkInAt: string | null;
    createdAt: string;
  };
  qrDataUrl?: string;
  isAttended?: boolean;
  message?: string;
}

export default function ParticipantPassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const participantId = resolvedParams.id;
  const { t, lang } = useLanguage();

  const [data, setData] = useState<PassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  const loadPass = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pass/${encodeURIComponent(participantId)}`);
      const json = (await res.json()) as PassData;
      setData(json);
    } catch {
      toast.error(lang === 'ms' ? 'Ralat memuatkan pas peserta.' : 'Failed to load participant pass.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPass();
  }, [participantId]);

  const handleInstantCheckin = async () => {
    if (!data?.participant) return;
    setCheckingIn(true);
    try {
      const mode = data.participant.finalMode === 'Registered_Physical' ? 'Physical' : 'Online';
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: data.participant.participantId,
          mode,
        }),
      });
      const result = await res.json();
      if (result.ok) {
        toast.success(lang === 'ms' ? 'Kehadiran anda berjaya disahkan!' : 'Attendance confirmed successfully!');
        loadPass();
      } else {
        toast.warning(result.message || (lang === 'ms' ? 'Semakan kehadiran selesai.' : 'Check-in processed.'));
        loadPass();
      }
    } catch {
      toast.error(lang === 'ms' ? 'Ralat rangkaian semasa pengesahan.' : 'Network error.');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b bg-[#0B1F3A] text-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-9 sm:h-10 items-center justify-center rounded-lg bg-white p-1 px-1.5 shadow shrink-0">
              <img
                src="/insken-logo.png"
                alt="INSKEN Logo"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-semibold text-xs sm:text-base truncate">{t.brandTitle}</span>
                <span className="shrink-0 rounded bg-[#D4A017]/20 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-[#F59E0B]">
                  {lang === 'ms' ? 'Pas Digital' : 'Digital Pass'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-white/70 truncate hidden xs:block sm:block">
                {t.brandSub}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <LanguageToggle />
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white text-xs gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.navBackToHome}</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-6 sm:py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {lang === 'ms' ? 'Memuatkan Pas Digital Rasmi...' : 'Loading Official Digital Pass...'}
            </p>
          </div>
        ) : !data?.ok || !data.participant ? (
          <Card className="text-center p-8 border shadow-sm space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/40">
              <QrCode className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {lang === 'ms' ? 'Pas Peserta Tidak Dijumpai' : 'Pass Not Found'}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === 'ms'
                  ? `Tiada pendaftaran aktif dijumpai untuk ID "${participantId}". Sila pastikan anda telah melengkapkan pendaftaran.`
                  : `No active registration found for ID "${participantId}". Please verify your registration.`}
              </p>
            </div>
            <div className="pt-2">
              <Link href="/">
                <Button className="h-10 text-xs font-semibold gap-1.5 bg-[#0B1F3A] hover:bg-[#1E3A8A]">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {lang === 'ms' ? 'Pergi ke Borang Pendaftaran' : 'Go to Registration Form'}
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Status Banner */}
            <div
              className={`rounded-2xl border p-4 sm:p-5 shadow-sm ${
                data.isAttended
                  ? 'border-emerald-300 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/30'
                  : 'border-[#D4A017]/40 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/30'
              }`}
            >
              <div className="flex items-center gap-3">
                {data.isAttended ? (
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                    <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-[#D4A017]/20 text-[#B45309]">
                    <Sparkles className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-foreground">
                      {data.isAttended
                        ? (lang === 'ms' ? 'Kehadiran Disahkan' : 'Attendance Verified')
                        : (lang === 'ms' ? 'Pas Kehadiran Aktif' : 'Attendance Pass Active')}
                    </span>
                    <Badge
                      className={`text-[10px] font-bold uppercase ${
                        data.isAttended
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#D4A017] text-[#0B1F3A]'
                      }`}
                    >
                      {data.isAttended
                        ? (lang === 'ms' ? 'SELESAI' : 'COMPLETED')
                        : (lang === 'ms' ? 'HARI KELAS' : 'EVENT DAY')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {data.isAttended && data.participant.checkInAt
                      ? (lang === 'ms'
                          ? `Cop masa kehadiran: ${new Date(data.participant.checkInAt).toLocaleString('en-MY', { hour12: false })}`
                          : `Recorded at: ${new Date(data.participant.checkInAt).toLocaleString('en-MY', { hour12: false })}`)
                      : (lang === 'ms'
                          ? 'Tunjukkan kod QR di bawah di meja urusetia untuk merekod kehadiran.'
                          : 'Present the QR code below at the reception desk to confirm your attendance.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Official Digital Pass Card */}
            <Card className="overflow-hidden border-2 border-[#0B1F3A]/20 dark:border-white/10 shadow-xl rounded-2xl bg-gradient-to-b from-[#0B1F3A] via-[#112D55] to-[#1E3A8A] text-white">
              <div className="p-5 sm:p-6 text-center space-y-4">
                {/* Header Badge */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#D4A017] backdrop-blur">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{lang === 'ms' ? 'PAS MASUK PROGRAM RASMI' : 'OFFICIAL EVENT ENTRY PASS'}</span>
                </div>

                {/* QR Code Container */}
                <div className="mx-auto w-fit rounded-2xl bg-white p-3 sm:p-4 shadow-2xl">
                  <img
                    src={data.qrDataUrl}
                    alt={`QR Pass for ${data.participant.participantId}`}
                    className="h-48 w-48 sm:h-56 sm:w-56 object-contain"
                  />
                </div>

                {/* Participant Details */}
                <div className="space-y-1.5 pt-2">
                  <div className="font-mono text-xl sm:text-2xl font-black tracking-wider text-[#D4A017]">
                    {data.participant.participantId}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {data.participant.name}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/80">
                    <span className="rounded bg-white/15 px-2 py-0.5 font-medium">
                      {data.participant.sector}
                    </span>
                    <span>·</span>
                    <span className="rounded bg-white/15 px-2 py-0.5 font-medium">
                      {data.participant.regionName}
                    </span>
                    <span>·</span>
                    <span className="rounded bg-[#D4A017] text-[#0B1F3A] px-2 py-0.5 font-bold">
                      {data.participant.finalMode.replace('Registered_', '')}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3">
                  {!data.isAttended ? (
                    <Button
                      onClick={handleInstantCheckin}
                      disabled={checkingIn}
                      className="w-full sm:flex-1 h-11 bg-[#D4A017] text-[#0B1F3A] hover:bg-[#F59E0B] font-bold text-xs gap-1.5 shadow-md"
                    >
                      {checkingIn ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{lang === 'ms' ? 'Mengesahkan...' : 'Verifying...'}</span>
                        </>
                      ) : (
                        <>
                          <ScanLine className="h-4 w-4" />
                          <span>{lang === 'ms' ? 'Sahkan Kehadiran Sekarang' : 'Confirm Attendance Now'}</span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="w-full rounded-lg bg-emerald-500/20 border border-emerald-400/40 p-2.5 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>{lang === 'ms' ? 'Kehadiran Telah Direkodkan' : 'Attendance Verified'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="border-t border-white/10 bg-black/20 px-5 py-3 text-center text-[11px] text-white/60">
                ASEAN MSME A.I. Skills Training · Institut Keusahawanan Negara (INSKEN)
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-4 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-2 px-4 sm:flex-row">
          <p>© 2026 INSKEN · ASEAN MSME A.I. Skills Training Program</p>
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:text-foreground">{t.navPublicRegister}</Link>
            <span>·</span>
            <Link href="/checkin" className="hover:text-foreground">{t.navPublicCheckin}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
