'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Lock,
  MessageSquareHeart,
  CheckCircle2,
  Layers,
  XCircle,
  ScanLine,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { CoachClassRecord, PROGRAMME_TITLE } from '@/app/api/config/coaches/route';

const DEFAULT_CLASSES: CoachClassRecord[] = [
  {
    id: 'cls-01',
    module: PROGRAMME_TITLE,
    coachId: 'coach-farhan',
    coachName: 'Mr. Farhan (Coach A)',
    region: 'KL',
    regionName: 'Kuala Lumpur (HQ)',
    date: '2026-09-02',
    time: '09:00 AM - 05:00 PM',
    venue: 'INSKEN Main Hall KL Sentral',
    targetSeats: 400,
  },
  {
    id: 'cls-02',
    module: PROGRAMME_TITLE,
    coachId: 'coach-nadia',
    coachName: 'Dr. Nadia (Coach B)',
    region: 'JHR',
    regionName: 'Johor Bahru',
    date: '2026-09-05',
    time: '09:00 AM - 05:00 PM',
    venue: 'Persada Johor International Convention Centre',
    targetSeats: 200,
  },
  {
    id: 'cls-03',
    module: PROGRAMME_TITLE,
    coachId: 'coach-amirul',
    coachName: 'Ts. Amirul (Coach C)',
    region: 'PNG',
    regionName: 'Pulau Pinang',
    date: '2026-09-08',
    time: '09:00 AM - 05:00 PM',
    venue: 'Setia SPICE Convention Centre, Penang',
    targetSeats: 200,
  },
  {
    id: 'cls-04',
    module: PROGRAMME_TITLE,
    coachId: 'coach-aishah',
    coachName: 'Ms. Aishah (Coach D)',
    region: 'SBH',
    regionName: 'Sabah (Kota Kinabalu)',
    date: '2026-09-12',
    time: '09:00 AM - 05:00 PM',
    venue: 'Sabah International Convention Centre (SICC)',
    targetSeats: 200,
  },
  {
    id: 'cls-05',
    module: PROGRAMME_TITLE,
    coachId: 'coach-farhan',
    coachName: 'Mr. Farhan (Coach A)',
    region: 'SWK',
    regionName: 'Sarawak (Kuching)',
    date: '2026-09-15',
    time: '09:00 AM - 05:00 PM',
    venue: 'Borneo Convention Centre Kuching (BCCK)',
    targetSeats: 200,
  },
  {
    id: 'cls-06',
    module: PROGRAMME_TITLE,
    coachId: 'coach-nadia',
    coachName: 'Dr. Nadia (Coach B)',
    region: 'KL',
    regionName: 'Kuala Lumpur',
    date: '2026-09-18',
    time: '09:00 AM - 05:00 PM',
    venue: 'INSKEN Main Theatre Hall',
    targetSeats: 400,
  },
];

export default function CoachPortalPage() {
  const [classes, setClasses] = useState<CoachClassRecord[]>(DEFAULT_CLASSES);
  const [selectedCoachFilter, setSelectedCoachFilter] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<CoachClassRecord>(DEFAULT_CLASSES[0]);
  const [isDisplayingScreen, setIsDisplayingScreen] = useState(false);
  const [activeScreenMode, setActiveScreenMode] = useState<'attendance' | 'feedback'>('attendance');
  const [feedbackPhase, setFeedbackPhase] = useState<'pre' | 'post'>('post');

  const [attendanceQrUrl, setAttendanceQrUrl] = useState('');
  const [feedbackQrUrl, setFeedbackQrUrl] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  const displaySectionRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch dynamic coaches & class schedule configured by Admin
  const loadDynamicClasses = async () => {
    try {
      const res = await fetch('/api/config/coaches');
      const data = await res.json();
      if (data.ok && Array.isArray(data.classes) && data.classes.length > 0) {
        setClasses(data.classes);
        if (!selectedClass || !data.classes.some((c: any) => c.id === selectedClass.id)) {
          setSelectedClass(data.classes[0]);
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadDynamicClasses();
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

  // 3. Generate QR codes uniquely per Coach, Venue, Region, Date, and Module
  useEffect(() => {
    if (!selectedClass) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://insken.1211111996.workers.dev';

    const attendanceUrl = `${origin}/checkin?session=${encodeURIComponent(selectedClass.module)}&region=${selectedClass.region}&venue=${encodeURIComponent(selectedClass.venue)}&date=${selectedClass.date}&coach=${encodeURIComponent(selectedClass.coachName)}&coachId=${selectedClass.coachId}`;
    QRCode.toDataURL(attendanceUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 480,
      color: { dark: '#0B1F3A', light: '#FFFFFF' },
    }).then(setAttendanceQrUrl);

    const feedbackUrl = `${origin}/feedback?trainer=${selectedClass.coachId}&trainerName=${encodeURIComponent(selectedClass.coachName)}&phase=${feedbackPhase}&session=${encodeURIComponent(selectedClass.module)}&region=${selectedClass.region}&venue=${encodeURIComponent(selectedClass.venue)}`;
    QRCode.toDataURL(feedbackUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 480,
      color: { dark: '#0B1F3A', light: '#FFFFFF' },
    }).then(setFeedbackQrUrl);
  }, [selectedClass, feedbackPhase]);

  const handleGenerateScreen = (cls: CoachClassRecord, mode: 'attendance' | 'feedback') => {
    setSelectedClass(cls);
    setActiveScreenMode(mode);
    setIsDisplayingScreen(true);

    setTimeout(() => {
      displaySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const uniqueCoaches = Array.from(
    new Map(classes.map((c) => [c.coachName, c])).values()
  );

  const filteredClasses = selectedCoachFilter === 'all'
    ? classes
    : classes.filter((c) => c.coachName === selectedCoachFilter || c.coachId === selectedCoachFilter);

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
                  Coach Portal
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
        
        {/* 1. Class Selection Section with Coach Filter Dropdown */}
        <Card className="border shadow-sm bg-card">
          <CardHeader className="pb-3 px-4 sm:px-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-base sm:text-lg">
                    Scheduled Training Sessions List
                  </CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select your coach profile and click <strong>[Generate Attendance QR]</strong> to project the tailored hall screen.
                </p>
              </div>

              {/* Coach Filter Dropdown */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <User className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Select Coach:</span>
                </div>
                <Select value={selectedCoachFilter} onValueChange={setSelectedCoachFilter}>
                  <SelectTrigger className="w-[200px] sm:w-[240px] h-9 text-xs font-semibold bg-background">
                    <SelectValue placeholder="All Coaches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs font-bold">
                      All Coaches ({classes.length} Sessions)
                    </SelectItem>
                    {uniqueCoaches.map((c) => (
                      <SelectItem key={c.coachName} value={c.coachName} className="text-xs">
                        {c.coachName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredClasses.map((cls) => {
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
                          {cls.date}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                        {cls.module}
                      </h4>

                      <div className="text-[11px] text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1.5 text-foreground font-bold">
                          <GraduationCap className="h-4 w-4 text-indigo-600 shrink-0" />
                          <span>{cls.coachName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{cls.venue}</span>
                        </div>
                        {cls.time && (
                          <div className="flex items-center gap-1.5 text-[10px] font-mono">
                            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span>{cls.time}</span>
                          </div>
                        )}
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
                        <span>Generate Attendance QR</span>
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

        {/* 2. Projector Display Area */}
        <div ref={displaySectionRef} className="space-y-4">
          {isDisplayingScreen && selectedClass ? (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant={activeScreenMode === 'attendance' ? 'default' : 'outline'}
                    onClick={() => setActiveScreenMode('attendance')}
                    className="h-9 text-xs sm:text-sm font-semibold gap-2"
                  >
                    <Tv className="h-4 w-4" />
                    <span>1. Hall Attendance Screen (16:9)</span>
                  </Button>

                  <Button
                    variant={activeScreenMode === 'feedback' ? 'default' : 'outline'}
                    onClick={() => setActiveScreenMode('feedback')}
                    className="h-9 text-xs sm:text-sm font-semibold gap-2"
                  >
                    <MessageSquareHeart className="h-4 w-4 text-[#D4A017]" />
                    <span>2. Feedback Form Screen</span>
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDisplayingScreen(false)}
                  className="h-8 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1 w-fit"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Close Screen Display</span>
                </Button>
              </div>

              {/* TAB 1: ATTENDANCE PROJECTOR DISPLAY (16:9 WIDESCREEN) */}
              {activeScreenMode === 'attendance' && (
                <div className="overflow-hidden rounded-2xl border-2 border-[#0B1F3A] bg-[#0B1F3A] text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
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
                          {selectedClass.coachName} · {selectedClass.regionName} · {selectedClass.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/40 text-xs px-2.5 py-1 gap-1">
                        <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                        <span>ATTENDANCE SESSION ACTIVE</span>
                      </Badge>
                      <div className="font-mono text-xs font-bold text-white/90 bg-white/10 px-3 py-1 rounded-md hidden sm:flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#D4A017]" />
                        <span>{currentTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-10 items-center bg-gradient-to-r from-[#0B1F3A] via-[#112D55] to-[#0B1F3A]">
                    {/* Left: Giant Attendance QR */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center text-center">
                      <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border-4 border-[#D4A017]">
                        {attendanceQrUrl ? (
                          <img
                            src={attendanceQrUrl}
                            alt={`Attendance QR for ${selectedClass.coachName}`}
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
                        <span>Scan QR for Attendance Confirmation ({selectedClass.coachName})</span>
                      </div>
                    </div>

                    {/* Right: Instructions & Session Details */}
                    <div className="md:col-span-7 space-y-4">
                      <div>
                        <Badge className="bg-[#D4A017] text-[#0B1F3A] font-bold text-xs uppercase mb-2">
                          {selectedClass.module}
                        </Badge>
                        <h3 className="text-xl sm:text-3xl font-black text-white">
                          Training Session Attendance Verification
                        </h3>
                        <p className="text-xs sm:text-sm text-white/75 mt-1 leading-relaxed">
                          Please use your smartphone camera to scan the QR code on screen to confirm your attendance for today's training session.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div className="rounded-xl bg-white/10 p-3.5 border border-white/15 text-center">
                          <div className="font-bold text-white text-xs sm:text-sm">1. Scan QR Code</div>
                          <div className="text-white/60 text-[11px] mt-0.5">Open phone camera</div>
                        </div>
                        <div className="rounded-xl bg-white/10 p-3.5 border border-white/15 text-center">
                          <div className="font-bold text-white text-xs sm:text-sm">2. Enter IC / ID</div>
                          <div className="text-white/60 text-[11px] mt-0.5">National IC or Pass ID</div>
                        </div>
                        <div className="rounded-xl bg-emerald-500/20 p-3.5 border border-emerald-400/40 text-center">
                          <div className="font-bold text-emerald-300 text-xs sm:text-sm">3. Verified!</div>
                          <div className="text-white/80 text-[11px] mt-0.5">Status saved instantly</div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-black/30 p-3.5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-white/80 gap-2">
                        <span>Coach: <strong className="text-white">{selectedClass.coachName}</strong></span>
                        <span className="font-mono text-[#D4A017]">{selectedClass.venue} · {selectedClass.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FEEDBACK FORM PROJECTOR DISPLAY */}
              {activeScreenMode === 'feedback' && (
                <div className="overflow-hidden rounded-2xl border-2 border-indigo-900 bg-[#0B1F3A] text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
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

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-10 items-center bg-gradient-to-r from-[#0B1F3A] via-[#1E1B4B] to-[#0B1F3A]">
                    {/* Left: Giant Feedback QR */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center text-center">
                      <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border-4 border-indigo-400">
                        {feedbackQrUrl ? (
                          <img
                            src={feedbackQrUrl}
                            alt={`Feedback QR for ${selectedClass.coachName}`}
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
                            ? `Pre-Session Questionnaire (${selectedClass.coachName})`
                            : `Post-Session Evaluation (${selectedClass.coachName})`}
                        </span>
                      </div>
                    </div>

                    {/* Right: Feedback Prompt */}
                    <div className="md:col-span-7 space-y-4">
                      <div>
                        <Badge className="bg-indigo-600 text-white font-bold text-xs uppercase mb-2">
                          {feedbackPhase === 'pre' ? 'Pre-Session Survey' : 'Post-Session Evaluation'}
                        </Badge>
                        <h3 className="text-xl sm:text-3xl font-black text-white">
                          Please Complete Your Training Feedback
                        </h3>
                        <p className="text-xs sm:text-sm text-white/75 mt-1 leading-relaxed">
                          Your honest feedback regarding <strong>{selectedClass.coachName}</strong> at <strong>{selectedClass.venue}</strong> ensures high-quality training delivery.
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 border border-white/15 text-xs">
                          <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                          <span>Trainer Mastery &amp; Content Clarity Evaluation</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 border border-white/15 text-xs">
                          <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                          <span>Practical Applicability for MSME Business Operations</span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
                        <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-relaxed">
                          <strong className="text-amber-300 block">Feedback Confidentiality:</strong>
                          All scores and comments submitted are strictly <strong>CONFIDENTIAL</strong> and reviewed exclusively by the <strong>Executive Admin Dashboard</strong>.
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
                Screen Display Not Yet Generated
              </h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Please select a coach and click <strong>[Generate Attendance QR]</strong> on any session above to display the 16:9 widescreen projector screen.
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
            <Link href="/" className="hover:text-foreground">Participant Portal</Link>
            <span>·</span>
            <Link href="/admin" className="hover:text-foreground">Executive Admin Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
