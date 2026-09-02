'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  UserPlus,
  CheckCircle2,
  XCircle,
  QrCode,
  Loader2,
  ShieldCheck,
  Route,
  Smartphone,
  RotateCcw,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RegisterResponse, WorkflowStep } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';

const SECTORS = [
  'Retail',
  'Food & Beverage',
  'Manufacturing',
  'Healthcare',
  'Education',
  'Professional Services',
  'Agriculture',
  'Tech & Digital',
  'Construction',
  'Tourism & Hospitality',
  'Others',
];

const REGIONS = [
  { code: 'KL', name: 'Kuala Lumpur (KL)' },
  { code: 'JHR', name: 'Johor (JHR)' },
  { code: 'PNG', name: 'Pulau Pinang (PNG)' },
  { code: 'SBH', name: 'Sabah (SBH)' },
  { code: 'SWK', name: 'Sarawak (SWK)' },
];

export function RegistrationConsole() {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState({
    icNumber: '',
    name: '',
    email: '',
    phone: '',
    sector: '',
    otherSector: '',
    region: 'KL',
    preferredMode: 'Physical',
  });

  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<RegisterResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.icNumber.trim() || !form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.sector) {
      toast.error(lang === 'ms' ? 'Sila lengkapkan semua ruangan wajib termasuk No. Telefon WhatsApp.' : 'Please fill in all required fields including WhatsApp Phone Number.');
      return;
    }

    const payload = {
      ...form,
      sector: form.sector === 'Others' && form.otherSector ? form.otherSector : form.sector,
    };

    setSubmitting(true);
    setResponse(null);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as RegisterResponse;
      setResponse(data);

      if (data.ok) {
        toast.success(lang === 'ms' ? 'Pendaftaran berjaya disahkan!' : 'Registration confirmed!');
      } else {
        toast.error(data.message || (lang === 'ms' ? 'Pendaftaran gagal.' : 'Registration failed.'));
      }
    } catch {
      toast.error(lang === 'ms' ? 'Ralat rangkaian — sila cuba lagi' : 'Network error — please retry');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm({
      icNumber: '',
      name: '',
      email: '',
      phone: '',
      sector: '',
      otherSector: '',
      region: 'KL',
      preferredMode: 'Physical',
    });
    setResponse(null);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-5">
      {/* Left: Registration form */}
      <Card className="lg:col-span-3 border shadow-sm">
        <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <UserPlus className="h-5 w-5 text-primary" />
            {t.regFormTitle}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {t.regFormSubtitle}
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* IC Number */}
            <div className="space-y-1.5">
              <Label htmlFor="ic" className="text-xs font-semibold">
                {t.regIcNumber} <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="ic"
                value={form.icNumber}
                onChange={(e) => setForm({ ...form, icNumber: e.target.value })}
                placeholder={t.regIcPlaceholder}
                className="font-mono text-sm h-10"
                required
              />
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">
                  {t.regFullName} <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ahmad bin Abdullah"
                  className="h-10 text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold">
                  {t.regPhone} <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0123456789 atau +6012-345 6789"
                  className="h-10 text-sm"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                {t.regEmail} <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ahmad@business.my"
                className="h-10 text-sm"
                required
              />
            </div>

            {/* Sector */}
            <div className="space-y-1.5">
              <Label htmlFor="sector" className="text-xs font-semibold">
                {t.regSector} <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.sector}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    sector: v,
                    otherSector: v === 'Others' ? form.otherSector : '',
                  })
                }
              >
                <SelectTrigger className="h-10 text-sm" id="sector">
                  <SelectValue placeholder={t.regSelectSector} />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((s) => (
                    <SelectItem key={s} value={s} className="text-sm">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.sector === 'Others' && (
                <Input
                  value={form.otherSector}
                  onChange={(e) => setForm({ ...form, otherSector: e.target.value })}
                  placeholder="Sila nyatakan sektor perniagaan anda"
                  className="mt-2 h-10 text-sm"
                  required
                />
              )}
            </div>

            {/* Region */}
            <div className="space-y-1.5">
              <Label htmlFor="region" className="text-xs font-semibold">
                {t.regRegion} <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.region}
                onValueChange={(v) => setForm({ ...form, region: v })}
              >
                <SelectTrigger className="h-10 text-sm" id="region">
                  <SelectValue placeholder={t.regSelectRegion} />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r.code} value={r.code} className="text-sm">
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Mode */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t.regPreferredMode}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={form.preferredMode === 'Physical' ? 'default' : 'outline'}
                  onClick={() => setForm({ ...form, preferredMode: 'Physical' })}
                  className={cn(
                    'h-10 text-xs font-medium',
                    form.preferredMode === 'Physical'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-muted',
                  )}
                >
                  {t.regPhysicalMode}
                </Button>
                <Button
                  type="button"
                  variant={form.preferredMode === 'Online' ? 'default' : 'outline'}
                  onClick={() => setForm({ ...form, preferredMode: 'Online' })}
                  className={cn(
                    'h-10 text-xs font-medium',
                    form.preferredMode === 'Online'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-muted',
                  )}
                >
                  {t.regOnlineMode}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground pt-0.5">
                {form.preferredMode === 'Physical' ? t.regPhysicalDesc : t.regOnlineDesc}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 h-11 text-sm font-semibold gap-2 bg-gradient-to-r from-[#0B1F3A] to-[#1E3A8A] text-white hover:opacity-95"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.regSubmitting}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 text-[#D4A017]" />
                    {t.regSubmitBtn}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={reset}
                disabled={submitting}
                className="h-11 sm:h-11 text-xs gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Right: Confirmation Pass Result */}
      <div className="lg:col-span-2 space-y-4">
        {!response ? (
          <Card className="h-full min-h-[340px] flex flex-col justify-center items-center text-center p-6 border-dashed bg-muted/20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
              <QrCode className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-sm font-semibold">{lang === 'ms' ? 'Pengesahan Tempat Rasmi' : 'Official Seat Confirmation'}</h3>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
              {lang === 'ms'
                ? 'Lengkapkan borang di sebelah untuk mengesahkan tempat anda. Pas kehadiran digital ber-QR akan dijana dan dihantar terus ke WhatsApp anda.'
                : 'Complete the form to confirm your seat. Your digital pass will be generated and dispatched directly to your WhatsApp.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Outcome banner */}
            <div
              className={cn(
                'flex items-start gap-3 rounded-xl border p-4 shadow-sm',
                response.ok
                  ? response.capacityRouted
                    ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
                    : 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                  : 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30',
              )}
            >
              {response.ok ? (
                response.capacityRouted ? (
                  <Route className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
                )
              ) : (
                <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-rose-600" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold text-foreground">
                  {response.ok
                    ? t.regSuccessTitle
                    : response.status === 'DUPLICATE_ENTRY'
                      ? (lang === 'ms' ? 'No. IC Sudah Didaftarkan' : 'Duplicate IC Number Blocked')
                      : (lang === 'ms' ? 'Pendaftaran Tidak Berjaya' : 'Registration Failed')}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{response.message}</p>

                {response.participant && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs rounded-lg bg-background/80 p-3 border">
                    <div>
                      <span className="text-muted-foreground text-[11px] block">{t.regParticipantId}:</span>
                      <span className="font-mono font-bold text-primary">{response.participant.participantId}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[11px] block">{t.regAssignedMode}:</span>
                      <span className="font-semibold text-foreground">
                        {response.participant.finalMode.replace('Registered_', '')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Official Confirmation Slip Pass Card */}
            {response.ok && response.qrDataUrl && response.participant && (
              <Card className="border-2 border-[#D4A017]/40 bg-gradient-to-b from-[#0B1F3A] to-[#1E293B] text-white p-5 flex flex-col items-center justify-center text-center shadow-lg rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {t.regConfirmedBadge}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#D4A017] tracking-wider uppercase mb-2">
                  {t.regSlipTitle}
                </h4>
                
                {/* QR Image Container */}
                <div className="relative rounded-2xl bg-white p-3 shadow-xl my-1">
                  <img
                    src={response.qrDataUrl}
                    alt={`QR Pass for ${response.participant.participantId}`}
                    className="h-40 w-40 sm:h-44 sm:w-44 object-contain"
                  />
                </div>

                <div className="mt-2.5 rounded-lg bg-amber-500/20 border border-amber-400/30 p-2.5 text-left w-full space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span>{t.regQrLockedBadge}</span>
                  </div>
                  <p className="text-[10px] text-white/80 leading-tight">
                    {t.regQrLockedDesc}
                  </p>
                </div>

                <div className="mt-3 space-y-1 w-full text-center">
                  <div className="font-mono font-bold text-xl text-[#D4A017]">
                    {response.participant.participantId}
                  </div>
                  <div className="font-semibold text-base text-white truncate">
                    {response.participant.name}
                  </div>
                  <div className="text-xs text-white/70">
                    {response.participant.region} · {response.participant.finalMode.replace('Registered_', '')}
                  </div>
                </div>

                {/* Direct WhatsApp Action */}
                <div className="mt-4 flex flex-col items-center gap-2 w-full">
                  {response.participant.phone && (
                    <a
                      href={`https://wa.me/${response.participant.phone.replace(/[^0-9]/g, '').replace(/^0/, '60')}?text=${encodeURIComponent(
                        `✅ *PENGESAHAN PENDAFTARAN INSKEN*\n\nHai *${response.participant.name}*!\nPendaftaran anda untuk *Program Latihan A.I. PMKS ASEAN* telah DISAHKAN.\n\n🎟️ *ID Peserta:* ${response.participant.participantId}\n📍 *Wilayah:* ${response.participant.region}\n📋 *Mod:* ${response.participant.finalMode.replace('Registered_', '')}\n\n👉 *Pautan Pas Kehadiran Digital:* ${typeof window !== 'undefined' ? window.location.origin : 'https://insken.workers.dev'}/pass/${response.participant.participantId}\n\n_Sila simpan pautan ini untuk imbasan kehadiran pada hari program._`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#25D366] px-4 py-3 text-xs font-bold text-white shadow-lg hover:bg-[#1EBE5D] transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{lang === 'ms' ? 'Buka Mesej di WhatsApp Anda' : 'Open Message in WhatsApp'}</span>
                    </a>
                  )}

                  <Button
                    variant="outline"
                    onClick={reset}
                    className="w-full h-9 border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs gap-1.5"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    {t.regRegisterAnother}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
