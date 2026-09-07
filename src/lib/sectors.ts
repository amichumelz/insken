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
