import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { REGION_CONFIG, RegionCode } from '@/lib/regions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RegisterPayload {
  icNumber: string;
  name: string;
  email: string;
  phone: string;
  sector: string;
  region: string;
  preferredMode: string;
}

/**
 * Phase 1: Ingestion & Validation — IC is the unique key.
 * Phase 2: Capacity Routing & Asset Generation — physical until cap, then online fallback.
 * Returns a structured workflow log so the dashboard can visualise the agent's decisions.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as RegisterPayload;
  const { icNumber, name, email, phone, sector, region, preferredMode } = body;

  const workflow: Array<{ phase: string; step: string; status: 'success' | 'rejected' | 'routed'; detail: string; timestamp: string }> = [];
  const t0 = new Date().toISOString();
  workflow.push({
    phase: 'Phase 1: Ingestion',
    step: 'Payload Extraction',
    status: 'success',
    detail: `Extracted IC=${icNumber}, Name=${name}, Region=${region}, Mode=${preferredMode}, Sector=${sector}`,
    timestamp: t0,
  });

  // Validate required fields
  if (!icNumber || !name || !email || !region || !sector) {
    return NextResponse.json(
      { ok: false, error: 'Missing required fields', workflow },
      { status: 400 },
    );
  }

  const regionCode = (region in REGION_CONFIG ? region : 'KL') as RegionCode;
  const cfg = REGION_CONFIG[regionCode];

  // Phase 1: Duplicate Check
  const existing = await db.participant.findUnique({ where: { icNumber } });
  if (existing) {
    workflow.push({
      phase: 'Phase 1: Validation',
      step: 'Duplicate Check',
      status: 'rejected',
      detail: `IC ${icNumber} already registered as ${existing.participantId}. Triggering DUPLICATE_ENTRY rejection.`,
      timestamp: new Date().toISOString(),
    });
    await db.auditLog.create({
      data: {
        action: 'DUPLICATE_BLOCKED',
        participant: name,
        icNumber,
        detail: `Duplicate registration attempt blocked — IC ${icNumber} already exists for ${existing.participantId}.`,
      },
    });
    return NextResponse.json({
      ok: false,
      status: 'DUPLICATE_ENTRY',
      existing,
      message: 'Registered Previously — your IC is already in our system.',
      workflow,
    });
  }

  workflow.push({
    phase: 'Phase 1: Validation',
    step: 'Duplicate Check',
    status: 'success',
    detail: `IC ${icNumber} not found in registry. Proceeding to capacity routing.`,
    timestamp: new Date().toISOString(),
  });

  // Phase 2: Capacity Check
  const physicalCount = await db.participant.count({
    where: { region: regionCode, finalMode: 'Registered_Physical' },
  });

  let finalMode: 'Registered_Physical' | 'Registered_Online';
  let capacityRouted = false;
  let capacityNote = '';

  if (preferredMode === 'Physical' && physicalCount < cfg.physicalCap) {
    finalMode = 'Registered_Physical';
    workflow.push({
      phase: 'Phase 2: Capacity Routing',
      step: 'Capacity Check',
      status: 'success',
      detail: `Physical seats ${physicalCount}/${cfg.physicalCap} available. Routing to Registered_Physical.`,
      timestamp: new Date().toISOString(),
    });
  } else if (preferredMode === 'Physical' && physicalCount >= cfg.physicalCap) {
    finalMode = 'Registered_Online';
    capacityRouted = true;
    capacityNote = 'Physical seats full; upgraded to Priority Online Session.';
    workflow.push({
      phase: 'Phase 2: Capacity Routing',
      step: 'Capacity Check',
      status: 'routed',
      detail: `Physical seats ${physicalCount}/${cfg.physicalCap} full. Auto-fallback to Registered_Online (priority session).`,
      timestamp: new Date().toISOString(),
    });
    await db.alert.create({
      data: {
        type: 'CAPACITY_FULL',
        region: regionCode,
        message: `${cfg.name} physical seats full (${physicalCount}/${cfg.physicalCap}). Auto-fallback to Online active for incoming registrations.`,
        severity: 'critical',
        metadata: JSON.stringify({ region: regionCode, physicalCount, cap: cfg.physicalCap }),
      },
    });
  } else {
    finalMode = 'Registered_Online';
    workflow.push({
      phase: 'Phase 2: Capacity Routing',
      step: 'Capacity Check',
      status: 'success',
      detail: `Preferred mode = Online. Routing to Registered_Online.`,
      timestamp: new Date().toISOString(),
    });
  }

  // Asset generation: unique participant ID + QR seed
  const totalSoFar = await db.participant.count();
  const participantId = `ASEAN-${String(totalSoFar + 1).padStart(5, '0')}`;
  const qrSeed = `${participantId}|${icNumber}`;

  workflow.push({
    phase: 'Phase 2: Asset Generation',
    step: 'QR Code',
    status: 'success',
    detail: `Generated Participant_ID ${participantId} and QR seed for WhatsApp delivery.`,
    timestamp: new Date().toISOString(),
  });

  const created = await db.participant.create({
    data: {
      participantId,
      icNumber,
      name,
      email,
      phone,
      sector,
      region: regionCode,
      preferredMode,
      finalMode,
      status: finalMode,
    },
  });

  await db.auditLog.create({
    data: {
      action: 'REGISTER',
      participant: name,
      icNumber,
      detail: `Registered as ${participantId} via ${finalMode}. Region: ${cfg.name}.`,
    },
  });

  // Check 80% warning threshold post-registration
  const newPhysical = await db.participant.count({
    where: { region: regionCode, finalMode: 'Registered_Physical' },
  });
  if (newPhysical === Math.floor(cfg.physicalCap * 0.8)) {
    await db.alert.create({
      data: {
        type: 'CAPACITY_80',
        region: regionCode,
        message: `${cfg.name} physical capacity reached 80% (${newPhysical}/${cfg.physicalCap}). Reduce regional ad spend.`,
        severity: 'warning',
        metadata: JSON.stringify({ region: regionCode, count: newPhysical, cap: cfg.physicalCap, pct: 80 }),
      },
    });
  }

  return NextResponse.json({
    ok: true,
    participant: created,
    qrSeed,
    capacityRouted,
    capacityNote,
    message: capacityRouted
      ? 'Physical seats full; you have been upgraded to our Priority Online Session.'
      : 'Registration confirmed. Your WhatsApp confirmation with event details is on its way.',
    workflow,
  });
}
