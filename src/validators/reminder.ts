import { z } from 'zod';

export const createReminderSchema = z
  .object({
    reminderText: z.string().trim().min(1).max(200),
    mileageIntervalKm: z.number().min(0).optional().nullable(),
    remindAtOdometerKm: z.number().min(0).optional().nullable(),
    monthInterval: z.number().int().min(0).optional().nullable(),
    remindAtDate: z.string().datetime().optional().nullable()
  })
  .refine(
    (payload) =>
      payload.mileageIntervalKm != null ||
      payload.remindAtOdometerKm != null ||
      payload.monthInterval != null ||
      payload.remindAtDate != null,
    'A reminder must have at least one mileage or date trigger.'
  );
