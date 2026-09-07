'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FinanceProgrammeItem,
  MilestonePaymentRecord,
  FinanceOverview,
  FinanceDataResponse,
  MilestoneProgressStatus,
  MilestonePaymentStatus,
} from '@/lib/types';
import { exportFinanceMilestonesCsv } from '@/lib/export-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Wallet,
  TrendingUp,
  Download,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  Banknote,
  DollarSign,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  Award,
  Users,
  CheckSquare,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fmtRM = (val: number) => {
  return `RM ${Number(val || 0).toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const fmtUSD = (val: number) => {
  return `USD ${Number(val || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const fmtNoDecimals = (val: number) => {
  return `RM ${Math.round(Number(val || 0)).toLocaleString('en-MY')}`;
};

export function FinanceMilestoneTracker({ refreshTick }: { refreshTick?: number }) {
  const [data, setData] = useState<FinanceDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'IN_REVIEW'>('ALL');
  const [milestoneFilter, setMilestoneFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'PENDING'>('ALL');
  const [currencyMode, setCurrencyMode] = useState<'MYR' | 'USD' | 'BOTH'>('BOTH');
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);

  // Modals state
  const [selectedAnnexMilestone, setSelectedAnnexMilestone] = useState<MilestonePaymentRecord | null>(null);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<MilestonePaymentRecord | null>(null);
  const [milestoneForm, setMilestoneForm] = useState<Partial<MilestonePaymentRecord>>({
    milestoneNumber: '',
    title: '',
    deliverable: '',
    dueDate: '',
    invoiceNo: '',
    tranchePct: 30,
    claimAmountUsd: 0,
    claimAmount: 0,
    amountPaid: 0,
    milestoneStatus: 'PENDING',
    paymentStatus: 'PENDING',
    paymentDate: '',
    grantor: 'ASEAN Foundation',
    recipient: 'Institut Keusahawanan Negara Berhad (INSKEN)',
    notes: '',
  });

  const [isProgModalOpen, setIsProgModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<FinanceProgrammeItem | null>(null);
  const [progForm, setProgForm] = useState<Partial<FinanceProgrammeItem>>({
    category: 'DE',
    name: '',
    allocation: 0,
    utilized: 0,
    committed: 0,
  });

  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);
  const [overviewForm, setOverviewForm] = useState({
    costs: 654791,
    netProfit: 444962,
    profitMarginPct: 40,
  });

  const [saving, setSaving] = useState(false);

  // Fetch Finance & Milestone Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/finance/milestones', { cache: 'no-store' });
      const json = (await res.json()) as FinanceDataResponse;
      if (json.ok) {
        setData(json);
        setOverviewForm({
          costs: json.overview.totalCosts,
          netProfit: json.overview.netProfit,
          profitMarginPct: json.overview.profitMarginPct,
        });
      }
    } catch {
      toast.error('Failed to load finance records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTick]);

  // Milestone Save
  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneForm.title || !milestoneForm.milestoneNumber) {
      toast.error('Please enter Milestone Number and Title.');
      return;
    }

    setSaving(true);
    try {
      const claim = Number(milestoneForm.claimAmount || 0);
      const paid = Number(milestoneForm.amountPaid || 0);
      const outstanding = Math.max(0, claim - paid);
      const paymentStatus: MilestonePaymentStatus =
        paid >= claim && claim > 0 ? 'PAID' : (milestoneForm.paymentStatus as MilestonePaymentStatus) || 'PENDING';

      const payload: MilestonePaymentRecord = {
        id: editingMilestone?.id || `ms-${Date.now()}`,
        milestoneNumber: milestoneForm.milestoneNumber || 'Milestone',
        title: milestoneForm.title || '',
        deliverable: milestoneForm.deliverable || '',
        dueDate: milestoneForm.dueDate || '',
        invoiceNo: milestoneForm.invoiceNo || '',
        tranchePct: Number(milestoneForm.tranchePct || 30),
        claimAmountUsd: Number(milestoneForm.claimAmountUsd || 0),
        amountPaidUsd: Number(milestoneForm.amountPaidUsd || 0),
        outstandingUsd: Math.max(0, Number(milestoneForm.claimAmountUsd || 0) - Number(milestoneForm.amountPaidUsd || 0)),
        claimAmount: claim,
        amountPaid: paid,
        outstanding,
        milestoneStatus: (milestoneForm.milestoneStatus as MilestoneProgressStatus) || 'PENDING',
        paymentStatus,
        paymentDate: milestoneForm.paymentDate || '',
        grantor: milestoneForm.grantor || 'ASEAN Foundation',
        recipient: milestoneForm.recipient || 'Institut Keusahawanan Negara Berhad (INSKEN)',
        notes: milestoneForm.notes || '',
        activities: editingMilestone?.activities,
        deliverablesList: editingMilestone?.deliverablesList,
      };

      const res = await fetch('/api/finance/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_MILESTONE', payload }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(editingMilestone ? 'Milestone updated!' : 'New milestone added!');
        setData(json);
        setIsMilestoneModalOpen(false);
        setEditingMilestone(null);
      } else {
        toast.error(json.error || 'Failed to save milestone.');
      }
    } catch {
      toast.error('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  // Quick Toggle Paid Status
  const handleQuickTogglePayment = async (ms: MilestonePaymentRecord) => {
    const isNowPaid = ms.paymentStatus !== 'PAID';
    const updated: MilestonePaymentRecord = {
      ...ms,
      paymentStatus: isNowPaid ? 'PAID' : 'PENDING',
      amountPaid: isNowPaid ? ms.claimAmount : 0,
      outstanding: isNowPaid ? 0 : ms.claimAmount,
      amountPaidUsd: isNowPaid ? (ms.claimAmountUsd || 0) : 0,
      outstandingUsd: isNowPaid ? 0 : (ms.claimAmountUsd || 0),
      paymentDate: isNowPaid ? new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    };

    try {
      const res = await fetch('/api/finance/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_MILESTONE', payload: updated }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(isNowPaid ? `Marked ${ms.milestoneNumber} as Paid to INSKEN.` : `Marked ${ms.milestoneNumber} as Pending.`);
        setData(json);
      }
    } catch {
      toast.error('Failed to update status.');
    }
  };

  // Reset to Annex IV Provisions
  const handleResetToAnnexIV = async () => {
    if (!confirm('Reset milestones to official ASEAN Foundation Annex IV schedule (30% / 40% / 30%)?')) return;
    try {
      const res = await fetch('/api/finance/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET_TO_ANNEX_IV' }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success('Reset to Annex IV schedule successfully!');
        setData(json);
      }
    } catch {
      toast.error('Failed to reset.');
    }
  };

  // Delete Milestone
  const handleDeleteMilestone = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch('/api/finance/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_MILESTONE', payload: { id } }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success('Milestone deleted.');
        setData(json);
      }
    } catch {
      toast.error('Failed to delete milestone.');
    }
  };

  // Programme Save
  const handleSaveProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progForm.name) {
      toast.error('Please enter name.');
      return;
    }

    setSaving(true);
    try {
      const allocation = Number(progForm.allocation || 0);
      const utilized = Number(progForm.utilized || 0);
      const committed = Number(progForm.committed || 0);
      const variance = allocation - utilized;

      const payload: FinanceProgrammeItem = {
        id: editingProg?.id || `prog-${Date.now()}`,
        category: (progForm.category as 'DE' | 'INTERNAL') || 'DE',
        name: progForm.name || '',
        allocation,
        utilized,
        committed,
        variance,
      };

      const res = await fetch('/api/finance/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_PROGRAMME', payload }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success('Budget item saved successfully.');
        setData(json);
        setIsProgModalOpen(false);
        setEditingProg(null);
      } else {
        toast.error(json.error || 'Failed to save budget item.');
      }
    } catch {
      toast.error('An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Programme
  const handleDeleteProgramme = async (id: string, category: 'DE' | 'INTERNAL', name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch('/api/finance/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_PROGRAMME', payload: { id, category } }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success('Item deleted.');
        setData(json);
      }
    } catch {
      toast.error('Failed to delete item.');
    }
  };

  // Save Overview (Costs & Profit)
  const handleSaveOverview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/finance/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_ALL',
          payload: {
            costs: Number(overviewForm.costs),
            netProfit: Number(overviewForm.netProfit),
            profitMarginPct: Number(overviewForm.profitMarginPct),
          },
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success('Financial overview updated!');
        setData(json);
        setIsOverviewModalOpen(false);
      }
    } catch {
      toast.error('Failed to update overview.');
    } finally {
      setSaving(false);
    }
  };

  // Filtered Milestones
  const filteredMilestones = useMemo(() => {
    if (!data?.milestones) return [];
    return data.milestones.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.milestoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.deliverable.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPayment = paymentFilter === 'ALL' || m.paymentStatus === paymentFilter;
      const matchesProgress = milestoneFilter === 'ALL' || m.milestoneStatus === milestoneFilter;

      return matchesSearch && matchesPayment && matchesProgress;
    });
  }, [data?.milestones, searchQuery, paymentFilter, milestoneFilter]);

  // Calculations for DE Allocation Bar
  const deTotal = data?.overview?.deAllocationTotal || 9400000;
  const deUtilized = data?.overview?.deUtilizedTotal || 4905652.55;
  const deRemaining = Math.max(0, deTotal - deUtilized);
  const deUtilizedPct = deTotal > 0 ? (deUtilized / deTotal) * 100 : 0;
  const deRemainingPct = deTotal > 0 ? (deRemaining / deTotal) * 100 : 0;

  // Total USD Grant Sum
  const totalUsdGrant = data?.milestones?.reduce((s, m) => s + (m.claimAmountUsd || 0), 0) || 36500;
  const totalUsdPaid = data?.milestones?.reduce((s, m) => s + (m.amountPaidUsd || (m.paymentStatus === 'PAID' ? m.claimAmountUsd || 0 : 0)), 0) || 10950;
  const totalUsdOutstanding = Math.max(0, totalUsdGrant - totalUsdPaid);

  if (loading && !data) {
    return (
      <div className="flex h-64 items-center justify-center space-x-3 text-sm text-muted-foreground">
        <RefreshCw className="h-5 w-5 animate-spin text-primary" />
        <span>Loading Finance & Milestone Tracking records...</span>
      </div>
    );
  }

  const overview = data?.overview || ({} as FinanceOverview);
  const programmes = data?.programmes || [];
  const internalDepartments = data?.internalDepartments || [];

  return (
    <div className="space-y-6">
      {/* 1. Header Bar with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B1F3A] to-[#1E3A8A] text-white shadow-sm">
            <Wallet className="h-5 w-5 text-[#D4A017]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Finance &amp; Milestone Tracking
              </h2>
              <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                ANNEX IV PROVISIONS
              </span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                INSKEN Live Audit
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Trace official deliverables, monthly reports, participant quotas, claims billed &amp; payment disbursement to INSKEN.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setEditingMilestone(null);
              setMilestoneForm({
                milestoneNumber: `Milestone ${(data?.milestones?.length || 0) + 1}`,
                title: '',
                deliverable: '',
                dueDate: '',
                invoiceNo: `INV-AF-INSKEN-0${(data?.milestones?.length || 0) + 1}`,
                tranchePct: 30,
                claimAmountUsd: 0,
                claimAmount: 0,
                amountPaid: 0,
                milestoneStatus: 'IN_PROGRESS',
                paymentStatus: 'PENDING',
                paymentDate: '',
                grantor: 'ASEAN Foundation',
                recipient: 'Institut Keusahawanan Negara Berhad (INSKEN)',
                notes: '',
              });
              setIsMilestoneModalOpen(true);
            }}
            className="h-8 bg-[#0B1F3A] hover:bg-[#112D55] text-white text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 text-[#D4A017]" />
            <span>+ Add Milestone</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleResetToAnnexIV}
            className="h-8 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
            title="Reset to official ASEAN Foundation Annex IV schedule"
          >
            <Award className="h-3.5 w-3.5 text-primary" />
            <span className="hidden md:inline">Reset Annex IV</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingProg(null);
              setProgForm({
                category: 'DE',
                name: '',
                allocation: 0,
                utilized: 0,
                committed: 0,
              });
              setIsProgModalOpen(true);
            }}
            className="h-8 text-xs font-semibold gap-1.5 border-border"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Add Budget Line</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportFinanceMilestonesCsv(
                overview,
                programmes,
                internalDepartments,
                data?.milestones || []
              )
            }
            className="h-8 border-[#D4A017]/40 bg-[#D4A017]/10 text-foreground hover:bg-[#D4A017]/20 text-xs font-semibold gap-1.5"
            title="Export Finance & Milestone CSV Report"
          >
            <Download className="h-3.5 w-3.5 text-[#D4A017]" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Refresh Data"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards Row (Costs, Net Profit, Total Allocation, Paid to INSKEN, Outstanding) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Costs */}
        <Card className="border-border shadow-sm bg-gradient-to-br from-card to-muted/20 relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Banknote className="h-3.5 w-3.5 text-amber-500" />
                <span>COSTS</span>
              </div>
              <button
                onClick={() => setIsOverviewModalOpen(true)}
                className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
                title="Edit Cost"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {fmtNoDecimals(overview.totalCosts)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Operational &amp; venue expenditure
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Net Profit */}
        <Card className="border-border shadow-sm bg-gradient-to-br from-card to-emerald-50/20 dark:to-emerald-950/10 relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                <span>NET PROFIT</span>
              </div>
              <span className="rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 px-1.5 py-0.5 text-[10px] font-bold">
                {overview.profitMarginPct}% margin
              </span>
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
              {fmtNoDecimals(overview.netProfit)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Net surplus generated
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Total Grant / Annex IV FAG Agreement */}
        <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-900/50 dark:bg-blue-950/20 shadow-sm relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                <Award className="h-3.5 w-3.5 text-blue-600" />
                <span>TOTAL FAG GRANT</span>
              </div>
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                100% (3 Tranches)
              </span>
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-blue-900 dark:text-blue-200">
              {fmtUSD(totalUsdGrant)}
            </div>
            <p className="mt-1 text-[11px] text-blue-700/80 dark:text-blue-300/80">
              ≈ {fmtRM(overview.totalClaimAmount)}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Sudah Dibayar (Paid to INSKEN) */}
        <Card className="border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20 shadow-sm relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>SUDAH DIBAYAR (INSKEN)</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                {((overview.totalPaidAmount / (overview.totalClaimAmount || 1)) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-emerald-700 dark:text-emerald-300">
              {fmtUSD(totalUsdPaid)}
            </div>
            <p className="mt-1 text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
              Disbursed ({fmtRM(overview.totalPaidAmount)})
            </p>
          </CardContent>
        </Card>

        {/* Card 5: Belum Dibayar (Outstanding Balance) */}
        <Card className="border-amber-200 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/20 shadow-sm relative overflow-hidden col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-800 dark:text-amber-300">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span>BELUM DIBAYAR (OUTSTANDING)</span>
              </div>
              <span className="rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 text-[10px] font-bold">
                Pending
              </span>
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-amber-700 dark:text-amber-400">
              {fmtUSD(totalUsdOutstanding)}
            </div>
            <p className="mt-1 text-[11px] text-amber-700/80 dark:text-amber-400/80">
              Tranches 2 &amp; 3 ({fmtRM(overview.totalOutstandingAmount)})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. OFFICIAL ANNEX IV MILESTONE PROVISION & PAYMENT AUDIT (MAIN FOCUS) */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-card border-b py-4 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  ANNEX IV — Milestone &amp; Disbursement Schedule (INSKEN)
                </CardTitle>
                <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">
                  {overview.completedMilestonesCount} of {overview.totalMilestonesCount} Completed
                </span>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Agreement between <strong>ASEAN Foundation</strong> and <strong>Institut Keusahawanan Negara Berhad (INSKEN)</strong>. Tranche payment issued upon milestone completion.
              </CardDescription>
            </div>

            {/* Quick Filters, Search & Currency Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-44 sm:w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search milestone / invoice..."
                  className="h-8 pl-8 text-xs"
                />
              </div>

              {/* Payment Filter */}
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Payments</option>
                <option value="PAID">Sudah Dibayar (Paid)</option>
                <option value="PENDING">Belum Dibayar (Pending)</option>
                <option value="IN_REVIEW">Dalam Semakan (In Review)</option>
              </select>

              {/* Currency Mode */}
              <div className="flex items-center rounded-md border bg-muted/50 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setCurrencyMode('BOTH')}
                  className={cn(
                    'px-2 py-1 rounded text-[11px] font-semibold transition-colors',
                    currencyMode === 'BOTH' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  USD + RM
                </button>
                <button
                  type="button"
                  onClick={() => setCurrencyMode('USD')}
                  className={cn(
                    'px-2 py-1 rounded text-[11px] font-semibold transition-colors',
                    currencyMode === 'USD' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  USD
                </button>
                <button
                  type="button"
                  onClick={() => setCurrencyMode('MYR')}
                  className={cn(
                    'px-2 py-1 rounded text-[11px] font-semibold transition-colors',
                    currencyMode === 'MYR' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  RM
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0B1F3A] text-white uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">MILESTONE &amp; DELIVERABLES (ANNEX IV)</th>
                  <th className="py-3 px-3">DUE DATE</th>
                  <th className="py-3 px-3">TRANCHE / INVOICE</th>
                  <th className="py-3 px-3 text-right">GRANT CLAIM</th>
                  <th className="py-3 px-3 text-right">PAID TO INSKEN</th>
                  <th className="py-3 px-3 text-right">OUTSTANDING</th>
                  <th className="py-3 px-3 text-center">MILESTONE STATUS</th>
                  <th className="py-3 px-3 text-center">PAYMENT STATUS</th>
                  <th className="py-3 px-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMilestones.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-foreground text-xs">
                      No milestones match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredMilestones.map((m) => {
                    const isPaid = m.paymentStatus === 'PAID';
                    const isCompleted = m.milestoneStatus === 'COMPLETED';
                    const isExpanded = expandedMilestoneId === m.id;

                    return (
                      <tr
                        key={m.id}
                        className={cn(
                          'hover:bg-muted/40 transition-colors',
                          isPaid ? 'bg-emerald-50/10 dark:bg-emerald-950/5' : ''
                        )}
                      >
                        {/* Milestone & Deliverable */}
                        <td className="py-3.5 px-4 max-w-md">
                          <div className="flex items-start gap-2">
                            <span className="shrink-0 mt-0.5 rounded bg-primary/10 text-primary font-mono font-bold px-1.5 py-0.5 text-[10px]">
                              {m.tranchePct || 30}%
                            </span>
                            <div>
                              <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                                <span>{m.milestoneNumber}:</span>
                                <span>{m.title}</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                {m.deliverable}
                              </p>

                              {/* Click to open full details */}
                              <button
                                type="button"
                                onClick={() => setSelectedAnnexMilestone(m)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline mt-1.5"
                              >
                                <FileText className="h-3 w-3" />
                                <span>View Full Activities &amp; Evidence Checklist ({m.deliverablesList?.length || 2} items)</span>
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Due Date */}
                        <td className="py-3.5 px-3 font-semibold whitespace-nowrap text-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{m.dueDate || '—'}</span>
                          </div>
                        </td>

                        {/* Tranche / Invoice No */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-mono font-bold text-foreground">{m.invoiceNo || '—'}</div>
                          <div className="text-[10px] text-muted-foreground">{m.tranchePct || 30}% of total grant</div>
                        </td>

                        {/* Claim Amount */}
                        <td className="py-3.5 px-3 text-right font-semibold tabular-nums text-foreground">
                          {currencyMode === 'USD' && fmtUSD(m.claimAmountUsd || 0)}
                          {currencyMode === 'MYR' && fmtRM(m.claimAmount)}
                          {currencyMode === 'BOTH' && (
                            <div>
                              <div className="font-bold">{fmtUSD(m.claimAmountUsd || 0)}</div>
                              <div className="text-[10px] text-muted-foreground">≈ {fmtRM(m.claimAmount)}</div>
                            </div>
                          )}
                        </td>

                        {/* Paid Amount */}
                        <td className="py-3.5 px-3 text-right font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                          {currencyMode === 'USD' && fmtUSD(m.amountPaidUsd || (isPaid ? m.claimAmountUsd || 0 : 0))}
                          {currencyMode === 'MYR' && fmtRM(m.amountPaid)}
                          {currencyMode === 'BOTH' && (
                            <div>
                              <div>{fmtUSD(m.amountPaidUsd || (isPaid ? m.claimAmountUsd || 0 : 0))}</div>
                              <div className="text-[10px] text-emerald-600/80">≈ {fmtRM(m.amountPaid)}</div>
                            </div>
                          )}
                        </td>

                        {/* Outstanding */}
                        <td
                          className={cn(
                            'py-3.5 px-3 text-right font-bold tabular-nums',
                            m.outstanding > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                          )}
                        >
                          {currencyMode === 'USD' && fmtUSD(m.outstandingUsd !== undefined ? m.outstandingUsd : (isPaid ? 0 : m.claimAmountUsd || 0))}
                          {currencyMode === 'MYR' && fmtRM(m.outstanding)}
                          {currencyMode === 'BOTH' && (
                            <div>
                              <div>{fmtUSD(m.outstandingUsd !== undefined ? m.outstandingUsd : (isPaid ? 0 : m.claimAmountUsd || 0))}</div>
                              <div className="text-[10px] text-muted-foreground">≈ {fmtRM(m.outstanding)}</div>
                            </div>
                          )}
                        </td>

                        {/* Milestone Progress Status */}
                        <td className="py-3.5 px-3 text-center">
                          {m.milestoneStatus === 'COMPLETED' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 px-2 py-0.5 text-[11px] font-bold">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Completed
                            </span>
                          ) : m.milestoneStatus === 'IN_PROGRESS' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 px-2 py-0.5 text-[11px] font-bold">
                              <Clock className="h-3 w-3 text-blue-600" />
                              In Progress
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 text-[11px] font-semibold">
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Payment Status (Sudah Dibayar vs Belum Dibayar) */}
                        <td className="py-3.5 px-3 text-center">
                          {m.paymentStatus === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500 text-white px-2 py-0.5 text-[11px] font-bold shadow-xs">
                              <CheckCircle2 className="h-3 w-3" />
                              Sudah Dibayar
                            </span>
                          ) : m.paymentStatus === 'PENDING' ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-300 px-2 py-0.5 text-[11px] font-bold border border-amber-300 dark:border-amber-700">
                              <Clock className="h-3 w-3 text-amber-600" />
                              Belum Dibayar
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 px-2 py-0.5 text-[11px] font-bold">
                              Dalam Semakan
                            </span>
                          )}
                          {m.paymentDate && isPaid && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {m.paymentDate}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Quick Toggle Paid Button */}
                            <Button
                              size="sm"
                              variant={isPaid ? 'outline' : 'default'}
                              onClick={() => handleQuickTogglePayment(m)}
                              className={cn(
                                'h-7 text-[11px] font-semibold px-2 gap-1 shadow-xs',
                                !isPaid
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40'
                              )}
                              title={isPaid ? 'Mark as Belum Dibayar' : 'Mark as Sudah Dibayar'}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{isPaid ? 'Paid' : 'Pay'}</span>
                            </Button>

                            {/* Edit Milestone */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingMilestone(m);
                                setMilestoneForm(m);
                                setIsMilestoneModalOpen(true);
                              }}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              title="Edit Details"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>

                            {/* Delete */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMilestone(m.id, m.milestoneNumber)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Milestone Totals */}
              <tfoot className="bg-muted/80 font-bold border-t-2 border-border text-foreground text-xs">
                <tr>
                  <td colSpan={3} className="py-3 px-4 uppercase">
                    Total FAG Grant &amp; Tranche Disbursement Audit
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    <div className="font-bold">{fmtUSD(totalUsdGrant)}</div>
                    <div className="text-[10px] text-muted-foreground">≈ {fmtRM(overview.totalClaimAmount)}</div>
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                    <div className="font-bold">{fmtUSD(totalUsdPaid)}</div>
                    <div className="text-[10px] text-emerald-600/80">≈ {fmtRM(overview.totalPaidAmount)}</div>
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-amber-600 dark:text-amber-400">
                    <div className="font-bold">{fmtUSD(totalUsdOutstanding)}</div>
                    <div className="text-[10px] text-amber-600/80">≈ {fmtRM(overview.totalOutstandingAmount)}</div>
                  </td>
                  <td colSpan={3} className="py-3 px-4 text-center text-[11px] text-muted-foreground font-normal">
                    Payer: <strong>ASEAN Foundation</strong> ➔ Recipient: <strong>INSKEN</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 4. FINANCE TRACKING SECTION (DE Allocation & Progress Bar) */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-[#0B1F3A] text-white py-3.5 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-xs font-mono font-bold text-[#D4A017]">
                7
              </span>
              <CardTitle className="text-sm sm:text-base font-bold tracking-wide uppercase">
                FINANCE TRACKING
              </CardTitle>
            </div>
            <div className="text-xs text-white/80 font-medium">
              National Development Allocation
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* DE Allocation Visual Progress Bar (Exact look of screenshot) */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-sm sm:text-base font-bold text-foreground">
                DE ALLOCATION: <span className="text-primary">{fmtRM(deTotal)}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Utilized: {fmtRM(deUtilized)} ({deUtilizedPct.toFixed(1)}%)
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Remaining Allocation: {fmtRM(deRemaining)} ({deRemainingPct.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Dual color progress bar (Green & Yellow) */}
            <div className="h-6 w-full rounded-md overflow-hidden bg-muted flex shadow-inner border">
              <div
                style={{ width: `${deUtilizedPct}%` }}
                className="h-full bg-[#16A34A] transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                title={`Utilized: ${fmtRM(deUtilized)}`}
              >
                {deUtilizedPct > 10 && `${deUtilizedPct.toFixed(1)}%`}
              </div>
              <div
                style={{ width: `${deRemainingPct}%` }}
                className="h-full bg-[#EAB308] transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-amber-950 shadow-sm"
                title={`Remaining: ${fmtRM(deRemaining)}`}
              >
                {deRemainingPct > 10 && `${deRemainingPct.toFixed(1)}%`}
              </div>
            </div>
          </div>

          {/* Table 1: Programme Allocation Table (Header in Dark Blue #1E3A8A) */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#1E3A8A] text-white uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">PROGRAMME</th>
                  <th className="py-2.5 px-3 text-right">ALLOCATION (RM)</th>
                  <th className="py-2.5 px-3 text-right">UTILIZED (RM)</th>
                  <th className="py-2.5 px-3 text-right">COMMITTED (RM)</th>
                  <th className="py-2.5 px-3 text-right">VARIANCE (RM)</th>
                  <th className="py-2.5 px-2 text-center w-16">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {programmes.map((p) => {
                  const varVal = p.allocation - p.utilized;
                  return (
                    <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-2 px-3 font-semibold text-foreground uppercase">
                        {p.name}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums text-foreground">
                        {p.allocation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                        {p.utilized.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">
                        {p.committed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums font-bold text-foreground">
                        {varVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingProg(p);
                              setProgForm(p);
                              setIsProgModalOpen(true);
                            }}
                            className="p-1 hover:text-primary text-muted-foreground rounded"
                            title="Edit"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteProgramme(p.id, 'DE', p.name)}
                            className="p-1 hover:text-destructive text-muted-foreground rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Total Row */}
              <tfoot className="bg-muted/60 font-bold border-t-2 border-border text-foreground">
                <tr>
                  <td className="py-2.5 px-3 uppercase">Total</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {deTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                    {deUtilized.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">
                    {overview.deCommittedTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {deRemaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL: VIEW ANNEX IV DELIVERABLES CHECKLIST */}
      <Dialog open={!!selectedAnnexMilestone} onOpenChange={() => setSelectedAnnexMilestone(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedAnnexMilestone && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 text-primary font-mono font-bold px-2 py-0.5 text-xs">
                    {selectedAnnexMilestone.milestoneNumber}
                  </span>
                  <span className="rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold px-2 py-0.5 text-xs">
                    Tranche: {selectedAnnexMilestone.tranchePct || 30}% (USD {(selectedAnnexMilestone.claimAmountUsd || 0).toLocaleString()})
                  </span>
                </div>
                <DialogTitle className="text-base sm:text-lg font-bold mt-1">
                  {selectedAnnexMilestone.title}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Due Date: <strong>{selectedAnnexMilestone.dueDate}</strong> · Grantor: <strong>{selectedAnnexMilestone.grantor || 'ASEAN Foundation'}</strong> · Recipient: <strong>{selectedAnnexMilestone.recipient || 'INSKEN'}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3 text-xs">
                {/* 1. Activities */}
                <div className="rounded-xl border bg-muted/30 p-3.5 space-y-2">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-primary">
                    <CheckSquare className="h-4 w-4" />
                    Activities to Implement:
                  </h4>
                  <ul className="space-y-1.5 pl-1 text-muted-foreground">
                    {selectedAnnexMilestone.activities?.map((act, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                        <span className="text-foreground font-medium">{act}</span>
                      </li>
                    )) || (
                      <li>1. Project implementation activities</li>
                    )}
                  </ul>
                </div>

                {/* 2. Evidence of Milestone Completion (Deliverables) */}
                <div className="rounded-xl border bg-card p-3.5 space-y-2.5">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-emerald-600 dark:text-emerald-400">
                    <Award className="h-4 w-4" />
                    Evidence of Milestone Completion (Deliverables):
                  </h4>
                  <div className="space-y-2">
                    {selectedAnnexMilestone.deliverablesList?.map((del, i) => (
                      <div key={i} className="rounded-lg border bg-muted/20 p-2.5 space-y-1">
                        <div className="whitespace-pre-line text-foreground font-medium leading-relaxed">
                          {del}
                        </div>
                      </div>
                    )) || (
                      <p className="text-muted-foreground">{selectedAnnexMilestone.deliverable}</p>
                    )}
                  </div>
                </div>

                {/* 3. Disbursement Clause */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20 p-3 text-blue-900 dark:text-blue-200">
                  <p className="text-[11px] leading-relaxed">
                    <strong>Payment Terms:</strong> Upon completion of the above milestone/deliverables and their acceptance by the ASEAN Foundation, a payment not to exceed <strong>USD {(selectedAnnexMilestone.claimAmountUsd || 0).toLocaleString()}</strong> / <strong>{selectedAnnexMilestone.tranchePct || 30}% of total grant</strong> (≈ {fmtRM(selectedAnnexMilestone.claimAmount)}) be made to <strong>Institut Keusahawanan Negara Berhad (INSKEN)</strong>.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  size="sm"
                  onClick={() => setSelectedAnnexMilestone(null)}
                  className="h-8 bg-[#0B1F3A] hover:bg-[#112D55] text-white text-xs font-semibold"
                >
                  Close Checklist
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 1: ADD / EDIT MILESTONE */}
      <Dialog open={isMilestoneModalOpen} onOpenChange={setIsMilestoneModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {editingMilestone ? 'Edit Project Milestone & Payment' : 'Add New Project Milestone'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure deliverable scope, tranche percentage, USD/MYR claim amount, and payment status to INSKEN.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveMilestone} className="space-y-3.5 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Milestone #</Label>
                <Input
                  value={milestoneForm.milestoneNumber}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, milestoneNumber: e.target.value })}
                  placeholder="e.g. Milestone 1"
                  required
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Invoice No.</Label>
                <Input
                  value={milestoneForm.invoiceNo}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, invoiceNo: e.target.value })}
                  placeholder="e.g. INV-AF-INSKEN-01"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Milestone Title</Label>
              <Input
                value={milestoneForm.title}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                placeholder="e.g. 50% MSME Target, Localisation & 6-Month Progress Report"
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Deliverables Summary</Label>
              <textarea
                value={milestoneForm.deliverable}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, deliverable: e.target.value })}
                placeholder="Describe key deliverables, reports, and participant targets..."
                rows={2}
                className="w-full rounded-md border border-input bg-background p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Target Due Date</Label>
                <Input
                  value={milestoneForm.dueDate}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                  placeholder="e.g. 31 January 2027"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tranche % of Grant</Label>
                <Input
                  type="number"
                  value={milestoneForm.tranchePct}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, tranchePct: Number(e.target.value) })}
                  placeholder="e.g. 40"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Claim Amount (USD)</Label>
                <Input
                  type="number"
                  step="1"
                  value={milestoneForm.claimAmountUsd}
                  onChange={(e) => {
                    const usd = Number(e.target.value);
                    setMilestoneForm({
                      ...milestoneForm,
                      claimAmountUsd: usd,
                      claimAmount: Number((usd * 4.45).toFixed(2)),
                    });
                  }}
                  className="h-8 text-xs font-semibold text-blue-600"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Claim Amount (RM Equiv)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={milestoneForm.claimAmount}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, claimAmount: Number(e.target.value) })}
                  className="h-8 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Amount Paid (RM)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={milestoneForm.amountPaid}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, amountPaid: Number(e.target.value) })}
                  className="h-8 text-xs font-semibold text-emerald-600"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Payment Date (If Paid)</Label>
                <Input
                  value={milestoneForm.paymentDate}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, paymentDate: e.target.value })}
                  placeholder="e.g. 18 Aug 2026"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Milestone Progress</Label>
                <select
                  value={milestoneForm.milestoneStatus}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, milestoneStatus: e.target.value as any })}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="COMPLETED">Completed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Payment Status (INSKEN)</Label>
                <select
                  value={milestoneForm.paymentStatus}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, paymentStatus: e.target.value as any })}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-bold"
                >
                  <option value="PAID">Sudah Dibayar (Paid)</option>
                  <option value="PENDING">Belum Dibayar (Pending)</option>
                  <option value="IN_REVIEW">Dalam Semakan (In Review)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Notes / Audit Remarks</Label>
              <Input
                value={milestoneForm.notes}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, notes: e.target.value })}
                placeholder="e.g. Tranche 1 disbursed via direct credit..."
                className="h-8 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMilestoneModalOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="h-8 bg-[#0B1F3A] hover:bg-[#112D55] text-white text-xs font-semibold"
              >
                {saving ? 'Saving...' : 'Save Milestone'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: ADD / EDIT PROGRAMME / INTERNAL BUDGET LINE */}
      <Dialog open={isProgModalOpen} onOpenChange={setIsProgModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              {editingProg ? 'Edit Budget Line' : 'Add New Budget Line'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add or adjust programme allocations (DE Allocation or Internal Department).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProgramme} className="space-y-3.5 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <select
                value={progForm.category}
                onChange={(e) => setProgForm({ ...progForm, category: e.target.value as any })}
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-semibold"
              >
                <option value="DE">DE Allocation (Programme)</option>
                <option value="INTERNAL">Internal Department Allocation</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Programme / Department Name</Label>
              <Input
                value={progForm.name}
                onChange={(e) => setProgForm({ ...progForm, name: e.target.value })}
                placeholder="e.g. BANGKIT, BANGKIT SE, Social Entrepreneurship..."
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Allocation (RM)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={progForm.allocation}
                  onChange={(e) => setProgForm({ ...progForm, allocation: Number(e.target.value) })}
                  className="h-8 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Utilized (RM)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={progForm.utilized}
                  onChange={(e) => setProgForm({ ...progForm, utilized: Number(e.target.value) })}
                  className="h-8 text-xs text-emerald-600 font-semibold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Committed (RM)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={progForm.committed}
                  onChange={(e) => setProgForm({ ...progForm, committed: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsProgModalOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="h-8 bg-[#0B1F3A] hover:bg-[#112D55] text-white text-xs font-semibold"
              >
                {saving ? 'Saving...' : 'Save Budget Line'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: EDIT COSTS & NET PROFIT OVERVIEW */}
      <Dialog open={isOverviewModalOpen} onOpenChange={setIsOverviewModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-amber-500" />
              Edit Costs &amp; Net Profit
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update top-level operational costs and profit margins.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveOverview} className="space-y-3.5 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Total Costs (RM)</Label>
              <Input
                type="number"
                step="1"
                value={overviewForm.costs}
                onChange={(e) => setOverviewForm({ ...overviewForm, costs: Number(e.target.value) })}
                className="h-8 text-xs font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Net Profit (RM)</Label>
              <Input
                type="number"
                step="1"
                value={overviewForm.netProfit}
                onChange={(e) => setOverviewForm({ ...overviewForm, netProfit: Number(e.target.value) })}
                className="h-8 text-xs font-semibold text-emerald-600"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Profit Margin (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={overviewForm.profitMarginPct}
                onChange={(e) => setOverviewForm({ ...overviewForm, profitMarginPct: Number(e.target.value) })}
                className="h-8 text-xs"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOverviewModalOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="h-8 bg-[#0B1F3A] hover:bg-[#112D55] text-white text-xs font-semibold"
              >
                {saving ? 'Saving...' : 'Update Overview'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
