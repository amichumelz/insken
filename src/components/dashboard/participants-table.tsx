'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Participant } from '@/lib/types';
import { Search, RefreshCw, Users, ChevronLeft, ChevronRight, Pencil, Check, X, Download, Building2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n';
import { exportParticipantRegistryCsv } from '@/lib/export-utils';
import { SECTORS, normalizeSectorName } from '@/lib/sectors';

const STATUS_TONE: Record<string, string> = {
  DUPLICATE_ENTRY: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  Registered_Physical: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  Registered_Online: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  Attended_Physical: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  Attended_Online: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
};

export function ParticipantsTable() {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState<Participant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(0);
  const pageSize = 25;

  // Edit modal state for participant enterprise details
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [editForm, setEditForm] = useState({
    companyName: '',
    sector: '',
    businessLocation: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (region !== 'all') params.set('region', region);
    if (status !== 'all') params.set('status', status);
    params.set('limit', String(pageSize));
    params.set('offset', String(page * pageSize));
    try {
      const res = await fetch(`/api/participants?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [q, region, status, page]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (region !== 'all') params.set('region', region);
        if (status !== 'all') params.set('status', status);
        params.set('limit', String(pageSize));
        params.set('offset', String(page * pageSize));
        const res = await fetch(`/api/participants?${params.toString()}`, { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) {
          setItems(data.items ?? []);
          setTotal(data.total ?? 0);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, region, status, page]);

  useEffect(() => {
    setPage(0);
  }, [q, region, status]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Open modal to view and edit participant details
  const openEditModal = (p: Participant) => {
    setEditingParticipant(p);
    setEditForm({
      companyName: p.companyName || '',
      sector: normalizeSectorName(p.sector),
      businessLocation: p.businessLocation || '',
    });
  };

  // Persist updated participant details via PATCH /api/participants
  const handleSaveParticipantEdit = async () => {
    if (!editingParticipant) return;
    setSavingEdit(true);
    try {
      const res = await fetch('/api/participants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingParticipant.id,
          participantId: editingParticipant.participantId,
          companyName: editForm.companyName.trim(),
          sector: editForm.sector.trim(),
          businessLocation: editForm.businessLocation.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === editingParticipant.id
              ? {
                  ...item,
                  companyName: editForm.companyName.trim(),
                  sector: editForm.sector.trim(),
                  businessLocation: editForm.businessLocation.trim(),
                }
              : item
          )
        );
        toast.success(`Maklumat peserta ${editingParticipant.name} berjaya dikemaskini.`);
        setEditingParticipant(null);
      } else {
        toast.error(data.error ?? 'Gagal mengemaskini maklumat peserta.');
      }
    } catch {
      toast.error('Ralat rangkaian — sila cuba lagi.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-5 w-5 text-primary" />
              {t.dashMasterRegistry}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {total.toLocaleString()} {lang === 'ms' ? 'rekod didaftarkan · No. IC adalah kunci unik utama' : 'records · IC is the unique primary key'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.dashSearchPlaceholder}
                className="h-9 w-full pl-8 text-xs sm:w-[220px]"
              />
            </div>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="h-9 w-[120px] text-xs">
                <SelectValue placeholder={t.dashFilterRegion} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === 'ms' ? 'Semua Wilayah' : 'All Regions'}</SelectItem>
                <SelectItem value="KL">Kuala Lumpur</SelectItem>
                <SelectItem value="JHR">Johor</SelectItem>
                <SelectItem value="PNG">Penang</SelectItem>
                <SelectItem value="SBH">Sabah</SelectItem>
                <SelectItem value="SWK">Sarawak</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue placeholder={t.dashFilterStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === 'ms' ? 'Semua Status' : 'All Statuses'}</SelectItem>
                <SelectItem value="Registered_Physical">{lang === 'ms' ? 'Daftar (Fizikal)' : 'Registered (Physical)'}</SelectItem>
                <SelectItem value="Registered_Online">{lang === 'ms' ? 'Daftar (Online)' : 'Registered (Online)'}</SelectItem>
                <SelectItem value="Attended_Physical">{lang === 'ms' ? 'Hadir (Fizikal)' : 'Attended (Physical)'}</SelectItem>
                <SelectItem value="Attended_Online">{lang === 'ms' ? 'Hadir (Online)' : 'Attended (Online)'}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (items.length === 0) {
                  toast.error('No participant records to export.');
                  return;
                }
                exportParticipantRegistryCsv(items);
                toast.success(`Exported ${items.length} participant records.`);
              }}
              className="h-9 text-xs font-semibold gap-1.5 border-primary/20 hover:bg-primary/5 px-2.5"
              title="Export Master Registry CSV"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={load} disabled={loading} className="h-9 w-9" title={t.navRefresh}>
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto scroll-styled">
          <table className="w-full text-xs min-w-[840px]">
            <thead className="border-y bg-muted/40">
              <tr className="text-left text-muted-foreground text-[11px]">
                <th className="w-10 px-2 sm:px-3 py-2.5 font-bold text-center">No.</th>
                <th className="px-3 py-2.5 font-medium">{t.regParticipantId}</th>
                <th className="px-3 py-2.5 font-medium">{t.dashName}</th>
                <th className="px-2 sm:px-3 py-2.5 font-medium">{lang === 'ms' ? 'Jantina' : 'Gender'}</th>
                <th className="px-2 sm:px-3 py-2.5 font-medium">{lang === 'ms' ? 'Umur' : 'Age'}</th>
                <th className="px-3 py-2.5 font-medium">{t.dashEmail || 'Email'}</th>
                <th className="hidden px-3 py-2.5 font-medium md:table-cell">{t.regIcNumber}</th>
                {/* Enterprise Columns as requested by user */}
                <th className="px-3 py-2.5 font-semibold text-foreground min-w-[200px]">
                  Nama Perusahaan / Perniagaan / Perkhidmatan:
                </th>
                <th className="px-3 py-2.5 font-semibold text-foreground min-w-[150px]">
                  CATEGORY
                </th>
                <th className="px-3 py-2.5 font-semibold text-foreground min-w-[220px]">
                  <div>Lokasi Perusahaan / Perniagaan / Perkhidmatan:</div>
                  <div className="text-[9px] font-normal text-muted-foreground">
                    Contoh: Cyberjaya, Putrajaya, Kuala Lumpur
                  </div>
                </th>
                <th className="px-3 py-2.5 font-semibold text-foreground min-w-[150px]">
                  <div>Sila tandakan:</div>
                  <div className="text-[9px] font-normal text-muted-foreground">
                    Persetujuan PDPA
                  </div>
                </th>
                <th className="px-3 py-2.5 font-medium">{t.checkinRegion}</th>
                <th className="px-3 py-2.5 font-medium">{t.dashStatus}</th>
                <th className="hidden px-3 py-2.5 font-medium md:table-cell">{t.dashRegisteredDate}</th>
                <th className="hidden px-3 py-2.5 font-medium sm:table-cell">{t.dashCheckinDate}</th>
                <th className="px-3 py-2.5 font-medium text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={16} className="px-3 py-8 text-center text-muted-foreground">
                    Loading registry...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={16} className="px-3 py-8 text-center text-muted-foreground">
                    No participants found.
                  </td>
                </tr>
              ) : (
                items.map((p, index) => (
                  <tr
                    key={p.id}
                    className="border-b transition-colors hover:bg-muted/30"
                  >
                    {/* No. */}
                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 text-center font-mono text-[11px] font-bold text-muted-foreground">
                      {page * pageSize + index + 1}
                    </td>

                    {/* Participant ID */}
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] font-semibold text-primary">
                      {p.participantId}
                    </td>

                    {/* Name */}
                    <td className="px-3 py-2 font-medium">{p.name}</td>

                    {/* Gender */}
                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 text-[11px]">
                      {p.gender ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] font-medium px-1.5 py-0.5 border shadow-2xs',
                            p.gender.toLowerCase() === 'female' || p.gender.toLowerCase() === 'perempuan'
                              ? 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-900/50'
                              : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50'
                          )}
                        >
                          {p.gender === 'Female' ? 'Perempuan' : p.gender === 'Male' ? 'Lelaki' : p.gender}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Age */}
                    <td className="whitespace-nowrap px-2 sm:px-3 py-2 text-[11px] font-mono text-muted-foreground">
                      {p.age ? `${p.age} thn` : '—'}
                    </td>

                    {/* Email */}
                    <td className="whitespace-nowrap px-3 py-2 text-[11px] text-muted-foreground">
                      {p.email ? (
                        <a
                          href={`mailto:${p.email}`}
                          className="hover:underline hover:text-foreground"
                          title={p.email}
                        >
                          {p.email}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* IC Number */}
                    <td className="hidden whitespace-nowrap px-3 py-2 font-mono text-[11px] text-muted-foreground md:table-cell">
                      {p.icNumber}
                    </td>

                    {/* Nama Perusahaan / Perniagaan / Perkhidmatan (Left of Sector) */}
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="group flex items-center gap-1.5 text-left text-[11px] hover:text-primary transition-colors cursor-pointer w-full"
                        title="Klik untuk kemaskini nama perusahaan"
                      >
                        <span className={cn('font-medium leading-tight', !p.companyName && 'text-muted-foreground/70 italic')}>
                          {p.companyName || '— (Klik untuk isi)'}
                        </span>
                        <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-70 text-primary shrink-0" />
                      </button>
                    </td>

                    {/* CATEGORY (Sector in the middle) */}
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="group flex items-center gap-1.5 text-left text-[11px] hover:text-primary transition-colors cursor-pointer w-full"
                        title="Klik untuk kemaskini sektor"
                      >
                        <span className="font-medium text-foreground leading-tight">{p.sector}</span>
                        <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-70 text-primary shrink-0" />
                      </button>
                    </td>

                    {/* Lokasi Perusahaan / Perniagaan / Perkhidmatan (Right of Sector) */}
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="group flex items-center gap-1.5 text-left text-[11px] hover:text-primary transition-colors cursor-pointer w-full"
                        title="Klik untuk kemaskini lokasi perusahaan"
                      >
                        <span className={cn('leading-tight', !p.businessLocation && 'text-muted-foreground/70 italic')}>
                          {p.businessLocation || '— (Klik untuk isi)'}
                        </span>
                        <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-70 text-primary shrink-0" />
                      </button>
                    </td>

                    {/* Sila tandakan: Persetujuan PDPA */}
                    <td className="px-3 py-2">
                      {p.pdpaConsent !== false ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50 gap-1 px-1.5 py-0.5 whitespace-nowrap"
                          title="Saya telah membaca dan bersetuju dengan Penyataan Perlindungan Data Peribadi – PDPA."
                        >
                          <Check className="h-2.5 w-2.5 text-emerald-600" />
                          <span>Bersetuju (PDPA)</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-200 whitespace-nowrap">
                          Belum Bersetuju
                        </Badge>
                      )}
                    </td>

                    {/* Region */}
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1 rounded bg-foreground/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/70">
                        {p.region}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          'inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap',
                          STATUS_TONE[p.status] ?? 'bg-muted text-muted-foreground',
                        )}
                      >
                        {p.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Registered Date */}
                    <td className="hidden whitespace-nowrap px-3 py-2 text-[11px] font-mono text-muted-foreground md:table-cell">
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>

                    {/* Checkin Date */}
                    <td className="hidden whitespace-nowrap px-3 py-2 text-[11px] font-mono sm:table-cell">
                      {p.checkInAt ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {new Date(p.checkInAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>

                    {/* Actions: Edit Modal Trigger */}
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(p)}
                        className="h-7 px-2 text-[11px] gap-1 hover:bg-primary/10 text-primary font-semibold"
                        title="Kemaskini Maklumat Perusahaan, Sektor & Lokasi"
                      >
                        <Pencil className="h-3 w-3" />
                        <span>Kemaskini</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-3 py-2 text-xs">
          <span className="text-muted-foreground">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total.toLocaleString()}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="h-7 px-2"
            >
              <ChevronLeft className="h-3 w-3" />
              Prev
            </Button>
            <span className="px-2 tabular-nums">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="h-7 px-2"
            >
              Next
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Edit Participant Enterprise & Details Modal */}
      <Dialog
        open={!!editingParticipant}
        onOpenChange={(open) => {
          if (!open) setEditingParticipant(null);
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto overscroll-contain">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Pencil className="h-4 w-4 text-primary" />
              Kemaskini Maklumat Peserta
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {editingParticipant?.name} ({editingParticipant?.participantId}) · IC: {editingParticipant?.icNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Nama Perusahaan / Perniagaan / Perkhidmatan */}
            <div className="space-y-1.5">
              <Label htmlFor="editCompanyName" className="text-xs font-semibold">
                Nama Perusahaan / Perniagaan / Perkhidmatan:
              </Label>
              <Input
                id="editCompanyName"
                value={editForm.companyName}
                onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                placeholder="Cth: Luqman And Imran Ice Cream (LQCC)"
                className="h-9 text-xs"
              />
            </div>

            {/* Sektor Perniagaan / Category */}
            <div className="space-y-1.5">
              <Label htmlFor="editSector" className="text-xs font-semibold">
                CATEGORY / Sektor Perniagaan:
              </Label>
              <Select
                value={editForm.sector}
                onValueChange={(v) => setEditForm({ ...editForm, sector: v })}
              >
                <SelectTrigger id="editSector" className="h-9 text-xs">
                  <SelectValue placeholder="Pilih Sektor" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lokasi Perusahaan / Perniagaan / Perkhidmatan */}
            <div className="space-y-1.5">
              <Label htmlFor="editBusinessLocation" className="text-xs font-semibold">
                Lokasi Perusahaan / Perniagaan / Perkhidmatan:
              </Label>
              <Input
                id="editBusinessLocation"
                value={editForm.businessLocation}
                onChange={(e) => setEditForm({ ...editForm, businessLocation: e.target.value })}
                placeholder="Contoh: Cyberjaya, Putrajaya, Kuala Lumpur"
                className="h-9 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                Contoh: Cyberjaya, Putrajaya, Kuala Lumpur
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingParticipant(null)}
              disabled={savingEdit}
              className="text-xs h-9"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveParticipantEdit}
              disabled={savingEdit}
              className="text-xs h-9 font-semibold gap-1.5 bg-[#0B1F3A] hover:bg-[#1E3A8A] text-white"
            >
              {savingEdit ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
