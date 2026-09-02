'use client';

import Link from 'next/link';
import { CheckinConsole } from '@/components/dashboard/checkin-console';
import { QrCode, UserPlus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckinPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top Participant Navigation Bar */}
      <header className="sticky top-0 z-40 border-b bg-[#0B1F3A] text-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#D4A017] to-[#F59E0B] text-sm font-bold text-[#0B1F3A] shadow">
              I
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base">INSKEN Portal</span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                  Kehadiran
                </span>
              </div>
              <p className="text-[11px] text-white/70 hidden sm:block">
                ASEAN MSME A.I. Skills Training Program
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/register">
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white text-xs gap-1.5"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Belum Daftar?</span> Daftar Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Check-in Area */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-6 sm:py-8 space-y-6">
        {/* Header Title Card */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <QrCode className="h-3.5 w-3.5" /> Kaunter Imbasan Kehadiran
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Pengesahan Kehadiran Peserta (Check-in)
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Imbas kod QR pada Pas Digital anda atau masukkan No. Kad Pengenalan / ID Peserta untuk mendaftar kehadiran.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground border">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Pengesahan Serta-merta ke Cloudflare D1</span>
            </div>
          </div>
        </div>

        {/* Checkin Component */}
        <CheckinConsole />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-4 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-4xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 INSKEN · Institut Keusahawanan Negara</p>
          <p className="text-[11px]">Sistem Pengesahan Kehadiran Digital</p>
        </div>
      </footer>
    </div>
  );
}
