import { calculateXP, getBaseXP, getDoubleXPStatus, isDoubleXPWeekend } from '@/lib/xp';

function localNoon(year: number, month: number, day: number) {
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

describe('getBaseXP', () => {
  it('returns the correct cardio brackets at exact boundaries', () => {
    expect(getBaseXP('cardio', 10)).toBe(1);
    expect(getBaseXP('cardio', 20)).toBe(2);
    expect(getBaseXP('cardio', 30)).toBe(4);
    expect(getBaseXP('cardio', 45)).toBe(5);
    expect(getBaseXP('cardio', 60)).toBe(8);
    expect(getBaseXP('cardio', 90)).toBe(12);
    expect(getBaseXP('cardio', 120)).toBe(16);
  });

  it('returns the correct lifting brackets at exact boundaries', () => {
    expect(getBaseXP('push', 1)).toBe(1);
    expect(getBaseXP('push', 5)).toBe(2);
    expect(getBaseXP('push', 9)).toBe(3);
    expect(getBaseXP('push', 13)).toBe(4);
    expect(getBaseXP('push', 17)).toBe(5);
    expect(getBaseXP('push', 21)).toBe(6);
    expect(getBaseXP('push', 25)).toBe(8);
  });

  it('throws for zero, negative, and non-integer values', () => {
    expect(() => getBaseXP('cardio', 0)).toThrow(RangeError);
    expect(() => getBaseXP('legs', -2)).toThrow(RangeError);
    expect(() => getBaseXP('core', 2.5)).toThrow(RangeError);
  });
});

describe('isDoubleXPWeekend', () => {
  it('returns true on known Double XP Friday, Saturday, and Sunday fixtures', () => {
    expect(isDoubleXPWeekend(localNoon(2026, 4, 3))).toBe(true);
    expect(isDoubleXPWeekend(localNoon(2026, 4, 4))).toBe(true);
    expect(isDoubleXPWeekend(localNoon(2026, 4, 5))).toBe(true);
  });

  it('returns false on a known non-eligible weekend and weekday', () => {
    expect(isDoubleXPWeekend(localNoon(2026, 4, 18))).toBe(false);
    expect(isDoubleXPWeekend(localNoon(2026, 4, 1))).toBe(false);
  });
});

describe('getDoubleXPStatus', () => {
  it('reports upcoming on the Thursday before an active Double XP weekend', () => {
    expect(getDoubleXPStatus(localNoon(2026, 4, 2))).toEqual({
      active: false,
      upcoming: true,
    });
  });

  it('reports active during the Double XP weekend', () => {
    expect(getDoubleXPStatus(localNoon(2026, 4, 4))).toEqual({
      active: true,
      upcoming: false,
    });
  });
});

describe('calculateXP', () => {
  it('doubles XP during a Double XP weekend', () => {
    expect(calculateXP('cardio', 30, localNoon(2026, 4, 3))).toBe(8);
  });

  it('does not double XP on a normal day', () => {
    expect(calculateXP('cardio', 30, localNoon(2026, 4, 18))).toBe(4);
  });

  it('throws for invalid workout values', () => {
    expect(() => calculateXP('pull', 0, localNoon(2026, 4, 3))).toThrow(RangeError);
  });
});
