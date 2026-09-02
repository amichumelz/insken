'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Star,
  CheckCircle2,
  Sparkles,
  Loader2,
  ArrowLeft,
  GraduationCap,
  HeartHandshake,
} from 'lucide-react';
import { useLanguage, LanguageToggle } from '@/lib/i18n';

function FeedbackFormContent() {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();

  const trainerId = searchParams.get('trainer') || 'coach-a';
  const trainerName = trainerId === 'coach-b' ? 'Coach B (Dr. Nadia)' : 'Coach A (En. Farhan)';
  const phase = searchParams.get('phase') || 'post';
  const sessionParam = searchParams.get('session') || 'Program Latihan Kemahiran A.I. PMKS ASEAN';

  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [trainerKnowledge, setTrainerKnowledge] = useState(5);
  const [contentClarity, setContentClarity] = useState(5);
  const [practicalUse, setPracticalUse] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainerId,
          phase,
          participantName: name.trim() || 'Peserta INSKEN',
          sessionName: sessionParam,
          rating,
          trainerKnowledge,
          contentClarity,
          practicalUse,
          comment,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSubmitted(true);
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Penghantaran gagal.');
      }
    } catch {
      toast.error('Ralat rangkaian semasa menghantar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b bg-[#0B1F3A] text-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 gap-2">
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
                <span className="font-semibold text-xs sm:text-base truncate">INSKEN</span>
                <span className="shrink-0 rounded bg-[#D4A017]/20 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-[#F59E0B]">
                  {phase === 'pre' ? 'Pre-Session' : 'Borang Maklum Balas'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-white/70 truncate hidden xs:block sm:block">
                Penilaian Kualiti &amp; Pengalaman Latihan
              </p>
            </div>
          </div>

          <LanguageToggle />
        </div>
      </header>

      {/* Main Form Content */}
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-6 sm:py-10">
        {submitted ? (
          <Card className="border shadow-lg p-6 sm:p-8 text-center space-y-4 rounded-2xl bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">
                {lang === 'ms' ? 'Terima Kasih Atas Maklum Balas Anda!' : 'Thank You for Your Feedback!'}
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                {lang === 'ms'
                  ? 'Penilaian anda telah direkodkan secara selamat. Maklum balas anda amat berharga bagi meningkatkan kualiti latihan keusahawanan negara.'
                  : 'Your evaluation has been securely recorded. Your feedback helps us continually enhance the training experience.'}
              </p>
            </div>

            <div className="pt-3">
              <Link href="/">
                <Button className="h-10 text-xs font-semibold gap-1.5 bg-[#0B1F3A] hover:bg-[#1E3A8A]">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {lang === 'ms' ? 'Kembali ke Laman Utama' : 'Return to Home'}
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="border shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-[#0B1F3A] text-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <Badge className="bg-[#D4A017] text-[#0B1F3A] font-bold text-[10px] uppercase">
                  {phase === 'pre' ? 'Pre-Session Survey' : 'Post-Session Evaluation'}
                </Badge>
                <span className="text-[11px] text-white/70 flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-[#D4A017]" />
                  <span>{trainerName}</span>
                </span>
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-white mt-2">
                {lang === 'ms' ? 'Borang Maklum Balas Sesi Latihan' : 'Training Session Feedback Form'}
              </CardTitle>
              <p className="text-xs text-white/70 mt-0.5">
                {sessionParam}
              </p>
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Participant Name (Optional) */}
                <div className="space-y-1.5">
                  <Label htmlFor="fb-name" className="text-xs font-semibold">
                    {lang === 'ms' ? 'Nama Anda (Pilihan / Boleh Dikosongkan)' : 'Your Name (Optional)'}
                  </Label>
                  <Input
                    id="fb-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'ms' ? 'Cth: Ahmad / Kosongkan untuk Tanpa Nama' : 'e.g. Ahmad or leave blank for Anonymous'}
                    className="h-10 text-sm"
                  />
                </div>

                {/* Overall Rating (1-5 Stars) */}
                <div className="space-y-2 rounded-xl bg-slate-50 dark:bg-slate-900 p-4 border">
                  <Label className="text-xs font-bold text-foreground block">
                    {lang === 'ms' ? '1. Penilaian Keseluruhan Sesi' : '1. Overall Session Rating'}
                  </Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`h-7 w-7 sm:h-8 sm:w-8 ${
                            star <= rating
                              ? 'fill-[#D4A017] text-[#D4A017]'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-[#D4A017]">{rating} / 5</span>
                  </div>
                </div>

                {/* Question 2: Trainer Knowledge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      {lang === 'ms' ? '2. Pengetahuan & Penguasaan Jurulatih' : '2. Trainer Knowledge & Expertise'}
                    </Label>
                    <span className="text-xs font-bold text-primary">{trainerKnowledge} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={trainerKnowledge}
                    onChange={(e) => setTrainerKnowledge(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-primary"
                  />
                </div>

                {/* Question 3: Content Clarity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      {lang === 'ms' ? '3. Kejelasan Kandungan & Modul' : '3. Content Clarity & Structure'}
                    </Label>
                    <span className="text-xs font-bold text-primary">{contentClarity} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={contentClarity}
                    onChange={(e) => setContentClarity(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-primary"
                  />
                </div>

                {/* Question 4: Practical Applicability */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      {lang === 'ms' ? '4. Kebolehlaksanaan untuk Perniagaan Anda' : '4. Applicability to Your Business'}
                    </Label>
                    <span className="text-xs font-bold text-primary">{practicalUse} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={practicalUse}
                    onChange={(e) => setPracticalUse(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-primary"
                  />
                </div>

                {/* Comment */}
                <div className="space-y-1.5">
                  <Label htmlFor="comment" className="text-xs font-semibold">
                    {lang === 'ms' ? 'Komen / Cadangan Penambahbaikan' : 'Comments / Suggestions'}
                  </Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={lang === 'ms' ? 'Kongsi pandangan anda mengenai sesi ini...' : 'Share your feedback on this session...'}
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-gradient-to-r from-[#0B1F3A] to-[#1E3A8A] text-white font-bold text-xs gap-2 shadow-md hover:opacity-95"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{lang === 'ms' ? 'Menghantar Maklum Balas...' : 'Submitting Feedback...'}</span>
                    </>
                  ) : (
                    <>
                      <HeartHandshake className="h-4 w-4 text-[#D4A017]" />
                      <span>{lang === 'ms' ? 'Hantar Maklum Balas' : 'Submit Feedback'}</span>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-3.5 text-center text-xs text-muted-foreground">
        <p>© 2026 INSKEN · Institut Keusahawanan Negara</p>
      </footer>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuatkan...</div>}>
      <FeedbackFormContent />
    </Suspense>
  );
}
