import { NextRequest } from 'next/server';

import { getAuthenticatedUser } from '@/lib/auth';
import { ok, parseJson, withErrorHandling } from '@/lib/api';
import { connectToDatabase } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { serializeVehicle } from '@/lib/serializers';
import { getOwnedVehicleOrThrow } from '@/lib/vehicles';
import { updateVehicleSchema } from '@/validators/vehicle';

type RouteContext = {
  params: Promise<{
    vehicleId: string;
  }>;
};

export const GET = withErrorHandling(async (_request: NextRequest, context: RouteContext) => {
  await connectToDatabase();
  const user = await getAuthenticatedUser();
  const { vehicleId } = await context.params;
  const vehicle = await getOwnedVehicleOrThrow(vehicleId, user.id);

  return ok({ vehicle: serializeVehicle(vehicle) });
});

export const PATCH = withErrorHandling(async (request: NextRequest, context: RouteContext) => {
  await connectToDatabase();
  const user = await getAuthenticatedUser();
  const { vehicleId } = await context.params;
  const vehicle = await getOwnedVehicleOrThrow(vehicleId, user.id);
  const payload = await parseJson(request, updateVehicleSchema);

  if (payload.description !== undefined) {
    vehicle.description = payload.description;
  }

  if (payload.plate !== undefined) {
    vehicle.plate = payload.plate.toUpperCase();
  }

  if (payload.category !== undefined) {
    vehicle.category = payload.category;
  }

  if (payload.currentOdometerKm !== undefined) {
    if (payload.currentOdometerKm < vehicle.currentOdometerKm) {
      throw new AppError('Odometer cannot move backwards.', 409, 'ODOMETER_REGRESSION');
    }

    vehicle.currentOdometerKm = payload.currentOdometerKm;
  }

  await vehicle.save();

  return ok({ vehicle: serializeVehicle(vehicle) });
});

export const DELETE = withErrorHandling(async (_request: NextRequest, context: RouteContext) => {
  await connectToDatabase();
  const user = await getAuthenticatedUser();
  const { vehicleId } = await context.params;
  const vehicle = await getOwnedVehicleOrThrow(vehicleId, user.id);

  await vehicle.deleteOne();

  return ok({ deleted: true });
});
