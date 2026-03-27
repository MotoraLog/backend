import { z } from 'zod';

export const createFuelEntrySchema = z.object({
  odometerKm: z.number().min(0),
  unitPrice: z.number().min(0),
  fuelType: z.string().trim().min(1).max(120),
  quantity: z.number().positive(),
  notes: z.string().trim().max(500).optional().nullable(),
  recordedAt: z.string().datetime().optional()
});
