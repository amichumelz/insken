/**
 * Empty-state seed script — wipes all data so the dashboard starts at 0.
 * The live ticker will then populate the dashboard from scratch.
 */
import { db } from '../src/lib/db';

async function main() {
  console.log('🧹 Wiping all participant data for empty-state start...');
  await db.auditLog.deleteMany();
  await db.alert.deleteMany();
  await db.participant.deleteMany();

  const total = await db.participant.count();
  const audit = await db.auditLog.count();
  const alerts = await db.alert.count();
  console.log(`\n✅ Empty state ready.`);
  console.log(`   Participants: ${total}`);
  console.log(`   Audit logs: ${audit}`);
  console.log(`   Alerts: ${alerts}`);
  console.log('\nThe live ticker will now populate the dashboard from 0.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
