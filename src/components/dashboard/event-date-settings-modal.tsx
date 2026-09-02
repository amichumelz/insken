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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  CalendarDays,
  Calendar,
  Save,
  Loader2,
  CheckCircle2,
  Sparkles,
  Lock,
  Unlock,
  MapPin,
  Clock,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { DEFAULT_EVENT_DATES } from '@/lib/event-dates';

interface RegionDateItem {
  code: string;
  name: string;
  date: string;
  forceActive: boolean;
}

export function EventDateSettingsModal({ onSaved }: { onSaved?: () => void }) {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dates, setDates] = useState<Record<string, string>>(DEFAULT_EVENT_DATES);
  const [forceActiveMap, setForceActiveMap] = useState<Record<string, boolean>>({ KL: true });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/config/event-dates');
      const data = await res.json();
      if (data.ok) {
        if (data.dates) setDates(data.dates);
        if (data.forceActiveMap) setForceActiveMap(data.forceActiveMap);
      }
    } catch {
      // use default
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadSettings();
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/config/event-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates, forceActiveMap }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(lang === 'ms' ? 'Jadual tarikh latihan berjaya disimpan!' : 'Training schedule saved!');
        setOpen(false);
        if (onSaved) onSaved();
      } else {
        toast.error(data.message || 'Gagal menyimpan tarikh.');
      }
    } catch {
      toast.error('Ralat sambungan pelayan.');
    } finally {
      setSaving(false);
    }
  };

  const REGIONS = [
    { code: 'KL', name: 'Kuala Lumpur (KL)' },
    { code: 'JHR', name: 'Johor (JHR)' },
    { code: 'PNG', name: 'Pulau Pinang (PNG)' },
    { code: 'SBH', name: 'Sabah (SBH)' },
    { code: 'SWK', name: 'Sarawak (SWK)' },
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-indigo-400/50 bg-indigo-50/50 text-indigo-900 dark:text-indigo-300 hover:bg-indigo-100 font-semibold text-xs gap-1.5 shadow-sm"
        >
          <CalendarDays className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{lang === 'ms' ? 'Tetapan Tarikh Latihan' : 'Training Date Settings'}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-0 overflow-hidden border shadow-2xl">
        <DialogHeader className="bg-[#0B1F3A] text-white px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#D4A017]" />
            <DialogTitle className="text-base font-bold text-white">
              {lang === 'ms' ? 'Pengurusan Tarikh Sesi & Akses QR Kehadiran' : 'Training Session Dates & QR Access Control'}
            </DialogTitle>
          </div>
          <p className="text-xs text-white/70 mt-1">
            {lang === 'ms'
              ? 'Tetapkan tarikh kelas bagi setiap wilayah. Akses Kod QR Kehadiran peserta akan dibuka secara automatik mengikut tarikh yang anda tetapkan.'
              : 'Set event dates per region. Participant attendance QR access unlocks automatically on the configured date.'}
          </p>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto scroll-styled">
          {/* Notice banner */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5 text-xs text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/20 dark:text-indigo-300 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Kawalan Akses Automatik:</strong> Peserta yang mendaftar sebelum tarikh kelas akan menerima Slip Pengesahan dengan notis <em>Kod QR Dikunci</em>. Pada hari kelas (atau apabila suis <strong>Buka Akses Hari Ini</strong> dihidupkan), pas mereka bertukar aktif secara automatik!
            </div>
          </div>

          {/* Region Date rows */}
          <div className="space-y-3">
            {REGIONS.map((r) => {
              const currentDate = dates[r.code] || DEFAULT_EVENT_DATES[r.code] || todayStr;
              const isForce = !!forceActiveMap[r.code];
              const isDateOpen = isForce || todayStr >= currentDate;

              return (
                <div
                  key={r.code}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                      {r.code}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-foreground">{r.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isDateOpen ? (
                          <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] gap-1 px-1.5 py-0 border-emerald-400/40">
                            <Unlock className="h-2.5 w-2.5" /> Akses Dibuka
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1 px-1.5 py-0">
                            <Lock className="h-2.5 w-2.5" /> Dikunci Sehingga {currentDate}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {/* Date Input */}
                    <div className="space-y-1">
                      <Input
                        type="date"
                        value={currentDate}
                        onChange={(e) => setDates({ ...dates, [r.code]: e.target.value })}
                        className="h-9 text-xs font-medium w-36"
                      />
                    </div>

                    {/* Force Active Toggle */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <Label htmlFor={`force-${r.code}`} className="text-[11px] text-muted-foreground whitespace-nowrap cursor-pointer">
                        Buka Hari Ini
                      </Label>
                      <Switch
                        id={`force-${r.code}`}
                        checked={isForce}
                        onCheckedChange={(val) => setForceActiveMap({ ...forceActiveMap, [r.code]: val })}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-9 text-xs"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-9 bg-primary text-primary-foreground font-bold text-xs gap-1.5 shadow"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Simpan Tetapan Tarikh</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
