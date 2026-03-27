import { z } from 'zod';

export const createVehicleSchema = z.object({
  description: z.string().trim().min(1).max(120),
  plate: z.string().trim().min(1).max(20),
  category: z.string().trim().min(1).max(50).default('car'),
  currentOdometerKm: z.number().min(0).default(0)
});

export const updateVehicleSchema = createVehicleSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  'At least one field must be provided.'
);

export const updateOdometerSchema = z.object({
  odometerKm: z.number().min(0),
  recordedAt: z.string().datetime().optional()
});
