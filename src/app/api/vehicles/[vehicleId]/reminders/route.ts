import { NextRequest } from 'next/server';
import { FilterQuery } from 'mongoose';

import { getAuthenticatedUser } from '@/lib/auth';
import { addMonths } from '@/lib/reminders';
import { created, getPaginationMeta, okWithMeta, parseJson, parseQuery, withErrorHandling } from '@/lib/api';
import { connectToDatabase } from '@/lib/db';
import { serializeReminder } from '@/lib/serializers';
import { getOwnedVehicleOrThrow } from '@/lib/vehicles';
import { ReminderModel } from '@/models/Reminder';
import { reminderListQuerySchema } from '@/validators/query';
import { createReminderSchema } from '@/validators/reminder';

type RouteContext = {
  params: Promise<{
    vehicleId: string;
  }>;
};

function resolveReminderDate(remindAtDate?: string | null, monthInterval?: number | null) {
  if (remindAtDate) {
    return new Date(remindAtDate);
  }

  if (monthInterval != null) {
    return addMonths(new Date(), monthInterval);
  }

  return null;
}

function resolveReminderMileage(
  currentOdometerKm: number,
  remindAtOdometerKm?: number | null,
  mileageIntervalKm?: number | null
) {
  if (remindAtOdometerKm != null) {
    return remindAtOdometerKm;
  }

  if (mileageIntervalKm != null) {
    return currentOdometerKm + mileageIntervalKm;
  }

  return null;
}

export const GET = withErrorHandling(async (_request: NextRequest, context: RouteContext) => {
  await connectToDatabase();
  const user = await getAuthenticatedUser();
  const { vehicleId } = await context.params;
  const vehicle = await getOwnedVehicleOrThrow(vehicleId, user.id);

  const query = parseQuery(_request, reminderListQuerySchema);
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const filters: FilterQuery<(typeof ReminderModel)['schema']['obj']> = {
    userId: user.id,
    vehicleId
  };

  if (query.status) {
    filters.status = query.status;
  }

  const reminders = await ReminderModel.find(filters).sort({ createdAt: -1 });
  const serializedReminders = reminders
    .map((reminder) => serializeReminder(reminder, vehicle.currentOdometerKm))
    .filter((reminder) => (query.due === undefined ? true : reminder.dueState.isDue === query.due));

  const startIndex = (page - 1) * pageSize;
  const paginatedReminders = serializedReminders.slice(startIndex, startIndex + pageSize);

  return okWithMeta(
    {
      reminders: paginatedReminders
    },
    getPaginationMeta(page, pageSize, serializedReminders.length)
  );
});

export const POST = withErrorHandling(async (request: NextRequest, context: RouteContext) => {
  await connectToDatabase();
  const user = await getAuthenticatedUser();
  const { vehicleId } = await context.params;
  const vehicle = await getOwnedVehicleOrThrow(vehicleId, user.id);
  const payload = await parseJson(request, createReminderSchema);

  const reminder = await ReminderModel.create({
    userId: user.id,
    vehicleId: vehicle.id,
    reminderText: payload.reminderText,
    currentOdometerKm: vehicle.currentOdometerKm,
    mileageIntervalKm: payload.mileageIntervalKm ?? null,
    remindAtOdometerKm: resolveReminderMileage(
      vehicle.currentOdometerKm,
      payload.remindAtOdometerKm,
      payload.mileageIntervalKm
    ),
    monthInterval: payload.monthInterval ?? null,
    remindAtDate: resolveReminderDate(payload.remindAtDate, payload.monthInterval),
    status: 'active'
  });

  return created({ reminder: serializeReminder(reminder, vehicle.currentOdometerKm) });
});
