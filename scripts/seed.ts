/**
 * Seed script for ASEAN MSME A.I. Skills Training Program
 * Generates realistic participant data to make the executive dashboard look alive.
 *
 * Target distribution (3,420 of 5,000 ≈ 68.4%):
 *  KL  : 1,150 (1,600 cap) - Physical 380 / Online 770
 *  JHR :   560 ( 800 cap) - Physical 165 / Online 395
 *  PNG :   590 ( 800 cap) - Physical 175 / Online 415
 *  SBH :   620 ( 900 cap) - Physical 160 / Online 460  (Near 80% threshold for demo)
 *  SWK :   500 ( 900 cap) - Physical 130 / Online 370  (Low velocity for demo)
 */

import { db } from '../src/lib/db';

const REGIONS = [
  { code: 'KL',  name: 'Kuala Lumpur', physicalCap: 400, onlineTarget: 1200, total: 1600, target: 1150, physical: 380 },
  { code: 'JHR', name: 'Johor',        physicalCap: 200, onlineTarget: 600,  total: 800,  target: 560,  physical: 165 },
  { code: 'PNG', name: 'Penang',       physicalCap: 200, onlineTarget: 600,  total: 800,  target: 590,  physical: 175 },
  { code: 'SBH', name: 'Sabah',        physicalCap: 200, onlineTarget: 700,  total: 900,  target: 620,  physical: 160 },
  { code: 'SWK', name: 'Sarawak',      physicalCap: 200, onlineTarget: 700,  total: 900,  target: 500,  physical: 130 },
];

const SECTORS = [
  { name: 'Retail',               weight: 0.28 },
  { name: 'Food & Beverage',      weight: 0.22 },
  { name: 'Professional Services', weight: 0.18 },
  { name: 'Tech & Digital',        weight: 0.12 },
  { name: 'Manufacturing',         weight: 0.10 },
  { name: 'Agriculture',           weight: 0.06 },
  { name: 'Others',               weight: 0.04 },
];

const FIRST_NAMES = [
  'Ahmad', 'Siti', 'Lim', 'Tan', 'Wong', 'Raj', 'Priya', 'Muhammad', 'Nurul', 'Wei',
  'Hafiz', 'Mei', 'Kumar', 'Aishah', 'Daniel', 'Fatimah', 'Chong', 'Anu', 'Suria', 'Koh',
  'Azlan', 'Lina', 'Ravi', 'Nadia', 'Chin', 'Arun', 'Farah', 'Bala', 'Hasan', 'Yee',
];
const LAST_NAMES = [
  'bin Abdullah', 'binti Hassan', 'Wei Ming', 'Hock Lee', 'Kumar', 'a/l Subramaniam',
  'binti Omar', 'bin Rahman', 'Sze Ling', 'Chen Hui', 'binti Yusof', 'bin Ibrahim',
  'Kaur', 'Pillai', 'binti Aziz', 'bin Ismail', 'Yong', 'Tan', 'Lee', 'Wong',
];

function pickName(seed: number) {
  const f = FIRST_NAMES[seed % FIRST_NAMES.length];
  const l = LAST_NAMES[(seed * 7) % LAST_NAMES.length];
  return `${f} ${l}`;
}

function pickSector(seed: number) {
  const r = (seed * 13) % 1000 / 1000;
  let acc = 0;
  for (const s of SECTORS) {
    acc += s.weight;
    if (r < acc) return s.name;
  }
  return 'Others';
}

function genIC(seed: number, region: string) {
  // Malaysian IC format: YYMMDD-PB-###G  (we generate synthetic ones)
  const yy = String(70 + (seed % 30)).padStart(2, '0');
  const mm = String(1 + (seed % 12)).padStart(2, '0');
  const dd = String(1 + (seed % 28)).padStart(2, '0');
  const regionCode: Record<string, string> = { KL: '14', JHR: '01', PNG: '07', SBH: '12', SWK: '13' };
  const pb = regionCode[region] ?? '00';
  const seq = String(1000 + (seed % 9000)).padStart(4, '0');
  const g = String((seed * 3) % 10);
  return `${yy}${mm}${dd}-${pb}-${seq}-${g}`;
}

function genEmail(name: string, seed: number) {
  const handle = name.toLowerCase().replace(/[^a-z]/g, '.').replace(/\.+/g, '.').slice(0, 18);
  const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'msme.my', 'business.my'];
  return `${handle}${seed}@${domains[seed % domains.length]}`;
}

function genPhone(seed: number) {
  const p = String(100000000 + (seed * 7) % 900000000);
  return `+60${p.slice(0, 2)}-${p.slice(2, 5)} ${p.slice(5, 8)}`;
}

async function main() {
  console.log('🧹 Cleaning existing data...');
  await db.auditLog.deleteMany();
  await db.alert.deleteMany();
  await db.participant.deleteMany();

  let counter = 0;
  const totalTarget = REGIONS.reduce((s, r) => s + r.target, 0);
  console.log(`🎯 Seeding ${totalTarget} participants...`);

  for (const region of REGIONS) {
    let physicalCount = 0;
    let onlineCount = 0;

    for (let i = 0; i < region.target; i++) {
      counter++;
      const seed = counter * 17;
      const name = pickName(seed);
      const sector = pickSector(seed);
      const ic = genIC(seed, region.code);
      const email = genEmail(name, counter);
      const phone = genPhone(seed);

      let preferredMode = 'Physical';
      let finalMode: string;
      let status: string;

      if (physicalCount < region.physical) {
        finalMode = 'Registered_Physical';
        status = 'Registered_Physical';
        physicalCount++;
        if ((seed % 10) < 6) {
          status = 'Attended_Physical';
        }
      } else {
        finalMode = 'Registered_Online';
        status = 'Registered_Online';
        onlineCount++;
        if ((seed % 20) < 9) {
          status = 'Attended_Online';
        }
      }

      const checkInAt =
        status.startsWith('Attended')
          ? new Date(Date.now() - (seed % 7) * 24 * 60 * 60 * 1000 - (seed % 1440) * 60 * 1000)
          : null;

      await db.participant.create({
        data: {
          participantId: `ASEAN-${String(counter).padStart(5, '0')}`,
          icNumber: ic,
          name,
          email,
          phone,
          sector,
          region: region.code,
          preferredMode,
          finalMode,
          status,
          checkInAt,
        },
      });
    }

    console.log(`✓ ${region.code} (${region.name}): ${region.target} seeded — Physical ${physicalCount}, Online ${onlineCount}`);
  }

  console.log('🚫 Seeding duplicate-blocked records...');
  const existing = await db.participant.findMany({ take: 80, orderBy: { createdAt: 'asc' } });
  let dupCounter = 0;
  for (const p of existing.slice(0, 60)) {
    dupCounter++;
    await db.auditLog.create({
      data: {
        action: 'DUPLICATE_BLOCKED',
        participant: p.name,
        icNumber: p.icNumber,
        detail: `Registration attempt blocked — IC ${p.icNumber} already exists for ${p.participantId}.`,
      },
    });
  }
  await db.alert.create({
    data: {
      type: 'DUPLICATE_BLOCKED',
      message: `${dupCounter} duplicate registration attempts blocked by data hygiene layer.`,
      severity: 'info',
      metadata: JSON.stringify({ count: dupCounter }),
    },
  });

  const sbhCount = await db.participant.count({ where: { region: 'SBH' } });
  if (sbhCount >= 720) {
    await db.alert.create({
      data: {
        type: 'CAPACITY_80',
        region: 'SBH',
        message: `Sabah physical capacity reached 80% (${sbhCount}/900). Reduce regional ad spend.`,
        severity: 'warning',
        metadata: JSON.stringify({ region: 'SBH', count: sbhCount, cap: 900, pct: Math.round((sbhCount / 900) * 100) }),
      },
    });
  }

  const sbhPhysical = await db.participant.count({ where: { region: 'SBH', finalMode: 'Registered_Physical' } });
  if (sbhPhysical >= 200) {
    await db.alert.create({
      data: {
        type: 'CAPACITY_FULL',
        region: 'SBH',
        message: `Sabah physical seats full (${sbhPhysical}/200). Auto-fallback to Online active.`,
        severity: 'critical',
        metadata: JSON.stringify({ region: 'SBH', physicalCount: sbhPhysical, cap: 200 }),
      },
    });
  }

  const swkCount = await db.participant.count({ where: { region: 'SWK' } });
  if (swkCount < 450) {
    await db.alert.create({
      data: {
        type: 'MARKETING_LAG',
        region: 'SWK',
        message: `Sarawak at ${Math.round((swkCount / 900) * 100)}% of allocation (${swkCount}/900) — below 50% threshold 7 days out. Trigger B2B push.`,
        severity: 'warning',
        metadata: JSON.stringify({ region: 'SWK', count: swkCount, cap: 900, pct: Math.round((swkCount / 900) * 100) }),
      },
    });
  }

  const totalCount = await db.participant.count();
  const milestones = [
    { p: 0.25, type: 'MILESTONE_25', label: '25%' },
    { p: 0.50, type: 'MILESTONE_50', label: '50%' },
    { p: 0.75, type: 'MILESTONE_75', label: '75%' },
  ];
  for (const m of milestones) {
    if (totalCount >= 5000 * m.p) {
      await db.alert.create({
        data: {
          type: m.type,
          message: `Global milestone reached: ${m.label} of 5,000 target (${totalCount} participants).`,
          severity: 'success',
          metadata: JSON.stringify({ count: totalCount, target: 5000, pct: m.label }),
        },
      });
    }
  }

  console.log(`\n✅ Seed complete. Total participants: ${totalCount}`);
  console.log(`✅ Audit logs: ${dupCounter} duplicate-blocked entries`);
  console.log(`✅ Alerts seeded for capacity + milestones`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
