import { NextRequest } from 'next/server';
import { FilterQuery } from 'mongoose';

import { getAuthenticatedUser } from '@/lib/auth';
import { created, getPaginationMeta, okWithMeta, parseJson, parseQuery, withErrorHandling } from '@/lib/api';
import { connectToDatabase } from '@/lib/db';
import { serializeMaintenanceEntry } from '@/lib/serializers';
import { getOwnedVehicleOrThrow } from '@/lib/vehicles';
import { MaintenanceEntryModel } from '@/models/MaintenanceEntry';
import { createMaintenanceEntrySchema } from '@/validators/maintenance';
import { maintenanceEntryListQuerySchema } from '@/validators/query';

type RouteContext = {
  params: Promise<{
    vehicleId: string;
  }>;
};

export const GET = withErrorHandling(async (_request: NextRequest, context: RouteContext) => {
  await connectToDatabase();
  const user = await getAuthenticatedUser();
  const { vehicleId } = await context.params;
  await getOwnedVehicleOrThrow(vehicleId, user.id);

  const query = parseQuery(_request, maintenanceEntryListQuerySchema);
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const filters: FilterQuery<(typeof MaintenanceEntryModel)['schema']['obj']> = {
    userId: user.id,
    vehicleId
  };

  if (query.maintenanceType) {
    filters.maintenanceType = { $regex: query.maintenanceType, $options: 'i' };
  }

  if (query.from || query.to) {
    filters.performedAt = {};
    if (query.from) {
      filters.performedAt.$gte = new Date(query.from);
    }
    if (query.to) {
      filters.performedAt.$lte = new Date(query.to);
    }
  }

  const [entries, totalItems] = await Promise.all([
    MaintenanceEntryModel.find(filters)
      .sort({ performedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    MaintenanceEntryModel.countDocuments(filters)
  ]);

  return okWithMeta(
    { maintenanceEntries: entries.map(serializeMaintenanceEntry) },
    getPaginationMeta(page, pageSize, totalItems)
  );
});

export const POST = withErrorHandling(async (request: NextRequest, context: RouteContext) => {
  await connectToDatabase();
  const user = await getAuthenticatedUser();
  const { vehicleId } = await context.params;
  const vehicle = await getOwnedVehicleOrThrow(vehicleId, user.id);
  const payload = await parseJson(request, createMaintenanceEntrySchema);

  const entry = await MaintenanceEntryModel.create({
    userId: user.id,
    vehicleId: vehicle.id,
    maintenanceType: payload.maintenanceType,
    notes: payload.notes ?? null,
    odometerKm: vehicle.currentOdometerKm,
    performedAt: payload.performedAt ? new Date(payload.performedAt) : new Date()
  });

  return created({ maintenanceEntry: serializeMaintenanceEntry(entry) });
});
