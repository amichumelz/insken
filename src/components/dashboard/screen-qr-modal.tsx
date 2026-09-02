'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import QRCode from 'qrcode';
import {
  Tv,
  QrCode,
  Sparkles,
  Maximize2,
  CheckCircle2,
  Users,
  MapPin,
  Clock,
  Radio,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function ScreenQrModal() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // Generate Master QR Code for Portal
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

    // Live clock
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
            {lang === 'ms' ? 'Paparan Skrin Dewan (QR)' : 'Hall Screen Display (QR)'}
          </span>
          <span className="sm:hidden">Skrin QR</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl p-0 overflow-hidden border-2 border-[#0B1F3A] bg-[#0B1F3A] text-white">
        {/* Projector Header */}
        <div className="bg-[#071526] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 items-center justify-center rounded-lg bg-white p-1 px-1.5 shadow shrink-0">
              <img
                src="/insken-logo.png"
                alt="INSKEN Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                INSKEN · PROGRAM LATIHAN KEMAHIRAN A.I. PMKS ASEAN
              </h2>
              <p className="text-xs text-[#D4A017] font-medium">
                {lang === 'ms' ? 'PENGESAHAN KEHADIRAN SESI HARI INI' : 'TODAY\'S SESSION ATTENDANCE CHECK-IN'}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/40 text-xs px-2.5 py-1 gap-1">
              <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span>LIVE KAUNTER</span>
            </Badge>
            <div className="font-mono text-xs font-bold text-white/80 bg-white/10 px-2.5 py-1 rounded-md">
              {currentTime}
            </div>
          </div>
        </div>

        {/* Projector Body */}
        <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-gradient-to-b from-[#0B1F3A] to-[#112D55]">
          {/* Left: Giant QR Code */}
          <div className="md:col-span-6 flex flex-col items-center justify-center text-center">
            <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border-4 border-[#D4A017]">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="Check-in Portal Master QR"
                  className="h-56 w-56 sm:h-72 sm:w-72 object-contain"
                />
              ) : (
                <div className="h-56 w-56 sm:h-72 sm:w-72 flex items-center justify-center text-primary">
                  <QrCode className="h-16 w-16 animate-pulse" />
                </div>
              )}
            </div>

            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#D4A017]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{lang === 'ms' ? 'Imbas untuk Semak Kehadiran' : 'Scan to Check-In'}</span>
            </div>
          </div>

          {/* Right: Easy 3-Step Instructions */}
          <div className="md:col-span-6 space-y-5">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {lang === 'ms' ? 'Selamat Datang Peserta!' : 'Welcome Participants!'}
              </h3>
              <p className="text-sm text-white/70 mt-1">
                {lang === 'ms'
                  ? 'Sila rekodkan kehadiran rasmi anda untuk sesi hari ini dengan 3 langkah mudah:'
                  : 'Please record your attendance for today\'s session in 3 simple steps:'}
              </p>
            </div>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3 rounded-xl bg-white/10 p-3.5 border border-white/15">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D4A017] text-[#0B1F3A] font-black text-sm">
                  1
                </div>
                <div className="text-xs sm:text-sm">
                  <div className="font-bold text-white">
                    {lang === 'ms' ? 'Buka Kamera Telefon Pintar' : 'Open Smartphone Camera'}
                  </div>
                  <div className="text-white/70 text-xs mt-0.5">
                    {lang === 'ms'
                      ? 'Halakan kamera ke arah Kod QR besar di sebelah untuk membuka portal kehadiran.'
                      : 'Point your camera at the QR code to launch the check-in portal.'}
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 rounded-xl bg-white/10 p-3.5 border border-white/15">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D4A017] text-[#0B1F3A] font-black text-sm">
                  2
                </div>
                <div className="text-xs sm:text-sm">
                  <div className="font-bold text-white">
                    {lang === 'ms' ? 'Masukkan No. Kad Pengenalan' : 'Enter National IC Number'}
                  </div>
                  <div className="text-white/70 text-xs mt-0.5">
                    {lang === 'ms'
                      ? 'Masukkan No. IC anda (tanpa sempang atau dengan sempang) & pilih mod kehadiran.'
                      : 'Enter your IC number & choose your attendance mode.'}
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 rounded-xl bg-emerald-500/20 p-3.5 border border-emerald-400/40">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white font-black text-sm">
                  3
                </div>
                <div className="text-xs sm:text-sm">
                  <div className="font-bold text-emerald-300">
                    {lang === 'ms' ? 'Kehadiran Disahkan Serta-merta' : 'Instant Attendance Verification'}
                  </div>
                  <div className="text-white/80 text-xs mt-0.5">
                    {lang === 'ms'
                      ? 'Sistem merekodkan masa kehadiran anda dan mengemas kini pangkalan data secara automatik.'
                      : 'Your attendance timestamp is instantly recorded in the live registry.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick URL for manual type */}
            <div className="pt-2 text-center sm:text-left">
              <span className="text-xs text-white/60 mr-2">
                {lang === 'ms' ? 'Layari terus di pelayar telefon:' : 'Or visit directly:'}
              </span>
              <span className="font-mono text-xs font-bold text-[#D4A017] underline">
                Portal Rasmi INSKEN
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
