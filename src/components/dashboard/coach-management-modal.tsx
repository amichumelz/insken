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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  GraduationCap,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Save,
  Loader2,
  Sparkles,
  Building2,
} from 'lucide-react';
import { CoachClassRecord } from '@/app/api/config/coaches/route';

const REGIONS = [
  { code: 'KL', name: 'Kuala Lumpur (HQ)' },
  { code: 'JHR', name: 'Johor Bahru' },
  { code: 'PNG', name: 'Pulau Pinang' },
  { code: 'SBH', name: 'Sabah (Kota Kinabalu)' },
  { code: 'SWK', name: 'Sarawak (Kuching)' },
];

export function CoachManagementModal({ onSaved }: { onSaved?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<CoachClassRecord[]>([]);

  // Form state for adding a new coach/class
  const [newCoachName, setNewCoachName] = useState('');
  const [newModule, setNewModule] = useState('');
  const [newRegion, setNewRegion] = useState('KL');
  const [newDate, setNewDate] = useState('2026-09-20');
  const [newTime, setNewTime] = useState('09:00 AM - 05:00 PM');
  const [newVenue, setNewVenue] = useState('Dewan Utama INSKEN');

  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/config/coaches');
      const data = await res.json();
      if (data.ok && Array.isArray(data.classes)) {
        setClasses(data.classes);
      }
    } catch {
      toast.error('Ralat memuatkan data jurulatih.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadClasses();
  }, [open]);

  const handleAddClass = () => {
    if (!newCoachName.trim() || !newModule.trim() || !newVenue.trim()) {
      toast.error('Sila lengkapkan Nama Jurulatih, Modul dan Tempat.');
      return;
    }

    const regionObj = REGIONS.find((r) => r.code === newRegion) || REGIONS[0];
    const coachSlug = newCoachName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newRecord: CoachClassRecord = {
      id: `cls-${Date.now()}`,
      coachId: `coach-${coachSlug}`,
      coachName: newCoachName.trim(),
      module: newModule.trim(),
      region: newRegion,
      regionName: regionObj.name,
      date: newDate,
      time: newTime,
      venue: newVenue.trim(),
      targetSeats: 200,
    };

    setClasses((prev) => [...prev, newRecord]);
    setNewCoachName('');
    setNewModule('');
    toast.success('Sesi jurulatih baharu ditambah ke senarai!');
  };

  const handleDeleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    toast.info('Sesi kelas dipadamkan.');
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/config/coaches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classes }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success('Semua maklumat jurulatih dan kelas berjaya dikemaskini!');
        setOpen(false);
        if (onSaved) onSaved();
      } else {
        toast.error('Gagal menyimpan perubahan.');
      }
    } catch {
      toast.error('Ralat semasa menghubungi pelayan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-indigo-300 bg-indigo-50 text-indigo-900 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 text-xs gap-1.5 font-semibold"
        >
          <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
          <span>Urus Jurulatih &amp; Kelas</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold">
                Pengurusan Jurulatih &amp; Jadual Kelas (Coach Management)
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Tambah jurulatih baharu, topik latihan, wilayah, tarikh dan tempat dewan. Maklumat ini akan diselaraskan secara automatik ke Portal Jurulatih.
              </p>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12 space-y-2">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* 1. Add New Coach & Class Form */}
            <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">
                <Plus className="h-4 w-4 text-indigo-600" />
                <span>Tambah Jurulatih / Sesi Kelas Baharu</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Nama Jurulatih (Coach)</Label>
                  <Input
                    placeholder="Contoh: Dr. Zulkifli (Coach E)"
                    value={newCoachName}
                    onChange={(e) => setNewCoachName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Modul / Topik Latihan A.I.</Label>
                  <Input
                    placeholder="Contoh: AI Copywriting & Social Ads"
                    value={newModule}
                    onChange={(e) => setNewModule(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Wilayah</Label>
                  <Select value={newRegion} onValueChange={setNewRegion}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r.code} value={r.code} className="text-xs">
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Tarikh Sesi</Label>
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Waktu</Label>
                  <Input
                    placeholder="09:00 AM - 05:00 PM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Tempat / Dewan Latihan</Label>
                  <Input
                    placeholder="Contoh: Hotel Grand Riverview, KB"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  onClick={handleAddClass}
                  className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Sesi ke Jadual</span>
                </Button>
              </div>
            </div>

            {/* 2. Existing Scheduled Classes List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Senarai Sesi &amp; Jurulatih Aktif ({classes.length} Sesi)
                </h4>
                <span className="text-[11px] text-muted-foreground">
                  Kod QR akan dijana berbeza secara unik mengikut setiap jurulatih dan tempat.
                </span>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {classes.map((cls, idx) => (
                  <div
                    key={cls.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border bg-card hover:bg-muted/20 text-xs"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-600 text-white text-[10px] font-bold">
                          {cls.region} · {cls.regionName}
                        </Badge>
                        <span className="font-bold text-foreground truncate">
                          {cls.coachName}
                        </span>
                      </div>
                      <div className="font-semibold text-indigo-950 dark:text-indigo-200">
                        {cls.module}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-[11px]">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="h-3 w-3 text-[#D4A017]" />
                          {cls.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {cls.venue}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClass(cls.id)}
                        className="h-8 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Padam</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-[11px] text-muted-foreground">
                Perubahan akan diselaraskan serta-merta ke Portal Jurulatih.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="h-9 text-xs"
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="h-9 bg-[#0B1F3A] hover:bg-[#112D55] text-white text-xs font-bold gap-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 text-[#D4A017]" />
                      <span>Simpan Perubahan Jadual</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
