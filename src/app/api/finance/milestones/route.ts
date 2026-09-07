import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  FinanceProgrammeItem,
  MilestonePaymentRecord,
  FinanceOverview,
  FinanceDataResponse,
} from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_PROGRAMMES: FinanceProgrammeItem[] = [
  {
    id: 'prog-01',
    category: 'DE',
    name: 'BANGKIT',
    allocation: 8450000.0,
    utilized: 4311518.21,
    committed: 3435425.58,
    variance: 4138481.79,
  },
  {
    id: 'prog-02',
    category: 'DE',
    name: 'BANGKIT SE',
    allocation: 450000.0,
    utilized: 372145.94,
    committed: 240000.0,
    variance: 77854.06,
  },
  {
    id: 'prog-03',
    category: 'DE',
    name: 'MCFA',
    allocation: 500000.0,
    utilized: 221988.4,
    committed: 31473.6,
    variance: 278011.6,
  },
];

const DEFAULT_INTERNAL_DEPTS: FinanceProgrammeItem[] = [
  {
    id: 'dept-01',
    category: 'INTERNAL',
    name: 'Social Entrepreneurship Department',
    allocation: 450000.0,
    utilized: 87175.0,
    committed: 0,
    variance: 362825.0,
  },
  {
    id: 'dept-02',
    category: 'INTERNAL',
    name: 'Stakeholder Management Department',
    allocation: 524500.0,
    utilized: 181541.22,
    committed: 0,
    variance: 342958.78,
  },
  {
    id: 'dept-03',
    category: 'INTERNAL',
    name: 'All Department (Collateral / Other Expenses / Networking)',
    allocation: 0.0,
    utilized: 48282.0,
    committed: 0,
    variance: -48282.0,
  },
  {
    id: 'dept-04',
    category: 'INTERNAL',
    name: 'Business Development Department',
    allocation: 982000.0,
    utilized: 487264.49,
    committed: 0,
    variance: 494735.51,
  },
];

const DEFAULT_MILESTONES: MilestonePaymentRecord[] = [
  {
    id: 'ms-01',
    milestoneNumber: 'Milestone 1',
    title: 'Inception Report & Mobilisation',
    deliverable: 'Participant onboarding (KL Central), syllabus formulation & baseline evaluation.',
    dueDate: '15 Aug 2026',
    invoiceNo: 'INV-INSKEN-2026-001',
    claimAmount: 1500000.0,
    amountPaid: 1500000.0,
    outstanding: 0.0,
    milestoneStatus: 'COMPLETED',
    paymentStatus: 'PAID',
    paymentDate: '20 Aug 2026',
    recipient: 'INSKEN',
    notes: 'Paid in full via EFT direct credit.',
  },
  {
    id: 'ms-02',
    milestoneNumber: 'Milestone 2',
    title: 'Phase 1 & 2 Regional Delivery',
    deliverable: 'Southern (Johor) & Northern (Penang) on-ground sessions completion with verified attendance.',
    dueDate: '05 Sep 2026',
    invoiceNo: 'INV-INSKEN-2026-002',
    claimAmount: 2000000.0,
    amountPaid: 2000000.0,
    outstanding: 0.0,
    milestoneStatus: 'COMPLETED',
    paymentStatus: 'PAID',
    paymentDate: '02 Sep 2026',
    recipient: 'INSKEN',
    notes: 'Approved & disbursed on schedule.',
  },
  {
    id: 'ms-03',
    milestoneNumber: 'Milestone 3',
    title: 'Phase 3 Nationwide & Virtual Delivery',
    deliverable: 'Sabah, Sarawak physical workshops & nationwide interactive online streaming modules.',
    dueDate: '15 Sep 2026',
    invoiceNo: 'INV-INSKEN-2026-003',
    claimAmount: 3500000.0,
    amountPaid: 1405652.55,
    outstanding: 2094347.45,
    milestoneStatus: 'IN_PROGRESS',
    paymentStatus: 'PENDING',
    paymentDate: '',
    recipient: 'INSKEN',
    notes: 'Partial progress payment cleared. Balance invoice processing.',
  },
  {
    id: 'ms-04',
    milestoneNumber: 'Milestone 4',
    title: 'Impact Assessment & Closeout Report',
    deliverable: 'Final SME AI competency certification, executive data registry audit & project closure.',
    dueDate: '30 Oct 2026',
    invoiceNo: 'INV-INSKEN-2026-004',
    claimAmount: 2400000.0,
    amountPaid: 0.0,
    outstanding: 2400000.0,
    milestoneStatus: 'PENDING',
    paymentStatus: 'PENDING',
    paymentDate: '',
    recipient: 'INSKEN',
    notes: 'Final tranche due upon submission of full impact evaluation.',
  },
];

let inMemoryState = {
  programmes: [...DEFAULT_PROGRAMMES],
  internalDepartments: [...DEFAULT_INTERNAL_DEPTS],
  milestones: [...DEFAULT_MILESTONES],
  costs: 654791.0,
  netProfit: 444962.0,
  profitMarginPct: 40.0,
};

function calculateOverview(
  programmes: FinanceProgrammeItem[],
  internalDepts: FinanceProgrammeItem[],
  milestones: MilestonePaymentRecord[]
): FinanceOverview {
  const deAllocationTotal = programmes.reduce((sum, p) => sum + p.allocation, 0);
  const deUtilizedTotal = programmes.reduce((sum, p) => sum + p.utilized, 0);
  const deCommittedTotal = programmes.reduce((sum, p) => sum + p.committed, 0);
  const deRemainingTotal = deAllocationTotal - deUtilizedTotal;

  const internalAllocationTotal = internalDepts.reduce((sum, d) => sum + d.allocation, 0);
  const internalUtilizedTotal = internalDepts.reduce((sum, d) => sum + d.utilized, 0);
  const internalRemainingTotal = internalAllocationTotal - internalUtilizedTotal;

  const totalClaimAmount = milestones.reduce((sum, m) => sum + m.claimAmount, 0);
  const totalPaidAmount = milestones.reduce((sum, m) => sum + m.amountPaid, 0);
  const totalOutstandingAmount = milestones.reduce((sum, m) => sum + m.outstanding, 0);
  const completedMilestonesCount = milestones.filter((m) => m.milestoneStatus === 'COMPLETED').length;

  return {
    totalCosts: inMemoryState.costs,
    netProfit: inMemoryState.netProfit,
    profitMarginPct: inMemoryState.profitMarginPct,
    deAllocationTotal,
    deUtilizedTotal,
    deCommittedTotal,
    deRemainingTotal,
    internalAllocationTotal,
    internalUtilizedTotal,
    internalRemainingTotal,
    totalMilestonesCount: milestones.length,
    completedMilestonesCount,
    totalClaimAmount,
    totalPaidAmount,
    totalOutstandingAmount,
  };
}

export async function GET() {
  try {
    const latestConfig = await db.auditLog
      .findFirst({
        where: { action: 'FINANCE_MILESTONES_CONFIG' },
        orderBy: { createdAt: 'desc' },
      })
      .catch(() => null);

    if (latestConfig && latestConfig.detail) {
      try {
        const parsed = JSON.parse(latestConfig.detail);
        if (parsed.programmes) inMemoryState.programmes = parsed.programmes;
        if (parsed.internalDepartments) inMemoryState.internalDepartments = parsed.internalDepartments;
        if (parsed.milestones) inMemoryState.milestones = parsed.milestones;
        if (parsed.costs !== undefined) inMemoryState.costs = parsed.costs;
        if (parsed.netProfit !== undefined) inMemoryState.netProfit = parsed.netProfit;
        if (parsed.profitMarginPct !== undefined) inMemoryState.profitMarginPct = parsed.profitMarginPct;
      } catch {
        // fallback to memory
      }
    }
  } catch (err) {
    console.warn('Finance config storage fallback:', err);
  }

  const overview = calculateOverview(
    inMemoryState.programmes,
    inMemoryState.internalDepartments,
    inMemoryState.milestones
  );

  return NextResponse.json<FinanceDataResponse>({
    ok: true,
    overview,
    programmes: inMemoryState.programmes,
    internalDepartments: inMemoryState.internalDepartments,
    milestones: inMemoryState.milestones,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === 'UPDATE_ALL') {
      if (payload.programmes) inMemoryState.programmes = payload.programmes;
      if (payload.internalDepartments) inMemoryState.internalDepartments = payload.internalDepartments;
      if (payload.milestones) inMemoryState.milestones = payload.milestones;
      if (payload.costs !== undefined) inMemoryState.costs = Number(payload.costs);
      if (payload.netProfit !== undefined) inMemoryState.netProfit = Number(payload.netProfit);
      if (payload.profitMarginPct !== undefined) inMemoryState.profitMarginPct = Number(payload.profitMarginPct);
    } else if (action === 'SAVE_MILESTONE') {
      const milestone = payload as MilestonePaymentRecord;
      const idx = inMemoryState.milestones.findIndex((m) => m.id === milestone.id);
      
      // Auto-recalc outstanding
      const outstanding = Math.max(0, milestone.claimAmount - milestone.amountPaid);
      const updatedRecord: MilestonePaymentRecord = {
        ...milestone,
        outstanding,
        paymentStatus: milestone.amountPaid >= milestone.claimAmount && milestone.claimAmount > 0 ? 'PAID' : milestone.paymentStatus,
      };

      if (idx >= 0) {
        inMemoryState.milestones[idx] = updatedRecord;
      } else {
        inMemoryState.milestones.push({
          ...updatedRecord,
          id: updatedRecord.id || `ms-${Date.now()}`,
        });
      }
    } else if (action === 'DELETE_MILESTONE') {
      const { id } = payload;
      inMemoryState.milestones = inMemoryState.milestones.filter((m) => m.id !== id);
    } else if (action === 'SAVE_PROGRAMME') {
      const item = payload as FinanceProgrammeItem;
      const list = item.category === 'INTERNAL' ? inMemoryState.internalDepartments : inMemoryState.programmes;
      const variance = item.allocation - item.utilized;
      const updatedItem = { ...item, variance };
      const idx = list.findIndex((p) => p.id === item.id);

      if (idx >= 0) {
        list[idx] = updatedItem;
      } else {
        list.push({
          ...updatedItem,
          id: updatedItem.id || `prog-${Date.now()}`,
        });
      }
    } else if (action === 'DELETE_PROGRAMME') {
      const { id, category } = payload;
      if (category === 'INTERNAL') {
        inMemoryState.internalDepartments = inMemoryState.internalDepartments.filter((p) => p.id !== id);
      } else {
        inMemoryState.programmes = inMemoryState.programmes.filter((p) => p.id !== id);
      }
    }

    // Persist to D1 / AuditLog
    await db.auditLog
      .create({
        data: {
          action: 'FINANCE_MILESTONES_CONFIG',
          actor: 'admin',
          detail: JSON.stringify(inMemoryState),
        },
      })
      .catch((err) => {
        console.warn('Could not persist finance config in DB:', err);
      });

    const overview = calculateOverview(
      inMemoryState.programmes,
      inMemoryState.internalDepartments,
      inMemoryState.milestones
    );

    return NextResponse.json({
      ok: true,
      message: 'Finance & milestone configuration saved successfully.',
      overview,
      programmes: inMemoryState.programmes,
      internalDepartments: inMemoryState.internalDepartments,
      milestones: inMemoryState.milestones,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to update finance records.' },
      { status: 500 }
    );
  }
}
