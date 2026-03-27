import { computeReminderDueState } from '@/lib/reminders';

describe('reminder helpers', () => {
  it('marks reminders as due when the reminder date has passed', () => {
    const dueState = computeReminderDueState(
      {
        remindAtDate: '2000-01-01T00:00:00.000Z'
      },
      1000,
      new Date('2026-03-27T00:00:00.000Z')
    );

    expect(dueState).toEqual({
      dueByMileage: false,
      dueByDate: true,
      isDue: true
    });
  });
});
