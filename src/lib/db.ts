import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export function getDb(): PrismaClient {
  try {
    const ctx = getCloudflareContext();
    if (ctx?.env && (ctx.env as any).DB) {
      const adapter = new PrismaD1((ctx.env as any).DB);
      return new PrismaClient({ adapter, log: ['error'] });
    }
  } catch {
    // Local / Node / Build-time fallback
  }

  const g = globalThis as unknown as { prisma?: PrismaClient };
  if (!g.prisma) {
    g.prisma = new PrismaClient({ log: ['error'] });
  }
  return g.prisma;
}

export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDb();
    const val = (client as any)[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  },
});
