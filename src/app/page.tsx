'use client';

import Link from 'next/link';
import { RegistrationConsole } from '@/components/dashboard/registration-console';
import { Sparkles, QrCode, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      {/* Top Participant Navigation Bar */}
      <header className="sticky top-0 z-40 border-b bg-[#0B1F3A] text-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#D4A017] to-[#F59E0B] text-sm font-bold text-[#0B1F3A] shadow">
              I
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base">INSKEN Portal</span>
                <span className="rounded bg-[#D4A017]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#F59E0B]">
                  Pendaftaran Peserta
                </span>
              </div>
              <p className="text-[11px] text-white/70 hidden sm:block">
                ASEAN MSME A.I. Skills Training Program
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/checkin">
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white text-xs gap-1.5"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sudah Daftar?</span> Semak Kehadiran
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Registration Form */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6 sm:py-8 space-y-6">
        {/* Intro Banner */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" /> Borang Pendaftaran Rasmi
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Pendaftaran Program Latihan A.I. PMKS ASEAN
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Sila lengkapkan butiran perniagaan anda di bawah untuk menyertai latihan. Pas kehadiran digital ber-QR akan dijana serta-merta.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground border">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Pengesahan No. IC Unik &amp; Laluan Kapasiti Automatik</span>
            </div>
          </div>
        </div>

        {/* Registration Component */}
        <RegistrationConsole />
      </main>

      {/* Footer with subtle Admin Link */}
      <footer className="border-t bg-card py-4 text-center text-xs text-muted-foreground mt-8">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 INSKEN · Institut Keusahawanan Negara</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/checkin" className="hover:text-foreground">Semak Kehadiran</Link>
            <span>·</span>
            <Link href="/admin" className="inline-flex items-center gap-1 hover:text-foreground">
              <Lock className="h-2.5 w-2.5" /> Akses Pentadbir (Admin)
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
