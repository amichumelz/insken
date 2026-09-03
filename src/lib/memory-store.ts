// Clean In-Memory Fallback Store with exactly 10 realistic sample participants

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

const SAMPLE_10: CachedParticipant[] = [
  {
    id: 'p-01',
    participantId: 'ASEAN-00001',
    icNumber: '880115-14-5521',
    name: 'Ahmad Farhan bin Rosli',
    email: 'farhan.rosli@msme.my',
    phone: '+60123456701',
    sector: 'Retail',
    region: 'KL',
    preferredMode: 'Physical',
    finalMode: 'Registered_Physical',
    status: 'Attended_Physical',
    checkInAt: '2026-09-02T08:30:00Z',
    createdAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 'p-02',
    participantId: 'ASEAN-00002',
    icNumber: '910322-01-6644',
    name: 'Nur Aisyah binti Zakaria',
    email: 'aisyah.z@msme.my',
    phone: '+60123456702',
    sector: 'Food & Beverage',
    region: 'JHR',
    preferredMode: 'Online',
    finalMode: 'Registered_Online',
    status: 'Attended_Online',
    checkInAt: '2026-09-02T08:45:00Z',
    createdAt: '2026-08-21T11:15:00Z',
  },
  {
    id: 'p-03',
    participantId: 'ASEAN-00003',
    icNumber: '850711-07-5123',
    name: 'Tan Wei Loon',
    email: 'weiloon.tan@msme.my',
    phone: '+60123456703',
    sector: 'Manufacturing',
    region: 'PNG',
    preferredMode: 'Physical',
    finalMode: 'Registered_Physical',
    status: 'Registered_Physical',
    checkInAt: null,
    createdAt: '2026-08-22T09:30:00Z',
  },
  {
    id: 'p-04',
    participantId: 'ASEAN-00004',
    icNumber: '931205-12-5890',
    name: 'Mohd Danial bin Yusof',
    email: 'danial.y@msme.my',
    phone: '+60123456704',
    sector: 'Professional Services',
    region: 'SBH',
    preferredMode: 'Physical',
    finalMode: 'Registered_Physical',
    status: 'Attended_Physical',
    checkInAt: '2026-09-02T09:10:00Z',
    createdAt: '2026-08-23T14:20:00Z',
  },
  {
    id: 'p-05',
    participantId: 'ASEAN-00005',
    icNumber: '890418-13-5012',
    name: 'Grace Ting Sie Ping',
    email: 'grace.ting@msme.my',
    phone: '+60123456705',
    sector: 'Agriculture',
    region: 'SWK',
    preferredMode: 'Online',
    finalMode: 'Registered_Online',
    status: 'Registered_Online',
    checkInAt: null,
    createdAt: '2026-08-24T16:40:00Z',
  },
  {
    id: 'p-06',
    participantId: 'ASEAN-00006',
    icNumber: '940809-10-5341',
    name: 'Priya a/p Subramaniam',
    email: 'priya.s@msme.my',
    phone: '+60123456706',
    sector: 'Retail',
    region: 'KL',
    preferredMode: 'Physical',
    finalMode: 'Registered_Physical',
    status: 'Registered_Physical',
    checkInAt: null,
    createdAt: '2026-08-25T10:10:00Z',
  },
  {
    id: 'p-07',
    participantId: 'ASEAN-00007',
    icNumber: '900214-01-5788',
    name: 'Hafiz bin Mansor',
    email: 'hafiz.m@msme.my',
    phone: '+60123456707',
    sector: 'Food & Beverage',
    region: 'JHR',
    preferredMode: 'Physical',
    finalMode: 'Registered_Physical',
    status: 'Attended_Physical',
    checkInAt: '2026-09-02T09:40:00Z',
    createdAt: '2026-08-26T13:00:00Z',
  },
  {
    id: 'p-08',
    participantId: 'ASEAN-00008',
    icNumber: '870930-08-5911',
    name: 'Lim Chee Keong',
    email: 'cheekeong.lim@msme.my',
    phone: '+60123456708',
    sector: 'Tech & Digital',
    region: 'PNG',
    preferredMode: 'Online',
    finalMode: 'Registered_Online',
    status: 'Attended_Online',
    checkInAt: '2026-09-02T10:05:00Z',
    createdAt: '2026-08-27T15:30:00Z',
  },
  {
    id: 'p-09',
    participantId: 'ASEAN-00009',
    icNumber: '950619-12-6102',
    name: 'Siti Hajar binti Ibrahim',
    email: 'hajar.i@msme.my',
    phone: '+60123456709',
    sector: 'Agriculture',
    region: 'SBH',
    preferredMode: 'Online',
    finalMode: 'Registered_Online',
    status: 'Registered_Online',
    checkInAt: null,
    createdAt: '2026-08-28T11:20:00Z',
  },
  {
    id: 'p-10',
    participantId: 'ASEAN-00010',
    icNumber: '920311-13-5490',
    name: 'Brandon Anak Walter',
    email: 'brandon.w@msme.my',
    phone: '+60123456710',
    sector: 'Professional Services',
    region: 'SWK',
    preferredMode: 'Physical',
    finalMode: 'Registered_Physical',
    status: 'Registered_Physical',
    checkInAt: null,
    createdAt: '2026-08-29T17:00:00Z',
  },
];

for (const p of SAMPLE_10) {
  inMemoryParticipants.set(p.participantId, p);
}
