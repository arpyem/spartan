import { act, renderHook } from '@testing-library/react';
import {
  collectionMock,
  db,
  docMock,
  emitCollectionSnapshot,
  emitSnapshotError,
  getSnapshotListenerCount,
  onSnapshotMock,
  resetFirebaseMocks,
} from '@/__tests__/mocks/firebase';

vi.mock('@/lib/firebase', () => ({
  getFirebaseServices: () => ({
    db,
  }),
}));

vi.mock('firebase/firestore', () => ({
  collection: collectionMock,
  doc: docMock,
  onSnapshot: onSnapshotMock,
}));

describe('useWorkoutStats', () => {
  beforeEach(() => {
    resetFirebaseMocks();
    vi.resetModules();
  });

  it('returns idle when no uid is provided', async () => {
    const { useWorkoutStats } = await import('@/hooks/useWorkoutStats');
    const { result } = renderHook(() => useWorkoutStats(null));

    expect(result.current.status).toBe('idle');
    expect(result.current.stats.totalWorkouts).toBe(0);
  });

  it('aggregates workout history and cleans up the listener on unmount', async () => {
    const { useWorkoutStats } = await import('@/hooks/useWorkoutStats');
    const { result, unmount } = renderHook(() => useWorkoutStats('spartan-117'));

    expect(result.current.status).toBe('ready');
    expect(getSnapshotListenerCount('users/spartan-117/workouts')).toBe(1);

    await act(async () => {
      emitCollectionSnapshot('users/spartan-117/workouts', [
        { __id: 'w1', track: 'cardio', value: 30, xpEarned: 4, doubleXP: false, note: '', timestamp: new Date('2026-04-01T12:00:00.000Z') },
        { __id: 'w2', track: 'push', value: 12, xpEarned: 3, doubleXP: false, note: '', timestamp: new Date('2026-04-02T12:00:00.000Z') },
      ]);
    });

    expect(result.current.stats.totalWorkouts).toBe(2);
    expect(result.current.stats.totalXp).toBe(7);
    expect(result.current.stats.byTrack.cardio.totalValue).toBe(30);
    expect(result.current.stats.byTrack.push.workouts).toBe(1);

    unmount();
    expect(getSnapshotListenerCount('users/spartan-117/workouts')).toBe(0);
  });

  it('surfaces snapshot errors', async () => {
    const { useWorkoutStats } = await import('@/hooks/useWorkoutStats');
    const { result } = renderHook(() => useWorkoutStats('spartan-117'));

    await act(async () => {
      emitSnapshotError('users/spartan-117/workouts', new Error('history failed'));
    });

    expect(result.current.status).toBe('ready');
    expect(result.current.stats.totalWorkouts).toBe(0);
    expect(result.current.error?.message).toMatch(/history failed/i);
  });

  it('keeps the last aggregated stats when a later snapshot fails', async () => {
    const { useWorkoutStats } = await import('@/hooks/useWorkoutStats');
    const { result } = renderHook(() => useWorkoutStats('spartan-117'));

    await act(async () => {
      emitCollectionSnapshot('users/spartan-117/workouts', [
        { __id: 'w1', track: 'cardio', value: 30, xpEarned: 4, doubleXP: false, note: '', timestamp: new Date('2026-04-01T12:00:00.000Z') },
      ]);
      emitSnapshotError('users/spartan-117/workouts', new Error('history failed'));
    });

    expect(result.current.status).toBe('ready');
    expect(result.current.stats.totalWorkouts).toBe(1);
    expect(result.current.error?.message).toMatch(/history failed/i);
  });
});
