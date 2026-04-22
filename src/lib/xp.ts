import type { DoubleXPStatus, TrackKey } from '@/lib/types';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

function assertValidWorkoutValue(value: number) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError('Workout values must be positive integers.');
  }
}

export function getBaseXP(track: TrackKey, value: number): number {
  assertValidWorkoutValue(value);

  if (track === 'cardio') {
    if (value < 20) return 1;
    if (value < 30) return 2;
    if (value < 45) return 4;
    if (value < 60) return 5;
    if (value < 90) return 8;
    if (value < 120) return 12;
    return 16;
  }

  if (value < 5) return 1;
  if (value < 9) return 2;
  if (value < 13) return 3;
  if (value < 17) return 4;
  if (value < 21) return 5;
  if (value < 25) return 6;
  return 8;
}

export function isDoubleXPWeekend(date: Date = new Date()): boolean {
  const weekNumber = Math.floor(date.getTime() / WEEK_MS);
  const day = date.getDay();
  const isWeekend = day === 5 || day === 6 || day === 0;

  return weekNumber % 5 === 0 && isWeekend;
}

export function getDoubleXPStatus(date: Date = new Date()): DoubleXPStatus {
  const active = isDoubleXPWeekend(date);
  const tomorrow = new Date(date.getTime() + DAY_MS);
  const upcoming = !active && date.getDay() === 4 && isDoubleXPWeekend(tomorrow);

  return { active, upcoming };
}

export function calculateXP(
  track: TrackKey,
  value: number,
  date: Date = new Date(),
): number {
  const baseXp = getBaseXP(track, value);

  return isDoubleXPWeekend(date) ? baseXp * 2 : baseXp;
}
