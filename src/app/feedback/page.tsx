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
import { useLanguage } from '@/lib/i18n';

function FeedbackFormContent() {
  const searchParams = useSearchParams();

  const trainerId = searchParams.get('trainer') || 'coach-farhan';
  const trainerNameParam = searchParams.get('trainerName');
  const trainerName = trainerNameParam ? decodeURIComponent(trainerNameParam) : (trainerId.includes('nadia') ? 'Dr. Nadia (Coach B)' : 'Mr. Farhan (Coach A)');
  const phase = searchParams.get('phase') || 'post';
  const sessionParam = searchParams.get('session') || 'ASEAN MSMEs AI Skills Training Programme';

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
          participantName: name.trim() || 'INSKEN Participant',
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
        toast.success(data.message || 'Feedback submitted successfully!');
      } else {
        toast.error(data.message || 'Submission failed.');
      }
    } catch {
      toast.error('Network error during submission.');
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
                  {phase === 'pre' ? 'Pre-Session Survey' : 'Feedback Form'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-white/70 truncate hidden xs:block sm:block">
                Training Quality &amp; Experience Evaluation
              </p>
            </div>
          </div>
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
                Thank You for Your Feedback!
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Your evaluation has been securely recorded. Your feedback helps INSKEN continually elevate entrepreneurship training quality.
              </p>
            </div>

            <div className="pt-2">
              <Link href="/">
                <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 font-semibold">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Return to Home
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="border shadow-xl rounded-2xl overflow-hidden bg-card">
            {/* Form Top Banner */}
            <div className="bg-gradient-to-r from-[#0B1F3A] via-[#112D55] to-[#0B1F3A] text-white p-5 sm:p-6 text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#D4A017]/20 border border-[#D4A017]/40 px-3 py-0.5 text-xs font-bold text-[#F59E0B]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{phase === 'pre' ? 'PRE-SESSION SURVEY' : 'POST-SESSION EVALUATION'}</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white">
                {sessionParam}
              </h1>
              <div className="flex items-center justify-center gap-1.5 text-xs text-white/80 font-medium">
                <GraduationCap className="h-4 w-4 text-[#D4A017]" />
                <span>Coach: <strong>{trainerName}</strong></span>
              </div>
            </div>

            <CardContent className="p-5 sm:p-6 space-y-5">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Participant Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold">
                    Participant Name / Company (Optional)
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ahmad bin Abdullah"
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>

                {/* Question 1: Overall Satisfaction */}
                <div className="space-y-2 rounded-xl border p-3.5 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      1. Overall Session Satisfaction
                    </Label>
                    <Badge variant="outline" className="text-xs font-bold text-amber-600 border-amber-400">
                      {rating} / 5 Stars
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1.5 rounded-lg transition-transform hover:scale-110 ${
                          star <= rating ? 'text-amber-500' : 'text-muted-foreground/30'
                        }`}
                      >
                        <Star className="h-7 w-7 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2: Trainer Mastery */}
                <div className="space-y-2 rounded-xl border p-3.5 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      2. Trainer Subject Matter Mastery
                    </Label>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {trainerKnowledge} / 5
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <Button
                        key={score}
                        type="button"
                        size="sm"
                        variant={trainerKnowledge === score ? 'default' : 'outline'}
                        onClick={() => setTrainerKnowledge(score)}
                        className="h-8 text-xs font-bold"
                      >
                        {score}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Question 3: Content Clarity */}
                <div className="space-y-2 rounded-xl border p-3.5 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      3. Clarity &amp; Delivery of Content
                    </Label>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {contentClarity} / 5
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <Button
                        key={score}
                        type="button"
                        size="sm"
                        variant={contentClarity === score ? 'default' : 'outline'}
                        onClick={() => setContentClarity(score)}
                        className="h-8 text-xs font-bold"
                      >
                        {score}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Question 4: Practical Applicability */}
                <div className="space-y-2 rounded-xl border p-3.5 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      4. Practical Applicability to Business
                    </Label>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {practicalUse} / 5
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <Button
                        key={score}
                        type="button"
                        size="sm"
                        variant={practicalUse === score ? 'default' : 'outline'}
                        onClick={() => setPracticalUse(score)}
                        className="h-8 text-xs font-bold"
                      >
                        {score}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div className="space-y-1.5">
                  <Label htmlFor="comment" className="text-xs font-semibold">
                    Suggestions, Comments &amp; Testimonials
                  </Label>
                  <Textarea
                    id="comment"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share what you liked most about today's session..."
                    className="text-xs sm:text-sm resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-[#0B1F3A] text-white hover:bg-[#112D55] font-bold text-xs sm:text-sm gap-2 shadow-md"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting Feedback...</span>
                    </>
                  ) : (
                    <>
                      <HeartHandshake className="h-4 w-4 text-[#D4A017]" />
                      <span>Submit Official Feedback</span>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-4 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-2 px-4 sm:flex-row">
          <p>© 2026 INSKEN · ASEAN MSMEs AI Skills Training Programme</p>
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:text-foreground">Registration</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <FeedbackFormContent />
    </Suspense>
  );
}
