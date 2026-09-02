'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import QRCode from 'qrcode';
import {
  Tv,
  QrCode,
  Sparkles,
  Camera,
  IdCard,
  CheckCircle2,
  Radio,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function ScreenQrModal() {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://insken.workers.dev';
    const portalUrl = `${origin}/`;

    QRCode.toDataURL(portalUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 480,
      color: {
        dark: '#0B1F3A',
        light: '#FFFFFF',
      },
    }).then(setQrUrl);

    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-MY', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-[#D4A017]/60 bg-[#D4A017]/10 text-amber-900 dark:text-amber-300 hover:bg-[#D4A017]/20 font-semibold text-xs gap-1.5 shadow-sm"
        >
          <Tv className="h-3.5 w-3.5 text-[#D4A017]" />
          <span className="hidden sm:inline">
            {lang === 'ms' ? 'Paparan Skrin Dewan (16:9)' : 'Hall Screen Display (16:9)'}
          </span>
          <span className="sm:hidden">Skrin Dewan</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl p-0 overflow-hidden border-2 border-[#0B1F3A] bg-[#0B1F3A] text-white shadow-2xl rounded-2xl">
        {/* Horizontal 16:9 Presentation Frame */}
        <div className="flex flex-col">
          {/* Top Widescreen Banner */}
          <div className="bg-[#071526] px-6 py-3.5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 items-center justify-center rounded-lg bg-white p-1 px-1.5 shadow shrink-0">
                <img
                  src="/insken-logo.png"
                  alt="INSKEN Logo"
                  className="h-8 w-auto object-contain"
                />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide uppercase">
                  INSKEN · Program Latihan Kemahiran A.I. PMKS ASEAN
                </h2>
                <p className="text-xs text-[#D4A017] font-semibold">
                  {lang === 'ms' ? 'SESI KELAS & PEMBELAJARAN HARI INI' : 'TODAY\'S CLASS & LEARNING SESSION'}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/40 text-xs px-2.5 py-1 gap-1">
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                <span>SESI AKTIF</span>
              </Badge>
              <div className="font-mono text-xs font-bold text-white/90 bg-white/10 px-3 py-1 rounded-md flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#D4A017]" />
                <span>{currentTime}</span>
              </div>
            </div>
          </div>

          {/* Horizontal Split Body (Side by Side) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 items-center bg-gradient-to-r from-[#0B1F3A] via-[#112D55] to-[#0B1F3A]">
            {/* Left: Giant Widescreen QR Code */}
            <div className="md:col-span-5 flex flex-col items-center justify-center text-center">
              <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-2xl border-4 border-[#D4A017]">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="Master Portal QR"
                    className="h-56 w-56 sm:h-64 sm:w-64 object-contain"
                  />
                ) : (
                  <div className="h-56 w-56 sm:h-64 sm:w-64 flex items-center justify-center text-primary">
                    <QrCode className="h-16 w-16 animate-pulse" />
                  </div>
                )}
              </div>

              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#D4A017] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{lang === 'ms' ? 'Imbas Kod QR dengan Telefon Pintar' : 'Scan QR with Smartphone'}</span>
              </div>
            </div>

            {/* Right: Horizontal 3-Step Guide */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {lang === 'ms' ? 'Pendaftaran & Pengesahan Kehadiran' : 'Registration & Attendance Confirmation'}
                </h3>
                <p className="text-xs sm:text-sm text-white/75 mt-1 leading-relaxed">
                  {lang === 'ms'
                    ? 'Bagi peserta yang berada di dewan atau sesi dalam talian, sila imbas kod QR ini untuk merekodkan kehadiran rasmi anda.'
                    : 'For attendees in the hall or virtual session, please scan this QR code to confirm your official attendance.'}
                </p>
              </div>

              {/* Horizontal 3-Step Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {/* Step 1 */}
                <div className="rounded-xl bg-white/10 p-3 border border-white/15 text-center flex flex-col items-center">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4A017] text-[#0B1F3A] font-black text-xs mb-1.5">
                    1
                  </div>
                  <div className="font-bold text-white text-xs">
                    {lang === 'ms' ? 'Buka Kamera' : 'Open Camera'}
                  </div>
                  <div className="text-white/60 text-[10px] mt-0.5 leading-tight">
                    {lang === 'ms' ? 'Imbas kod QR di skrin' : 'Scan the QR code'}
                  </div>
                </div>

                {/* Step 2 */}
                <div className="rounded-xl bg-white/10 p-3 border border-white/15 text-center flex flex-col items-center">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4A017] text-[#0B1F3A] font-black text-xs mb-1.5">
                    2
                  </div>
                  <div className="font-bold text-white text-xs">
                    {lang === 'ms' ? 'Isi No. IC' : 'Enter IC No.'}
                  </div>
                  <div className="text-white/60 text-[10px] mt-0.5 leading-tight">
                    {lang === 'ms' ? 'Sahkan maklumat diri' : 'Verify your details'}
                  </div>
                </div>

                {/* Step 3 */}
                <div className="rounded-xl bg-emerald-500/20 p-3 border border-emerald-400/40 text-center flex flex-col items-center">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white font-black text-xs mb-1.5">
                    3
                  </div>
                  <div className="font-bold text-emerald-300 text-xs">
                    {lang === 'ms' ? 'Kehadiran Disahkan' : 'Verified'}
                  </div>
                  <div className="text-white/80 text-[10px] mt-0.5 leading-tight">
                    {lang === 'ms' ? 'Direkod serta-merta' : 'Live timestamp logged'}
                  </div>
                </div>
              </div>

              {/* Bottom Hall Note */}
              <div className="rounded-xl bg-black/30 p-3 border border-white/10 flex items-center justify-between text-xs">
                <span className="text-white/70">
                  {lang === 'ms' ? 'Sebarang bantuan, sila rujuk urusetia / jurulatih dewan.' : 'For assistance, please contact the event coordinator.'}
                </span>
                <span className="font-mono font-bold text-[#D4A017]">
                  INSKEN ASEANA.I.
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
