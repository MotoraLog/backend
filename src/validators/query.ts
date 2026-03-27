import { z } from 'zod';

const parseBoolean = z
  .union([z.literal('true'), z.literal('false'), z.boolean()])
  .transform((value) => value === true || value === 'true');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const vehicleListQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(120).optional()
});

export const fuelEntryListQuerySchema = paginationSchema.extend({
  fuelType: z.string().trim().max(120).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional()
});

export const maintenanceEntryListQuerySchema = paginationSchema.extend({
  maintenanceType: z.string().trim().max(120).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional()
});

export const reminderListQuerySchema = paginationSchema.extend({
  status: z.string().trim().max(50).optional(),
  due: parseBoolean.optional()
});
