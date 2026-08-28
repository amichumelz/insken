import { db } from '../src/lib/db';
const count = await db.participant.count({ where: { region: 'SBH', finalMode: 'Registered_Physical' } });
console.log('SBH physical:', count, '/ 200 =', Math.round(count/200*100)+'%');
const total = await db.participant.count({ where: { region: 'SBH' } });
console.log('SBH total:', total, '/ 900 =', Math.round(total/900*100)+'%');
await db.$disconnect();
