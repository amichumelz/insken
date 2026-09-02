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
  Send,
  Smartphone,
  Download,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RegisterResponse, WorkflowStep } from '@/lib/types';
import { WhatsAppPreview } from './whatsapp-preview';
import { useLanguage } from '@/lib/i18n';

const SECTORS = [
  'Retail',
  'Food & Beverage',
  'Manufacturing',
  'Healthcare',
  'Education',
  'Finance & Banking',
  'Technology',
  'Tourism & Hospitality',
  'Government / Public Sector',
  'Professional Services',
  'Agriculture',
  'Others',
];

const REGIONS = [
  { code: 'KL', name: 'Kuala Lumpur' },
  { code: 'JHR', name: 'Johor' },
  { code: 'PNG', name: 'Penang' },
  { code: 'SBH', name: 'Sabah' },
  { code: 'SWK', name: 'Sarawak' },
];

const STEP_ICON: Record<WorkflowStep['status'], React.ElementType> = {
  success: CheckCircle2,
  rejected: XCircle,
  routed: Route,
};

const STEP_TONE: Record<WorkflowStep['status'], string> = {
  success: 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30',
  rejected: 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30',
  routed: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30',
};

const STEP_ICON_TONE: Record<WorkflowStep['status'], string> = {
  success: 'text-emerald-600',
  rejected: 'text-rose-600',
  routed: 'text-amber-600',
};

export function RegistrationConsole() {
  const { t, lang } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<RegisterResponse | null>(null);
  const [form, setForm] = useState({
    icNumber: '',
    name: '',
    email: '',
    phone: '',
    sector: 'Retail',
    otherSector: '',
    region: 'KL',
    preferredMode: 'Physical',
  });

  const resolvedSector = form.sector === 'Others' ? form.otherSector.trim() || 'Others' : form.sector;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.icNumber || !form.name || !form.email) {
      toast.error(lang === 'ms' ? 'No. IC, Nama Penuh dan Emel adalah wajib.' : 'IC Number, Full Name, and Email are required.');
      return;
    }
    if (!form.sector) {
      toast.error(lang === 'ms' ? 'Sila pilih sektor perniagaan anda.' : 'Please select your business sector.');
      return;
    }
    if (form.sector === 'Others' && !form.otherSector.trim()) {
      toast.error(lang === 'ms' ? 'Sila nyatakan sektor anda jika memilih "Others".' : 'Please specify your sector when "Others" is selected.');
      return;
    }
    setSubmitting(true);
    setResponse(null);
    try {
      const payload = { ...form, sector: resolvedSector };
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as RegisterResponse;
      setResponse(data);
      if (data.ok) {
        toast.success(lang === 'ms' ? 'Pendaftaran berjaya disahkan!' : (data.message ?? 'Registered successfully'));
      } else if (data.status === 'DUPLICATE_ENTRY') {
        toast.error(lang === 'ms' ? 'No. IC ini sudah didaftarkan.' : (data.message ?? 'Duplicate entry — already registered'));
      } else {
        toast.error(data.error ?? (lang === 'ms' ? 'Pendaftaran gagal.' : 'Registration failed'));
      }
    } catch {
      toast.error(lang === 'ms' ? 'Ralat sambungan rangkaian. Sila cuba lagi.' : 'Network error — please retry');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setResponse(null);
    setForm({
      icNumber: '',
      name: '',
      email: '',
      phone: '',
      sector: 'Retail',
      otherSector: '',
      region: 'KL',
      preferredMode: 'Physical',
    });
  };

  const regionName = response?.participant
    ? REGIONS.find((r) => r.code === response.participant!.region)?.name ?? response.participant.region
    : '';

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:gap-6',
        response?.ok && response.qrDataUrl && response.whatsapp
          ? 'lg:grid-cols-12'
          : 'lg:grid-cols-5',
      )}
    >
      {/* Left: Registration form */}
      <Card className={cn('border shadow-sm', response?.ok && response.qrDataUrl ? 'lg:col-span-5' : 'lg:col-span-3')}>
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
                  {t.regPhone}
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+6012-345 6789"
                  className="h-10 text-sm"
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
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {form.sector === 'Others' && (
                <div className="space-y-1.5 pt-1.5">
                  <Label htmlFor="otherSector" className="text-xs font-semibold">
                    {lang === 'ms' ? 'Sila nyatakan sektor anda' : 'Please specify your sector'} <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="otherSector"
                    value={form.otherSector}
                    onChange={(e) => setForm({ ...form, otherSector: e.target.value })}
                    placeholder="cth: Logistik, Pembinaan, Kraf..."
                    className="h-10 text-sm"
                    required
                  />
                </div>
              )}
            </div>

            {/* Region & Mode */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t.regRegion}</Label>
                <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder={t.regSelectRegion} />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => (
                      <SelectItem key={r.code} value={r.code}>
                        {r.code} · {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t.regPreferredMode}</Label>
                <Select
                  value={form.preferredMode}
                  onValueChange={(v) => setForm({ ...form, preferredMode: v })}
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Physical">{t.regPhysicalMode}</SelectItem>
                    <SelectItem value="Online">{t.regOnlineMode}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mode Guidance Note */}
            <div className="rounded-lg bg-muted/50 p-2.5 text-[11px] text-muted-foreground border">
              <p>
                {form.preferredMode === 'Physical'
                  ? t.regPhysicalDesc
                  : t.regOnlineDesc}
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

      {/* Right: Workflow Log & Digital Pass Preview */}
      <div className={cn(response?.ok && response.qrDataUrl ? 'lg:col-span-7' : 'lg:col-span-2', 'space-y-4')}>
        {!response ? (
          <Card className="h-full min-h-[300px] flex flex-col justify-center items-center text-center p-6 border-dashed bg-muted/20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
              <QrCode className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-sm font-semibold">{lang === 'ms' ? 'Pas Digital Automatik' : 'Instant Digital Pass'}</h3>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
              {lang === 'ms'
                ? 'Lengkapkan borang di sebelah untuk menjana Pas Kehadiran Rasmi ber-QR dan ID Peserta secara serta-merta.'
                : 'Complete the form to instantly generate your official QR entry pass and participant ID.'}
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

            {/* Digital Pass Card (Mobile & Desktop optimized) */}
            {response.ok && response.qrDataUrl && response.participant && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* QR Pass Box */}
                <Card className="border-2 border-[#D4A017]/40 bg-gradient-to-b from-[#0B1F3A] to-[#1E293B] text-white p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-md">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#D4A017]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider mb-3">
                    <Sparkles className="h-3 w-3" /> Pas Kehadiran Digital
                  </div>
                  
                  {/* QR Image Container */}
                  <div className="rounded-xl bg-white p-3 shadow-lg my-1">
                    <img
                      src={response.qrDataUrl}
                      alt={`QR Pass for ${response.participant.participantId}`}
                      className="h-36 w-36 sm:h-44 sm:w-44 object-contain"
                    />
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="font-mono font-bold text-lg text-[#D4A017]">
                      {response.participant.participantId}
                    </div>
                    <div className="font-medium text-sm text-white truncate max-w-[220px]">
                      {response.participant.name}
                    </div>
                    <div className="text-xs text-white/70">
                      {response.participant.region} · {response.participant.finalMode.replace('Registered_', '')}
                    </div>
                  </div>

                  <a
                    href={response.qrDataUrl}
                    download={`INSKEN-Pass-${response.participant.participantId}.png`}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 w-full rounded-lg bg-[#D4A017] px-3 py-2 text-xs font-bold text-[#0B1F3A] shadow hover:bg-[#F59E0B] transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {t.regDownloadPass}
                  </a>
                </Card>

                {/* WhatsApp Confirmation Card */}
                {response.whatsapp && (
                  <Card className="p-4 sm:p-5 flex flex-col justify-between border shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Smartphone className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {t.regWhatsAppPreview}
                        </span>
                      </div>
                      <WhatsAppPreview
                        participant={response.participant}
                        qrDataUrl={response.qrDataUrl}
                        whatsapp={response.whatsapp}
                        capacityRouted={!!response.capacityRouted}
                        regionName={regionName}
                      />
                    </div>

                    <Button
                      variant="outline"
                      onClick={reset}
                      className="mt-4 w-full h-9 text-xs gap-1.5"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      {t.regRegisterAnother}
                    </Button>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
