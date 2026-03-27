import { NextRequest } from 'next/server';
import { FilterQuery } from 'mongoose';

import { getAuthenticatedUser } from '@/lib/auth';
import { created, getPaginationMeta, okWithMeta, parseJson, parseQuery, withErrorHandling } from '@/lib/api';
import { connectToDatabase } from '@/lib/db';
import { serializeVehicle } from '@/lib/serializers';
import { VehicleModel } from '@/models/Vehicle';
import { createVehicleSchema } from '@/validators/vehicle';
import { vehicleListQuerySchema } from '@/validators/query';

export const GET = withErrorHandling(async (request: NextRequest) => {
  await connectToDatabase();
  const user = await getAuthenticatedUser();
  const query = parseQuery(request, vehicleListQuerySchema);
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const filters: FilterQuery<(typeof VehicleModel)['schema']['obj']> = {
    userId: user.id
  };

  if (query.search) {
    filters.$or = [
      { description: { $regex: query.search, $options: 'i' } },
      { plate: { $regex: query.search, $options: 'i' } },
      { category: { $regex: query.search, $options: 'i' } }
    ];
  }

  const [vehicles, totalItems] = await Promise.all([
    VehicleModel.find(filters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    VehicleModel.countDocuments(filters)
  ]);

  return okWithMeta(
    { vehicles: vehicles.map(serializeVehicle) },
    getPaginationMeta(page, pageSize, totalItems)
  );
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  await connectToDatabase();
  const user = await getAuthenticatedUser();
  const payload = await parseJson(request, createVehicleSchema);

  const vehicle = await VehicleModel.create({
    userId: user.id,
    description: payload.description,
    plate: payload.plate,
    category: payload.category,
    currentOdometerKm: payload.currentOdometerKm
  });

  return created({ vehicle: serializeVehicle(vehicle) });
});
