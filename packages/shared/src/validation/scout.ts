import { z } from 'zod';

export const scoutInputSchema = z.object({
  country: z.enum(['AU', 'CL']),
  propertyType: z.enum([
    'restaurant',
    'hotel',
    'mall',
    'apartment',
    'office',
    'hospital',
    'other',
  ]),
  parkingSpaces: z.number().int().min(1).max(10000),
  chargerType: z.enum(['L2', 'DCFC']),
  chargerCount: z.number().int().min(1).max(500),
  electricityRate: z.number().min(0),
  sessionRate: z.number().min(0),
  utilizationPct: z.number().min(1).max(100),
  installCostTotal: z.number().min(0),
  taxCreditPct: z.number().min(0).max(100),
});

export type ScoutFormData = z.infer<typeof scoutInputSchema>;

export const leadFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  company: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;
