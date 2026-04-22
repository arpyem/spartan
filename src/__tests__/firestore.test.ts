import {
  collectionMock,
  createMockUser,
  db,
  docMock,
  getCommittedBatches,
  getDocMock,
  getStoredDoc,
  incrementMock,
  resetFirebaseMocks,
  seedDoc,
  serverTimestampMock,
  setDocMock,
  writeBatchMock,
} from '@/__tests__/mocks/firebase';

vi.mock('@/lib/firebase', () => ({
  getFirebaseServices: () => ({
    db,
  }),
}));

vi.mock('firebase/firestore', () => ({
  collection: collectionMock,
  doc: docMock,
  getDoc: getDocMock,
  increment: incrementMock,
  serverTimestamp: serverTimestampMock,
  setDoc: setDocMock,
  writeBatch: writeBatchMock,
}));

describe('firestore helpers', () => {
  beforeEach(() => {
    resetFirebaseMocks();
    vi.resetModules();
  });

  it('creates the initial track map at Recruit Tour 1', async () => {
    const { createInitialTracks } = await import('@/lib/firestore');

    expect(createInitialTracks()).toEqual({
      cardio: { xp: 0, tour: 1 },
      legs: { xp: 0, tour: 1 },
      push: { xp: 0, tour: 1 },
      pull: { xp: 0, tour: 1 },
      core: { xp: 0, tour: 1 },
    });
  });

  it('creates a user document on first sign-in and stays idempotent afterwards', async () => {
    const { ensureUserDoc } = await import('@/lib/firestore');
    const user = createMockUser();

    await expect(ensureUserDoc(user)).resolves.toBe(true);

    const createdDoc = getStoredDoc(`users/${user.uid}`);
    expect(createdDoc?.data).toMatchObject({
      displayName: 'Master Chief',
      email: 'chief@example.com',
      photoURL: 'https://example.com/chief.png',
      tracks: {
        cardio: { xp: 0, tour: 1 },
        legs: { xp: 0, tour: 1 },
        push: { xp: 0, tour: 1 },
        pull: { xp: 0, tour: 1 },
        core: { xp: 0, tour: 1 },
      },
    });

    seedDoc(`users/${user.uid}`, {
      displayName: 'Existing Spartan',
      email: 'existing@example.com',
      photoURL: '',
      createdAt: { __kind: 'serverTimestamp' },
      tracks: {
        cardio: { xp: 25, tour: 1 },
        legs: { xp: 0, tour: 1 },
        push: { xp: 0, tour: 1 },
        pull: { xp: 0, tour: 1 },
        core: { xp: 0, tour: 1 },
      },
    });

    await expect(ensureUserDoc(user)).resolves.toBe(false);
    expect(getStoredDoc(`users/${user.uid}`)?.data.displayName).toBe('Existing Spartan');
  });

  it('logs a workout with a batched workout write and XP increment', async () => {
    const { logWorkout } = await import('@/lib/firestore');
    seedDoc('users/spartan-117', {
      displayName: 'Master Chief',
      email: 'chief@example.com',
      photoURL: 'https://example.com/chief.png',
      createdAt: { __kind: 'serverTimestamp' },
      tracks: {
        cardio: { xp: 90, tour: 1 },
      },
    });

    const result = await logWorkout({
      uid: 'spartan-117',
      track: 'cardio',
      value: 30,
      note: '  Tempo run  ',
      currentTrack: { xp: 90, tour: 1 },
      now: new Date(2026, 3, 3, 12, 0, 0, 0),
    });

    expect(result).toEqual({
      workoutId: 'mock-doc-1',
      xpEarned: 8,
      doubleXP: true,
      xpBefore: 90,
      xpAfter: 98,
      tourBefore: 1,
      tourAfter: 1,
      tourAdvanceAvailable: false,
    });

    const batches = getCommittedBatches();
    expect(batches).toHaveLength(1);
    expect(batches[0]).toHaveLength(2);
    expect(batches[0][0].type).toBe('set');
    expect(batches[0][1]).toMatchObject({
      type: 'update',
      ref: { path: 'users/spartan-117' },
      data: { 'tracks.cardio.xp': { __kind: 'increment', amount: 8 } },
    });

    expect(getStoredDoc('users/spartan-117/workouts/mock-doc-1')?.data).toEqual({
      track: 'cardio',
      value: 30,
      xpEarned: 8,
      doubleXP: true,
      note: 'Tempo run',
      timestamp: { __kind: 'serverTimestamp' },
    });
    expect(getStoredDoc('users/spartan-117')?.data).toMatchObject({
      tracks: {
        cardio: { xp: 98, tour: 1 },
      },
    });
  });

  it('advances a Tour atomically and enforces the Tour gates', async () => {
    const { advanceTour } = await import('@/lib/firestore');
    seedDoc('users/spartan-117', {
      tracks: {
        cardio: { xp: 2000, tour: 1 },
      },
    });

    await expect(
      advanceTour({
        uid: 'spartan-117',
        track: 'cardio',
        currentTrack: { xp: 2000, tour: 1 },
      }),
    ).resolves.toEqual({
      previousTour: 1,
      nextTour: 2,
      xpBefore: 2000,
      xpAfter: 0,
    });

    expect(getStoredDoc('users/spartan-117')?.data).toMatchObject({
      tracks: {
        cardio: { xp: 0, tour: 2 },
      },
    });

    await expect(
      advanceTour({
        uid: 'spartan-117',
        track: 'cardio',
        currentTrack: { xp: 1999, tour: 1 },
      }),
    ).rejects.toThrow(/threshold/i);

    await expect(
      advanceTour({
        uid: 'spartan-117',
        track: 'cardio',
        currentTrack: { xp: 2000, tour: 5 },
      }),
    ).rejects.toThrow(/maximum Tour/i);
  });
});
