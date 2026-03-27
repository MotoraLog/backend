import { computeReminderDueState } from '@/lib/reminders';

type SerializableDate = Date | string | null | undefined;

function toIsoDate(value: SerializableDate) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

export function serializeUser(user: {
  _id: { toString(): string };
  email: string;
  name: string;
}) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name
  };
}

export function serializeVehicle(vehicle: {
  _id: { toString(): string };
  userId: { toString(): string };
  description: string;
  plate: string;
  category: string;
  currentOdometerKm: number;
  createdAt?: SerializableDate;
  updatedAt?: SerializableDate;
}) {
  return {
    id: vehicle._id.toString(),
    userId: vehicle.userId.toString(),
    description: vehicle.description,
    plate: vehicle.plate,
    category: vehicle.category,
    currentOdometerKm: vehicle.currentOdometerKm,
    createdAt: toIsoDate(vehicle.createdAt),
    updatedAt: toIsoDate(vehicle.updatedAt)
  };
}

export function serializeOdometerUpdate(update: {
  _id: { toString(): string };
  userId: { toString(): string };
  vehicleId: { toString(): string };
  odometerKm: number;
  recordedAt: SerializableDate;
  createdAt?: SerializableDate;
}) {
  return {
    id: update._id.toString(),
    userId: update.userId.toString(),
    vehicleId: update.vehicleId.toString(),
    odometerKm: update.odometerKm,
    recordedAt: toIsoDate(update.recordedAt),
    createdAt: toIsoDate(update.createdAt)
  };
}

export function serializeFuelEntry(entry: {
  _id: { toString(): string };
  userId: { toString(): string };
  vehicleId: { toString(): string };
  odometerKm: number;
  unitPrice: number;
  fuelType: string;
  quantity: number;
  totalPrice: number;
  notes?: string | null;
  recordedAt: SerializableDate;
  createdAt?: SerializableDate;
}) {
  return {
    id: entry._id.toString(),
    userId: entry.userId.toString(),
    vehicleId: entry.vehicleId.toString(),
    odometerKm: entry.odometerKm,
    unitPrice: entry.unitPrice,
    fuelType: entry.fuelType,
    quantity: entry.quantity,
    totalPrice: entry.totalPrice,
    notes: entry.notes ?? null,
    recordedAt: toIsoDate(entry.recordedAt),
    createdAt: toIsoDate(entry.createdAt)
  };
}

export function serializeMaintenanceEntry(entry: {
  _id: { toString(): string };
  userId: { toString(): string };
  vehicleId: { toString(): string };
  maintenanceType: string;
  odometerKm: number;
  notes?: string | null;
  performedAt: SerializableDate;
  createdAt?: SerializableDate;
}) {
  return {
    id: entry._id.toString(),
    userId: entry.userId.toString(),
    vehicleId: entry.vehicleId.toString(),
    maintenanceType: entry.maintenanceType,
    odometerKm: entry.odometerKm,
    notes: entry.notes ?? null,
    performedAt: toIsoDate(entry.performedAt),
    createdAt: toIsoDate(entry.createdAt)
  };
}

export function serializeReminder(
  reminder: {
    _id: { toString(): string };
    userId: { toString(): string };
    vehicleId: { toString(): string };
    reminderText: string;
    currentOdometerKm: number;
    mileageIntervalKm?: number | null;
    remindAtOdometerKm?: number | null;
    monthInterval?: number | null;
    remindAtDate?: SerializableDate;
    status: string;
    createdAt?: SerializableDate;
    updatedAt?: SerializableDate;
  },
  vehicleCurrentOdometerKm: number
) {
  const dueState = computeReminderDueState(reminder, vehicleCurrentOdometerKm);

  return {
    id: reminder._id.toString(),
    userId: reminder.userId.toString(),
    vehicleId: reminder.vehicleId.toString(),
    reminderText: reminder.reminderText,
    currentOdometerKm: reminder.currentOdometerKm,
    mileageIntervalKm: reminder.mileageIntervalKm ?? null,
    remindAtOdometerKm: reminder.remindAtOdometerKm ?? null,
    monthInterval: reminder.monthInterval ?? null,
    remindAtDate: toIsoDate(reminder.remindAtDate),
    status: reminder.status,
    createdAt: toIsoDate(reminder.createdAt),
    updatedAt: toIsoDate(reminder.updatedAt),
    dueState
  };
}
