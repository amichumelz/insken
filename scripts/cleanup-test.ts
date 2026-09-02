import { db } from '../src/lib/db';
async function main() {
  const testIds = await db.participant.findMany({
    where: { name: { in: ['Healthcare Test User', 'Test Participant Demo', 'Duplicate Test', 'QR Demo Participant', 'Duplicate User', 'Mobile QR Test'] } },
    select: { id: true, participantId: true, name: true },
  });
  for (const t of testIds) {
    await db.auditLog.deleteMany({ where: { participant: t.name } });
    await db.participant.delete({ where: { id: t.id } });
    console.log(`  removed ${t.participantId} (${t.name})`);
  }
  console.log(`Done. Final count: ${await db.participant.count()}`);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
