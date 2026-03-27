import { Types } from 'mongoose';

import { AppError } from '@/lib/errors';
import { VehicleModel } from '@/models/Vehicle';

export async function getOwnedVehicleOrThrow(vehicleId: string, userId: string) {
  if (!Types.ObjectId.isValid(vehicleId)) {
    throw new AppError('Invalid vehicle id.', 400, 'INVALID_VEHICLE_ID');
  }

  const vehicle = await VehicleModel.findOne({ _id: vehicleId, userId });

  if (!vehicle) {
    throw new AppError('Vehicle not found.', 404, 'VEHICLE_NOT_FOUND');
  }

  return vehicle;
}
