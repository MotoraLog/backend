import { z } from 'zod';

export const createMaintenanceEntrySchema = z.object({
  maintenanceType: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(500).optional().nullable(),
  performedAt: z.string().datetime().optional()
});
