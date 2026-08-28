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
  ArrowRight,
  QrCode,
  Loader2,
  ShieldCheck,
  Route,
  Send,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RegisterResponse, WorkflowStep } from '@/lib/types';
import { WhatsAppPreview } from './whatsapp-preview';

const SECTORS = [
  'Retail',
  'Food & Beverage',
  'Professional Services',
  'Tech & Digital',
  'Manufacturing',
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
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<RegisterResponse | null>(null);
  const [form, setForm] = useState({
    icNumber: '',
    name: '',
    email: '',
    phone: '',
    sector: 'Retail',
    region: 'KL',
    preferredMode: 'Physical',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.icNumber || !form.name || !form.email) {
      toast.error('IC Number, Name, and Email are required.');
      return;
    }
    setSubmitting(true);
    setResponse(null);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as RegisterResponse;
      setResponse(data);
      if (data.ok) {
        toast.success(data.message ?? 'Registered successfully');
      } else if (data.status === 'DUPLICATE_ENTRY') {
        toast.error(data.message ?? 'Duplicate entry — already registered');
      } else {
        toast.error(data.error ?? 'Registration failed');
      }
    } catch (err) {
      toast.error('Network error — please retry');
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
        'grid grid-cols-1 gap-4',
        response?.ok && response.qrDataUrl && response.whatsapp
          ? 'lg:grid-cols-12'
          : 'lg:grid-cols-5',
      )}
    >
      {/* Left: Registration form */}
      <Card className={cn(response?.ok && response.qrDataUrl ? 'lg:col-span-4' : 'lg:col-span-2')}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-4 w-4 text-primary" />
            Participant Registration
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Phase 1: Ingestion &amp; Validation — IC is the primary unique key.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ic" className="text-xs font-medium">
                IC Number / Passport <span className="text-rose-500">*</span>{' '}
                <span className="font-normal text-muted-foreground">(Primary Key)</span>
              </Label>
              <Input
                id="ic"
                value={form.icNumber}
                onChange={(e) => setForm({ ...form, icNumber: e.target.value })}
                placeholder="900101-14-1234-5"
                className="font-mono text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium">
                  Full Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ahmad bin Abdullah"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium">
                  Phone (WhatsApp)
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+6012-345 6789"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                Email <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@business.my"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Region</Label>
                <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
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
                <Label className="text-xs font-medium">Sector</Label>
                <Select value={form.sector} onValueChange={(v) => setForm({ ...form, sector: v })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Mode</Label>
                <Select
                  value={form.preferredMode}
                  onValueChange={(v) => setForm({ ...form, preferredMode: v })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Physical">Physical</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Validate &amp; Register
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={reset} disabled={submitting}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Right: Workflow log + result */}
      <Card className={cn(response?.ok && response.qrDataUrl ? 'lg:col-span-5' : 'lg:col-span-3')}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Route className="h-4 w-4 text-primary" />
            Agentic Workflow Trace
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Phase 1 → Phase 2 → Asset Delivery — every decision the agent makes is logged below.
          </p>
        </CardHeader>
        <CardContent>
          {!response ? (
            <div className="flex h-[420px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
              <QrCode className="h-10 w-10 text-muted-foreground/60" />
              <div>
                <div className="text-sm font-medium">No workflow yet</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Submit a registration to see the agent's full decision trail — duplicate check, capacity routing, and QR asset generation.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Outcome banner */}
              <div
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3',
                  response.ok
                    ? response.capacityRouted
                      ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
                      : 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                    : 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30',
                )}
              >
                {response.ok ? (
                  response.capacityRouted ? (
                    <Route className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  )
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">
                    {response.ok
                      ? response.capacityRouted
                        ? 'Capacity Routed to Online'
                        : 'Registration Confirmed'
                      : response.status === 'DUPLICATE_ENTRY'
                        ? 'DUPLICATE_ENTRY Rejected'
                        : 'Registration Failed'}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{response.message}</p>
                  {response.participant && (
                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] sm:grid-cols-3">
                      <div>
                        <span className="text-muted-foreground">Participant ID:</span>{' '}
                        <span className="font-mono font-semibold">{response.participant.participantId}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Region:</span>{' '}
                        <span className="font-semibold">{response.participant.region}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mode:</span>{' '}
                        <span className="font-semibold">{response.participant.finalMode}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <span className="text-muted-foreground">QR Seed:</span>{' '}
                        <span className="font-mono text-[10px]">{response.qrSeed}</span>
                      </div>
                    </div>
                  )}
                  {response.existing && (
                    <div className="mt-2 text-[11px]">
                      <span className="text-muted-foreground">Existing record:</span>{' '}
                      <span className="font-mono font-semibold">{response.existing.participantId}</span>{' '}
                      <span className="text-muted-foreground">· registered {new Date(response.existing.createdAt).toLocaleDateString('en-MY')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Workflow timeline */}
              <div className="space-y-2">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Workflow Steps
                </div>
                {response.workflow.map((step, i) => {
                  const Icon = STEP_ICON[step.status];
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-full border-2 bg-background',
                            STEP_TONE[step.status],
                          )}
                        >
                          <Icon className={cn('h-3.5 w-3.5', STEP_ICON_TONE[step.status])} />
                        </div>
                        {i < response.workflow.length - 1 && (
                          <div className="my-0.5 h-full min-h-[24px] w-px bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-xs font-semibold">{step.step}</span>
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                            {step.phase}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">
                          {new Date(step.timestamp).toLocaleTimeString('en-MY', { hour12: false })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp delivery preview — only rendered after a successful registration with QR asset */}
      {response?.ok && response.qrDataUrl && response.whatsapp && response.participant && (
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone className="h-4 w-4 text-emerald-600" />
              WhatsApp Asset Delivery
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Live dispatch via WhatsApp Business API · template{' '}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                {response.whatsapp.template}
              </code>
            </p>
          </CardHeader>
          <CardContent>
            <WhatsAppPreview
              participant={response.participant}
              qrDataUrl={response.qrDataUrl}
              whatsapp={response.whatsapp}
              capacityRouted={!!response.capacityRouted}
              regionName={regionName}
            />

            {/* Dispatch meta */}
            <div className="mt-4 space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5 text-[11px] dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
                <Send className="h-3 w-3" />
                Dispatch Confirmation
              </div>
              <div className="grid grid-cols-1 gap-x-3 gap-y-1 text-[11px] sm:grid-cols-2">
                <MetaRow label="Recipient" value={response.whatsapp.recipient || '—'} />
                <MetaRow
                  label="Dispatched"
                  value={new Date(response.whatsapp.dispatchedAt).toLocaleString('en-MY', { hour12: false })}
                />
                <MetaRow label="Template" value={response.whatsapp.template} mono />
                <MetaRow label="QR Payload" value={response.qrPayload ?? ''} mono />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('truncate font-medium', mono && 'font-mono text-[10px]')}>{value}</span>
    </div>
  );
}
