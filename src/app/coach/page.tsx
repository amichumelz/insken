'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import QRCode from 'qrcode';
import {
  GraduationCap,
  Tv,
  QrCode,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  Radio,
  FileSpreadsheet,
  Lock,
  ArrowLeft,
  MessageSquareHeart,
  Presentation,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage, LanguageToggle } from '@/lib/i18n';
import Link from 'next/link';

const MODULES = [
  'Generative A.I. Fundamentals for MSMEs',
  'AI for Retail Marketing & Sales',
  'ChatGPT for MSME Daily Operations',
  'No-Code A.I. Tools & Workflow Automation',
  'AI for F&B and Inventory Management',
  'Automation for Service Businesses',
];

const REGIONS = [
  { code: 'KL', name: 'Kuala Lumpur (KL)' },
  { code: 'JHR', name: 'Johor (JHR)' },
  { code: 'PNG', name: 'Pulau Pinang (PNG)' },
  { code: 'SBH', name: 'Sabah (SBH)' },
  { code: 'SWK', name: 'Sarawak (SWK)' },
];

export default function CoachPortalPage() {
  const { lang } = useLanguage();

  const [coach, setCoach] = useState('coach-a');
  const [region, setRegion] = useState('KL');
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedModule, setSelectedModule] = useState(MODULES[0]);
  const [activeScreenTab, setActiveScreenTab] = useState<'attendance' | 'feedback'>('attendance');
  const [feedbackPhase, setFeedbackPhase] = useState<'pre' | 'post'>('post');

  const [attendanceQrUrl, setAttendanceQrUrl] = useState('');
  const [feedbackQrUrl, setFeedbackQrUrl] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  // Live clock
  useEffect(() => {
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
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate QR codes dynamically based on coach settings
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://insken.workers.dev';

    // Attendance QR URL
    const attendanceUrl = `${origin}/?date=${sessionDate}&region=${region}&coach=${coach}`;
    QRCode.toDataURL(attendanceUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 480,
      color: { dark: '#0B1F3A', light: '#FFFFFF' },
    }).then(setAttendanceQrUrl);

    // Feedback QR URL
    const feedbackUrl = `${origin}/feedback?trainer=${coach}&phase=${feedbackPhase}&session=${encodeURIComponent(selectedModule)}`;
    QRCode.toDataURL(feedbackUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 480,
      color: { dark: '#0B1F3A', light: '#FFFFFF' },
    }).then(setFeedbackQrUrl);
  }, [coach, region, sessionDate, selectedModule, feedbackPhase]);

  const coachName = coach === 'coach-a' ? 'En. Farhan (Coach A)' : 'Dr. Nadia (Coach B)';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b bg-[#0B1F3A] text-white shadow-sm">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 gap-2">
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
                <span className="font-semibold text-xs sm:text-base truncate">INSKEN · Operations</span>
                <span className="shrink-0 rounded bg-indigo-500/20 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-indigo-300">
                  {lang === 'ms' ? 'Portal Jurulatih (Coach)' : 'Coach Portal'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-white/70 truncate hidden xs:block sm:block">
                Paparan Skrin Projektor Kehadiran &amp; Borang Maklum Balas Mengikut Tarikh Kelas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageToggle />
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs gap-1"
              >
                <Lock className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-6">
        {/* Coach Session Control Bar */}
        <Card className="border shadow-sm bg-card">
          <CardHeader className="pb-3 px-4 sm:px-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-base sm:text-lg">
                  {lang === 'ms' ? 'Tetapan Sesi Latihan Jurulatih' : 'Trainer Session Configuration'}
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-xs font-mono font-bold bg-muted w-fit">
                {currentTime}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {lang === 'ms'
                ? 'Pilih nama jurulatih, tarikh kelas, dan modul untuk menjana paparan skrin dewan yang bersesuaian.'
                : 'Configure your active session date and module to generate the tailored hall projection screen.'}
            </p>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Coach Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {lang === 'ms' ? 'Nama Jurulatih' : 'Coach Profile'}
                </Label>
                <Select value={coach} onValueChange={setCoach}>
                  <SelectTrigger className="h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coach-a">En. Farhan (Coach A - Retail & Ops)</SelectItem>
                    <SelectItem value="coach-b">Dr. Nadia (Coach B - GenAI & Tech)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {lang === 'ms' ? 'Tarikh Sesi Kelas' : 'Session Date'}
                </Label>
                <Input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="h-10 text-xs sm:text-sm"
                />
              </div>

              {/* Region */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {lang === 'ms' ? 'Wilayah Latihan' : 'Training Region'}
                </Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => (
                      <SelectItem key={r.code} value={r.code}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Module */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {lang === 'ms' ? 'Modul / Topik Latihan' : 'Module / Topic'}
                </Label>
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger className="h-10 text-xs sm:text-sm truncate">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODULES.map((m) => (
                      <SelectItem key={m} value={m} className="text-xs sm:text-sm">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mode Selector Tabs (Attendance Screen vs Feedback Form Screen) */}
        <div className="flex items-center gap-2 border-b pb-2">
          <Button
            variant={activeScreenTab === 'attendance' ? 'default' : 'outline'}
            onClick={() => setActiveScreenTab('attendance')}
            className="h-10 text-xs sm:text-sm font-semibold gap-2"
          >
            <Tv className="h-4 w-4" />
            <span>{lang === 'ms' ? '1. Skrin Kehadiran Dewan (16:9)' : '1. Attendance Screen (16:9)'}</span>
          </Button>

          <Button
            variant={activeScreenTab === 'feedback' ? 'default' : 'outline'}
            onClick={() => setActiveScreenTab('feedback')}
            className="h-10 text-xs sm:text-sm font-semibold gap-2"
          >
            <MessageSquareHeart className="h-4 w-4 text-[#D4A017]" />
            <span>{lang === 'ms' ? '2. Skrin Borang Maklum Balas (QR)' : '2. Feedback Form Screen (QR)'}</span>
          </Button>
        </div>

        {/* TAB 1: ATTENDANCE PROJECTOR DISPLAY (16:9 WIDESCREEN) */}
        {activeScreenTab === 'attendance' && (
          <div className="overflow-hidden rounded-2xl border-2 border-[#0B1F3A] bg-[#0B1F3A] text-white shadow-2xl">
            {/* Top Presentation Bar */}
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
                    INSKEN · PROGRAM LATIHAN KEMAHIRAN A.I. PMKS ASEAN
                  </h2>
                  <p className="text-xs text-[#D4A017] font-semibold">
                    {coachName} · {region} · {sessionDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/40 text-xs px-2.5 py-1 gap-1">
                  <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                  <span>SESI KELAS AKTIF</span>
                </Badge>
                <div className="font-mono text-xs font-bold text-white/90 bg-white/10 px-3 py-1 rounded-md hidden sm:flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#D4A017]" />
                  <span>{currentTime}</span>
                </div>
              </div>
            </div>

            {/* Horizontal 16:9 Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-10 items-center bg-gradient-to-r from-[#0B1F3A] via-[#112D55] to-[#0B1F3A]">
              {/* Left: Giant Attendance QR */}
              <div className="md:col-span-5 flex flex-col items-center justify-center text-center">
                <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border-4 border-[#D4A017]">
                  {attendanceQrUrl ? (
                    <img
                      src={attendanceQrUrl}
                      alt="Class Attendance QR"
                      className="h-56 w-56 sm:h-72 sm:w-72 object-contain"
                    />
                  ) : (
                    <div className="h-56 w-56 sm:h-72 sm:w-72 flex items-center justify-center">
                      <QrCode className="h-16 w-16 animate-pulse text-primary" />
                    </div>
                  )}
                </div>

                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-[#D4A017]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{lang === 'ms' ? 'Imbas QR untuk Pendaftaran / Kehadiran' : 'Scan for Attendance Confirmation'}</span>
                </div>
              </div>

              {/* Right: Instructions & Session Details */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <Badge className="bg-[#D4A017] text-[#0B1F3A] font-bold text-xs uppercase mb-2">
                    {selectedModule}
                  </Badge>
                  <h3 className="text-xl sm:text-3xl font-black text-white">
                    {lang === 'ms' ? 'Selamat Datang ke Sesi Pembelajaran Hari Ini!' : 'Welcome to Today\'s Class Session!'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/75 mt-1 leading-relaxed">
                    {lang === 'ms'
                      ? 'Sila gunakan kamera telefon pintar anda untuk mengimbas kod QR di sebelah bagi mengesahkan kehadiran rasmi kelas hari ini.'
                      : 'Please scan the on-screen QR code using your smartphone camera to record your official attendance.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="rounded-xl bg-white/10 p-3.5 border border-white/15 text-center">
                    <div className="font-bold text-white text-xs sm:text-sm">1. Imbas QR</div>
                    <div className="text-white/60 text-[11px] mt-0.5">Buka kamera telefon</div>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3.5 border border-white/15 text-center">
                    <div className="font-bold text-white text-xs sm:text-sm">2. Sahkan Tempat</div>
                    <div className="text-white/60 text-[11px] mt-0.5">Nama &amp; No. IC</div>
                  </div>
                  <div className="rounded-xl bg-emerald-500/20 p-3.5 border border-emerald-400/40 text-center">
                    <div className="font-bold text-emerald-300 text-xs sm:text-sm">3. Kehadiran Siap</div>
                    <div className="text-white/80 text-[11px] mt-0.5">Automatik direkodkan</div>
                  </div>
                </div>

                <div className="rounded-xl bg-black/30 p-3.5 border border-white/10 flex items-center justify-between text-xs text-white/80">
                  <span>Jurulatih: <strong className="text-white">{coachName}</strong></span>
                  <span className="font-mono text-[#D4A017]">Wilayah: {region} · {sessionDate}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FEEDBACK FORM PROJECTOR DISPLAY */}
        {activeScreenTab === 'feedback' && (
          <div className="overflow-hidden rounded-2xl border-2 border-indigo-900 bg-[#0B1F3A] text-white shadow-2xl">
            {/* Top Feedback Bar */}
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
                    BORANG MAKLUM BALAS &amp; PENILAIAN LATIHAN A.I.
                  </h2>
                  <p className="text-xs text-[#D4A017] font-semibold">
                    {coachName} · {selectedModule}
                  </p>
                </div>
              </div>

              {/* Pre / Post Toggle */}
              <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-lg border border-white/15">
                <Button
                  size="sm"
                  variant={feedbackPhase === 'pre' ? 'default' : 'ghost'}
                  onClick={() => setFeedbackPhase('pre')}
                  className="h-7 text-xs px-2.5"
                >
                  Pre-Session
                </Button>
                <Button
                  size="sm"
                  variant={feedbackPhase === 'post' ? 'default' : 'ghost'}
                  onClick={() => setFeedbackPhase('post')}
                  className="h-7 text-xs px-2.5"
                >
                  Post-Session
                </Button>
              </div>
            </div>

            {/* Horizontal 16:9 Feedback Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-10 items-center bg-gradient-to-r from-[#0B1F3A] via-[#1E1B4B] to-[#0B1F3A]">
              {/* Left: Giant Feedback QR */}
              <div className="md:col-span-5 flex flex-col items-center justify-center text-center">
                <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border-4 border-indigo-400">
                  {feedbackQrUrl ? (
                    <img
                      src={feedbackQrUrl}
                      alt="Feedback Form QR"
                      className="h-56 w-56 sm:h-72 sm:w-72 object-contain"
                    />
                  ) : (
                    <div className="h-56 w-56 sm:h-72 sm:w-72 flex items-center justify-center">
                      <QrCode className="h-16 w-16 animate-pulse text-primary" />
                    </div>
                  )}
                </div>

                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>
                    {feedbackPhase === 'pre'
                      ? 'Imbas untuk Soal Selidik Awal (Pre-Session)'
                      : 'Imbas untuk Penilaian Akhir (Post-Session)'}
                  </span>
                </div>
              </div>

              {/* Right: Feedback Prompt & Admin Privacy Notice */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <Badge className="bg-indigo-600 text-white font-bold text-xs uppercase mb-2">
                    {feedbackPhase === 'pre' ? 'Kaji Selidik Pra-Latihan' : 'Penilaian Sesi Selesai'}
                  </Badge>
                  <h3 className="text-xl sm:text-3xl font-black text-white">
                    {lang === 'ms'
                      ? 'Sila Lengkapkan Borang Maklum Balas Anda'
                      : 'Please Complete Your Session Feedback'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/75 mt-1 leading-relaxed">
                    {lang === 'ms'
                      ? 'Pandangan dan penilaian anda amat penting bagi memastikan modul bimbingan A.I. ini memberi impak maksimum kepada perniagaan PMKS anda.'
                      : 'Your honest feedback ensures that INSKEN continues to deliver maximum value for your enterprise.'}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 border border-white/15 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Penilaian Penguasaan Jurulatih &amp; Kejelasan Kandungan</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 border border-white/15 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Kebolehlaksanaan A.I. dalam operasi perniagaan sebenar</span>
                  </div>
                </div>

                {/* Privacy Badge: Admin-Only Analytics */}
                <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
                  <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <strong className="text-amber-300 block">Jaminan Kerahsiaan Maklum Balas:</strong>
                    Semua skor penilaian dan komen peserta adalah <strong>SULIT</strong> dan dianalisis secara eksklusif oleh pihak <strong>Pentadbir (Admin Dashboard)</strong> untuk kawalan kualiti bebas.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-3.5 text-xs text-muted-foreground mt-8">
        <div className="mx-auto flex max-w-[1600px] flex-col sm:flex-row items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-700 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
              COACH
            </span>
            <span className="text-[11px]">INSKEN Training Faculty Portal · ASEAN MSME A.I.</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <Link href="/" className="hover:text-foreground">Portal Peserta</Link>
            <span>·</span>
            <Link href="/admin" className="hover:text-foreground">Executive Admin Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
