import { NextRequest } from 'next/server';

import { getAuthenticatedUser } from '@/lib/auth';
import { created, parseJson, withErrorHandling } from '@/lib/api';
import { connectToDatabase } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { serializeOdometerUpdate, serializeVehicle } from '@/lib/serializers';
import { getOwnedVehicleOrThrow } from '@/lib/vehicles';
import { OdometerUpdateModel } from '@/models/OdometerUpdate';
import { updateOdometerSchema } from '@/validators/vehicle';

type RouteContext = {
  params: Promise<{
    vehicleId: string;
  }>;
};

export const POST = withErrorHandling(async (request: NextRequest, context: RouteContext) => {
  await connectToDatabase();
  const user = await getAuthenticatedUser();
  const { vehicleId } = await context.params;
  const vehicle = await getOwnedVehicleOrThrow(vehicleId, user.id);
  const payload = await parseJson(request, updateOdometerSchema);

  if (payload.odometerKm < vehicle.currentOdometerKm) {
    throw new AppError('Odometer cannot move backwards.', 409, 'ODOMETER_REGRESSION');
  }

  vehicle.currentOdometerKm = payload.odometerKm;
  await vehicle.save();

  const update = await OdometerUpdateModel.create({
    userId: user.id,
    vehicleId: vehicle.id,
    odometerKm: payload.odometerKm,
    recordedAt: payload.recordedAt ? new Date(payload.recordedAt) : new Date()
  });

  return created({
    vehicle: serializeVehicle(vehicle),
    odometerUpdate: serializeOdometerUpdate(update)
  });
});
