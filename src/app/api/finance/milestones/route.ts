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
    title: 'Signing Agreement & Project Proposal Finalisation',
    dueDate: '11 August 2026',
    invoiceNo: 'INV-AF-INSKEN-01',
    tranchePct: 30,
    claimAmountUsd: 10950.0,
    amountPaidUsd: 10950.0,
    outstandingUsd: 0.0,
    claimAmount: 48727.5,
    amountPaid: 48727.5,
    outstanding: 0.0,
    milestoneStatus: 'COMPLETED',
    paymentStatus: 'PAID',
    paymentDate: '18 Aug 2026',
    grantor: 'ASEAN Foundation',
    recipient: 'Institut Keusahawanan Negara Berhad (INSKEN)',
    activities: [
      '1. Signing agreement',
      '2. Finalisation of Project and Budget Proposal',
    ],
    deliverablesList: [
      '1. Fixed Amount Grant Agreement (FAG Agreement) signed',
      '2. Approved Final Project Proposal (including work plan) and Budget Proposal submitted to ASEAN Foundation',
    ],
    deliverable:
      'Fixed Amount Grant Agreement (FAG Agreement) signed & Approved Final Project Proposal (including work plan) and Budget Proposal submitted to ASEAN Foundation.',
    notes: 'Tranche 1: USD 10,950 (30% of total grant) paid to INSKEN.',
  },
  {
    id: 'ms-02',
    milestoneNumber: 'Milestone 2',
    title: '50% MSME Target (2,500 Beneficiaries), Localisation & 6-Month Progress Report',
    dueDate: '31 January 2027',
    invoiceNo: 'INV-AF-INSKEN-02',
    tranchePct: 40,
    claimAmountUsd: 14600.0,
    amountPaidUsd: 0.0,
    outstandingUsd: 14600.0,
    claimAmount: 64970.0,
    amountPaid: 0.0,
    outstanding: 64970.0,
    milestoneStatus: 'IN_PROGRESS',
    paymentStatus: 'PENDING',
    paymentDate: '',
    grantor: 'ASEAN Foundation',
    recipient: 'Institut Keusahawanan Negara Berhad (INSKEN)',
    activities: [
      '1. Localisation of AI training materials into Tetum and local context',
      '2. Implement specific AI training to 50% from the 5,000 target of End-Beneficiaries of MSMEs Business owners',
      '3. Implement an awareness campaign that includes a social media component and media engagement highlighting key activities.',
      '4. Identifying the National Policy Convening (NPC) topic and key stakeholders to be involved',
      '5. Submit 6-Month Progress Report and Conduct data collection pre- and post-surveys.',
    ],
    deliverablesList: [
      '1. Modules documents are localised to Melayu and context, with materials tailored to the specific business scopes of each MSME approved by ASEAN Foundation.',
      '2. Monthly progress reports for each month in the period of August 2026-January 2027 (including key activities, progress highlights, challenges encountered, and next month\'s plans).',
      '3. The 6-Month Narrative Progress Report (period August 2026- January 2027), including:\n   • Database of 2,500 from target number of MSMEs engaged (that qualify for eligibility criteria agreed) breakdown business sector and country.\n   • Conduct impact evaluation using pre-and post-survey and submit the survey result.\n   • Summary of social Media Performance Metrics, MSME engagement data, and written qualitative Insights & recommendations.\n   • 3 Human interest stories featuring named MSME beneficiaries (at least 1 female protagonist) and 10 MSME Business Owner impact testimonials.\n   • Relevant documentation of the activities;',
      '4. Draft Concept Note that include: relevant topic, target participants and stakeholders, time, and run down.',
      '5. Financial report',
    ],
    deliverable:
      'Modules localised to Melayu/context, Monthly reports (Aug 2026 - Jan 2027), 6-Month Narrative Report (2,500 MSME database, pre/post surveys, social metrics, 3 stories & 10 testimonials), Draft NPC Concept Note & Financial report.',
    notes: 'Tranche 2: USD 14,600 (40% of total grant) upon acceptance by ASEAN Foundation.',
  },
  {
    id: 'ms-03',
    milestoneNumber: 'Milestone 3',
    title: '100% MSME Target (5,000 Beneficiaries), Project Completion & Financial Report',
    dueDate: '31 July 2027',
    invoiceNo: 'INV-AF-INSKEN-03',
    tranchePct: 30,
    claimAmountUsd: 10950.0,
    amountPaidUsd: 0.0,
    outstandingUsd: 10950.0,
    claimAmount: 48727.5,
    amountPaid: 0.0,
    outstanding: 48727.5,
    milestoneStatus: 'PENDING',
    paymentStatus: 'PENDING',
    paymentDate: '',
    grantor: 'ASEAN Foundation',
    recipient: 'Institut Keusahawanan Negara Berhad (INSKEN)',
    activities: [
      '1. Implement specific AI training to 100% from 5,000 target of End-Beneficiaries of MSMEs Business owners',
      '2. Implement an awareness campaign that includes a social media component and media engagement highlighting key activities.',
      '3. Finalise and submit project completion report.',
      '4. Finalise and submit a financial report.',
    ],
    deliverablesList: [
      '1. Monthly progress reports for each month in the period of February-July 2027 (including key activities, progress highlights, challenges encountered, and next month\'s plans).',
      '2. Project Completion Report/Final Report, including:\n   • Database of 5,000 from target number of MSMEs engaged (that qualify for eligibility criteria agreed) breakdown business sector and country.\n   • 3 Human interest stories featuring named MSME beneficiaries (at least 1 female protagonist) and 10 MSME Business Owner impact testimonials.\n   • Conduct impact evaluation using pre-and post-survey, and 6-month follow-up surveys and submit the result\n   • Summary of social Media Performance Metrics, MSME engagement data, and written qualitative Insights & recommendations – (from overall implementation)\n   • Relevant documentation of the activities;',
      '3. Final financial report',
    ],
    deliverable:
      'Monthly reports (Feb-Jul 2027), Project Completion / Final Report (5,000 MSME database, 3 stories & 10 testimonials, pre/post & 6-month follow-up evaluation, social metrics & insights, activity docs) & Final financial report.',
    notes: 'Tranche 3: USD 10,950 (30% of total grant) upon acceptance by ASEAN Foundation.',
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
    } else if (action === 'RESET_TO_ANNEX_IV') {
      inMemoryState.milestones = JSON.parse(JSON.stringify(DEFAULT_MILESTONES));
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
