type ReminderLike = {
  remindAtOdometerKm?: number | null;
  remindAtDate?: Date | string | null;
};

export function computeReminderDueState(
  reminder: ReminderLike,
  currentOdometerKm: number,
  now = new Date()
) {
  const dueByMileage =
    typeof reminder.remindAtOdometerKm === 'number' && currentOdometerKm >= reminder.remindAtOdometerKm;
  const dueByDate =
    reminder.remindAtDate != null && new Date(reminder.remindAtDate).getTime() <= now.getTime();

  return {
    dueByMileage,
    dueByDate,
    isDue: dueByMileage || dueByDate
  };
}

export function addMonths(baseDate: Date, months: number) {
  const nextDate = new Date(baseDate);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}
