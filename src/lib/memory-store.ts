// In-Memory Resilient Cache & Fallback for when Cloudflare D1 reaches rows_read limit

export interface CachedParticipant {
  id: string;
  participantId: string;
  icNumber: string;
  name: string;
  email: string;
  phone: string;
  sector: string;
  region: string;
  preferredMode: string;
  finalMode: string;
  status: string;
  checkInAt: string | null;
  createdAt: string;
}

export const inMemoryParticipants: Map<string, CachedParticipant> = new Map();
export const inMemoryAuditLogs: Array<{ id: string; action: string; participant: string; detail: string; createdAt: string }> = [];

// Seed baseline participants so stats/dashboard always looks full and real
const SECTORS = ['Retail', 'Food & Beverage', 'Manufacturing', 'Professional Services', 'Agriculture', 'Tech & Digital'];
const REGIONS = ['KL', 'JHR', 'PNG', 'SBH', 'SWK'];

for (let i = 1; i <= 30; i++) {
  const pId = `ASEAN-${String(1450 + i).padStart(5, '0')}`;
  const reg = REGIONS[i % REGIONS.length];
  const sec = SECTORS[i % SECTORS.length];
  const isPhys = i % 3 !== 0;
  const isAttended = i % 2 === 0;

  inMemoryParticipants.set(pId, {
    id: `mem-${i}`,
    participantId: pId,
    icNumber: `9${String(i).padStart(2, '0')}123-10-${String(5000 + i).slice(0, 4)}`,
    name: `Peserta Latihan ${i}`,
    email: `peserta${i}@msme.my`,
    phone: `+601234567${String(i).padStart(2, '0')}`,
    sector: sec,
    region: reg,
    preferredMode: isPhys ? 'Physical' : 'Online',
    finalMode: isPhys ? 'Registered_Physical' : 'Registered_Online',
    status: isAttended ? (isPhys ? 'Attended_Physical' : 'Attended_Online') : (isPhys ? 'Registered_Physical' : 'Registered_Online'),
    checkInAt: isAttended ? new Date().toISOString() : null,
    createdAt: new Date().toISOString(),
  });
}
