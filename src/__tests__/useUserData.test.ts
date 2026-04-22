import { act, renderHook } from '@testing-library/react';
import {
  db,
  docMock,
  emitDocSnapshot,
  emitSnapshotError,
  getSnapshotListenerCount,
  onSnapshotMock,
  resetFirebaseMocks,
} from '@/__tests__/mocks/firebase';

vi.mock('@/lib/firebase', () => ({
  db,
}));

vi.mock('firebase/firestore', () => ({
  doc: docMock,
  onSnapshot: onSnapshotMock,
}));

describe('useUserData', () => {
  beforeEach(() => {
    resetFirebaseMocks();
    vi.resetModules();
  });

  it('returns idle when no uid is provided', async () => {
    const { useUserData } = await import('@/hooks/useUserData');
    const { result } = renderHook(() => useUserData(null));

    expect(result.current).toEqual({
      status: 'idle',
      userDoc: null,
      error: null,
    });
  });

  it('subscribes to the user document and cleans up on unmount', async () => {
    const { useUserData } = await import('@/hooks/useUserData');
    const { result, unmount } = renderHook(() => useUserData('spartan-117'));

    expect(result.current.status).toBe('ready');
    expect(result.current.userDoc).toBeNull();
    expect(getSnapshotListenerCount('users/spartan-117')).toBe(1);

    await act(async () => {
      emitDocSnapshot('users/spartan-117', {
        displayName: 'Master Chief',
        email: 'chief@example.com',
        photoURL: '',
        createdAt: { __kind: 'serverTimestamp' },
        tracks: {
          cardio: { xp: 10, tour: 1 },
          legs: { xp: 0, tour: 1 },
          push: { xp: 0, tour: 1 },
          pull: { xp: 0, tour: 1 },
          core: { xp: 0, tour: 1 },
        },
      });
    });

    expect(result.current.status).toBe('ready');
    expect(result.current.userDoc?.displayName).toBe('Master Chief');

    unmount();
    expect(getSnapshotListenerCount('users/spartan-117')).toBe(0);
  });

  it('surfaces snapshot errors', async () => {
    const { useUserData } = await import('@/hooks/useUserData');
    const { result } = renderHook(() => useUserData('spartan-117'));

    await act(async () => {
      emitSnapshotError('users/spartan-117', new Error('listener failed'));
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toMatch(/listener failed/i);
  });
});
