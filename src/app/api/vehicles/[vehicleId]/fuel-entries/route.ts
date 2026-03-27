import { NextRequest } from 'next/server';
import { FilterQuery } from 'mongoose';

import { getAuthenticatedUser } from '@/lib/auth';
import { created, getPaginationMeta, okWithMeta, parseJson, parseQuery, withErrorHandling } from '@/lib/api';
import { connectToDatabase } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { serializeFuelEntry, serializeVehicle } from '@/lib/serializers';
import { getOwnedVehicleOrThrow } from '@/lib/vehicles';
import { FuelEntryModel } from '@/models/FuelEntry';
import { createFuelEntrySchema } from '@/validators/fuel';
import { fuelEntryListQuerySchema } from '@/validators/query';

type RouteContext = {
  params: Promise<{
    vehicleId: string;
  }>;
};

function calculateTotalPrice(quantity: number, unitPrice: number) {
  return Number((quantity * unitPrice).toFixed(2));
}

export const GET = withErrorHandling(async (_request: NextRequest, context: RouteContext) => {
  await connectToDatabase();
  const user = await getAuthenticatedUser();
  const { vehicleId } = await context.params;
  await getOwnedVehicleOrThrow(vehicleId, user.id);

  const query = parseQuery(_request, fuelEntryListQuerySchema);
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const filters: FilterQuery<(typeof FuelEntryModel)['schema']['obj']> = {
    userId: user.id,
    vehicleId
  };

  if (query.fuelType) {
    filters.fuelType = { $regex: query.fuelType, $options: 'i' };
  }

  if (query.from || query.to) {
    filters.recordedAt = {};
    if (query.from) {
      filters.recordedAt.$gte = new Date(query.from);
    }
    if (query.to) {
      filters.recordedAt.$lte = new Date(query.to);
    }
  }

  const [entries, totalItems] = await Promise.all([
    FuelEntryModel.find(filters)
      .sort({ recordedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    FuelEntryModel.countDocuments(filters)
  ]);

  return okWithMeta(
    { fuelEntries: entries.map(serializeFuelEntry) },
    getPaginationMeta(page, pageSize, totalItems)
  );
});

export const POST = withErrorHandling(async (request: NextRequest, context: RouteContext) => {
  await connectToDatabase();
  const user = await getAuthenticatedUser();
  const { vehicleId } = await context.params;
  const vehicle = await getOwnedVehicleOrThrow(vehicleId, user.id);
  const payload = await parseJson(request, createFuelEntrySchema);

  if (payload.odometerKm < vehicle.currentOdometerKm) {
    throw new AppError(
      'Fuel entry odometer cannot be lower than the current vehicle odometer.',
      409,
      'ODOMETER_REGRESSION'
    );
  }

  const totalPrice = calculateTotalPrice(payload.quantity, payload.unitPrice);

  const entry = await FuelEntryModel.create({
    userId: user.id,
    vehicleId: vehicle.id,
    odometerKm: payload.odometerKm,
    unitPrice: payload.unitPrice,
    fuelType: payload.fuelType,
    quantity: payload.quantity,
    totalPrice,
    notes: payload.notes ?? null,
    recordedAt: payload.recordedAt ? new Date(payload.recordedAt) : new Date()
  });

  if (payload.odometerKm > vehicle.currentOdometerKm) {
    vehicle.currentOdometerKm = payload.odometerKm;
    await vehicle.save();
  }

  return created({
    fuelEntry: serializeFuelEntry(entry),
    vehicle: serializeVehicle(vehicle)
  });
});
