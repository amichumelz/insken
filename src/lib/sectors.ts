/**
 * Official AIM ASEAN Targeted MSMEs Business Sectors for AI Training
 * As defined by INSKEN & AIM ASEAN.
 */
export const SECTORS = [
  'Food, Agriculture and Forestry',
  'Energy',
  'Minerals',
  'Digital sector',
  'E-commerce',
  'Standard and Conformance',
  'Services (Tourism, Transport, Education, Healthcare, Retail, etc.)',
  'Manufacturing',
  'Construction',
  'Non-profit sector',
  'Other industry workers',
] as const;

export type SectorType = (typeof SECTORS)[number];

export const SECTOR_COLORS: Record<string, string> = {
  'Food, Agriculture and Forestry': '#16A34A', // Green
  'Energy': '#F59E0B',                        // Amber / Energy
  'Minerals': '#78716C',                      // Stone / Mineral
  'Digital sector': '#2563EB',                // Tech Blue
  'E-commerce': '#EC4899',                    // Pink / Shopping
  'Standard and Conformance': '#6366F1',      // Indigo / Quality
  'Services (Tourism, Transport, Education, Healthcare, Retail, etc.)': '#0891B2', // Cyan / Service
  'Manufacturing': '#EA580C',                 // Orange / Industrial
  'Construction': '#D97706',                  // Ochre / Construction
  'Non-profit sector': '#9333EA',             // Purple / NGO
  'Other industry workers': '#64748B',        // Slate / Others
};

export function normalizeSectorName(rawSector: string): string {
  if (!rawSector) return 'Services (Tourism, Transport, Education, Healthcare, Retail, etc.)';
  const trimmed = rawSector.trim();
  if (SECTORS.includes(trimmed as any)) return trimmed;

  const lower = trimmed.toLowerCase();
  if (lower.includes('food') || lower.includes('beverage') || lower.includes('f&b') || lower.includes('agri') || lower.includes('forest') || lower.includes('farm')) {
    return 'Food, Agriculture and Forestry';
  }
  if (lower.includes('energy') || lower.includes('power') || lower.includes('oil') || lower.includes('gas') || lower.includes('solar')) {
    return 'Energy';
  }
  if (lower.includes('mineral') || lower.includes('mining') || lower.includes('metal')) {
    return 'Minerals';
  }
  if (lower.includes('digit') || lower.includes('tech') || lower.includes('software') || lower.includes('ai') || lower.includes('it')) {
    return 'Digital sector';
  }
  if (lower.includes('e-comm') || lower.includes('ecommerce') || lower.includes('online shop') || lower.includes('shopee') || lower.includes('tiktok')) {
    return 'E-commerce';
  }
  if (lower.includes('standard') || lower.includes('conformance') || lower.includes('quality') || lower.includes('iso') || lower.includes('sirim')) {
    return 'Standard and Conformance';
  }
  if (lower.includes('service') || lower.includes('retail') || lower.includes('tourism') || lower.includes('transport') || lower.includes('education') || lower.includes('health') || lower.includes('hospitality') || lower.includes('consult')) {
    return 'Services (Tourism, Transport, Education, Healthcare, Retail, etc.)';
  }
  if (lower.includes('manufactur') || lower.includes('factory') || lower.includes('product') || lower.includes('industrial')) {
    return 'Manufacturing';
  }
  if (lower.includes('construct') || lower.includes('building') || lower.includes('contractor') || lower.includes('property')) {
    return 'Construction';
  }
  if (lower.includes('non-profit') || lower.includes('ngo') || lower.includes('charity') || lower.includes('persatuan') || lower.includes('yayasan')) {
    return 'Non-profit sector';
  }
  return 'Other industry workers';
}

