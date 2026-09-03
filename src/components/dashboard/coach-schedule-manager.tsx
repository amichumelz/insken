'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  Calendar,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Save,
  Loader2,
  Sparkles,
  ExternalLink,
  Layers,
  CheckCircle2,
  RefreshCw,
  Tv,
} from 'lucide-react';
import Link from 'next/link';
import { CoachClassRecord } from '@/app/api/config/coaches/route';
import { DEFAULT_EVENT_DATES } from '@/lib/event-dates';

const REGIONS = [
  { code: 'KL', name: 'Kuala Lumpur (HQ)' },
  { code: 'JHR', name: 'Johor Bahru' },
  { code: 'PNG', name: 'Pulau Pinang' },
  { code: 'SBH', name: 'Sabah (Kota Kinabalu)' },
  { code: 'SWK', name: 'Sarawak (Kuching)' },
];

export function CoachScheduleManager({ onSaved }: { onSaved?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Region dates & force-active map
  const [dates, setDates] = useState<Record<string, string>>(DEFAULT_EVENT_DATES);
  const [forceActiveMap, setForceActiveMap] = useState<Record<string, boolean>>({
    KL: false,
    JHR: false,
    PNG: false,
    SBH: false,
    SWK: false,
  });

  // Coach Classes list
  const [classes, setClasses] = useState<CoachClassRecord[]>([]);

  // Add new class form
  const [newCoachName, setNewCoachName] = useState('');
  const [newModule, setNewModule] = useState('');
  const [newRegion, setNewRegion] = useState('KL');
  const [newTime, setNewTime] = useState('09:00 AM - 05:00 PM');
  const [newVenue, setNewVenue] = useState('Dewan Utama INSKEN KL Sentral');

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Load Event Dates
      const datesRes = await fetch('/api/config/event-dates');
      const datesData = await datesRes.json();
      if (datesData.ok) {
        if (datesData.dates) setDates(datesData.dates);
        if (datesData.forceActiveMap) setForceActiveMap(datesData.forceActiveMap);
      }

      // 2. Load Coaches & Classes
      const coachRes = await fetch('/api/config/coaches');
      const coachData = await coachRes.json();
      if (coachData.ok && Array.isArray(coachData.classes)) {
        setClasses(coachData.classes);
      }
    } catch {
      toast.error('Ralat memuatkan data tarikh dan jurulatih.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync class dates whenever region dates change
  const handleDateChange = (regionCode: string, newDate: string) => {
    setDates((prev) => ({ ...prev, [regionCode]: newDate }));
    setClasses((prev) =>
      prev.map((c) => (c.region === regionCode ? { ...c, date: newDate } : c))
    );
  };

  const handleToggleForceActive = (regionCode: string) => {
    setForceActiveMap((prev) => ({
      ...prev,
      [regionCode]: !prev[regionCode],
    }));
  };

  const handleAddClass = () => {
    if (!newCoachName.trim() || !newModule.trim() || !newVenue.trim()) {
      toast.error('Sila lengkapkan Nama Jurulatih, Modul dan Tempat.');
      return;
    }

    const regionObj = REGIONS.find((r) => r.code === newRegion) || REGIONS[0];
    const coachSlug = newCoachName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const classDate = dates[newRegion] || '2026-09-20';

    const newRecord: CoachClassRecord = {
      id: `cls-${Date.now()}`,
      coachId: `coach-${coachSlug}`,
      coachName: newCoachName.trim(),
      module: newModule.trim(),
      region: newRegion,
      regionName: regionObj.name,
      date: classDate,
      time: newTime,
      venue: newVenue.trim(),
      targetSeats: 200,
    };

    setClasses((prev) => [...prev, newRecord]);
    setNewCoachName('');
    setNewModule('');
    toast.success('Sesi jurulatih baharu berjaya ditambah ke senarai!');
  };

  const handleDeleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    toast.info('Sesi kelas dipadamkan daripada senarai.');
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // 1. Save Event Dates
      await fetch('/api/config/event-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates, forceActiveMap }),
      });

      // 2. Save Coach Classes (with updated region dates)
      const syncedClasses = classes.map((c) => ({
        ...c,
        date: dates[c.region] || c.date,
      }));

      await fetch('/api/config/coaches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classes: syncedClasses }),
      });

      toast.success('Semua tetapan tarikh, jurulatih & jadual kelas berjaya disimpan dan diselaraskan!');
      if (onSaved) onSaved();
    } catch {
      toast.error('Ralat semasa menyimpan tetapan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">
          Memuatkan pengurusan tarikh dan jurulatih...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <GraduationCap className="h-4 w-4" />
            <span>PENGURUSAN BERSEPADU SESI &amp; JURULATIH</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-foreground">
            Tetapan Tarikh Latihan &amp; Pengurusan Jurulatih
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
            Urus tarikh latihan bagi setiap wilayah dan selaraskan maklumat jurulatih, topik modul, serta lokasi dewan dalam satu halaman yang sama. Perubahan akan diselaraskan serta-merta ke Portal Jurulatih.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <Link href="/coach" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs font-semibold gap-1.5 border-indigo-300 bg-indigo-50 text-indigo-900 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              <Tv className="h-3.5 w-3.5 text-indigo-600" />
              <span>Buka Portal Jurulatih</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={handleSaveAll}
            disabled={saving}
            className="h-9 bg-[#0B1F3A] hover:bg-[#112D55] text-white text-xs font-bold gap-1.5 shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 text-[#D4A017]" />
                <span>Simpan Semua Perubahan</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* SECTION 1: REGION DATES MANAGEMENT (5 REGIONS) */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-base sm:text-lg font-bold">
              1. Penyelarasan Tarikh Latihan Mengikut Wilayah
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Tetapkan tarikh rasmi bagi setiap wilayah. Semua sesi jurulatih di bawah wilayah tersebut akan diselaraskan tarikhnya secara automatik.
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {REGIONS.map((r) => {
              const currentDate = dates[r.code] || '2026-09-02';
              const isForced = forceActiveMap[r.code] || false;

              return (
                <div
                  key={r.code}
                  className="rounded-xl border bg-card p-3.5 space-y-3 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <Badge className="bg-[#0B1F3A] text-white text-xs font-bold">
                      {r.code}
                    </Badge>
                    <span className="text-[11px] font-semibold text-muted-foreground truncate">
                      {r.name.replace(` (${r.code})`, '')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground font-semibold">
                      Tarikh Sesi Latihan
                    </Label>
                    <Input
                      type="date"
                      value={currentDate}
                      onChange={(e) => handleDateChange(r.code, e.target.value)}
                      className="h-9 text-xs font-mono font-bold bg-background"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t text-[11px]">
                    <span className="text-muted-foreground font-medium">Buka Sesi Terus</span>
                    <Switch
                      checked={isForced}
                      onCheckedChange={() => handleToggleForceActive(r.code)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: ADD NEW COACH / CLASS SESSION */}
      <Card className="border shadow-sm border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/10">
        <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-base sm:text-lg font-bold text-indigo-950 dark:text-indigo-200">
              2. Tambah Jurulatih &amp; Sesi Kelas Baharu
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Masukkan maklumat jurulatih baharu untuk dijadualkan ke dalam sistem. Tarikh akan dipadankan secara automatik mengikut wilayah yang dipilih.
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nama Jurulatih (Coach)</Label>
              <Input
                placeholder="Contoh: Dr. Zulkifli (Coach E)"
                value={newCoachName}
                onChange={(e) => setNewCoachName(e.target.value)}
                className="h-9 text-xs bg-background"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Modul / Topik Latihan A.I.</Label>
              <Input
                placeholder="Contoh: AI Copywriting & Social Ads Automation"
                value={newModule}
                onChange={(e) => setNewModule(e.target.value)}
                className="h-9 text-xs bg-background"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Wilayah</Label>
              <Select value={newRegion} onValueChange={setNewRegion}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r.code} value={r.code} className="text-xs">
                      {r.name} (Tarikh: {dates[r.code] || '2026-09-02'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Tempat / Dewan Latihan</Label>
              <Input
                placeholder="Contoh: Hotel Grand Riverview, Kota Bharu"
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
                className="h-9 text-xs bg-background"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Waktu Sesi</Label>
              <Input
                placeholder="09:00 AM - 05:00 PM"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="h-9 text-xs font-mono bg-background"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleAddClass}
                className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Sesi ke Jadual</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3: SCHEDULED CLASSES & COACH LIST */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base sm:text-lg font-bold">
                3. Senarai Jadual Sesi Latihan Aktif ({classes.length} Sesi)
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-xs font-semibold w-fit">
              Semua tarikh selaras dengan Wilayah
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Setiap sesi di bawah akan menjana Kod QR Kehadiran dan Borang Maklum Balas yang unik mengikut profil jurulatih dan lokasi dewan di Portal Jurulatih.
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {classes.map((cls) => {
              const effectiveDate = dates[cls.region] || cls.date;

              return (
                <div
                  key={cls.id}
                  className="rounded-xl border bg-card p-4 transition-all flex flex-col justify-between space-y-3 hover:border-indigo-300 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <Badge className="bg-indigo-600 text-white text-[10px] font-bold">
                        {cls.region} · {cls.regionName}
                      </Badge>
                      <span className="font-mono text-[11px] font-bold text-indigo-950 dark:text-indigo-200 bg-amber-500/15 border border-amber-400/40 px-2 py-0.5 rounded flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-[#D4A017]" />
                        {effectiveDate}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-2">
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

                  <div className="pt-2 border-t flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">ID: {cls.id}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteClass(cls.id)}
                      className="h-7 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs gap-1 px-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Padam Sesi</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end pt-4 border-t">
            <Button
              onClick={handleSaveAll}
              disabled={saving}
              className="h-10 bg-[#0B1F3A] hover:bg-[#112D55] text-white text-xs sm:text-sm font-bold gap-2 shadow-md px-6"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan Perubahan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 text-[#D4A017]" />
                  <span>Simpan Semua Perubahan Tarikh &amp; Jurulatih</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
