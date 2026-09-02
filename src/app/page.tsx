'use client';

import Link from 'next/link';
import { RegistrationConsole } from '@/components/dashboard/registration-console';
import { Sparkles, QrCode, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage, LanguageToggle } from '@/lib/i18n';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      {/* Top Participant Navigation Bar */}
      <header className="sticky top-0 z-40 border-b bg-[#0B1F3A] text-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 gap-2">
          {/* Brand Logo & Name */}
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
                  {t.participantBadge}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-white/70 truncate hidden xs:block sm:block">
                {t.brandSub}
              </p>
            </div>
          </div>

          {/* Right Header Actions: Language Toggle & Checkin Link */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <LanguageToggle />

            <Link href="/checkin">
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white text-xs gap-1 px-2 sm:px-3"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{t.navAlreadyRegistered}</span>
                <span className="text-[11px] sm:text-xs">{t.navCheckAttendance}</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Registration Form Area */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Intro Banner */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#D4A017] uppercase tracking-wider">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {t.regOfficialForm}
              </div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                {t.regTitle}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {t.regSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start md:self-auto rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground border">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-[11px] sm:text-xs">{t.regIcRoutingBadge}</span>
            </div>
          </div>
        </div>

        {/* Registration Component */}
        <RegistrationConsole />
      </main>

      {/* Footer with Admin Access link */}
      <footer className="border-t bg-card py-4 text-center text-xs text-muted-foreground mt-8">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p>© 2026 INSKEN · Institut Keusahawanan Negara</p>
          <div className="flex items-center gap-3 text-[11px]">
            <Link href="/checkin" className="hover:text-foreground underline sm:no-underline">
              {t.navCheckAttendance}
            </Link>
            <span>·</span>
            <Link href="/admin" className="inline-flex items-center gap-1 hover:text-foreground font-medium text-slate-600 dark:text-slate-400">
              <Lock className="h-3 w-3" /> {t.navAdminAccess}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
