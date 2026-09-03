'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Lock,
  MessageSquareHeart,
  CheckCircle2,
  Layers,
  XCircle,
  ScanLine,
} from 'lucide-react';
import Link from 'next/link';
import { DEFAULT_EVENT_DATES } from '@/lib/event-dates';

interface TrainingClass {
  id: string;
  module: string;
  coachId: 'coach-a' | 'coach-b';
  coachName: string;
  region: string;
  regionName: string;
  defaultDate: string;
  time: string;
  venue: string;
  targetSeats: number;
}

const BASE_SCHEDULED_CLASSES: TrainingClass[] = [
  {
    id: 'cls-01',
    module: 'AI for Retail Marketing & Sales Automation',
    coachId: 'coach-a',
    coachName: 'En. Farhan (Coach A)',
    region: 'KL',
    regionName: 'Kuala Lumpur (HQ)',
    defaultDate: '2026-09-02',
    time: '09:00 AM - 05:00 PM',
    venue: 'Dewan Utama INSKEN KL Sentral',
    targetSeats: 400,
  },
  {
    id: 'cls-02',
    module: 'ChatGPT & Prompt Engineering for MSME Daily Operations',
    coachId: 'coach-a',
    coachName: 'En. Farhan (Coach A)',
    region: 'JHR',
    regionName: 'Johor Bahru',
    defaultDate: '2026-09-05',
    time: '09:00 AM - 05:00 PM',
    venue: 'Pusat Konvensyen Antarabangsa Persada Johor',
    targetSeats: 200,
  },
  {
    id: 'cls-03',
    module: 'Generative A.I. Fundamentals & Content Creation for MSMEs',
    coachId: 'coach-b',
    coachName: 'Dr. Nadia (Coach B)',
    region: 'PNG',
    regionName: 'Pulau Pinang',
    defaultDate: '2026-09-08',
    time: '09:00 AM - 05:00 PM',
    venue: 'Setia SPICE Convention Centre, Penang',
    targetSeats: 200,
  },
  {
    id: 'cls-04',
    module: 'No-Code A.I. Tools & Automated Business Workflows',
    coachId: 'coach-b',
    coachName: 'Dr. Nadia (Coach B)',
    region: 'SBH',
    regionName: 'Sabah (Kota Kinabalu)',
    defaultDate: '2026-09-12',
    time: '09:00 AM - 05:00 PM',
    venue: 'Sabah International Convention Centre (SICC)',
    targetSeats: 200,
  },
  {
    id: 'cls-05',
    module: 'AI for F&B, Smart Inventory & Customer Retention',
    coachId: 'coach-a',
    coachName: 'En. Farhan (Coach A)',
    region: 'SWK',
    regionName: 'Sarawak (Kuching)',
    defaultDate: '2026-09-15',
    time: '09:00 AM - 05:00 PM',
    venue: 'Borneo Convention Centre Kuching (BCCK)',
    targetSeats: 200,
  },
  {
    id: 'cls-06',
    module: 'Automation & A.I. Lead Generation for Service Businesses',
    coachId: 'coach-b',
    coachName: 'Dr. Nadia (Coach B)',
    region: 'KL',
    regionName: 'Kuala Lumpur',
    defaultDate: '2026-09-18',
    time: '09:00 AM - 05:00 PM',
    venue: 'Dewan Teater Utama INSKEN',
    targetSeats: 400,
  },
];

export default function CoachPortalPage() {
  const [eventDates, setEventDates] = useState<Record<string, string>>(DEFAULT_EVENT_DATES);
  const [selectedClass, setSelectedClass] = useState<TrainingClass>(BASE_SCHEDULED_CLASSES[0]);
  const [isDisplayingScreen, setIsDisplayingScreen] = useState(false);
  const [activeScreenMode, setActiveScreenMode] = useState<'attendance' | 'feedback'>('attendance');
  const [feedbackPhase, setFeedbackPhase] = useState<'pre' | 'post'>('post');

  const [attendanceQrUrl, setAttendanceQrUrl] = useState('');
  const [feedbackQrUrl, setFeedbackQrUrl] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  const displaySectionRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch live event dates set by Admin to keep everything in sync
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const res = await fetch('/api/config/event-dates');
        const data = await res.json();
        if (data.ok && data.dates) {
          setEventDates(data.dates);
        }
      } catch {
        // Fallback
      }
    };
    fetchDates();
  }, []);

  // 2. Live clock
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

  // 3. Generate QR codes strictly for ATTENDANCE CHECK-IN (not for registration)
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://insken.1211111996.workers.dev';
    const effectiveDate = eventDates[selectedClass.region] || selectedClass.defaultDate;

    // Attendance QR URL — points to check-in confirmation
    const attendanceUrl = `${origin}/checkin?session=${encodeURIComponent(selectedClass.module)}&region=${selectedClass.region}&date=${effectiveDate}&coach=${selectedClass.coachId}`;
    QRCode.toDataURL(attendanceUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 480,
      color: { dark: '#0B1F3A', light: '#FFFFFF' },
    }).then(setAttendanceQrUrl);

    // Feedback QR URL
    const feedbackUrl = `${origin}/feedback?trainer=${selectedClass.coachId}&phase=${feedbackPhase}&session=${encodeURIComponent(selectedClass.module)}&region=${selectedClass.region}`;
    QRCode.toDataURL(feedbackUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 480,
      color: { dark: '#0B1F3A', light: '#FFFFFF' },
    }).then(setFeedbackQrUrl);
  }, [selectedClass, feedbackPhase, eventDates]);

  // Action: User clicks Generate QR / Display Screen
  const handleGenerateScreen = (cls: TrainingClass, mode: 'attendance' | 'feedback') => {
    setSelectedClass(cls);
    setActiveScreenMode(mode);
    setIsDisplayingScreen(true);

    setTimeout(() => {
      displaySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const activeDate = eventDates[selectedClass.region] || selectedClass.defaultDate;

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
                  Portal Jurulatih (Coach)
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-white/70 truncate hidden xs:block sm:block">
                ASEAN MSMEs AI Skills Training Programme
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="font-mono text-xs font-bold text-white/90 bg-white/10 px-3 py-1 rounded-md hidden sm:flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#D4A017]" />
              <span>{currentTime}</span>
            </div>
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
        
        {/* 1. Class Selection Section */}
        <Card className="border shadow-sm bg-card">
          <CardHeader className="pb-3 px-4 sm:px-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-base sm:text-lg">
                  Senarai Jadual Sesi Latihan Jurulatih
                </CardTitle>
              </div>
              <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-300 text-xs">
                Tarikh Diselaraskan Automatik dari Admin
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Klik butang <strong>[Jana QR Kehadiran]</strong> pada mana-mana sesi di bawah untuk memaparkan kod QR pengesahan kehadiran dewan (16:9) pada skrin projektor.
            </p>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {BASE_SCHEDULED_CLASSES.map((cls) => {
                const classDate = eventDates[cls.region] || cls.defaultDate;
                const isSelected = selectedClass.id === cls.id && isDisplayingScreen;

                return (
                  <div
                    key={cls.id}
                    className={`rounded-xl border p-4 transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/30'
                        : 'border-border bg-card hover:border-indigo-300 hover:bg-muted/30'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1">
                        <Badge variant="outline" className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 border-indigo-300 bg-indigo-50/50">
                          {cls.region} · {cls.regionName}
                        </Badge>
                        <span className="font-mono text-[11px] font-bold text-indigo-950 dark:text-indigo-200 bg-amber-500/15 border border-amber-400/40 px-2 py-0.5 rounded flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-[#D4A017]" />
                          {classDate}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-2">
                        {cls.module}
                      </h4>

                      <div className="text-[11px] text-muted-foreground space-y-0.5">
                        <div className="flex items-center gap-1 text-foreground font-medium">
                          <GraduationCap className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                          <span>{cls.coachName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{cls.venue}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleGenerateScreen(cls, 'attendance')}
                        className={`flex-1 h-8 text-[11px] font-bold gap-1 shadow-sm ${
                          isSelected && activeScreenMode === 'attendance'
                            ? 'bg-[#0B1F3A] text-white hover:bg-[#112D55]'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        <ScanLine className="h-3.5 w-3.5" />
                        <span>Jana QR Kehadiran</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateScreen(cls, 'feedback')}
                        className={`h-8 px-2.5 text-[11px] font-semibold gap-1 ${
                          isSelected && activeScreenMode === 'feedback'
                            ? 'border-indigo-600 bg-indigo-100 text-indigo-900 font-bold'
                            : ''
                        }`}
                      >
                        <MessageSquareHeart className="h-3.5 w-3.5 text-[#D4A017]" />
                        <span>Feedback QR</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 2. Projector Display Area — ONLY DISPLAYED WHEN USER CLICKS GENERATE QR */}
        <div ref={displaySectionRef} className="space-y-4">
          {isDisplayingScreen ? (
            <div className="space-y-3">
              {/* Header Bar with Toggle & Close Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant={activeScreenMode === 'attendance' ? 'default' : 'outline'}
                    onClick={() => setActiveScreenMode('attendance')}
                    className="h-9 text-xs sm:text-sm font-semibold gap-2"
                  >
                    <Tv className="h-4 w-4" />
                    <span>1. Paparan Skrin Pengesahan Kehadiran (16:9)</span>
                  </Button>

                  <Button
                    variant={activeScreenMode === 'feedback' ? 'default' : 'outline'}
                    onClick={() => setActiveScreenMode('feedback')}
                    className="h-9 text-xs sm:text-sm font-semibold gap-2"
                  >
                    <MessageSquareHeart className="h-4 w-4 text-[#D4A017]" />
                    <span>2. Paparan Skrin Borang Maklum Balas</span>
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDisplayingScreen(false)}
                  className="h-8 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1 w-fit"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Tutup Paparan Skrin</span>
                </Button>
              </div>

              {/* TAB 1: ATTENDANCE PROJECTOR DISPLAY (16:9 WIDESCREEN) */}
              {activeScreenMode === 'attendance' && (
                <div className="overflow-hidden rounded-2xl border-2 border-[#0B1F3A] bg-[#0B1F3A] text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
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
                          ASEAN MSMEs AI Skills Training Programme
                        </h2>
                        <p className="text-xs text-[#D4A017] font-semibold">
                          {selectedClass.coachName} · {selectedClass.regionName} · {activeDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/40 text-xs px-2.5 py-1 gap-1">
                        <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                        <span>SESI KEHADIRAN AKTIF</span>
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
                            alt="Class Attendance Check-in QR"
                            className="h-56 w-56 sm:h-72 sm:w-72 object-contain"
                          />
                        ) : (
                          <div className="h-56 w-56 sm:h-72 sm:w-72 flex items-center justify-center">
                            <QrCode className="h-16 w-16 animate-pulse text-primary" />
                          </div>
                        )}
                      </div>

                      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-[#D4A017]">
                        <ScanLine className="h-3.5 w-3.5" />
                        <span>Imbas QR untuk Pengesahan Kehadiran Kelas (Check-in)</span>
                      </div>
                    </div>

                    {/* Right: Instructions & Session Details */}
                    <div className="md:col-span-7 space-y-4">
                      <div>
                        <Badge className="bg-[#D4A017] text-[#0B1F3A] font-bold text-xs uppercase mb-2">
                          {selectedClass.module}
                        </Badge>
                        <h3 className="text-xl sm:text-3xl font-black text-white">
                          Pengesahan Kehadiran Sesi Latihan
                        </h3>
                        <p className="text-xs sm:text-sm text-white/75 mt-1 leading-relaxed">
                          Sila gunakan kamera telefon pintar anda untuk mengimbas kod QR di sebelah bagi mengesahkan kehadiran anda dalam sesi kelas hari ini.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div className="rounded-xl bg-white/10 p-3.5 border border-white/15 text-center">
                          <div className="font-bold text-white text-xs sm:text-sm">1. Imbas QR</div>
                          <div className="text-white/60 text-[11px] mt-0.5">Buka kamera telefon</div>
                        </div>
                        <div className="rounded-xl bg-white/10 p-3.5 border border-white/15 text-center">
                          <div className="font-bold text-white text-xs sm:text-sm">2. Sahkan No. IC / Pas</div>
                          <div className="text-white/60 text-[11px] mt-0.5">Masukkan No. IC peserta</div>
                        </div>
                        <div className="rounded-xl bg-emerald-500/20 p-3.5 border border-emerald-400/40 text-center">
                          <div className="font-bold text-emerald-300 text-xs sm:text-sm">3. Kehadiran Siap</div>
                          <div className="text-white/80 text-[11px] mt-0.5">Status kehadiran disahkan</div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-black/30 p-3.5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-white/80 gap-2">
                        <span>Jurulatih: <strong className="text-white">{selectedClass.coachName}</strong></span>
                        <span className="font-mono text-[#D4A017]">{selectedClass.venue} · {activeDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FEEDBACK FORM PROJECTOR DISPLAY */}
              {activeScreenMode === 'feedback' && (
                <div className="overflow-hidden rounded-2xl border-2 border-indigo-900 bg-[#0B1F3A] text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
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
                          ASEAN MSMEs AI Skills Training Programme
                        </h2>
                        <p className="text-xs text-[#D4A017] font-semibold">
                          {selectedClass.coachName} · {selectedClass.module}
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
                          Sila Lengkapkan Borang Maklum Balas Anda
                        </h3>
                        <p className="text-xs sm:text-sm text-white/75 mt-1 leading-relaxed">
                          Pandangan dan penilaian anda amat penting bagi memastikan modul bimbingan A.I. ini memberi impak maksimum kepada perniagaan PMKS anda.
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
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-muted-foreground/25 p-8 text-center bg-muted/10 space-y-2">
              <Tv className="h-10 w-10 text-muted-foreground/50 mx-auto" />
              <h4 className="text-sm font-bold text-foreground">
                Paparan Skrin Projektor Belum Diaktifkan
              </h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Sila klik butang <strong>[Jana QR Kehadiran]</strong> pada mana-mana kelas di atas untuk memaparkan kod QR pengesahan kehadiran dewan (16:9) atau borang maklum balas.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-3.5 text-xs text-muted-foreground mt-8">
        <div className="mx-auto flex max-w-[1600px] flex-col sm:flex-row items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-700 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
              COACH
            </span>
            <span className="text-[11px]">INSKEN Training Faculty Portal · ASEAN MSMEs AI Skills Training Programme</span>
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
