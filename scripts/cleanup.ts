/**
 * Cleanup script — removes the test participants created during browser verification,
 * then re-syncs the audit log so the dashboard reflects only seeded realistic data.
 */
import { db } from '../src/lib/db';

async function main() {
  console.log('🧹 Removing test participants created during verification...');
  const testIds = await db.participant.findMany({
    where: { name: { in: ['Test Participant Demo', 'Duplicate Test'] } },
    select: { id: true, participantId: true, name: true },
  });
  for (const t of testIds) {
    await db.auditLog.deleteMany({ where: { participant: t.name } });
    await db.participant.delete({ where: { id: t.id } });
    console.log(`  removed ${t.participantId} (${t.name})`);
  }

  // Also remove CAPACITY_FULL alerts created by my test registration that hit a full seat
  // (not the seeded ones, only ones triggered during testing on 2026-08-24 after the seed)
  const seedTime = new Date('2026-08-24T04:09:00Z');
  const extraAlerts = await db.alert.findMany({
    where: { triggeredAt: { gt: seedTime } },
    select: { id: true, type: true, message: true, triggeredAt: true },
  });
  for (const a of extraAlerts) {
    await db.alert.delete({ where: { id: a.id } });
    console.log(`  removed alert ${a.type} @ ${a.triggeredAt.toISOString()}`);
  }

  const finalCount = await db.participant.count();
  console.log(`\n✅ Final participant count: ${finalCount}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
