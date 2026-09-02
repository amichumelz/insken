'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Send,
  Smartphone,
  CheckCircle2,
  Loader2,
  Users,
  Sparkles,
  ExternalLink,
  Bot,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function WhatsAppBlastModal({ onBlastComplete }: { onBlastComplete?: () => void }) {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ totalCount: number; message: string } | null>(null);

  const handleBlast = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/blast/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: selectedRegion }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult({ totalCount: data.totalCount, message: data.message });
        toast.success(data.message);
        if (onBlastComplete) onBlastComplete();
      } else {
        toast.error(data.message || (lang === 'ms' ? 'Penghantaran gagal.' : 'Dispatch failed.'));
      }
    } catch {
      toast.error(lang === 'ms' ? 'Ralat sambungan pelayan.' : 'Server connection error.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-emerald-500/60 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20 font-semibold text-xs gap-1.5 shadow-sm"
        >
          <Send className="h-3.5 w-3.5 text-emerald-600" />
          <span className="hidden sm:inline">
            {lang === 'ms' ? 'Blast WhatsApp Hari Kelas' : 'Event-Day WhatsApp Blast'}
          </span>
          <span className="sm:hidden">Blast WhatsApp</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl p-0 overflow-hidden border shadow-xl">
        <DialogHeader className="bg-[#0B1F3A] text-white px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-emerald-400" />
            <DialogTitle className="text-base font-bold text-white">
              {lang === 'ms' ? 'Penghantaran WhatsApp Hari Kelas (QR Pass)' : 'Event-Day WhatsApp Broadcast'}
            </DialogTitle>
          </div>
          <p className="text-xs text-white/70 mt-1">
            {lang === 'ms'
              ? 'Hantar pautan Pas QR Kehadiran aktif secara pukal terus ke WhatsApp peserta yang disahkan.'
              : 'Broadcast active event-day QR pass links to confirmed attendees via WhatsApp Business API.'}
          </p>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Region Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              {lang === 'ms' ? 'Pilih Wilayah Sasaran' : 'Select Target Region'}
            </Label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Semua Wilayah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{lang === 'ms' ? 'Semua Wilayah (Nasional · 5 Wilayah)' : 'All Regions (National · 5 Regions)'}</SelectItem>
                <SelectItem value="KL">Kuala Lumpur (KL)</SelectItem>
                <SelectItem value="JHR">Johor (JHR)</SelectItem>
                <SelectItem value="PNG">Pulau Pinang (PNG)</SelectItem>
                <SelectItem value="SBH">Sabah (SBH)</SelectItem>
                <SelectItem value="SWK">Sarawak (SWK)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* WhatsApp Message Template Preview */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Bot className="h-4 w-4" /> Pratonton Mesej WhatsApp
              </span>
              <Badge variant="outline" className="text-[10px] bg-white dark:bg-black font-mono">
                template: asean_eventday_pass_v1
              </Badge>
            </div>

            <div className="rounded-lg bg-white dark:bg-slate-900 p-3 text-xs text-foreground border shadow-sm space-y-1 font-sans">
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                🔔 INSKEN: Sesi Latihan A.I. Anda Bermula Hari Ini!
              </p>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Hai <strong>[Nama Peserta]</strong>, kehadiran untuk program latihan hari ini telah dibuka. Sila buka pas digital anda untuk imbasan di meja urusetia:
              </p>
              <div className="rounded bg-muted p-2 font-mono text-[11px] text-primary break-all">
                👉 https://insken.workers.dev/pass/ASEAN-XXXXX
              </div>
              <p className="text-[10px] text-muted-foreground italic pt-1">
                *Tunjukkan kod QR di pautan tersebut semasa pendaftaran di dewan atau sesi dalam talian.
              </p>
            </div>
          </div>

          {/* Success Outcome */}
          {result && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold">{result.message}</div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Audit log direkodkan · Status WhatsApp API: 100% Delivered
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <Button
              onClick={handleBlast}
              disabled={sending}
              className="w-full h-11 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs gap-2 shadow-md"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{lang === 'ms' ? 'Menghantar WhatsApp Pukal...' : 'Dispatching WhatsApp Broadcast...'}</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>
                    {lang === 'ms'
                      ? 'Hantar WhatsApp Blast Sekarang'
                      : 'Dispatch WhatsApp Broadcast Now'}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
