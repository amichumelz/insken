'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ScanLine,
  CheckCircle2,
  QrCode,
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
  GraduationCap,
  Loader2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

function CheckinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionName = searchParams.get('session') || 'ASEAN MSMEs AI Skills Training Programme';
  const region = searchParams.get('region') || 'KL';
  const sessionDate = searchParams.get('date') || '';
  const coach = searchParams.get('coach') || '';

  const [identifier, setIdentifier] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attendedRecord, setAttendedRecord] = useState<any | null>(null);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();

    if (!cleanId) {
      toast.error('Sila masukkan No. IC atau ID Peserta anda.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrPayload: cleanId,
          mode: 'Physical',
          session: sessionName,
          region,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success('Kehadiran anda telah berjaya disahkan!');
        setAttendedRecord(data.participant || { participantId: cleanId, name: 'Peserta' });

        // Auto navigate to their digital pass after 1.5s
        const passId = data.participant?.participantId || cleanId;
        setTimeout(() => {
          router.push(`/pass/${encodeURIComponent(passId)}`);
        }, 1500);
      } else {
        toast.error(data.message || 'Rekod peserta tidak dijumpai. Sila pastikan No. IC anda betul.');
      }
    } catch {
      toast.error('Ralat sambungan pelayan. Sila cuba lagi.');
    } finally {
      setSubmitting(false);
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
                <span className="font-semibold text-xs sm:text-base truncate">INSKEN · Pengesahan Kehadiran</span>
                <span className="shrink-0 rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-300">
                  Check-in Sesi
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-white/70 truncate hidden xs:block sm:block">
                ASEAN MSMEs AI Skills Training Programme
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs gap-1"
              >
                <span>Daftar Peserta</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-6 sm:py-10">
        <Card className="border shadow-xl rounded-2xl overflow-hidden bg-card">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0B1F3A] via-[#112D55] to-[#0B1F3A] text-white p-5 sm:p-6 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-300">
              <ScanLine className="h-3.5 w-3.5" />
              <span>PENGESAHAN KEHADIRAN SESI HARI INI</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white">
              {sessionName}
            </h2>
            <div className="flex items-center justify-center gap-2 text-xs text-white/80 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[#D4A017]" />
                {region}
              </span>
              {sessionDate && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-[#D4A017]" />
                    {sessionDate}
                  </span>
                </>
              )}
            </div>
          </div>

          <CardContent className="p-5 sm:p-6 space-y-5">
            {attendedRecord ? (
              <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-foreground">
                    Kehadiran Anda Telah Disahkan!
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Membuka Pas Kehadiran Digital Rasmi anda...
                  </p>
                </div>
                <div className="pt-2">
                  <Link href={`/pass/${encodeURIComponent(attendedRecord.participantId || identifier)}`}>
                    <Button className="h-10 bg-[#0B1F3A] text-white hover:bg-[#112D55] text-xs font-bold gap-1.5 shadow">
                      <span>Buka Pas Digital Saya</span>
                      <ArrowRight className="h-4 w-4 text-[#D4A017]" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckin} className="space-y-4">
                <div className="rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 p-3.5 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-2.5">
                  <UserCheck className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    Sila masukkan <strong>No. Kad Pengenalan (IC)</strong> atau <strong>ID Peserta</strong> (cth: <em>ASEAN-00011</em>) yang telah anda daftarkan untuk merekodkan kehadiran.
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="id-input" className="text-xs font-bold">
                    Nombor Kad Pengenalan / ID Peserta
                  </Label>
                  <Input
                    id="id-input"
                    type="text"
                    required
                    placeholder="Contoh: 880115-14-5521 atau ASEAN-00011"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="h-11 text-sm font-semibold tracking-wide"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-[#D4A017] text-[#0B1F3A] hover:bg-[#F59E0B] font-bold text-xs sm:text-sm gap-2 shadow-md"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mengesahkan Kehadiran...</span>
                    </>
                  ) : (
                    <>
                      <ScanLine className="h-4 w-4" />
                      <span>Sahkan Kehadiran Sekarang</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-4 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-2 px-4 sm:flex-row">
          <p>© 2026 INSKEN · ASEAN MSMEs AI Skills Training Programme</p>
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:text-foreground">Portal Pendaftaran</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CheckinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CheckinContent />
    </Suspense>
  );
}
