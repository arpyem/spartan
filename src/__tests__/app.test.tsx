import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { User } from 'firebase/auth';
import {
  auth,
  collectionMock,
  createMockUser,
  db,
  docMock,
  emitAuthState,
  emitDocSnapshot,
  emitSnapshotError,
  firebaseApp,
  getAuthActionCalls,
  getCommittedBatches,
  getDocMock,
  getRedirectResultMock,
  getStoredDoc,
  googleProvider,
  incrementMock,
  onAuthStateChangedMock,
  onSnapshotMock,
  resetFirebaseMocks,
  seedCollection,
  seedDoc,
  setBatchCommitError,
  serverTimestampMock,
  setAuthActionError,
  setAuthBootstrapMode,
  setInitialAuthState,
  setSetDocError,
  setDocMock,
  signInWithPopupMock,
  signInWithRedirectMock,
  signOutMock,
  updateDocMock,
  writeBatchMock,
} from '@/__tests__/mocks/firebase';
import type { DoubleXPStatus } from '@/lib/types';

let currentDoubleXpStatus: DoubleXPStatus = { active: false, upcoming: false };

function setOnlineState(isOnline: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value: isOnline,
  });
}

function getDevLogEvents() {
  return window.__SPARTAN_DEV_LOGS__?.get().map((entry) => entry.event) ?? [];
}

vi.mock('@/lib/firebase', () => ({
  firebaseApp,
  auth,
  db,
  googleProvider,
  getFirebaseServices: () => ({
    firebaseApp,
    auth,
    db,
    googleProvider,
  }),
}));

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual<typeof import('firebase/auth')>(
    'firebase/auth',
  );

  return {
    ...actual,
    getRedirectResult: getRedirectResultMock,
    onAuthStateChanged: onAuthStateChangedMock,
    signInWithPopup: signInWithPopupMock,
    signInWithRedirect: signInWithRedirectMock,
    signOut: signOutMock,
  };
});

vi.mock('firebase/firestore', () => ({
  collection: collectionMock,
  doc: docMock,
  getDoc: getDocMock,
  increment: incrementMock,
  onSnapshot: onSnapshotMock,
  serverTimestamp: serverTimestampMock,
  setDoc: setDocMock,
  updateDoc: updateDocMock,
  writeBatch: writeBatchMock,
}));

vi.mock('@/lib/xp', async () => {
  const actual = await vi.importActual<typeof import('@/lib/xp')>('@/lib/xp');

  return {
    ...actual,
    calculateXP: (track: Parameters<typeof actual.calculateXP>[0], value: number) =>
      actual.getBaseXP(track, value),
    isDoubleXPWeekend: () => false,
  };
});

vi.mock('@/hooks/useDoubleXP', () => ({
  useDoubleXP: () => currentDoubleXpStatus,
}));

vi.mock('virtual:pwa-register', () => ({
  registerSW: () => vi.fn(),
}));

function seedSignedInState(
  user: User = createMockUser(),
  trackOverrides: Partial<Record<'cardio' | 'legs' | 'push' | 'pull' | 'core', { xp: number; tour: 1 | 2 | 3 | 4 | 5 }>> = {},
) {
  setInitialAuthState(user);
  seedDoc(`users/${user.uid}`, {
    displayName: user.displayName ?? '',
    email: user.email ?? '',
    photoURL: user.photoURL ?? '',
    createdAt: new Date('2026-04-01T00:00:00.000Z'),
    tracks: {
      cardio: { xp: 0, tour: 1 },
      legs: { xp: 0, tour: 1 },
      push: { xp: 0, tour: 1 },
      pull: { xp: 0, tour: 1 },
      core: { xp: 0, tour: 1 },
      ...trackOverrides,
    },
  });

  return user;
}

describe('Plan 03 app flow', () => {
  beforeEach(() => {
    resetFirebaseMocks();
    vi.resetModules();
    vi.useRealTimers();
    currentDoubleXpStatus = { active: false, upcoming: false };
    setOnlineState(true);
    window.history.pushState({}, '', '/');
    window.__SPARTAN_DEV_LOGS__?.clear();
  });

  it('renders the boot surface while auth state is unresolved', async () => {
    setAuthBootstrapMode('deferred');
    const { default: App } = await import('@/App');

    render(<App />);

    expect(screen.getByText(/Syncing service record/i)).toBeInTheDocument();
  });

  it('renders the auth surface and starts Google popup sign-in in dev', async () => {
    setInitialAuthState(null);
    const { default: App } = await import('@/App');
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByText(/Spartan ID Required/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Sign In With Google/i }));

    expect(getAuthActionCalls().signInWithPopup).toBe(1);
  });

  it('disables Google sign-in while offline', async () => {
    setInitialAuthState(null);
    setOnlineState(false);
    const { default: App } = await import('@/App');

    render(<App />);

    expect(screen.getByText(/network connection is required/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In With Google/i })).toBeDisabled();
  });

  it('surfaces redirect bootstrap failures on the auth screen', async () => {
    setInitialAuthState(null);
    setAuthActionError('redirect_result', new Error('redirect failed'));
    const { default: App } = await import('@/App');
    const user = userEvent.setup();

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/redirect failed/i);
    await user.click(screen.getByRole('button', { name: /Dismiss/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('surfaces sign-in failures without leaving the auth screen', async () => {
    setInitialAuthState(null);
    setAuthActionError('sign_in', new Error('popup blocked'));
    const { default: App } = await import('@/App');
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /Sign In With Google/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/popup blocked/i);
    expect(screen.getByText(/Spartan ID Required/i)).toBeInTheDocument();
  });

  it('shows actionable retry UI when signed-in profile bootstrap fails', async () => {
    const userModel = createMockUser({ uid: 'bootstrap-fail-ui' });
    setInitialAuthState(userModel);
    seedCollection(`users/${userModel.uid}/workouts`, []);
    setSetDocError(new Error('Profile bootstrap failed.'));
    const { default: App } = await import('@/App');

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: /Unable to prepare your Spartan profile/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Profile bootstrap failed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry Profile Sync/i })).toBeInTheDocument();
  });

  it('recovers profile bootstrap in-session after retrying a failed first write', async () => {
    const userModel = createMockUser({ uid: 'bootstrap-retry' });
    setInitialAuthState(userModel);
    seedCollection(`users/${userModel.uid}/workouts`, []);
    setSetDocError(new Error('Profile bootstrap failed.'));
    const { default: App } = await import('@/App');
    const user = userEvent.setup();

    render(<App />);

    const retryButton = await screen.findByRole('button', { name: /Retry Profile Sync/i });
    setSetDocError(null);
    await user.click(retryButton);

    expect(
      await screen.findByRole('heading', { name: /Service Record/i }, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(getStoredDoc(`users/${userModel.uid}`)?.exists).toBe(true);
  });

  it('renders the live home screen, opens the info modal, and signs out', async () => {
    currentDoubleXpStatus = { active: true, upcoming: false };
    const userModel = seedSignedInState(createMockUser(), {
      cardio: { xp: 45, tour: 1 },
      legs: { xp: 2000, tour: 1 },
      push: { xp: 120, tour: 2 },
      pull: { xp: 500, tour: 1 },
      core: { xp: 30, tour: 1 },
    });
    seedCollection(`users/${userModel.uid}/workouts`, [
      { __id: 'w1', track: 'cardio', value: 30, xpEarned: 4, doubleXP: false, note: '', timestamp: new Date('2026-04-01T12:00:00.000Z') },
      { __id: 'w2', track: 'legs', value: 10, xpEarned: 2, doubleXP: false, note: '', timestamp: new Date('2026-04-02T12:00:00.000Z') },
    ]);
    const { default: App } = await import('@/App');
    const user = userEvent.setup();

    render(<App />);

    expect(
      await screen.findByRole('button', { name: /Open service record/i }, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Double XP Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Cardio/i)).toBeInTheDocument();
    expect(screen.getByText(/Legs/i)).toBeInTheDocument();
    expect(screen.getByText(/Push/i)).toBeInTheDocument();
    expect(screen.getByText(/Pull/i)).toBeInTheDocument();
    expect(screen.getByText(/Core/i)).toBeInTheDocument();
    expect(screen.queryByText(/EXP to next rank/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Tour advancement available/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Service Tour/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Log workout$/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Open global rank info/i }));
    expect(await screen.findByRole('dialog', { name: /Global rank info/i })).toBeInTheDocument();
    expect(screen.getByText(/Global rank is the floor average of the five Spartan track/i)).toBeInTheDocument();
    expect(screen.getByText(/Tap any track tile to log one session/i)).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Global rank info/i })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Open service record/i }));
    expect(await screen.findByRole('dialog', { name: /Service Record/i })).toBeInTheDocument();
    expect(screen.getByText(/Total workouts/i)).toBeInTheDocument();
    expect(screen.getByText(/^2$/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Sign Out$/i }));
    await waitFor(() => {
      expect(screen.getByText(/Spartan ID Required/i)).toBeInTheDocument();
    });
  });

  it('surfaces sign-out failures inside the service record modal', async () => {
    const userModel = seedSignedInState();
    seedCollection(`users/${userModel.uid}/workouts`, []);
    setAuthActionError('sign_out', new Error('sign-out failed'));
    const { default: App } = await import('@/App');
    const user = userEvent.setup();

    render(<App />);

    await user.click(await screen.findByRole('button', { name: /Open service record/i }));
    await user.click(screen.getByRole('button', { name: /^Sign Out$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/sign-out failed/i);
    expect(screen.getByRole('dialog', { name: /Service Record/i })).toBeInTheDocument();
  });

  it('updates the app when auth becomes available after mount', async () => {
    setAuthBootstrapMode('deferred');
    const { default: App } = await import('@/App');

    render(<App />);

    await act(async () => {
      const user = createMockUser({ uid: 'chief' });
      seedDoc('users/chief', {
        displayName: 'Master Chief',
        email: 'chief@example.com',
        photoURL: '',
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        tracks: {
          cardio: { xp: 0, tour: 1 },
          legs: { xp: 0, tour: 1 },
          push: { xp: 0, tour: 1 },
          pull: { xp: 0, tour: 1 },
          core: { xp: 0, tour: 1 },
        },
      });
      emitAuthState(user);
    });

    expect(await screen.findByRole('heading', { name: /Service Record/i })).toBeInTheDocument();
  });

  it('updates the home screen when realtime user data changes after mount', async () => {
    const userModel = seedSignedInState(createMockUser({ uid: 'chief' }), {
      cardio: { xp: 0, tour: 1 },
    });
    seedCollection(`users/${userModel.uid}/workouts`, []);
    const { default: App } = await import('@/App');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /Service Record/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cardio/i })).toHaveAttribute('data-selected', 'false');

    await act(async () => {
      emitDocSnapshot(`users/${userModel.uid}`, {
        displayName: 'Master Chief',
        email: 'chief@example.com',
        photoURL: '',
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        tracks: {
          cardio: { xp: 2000, tour: 1 },
          legs: { xp: 0, tour: 1 },
          push: { xp: 0, tour: 1 },
          pull: { xp: 0, tour: 1 },
          core: { xp: 0, tour: 1 },
        },
      });
    });

    expect(screen.getByRole('button', { name: /Cardio/i })).toHaveAttribute('data-selected', 'true');
  });

  it('keeps the home screen visible and shows a sync warning after a later snapshot failure', async () => {
    const userModel = seedSignedInState();
    seedCollection(`users/${userModel.uid}/workouts`, []);
    const { default: App } = await import('@/App');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /Service Record/i })).toBeInTheDocument();

    await act(async () => {
      emitSnapshotError(`users/${userModel.uid}`, new Error('listener failed'));
    });

    expect(screen.getByRole('heading', { name: /Service Record/i })).toBeInTheDocument();
    expect(screen.getByText(/Live sync paused/i)).toBeInTheDocument();
  });

  it('reacts to browser offline events on signed-in surfaces', async () => {
    const userModel = seedSignedInState();
    seedCollection(`users/${userModel.uid}/workouts`, []);
    const { default: App } = await import('@/App');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /Service Record/i })).toBeInTheDocument();

    await act(async () => {
      setOnlineState(false);
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByText(/^Offline$/i)).toBeInTheDocument();
    expect(
      screen.getByText(/showing your last synced Spartan record/i),
    ).toBeInTheDocument();
  });

  it('shows a rank-up modal after submit and returns home when the ceremony is dismissed', async () => {
    const userModel = seedSignedInState(createMockUser(), {
      cardio: { xp: 1, tour: 1 },
    });
    seedCollection(`users/${userModel.uid}/workouts`, []);
    window.history.pushState({}, '', '/log/cardio');
    const { default: App } = await import('@/App');
    const user = userEvent.setup();

    render(<App />);

    expect(await screen.findByText(/^Cardio$/i)).toBeInTheDocument();
    expect(screen.queryByText(/Training track/i)).not.toBeInTheDocument();
    expect(screen.getByText(/^Recruit$/i)).toBeInTheDocument();
    expect(screen.getByText('1 EXP')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    const valueInput = screen.getByLabelText(/Enter minutes/i);
    await user.type(valueInput, '10');

    await user.click(screen.getByRole('button', { name: /Log It/i }));

    expect(screen.getByRole('heading', { name: /^Apprentice$/i })).toBeInTheDocument();
    expect(screen.getByText(/Cardio advanced from Recruit/i)).toBeInTheDocument();
    expect(getCommittedBatches()).toHaveLength(1);
    await user.click(screen.getByRole('heading', { name: /^Apprentice$/i }));
    expect(await screen.findByRole('heading', { name: /Service Record/i })).toBeInTheDocument();
  });

  it('stores workout notes from the free-text field on submit', async () => {
    const userModel = seedSignedInState(createMockUser(), {
      cardio: { xp: 1, tour: 1 },
    });
    seedCollection(`users/${userModel.uid}/workouts`, []);
    window.history.pushState({}, '', '/log/cardio');
    const { default: App } = await import('@/App');
    const user = userEvent.setup();

    render(<App />);

    await user.type(await screen.findByLabelText(/Enter minutes/i), '10');
    const noteInput = screen.getByLabelText(/Workout notes/i);
    expect(screen.queryByText(/Optional subtrack/i)).not.toBeInTheDocument();
    await user.type(noteInput, 'Felt sharp on intervals');
    await user.click(screen.getByRole('button', { name: /Log It/i }));

    const workoutWrite = getCommittedBatches()[0]?.find((operation) => operation.type === 'set');
    expect(workoutWrite?.data).toMatchObject({
      note: 'Felt sharp on intervals',
    });
  });

  it('keeps the typed workout input and surfaces an inline alert when the write fails', async () => {
    const userModel = seedSignedInState(createMockUser(), {
      cardio: { xp: 1, tour: 1 },
    });
    seedCollection(`users/${userModel.uid}/workouts`, []);
    window.history.pushState({}, '', '/log/cardio');
    setBatchCommitError(new Error('Workout write failed.'));
    const { default: App } = await import('@/App');
    const user = userEvent.setup();

    render(<App />);

    const valueInput = await screen.findByLabelText(/Enter minutes/i);
    await user.type(valueInput, '10');
    await user.click(screen.getByRole('button', { name: /Log It/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Workout write failed/i);
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.queryByText(/Cardio advanced from Recruit/i)).not.toBeInTheDocument();
  });

  it('disables workout logging while offline and updates when connectivity returns', async () => {
    const userModel = seedSignedInState(createMockUser(), {
      cardio: { xp: 1, tour: 1 },
    });
    seedCollection(`users/${userModel.uid}/workouts`, []);
    window.history.pushState({}, '', '/log/cardio');
    setOnlineState(false);
    const { default: App } = await import('@/App');
    const user = userEvent.setup();

    render(<App />);

    expect(await screen.findByText(/^Offline$/i)).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /Log It/i });
    expect(button).toBeDisabled();
    expect(screen.getByText(/Workout logging is disabled while the device is offline/i)).toBeInTheDocument();

    await act(async () => {
      setOnlineState(true);
      window.dispatchEvent(new Event('online'));
    });

    await user.type(screen.getByLabelText(/Enter minutes/i), '10');
    expect(screen.getByRole('button', { name: /Log It/i })).toBeEnabled();
  });

  it('surfaces Tour advancement, confirms it, and then plays the ceremony', async () => {
    const userModel = seedSignedInState(createMockUser(), {
      cardio: { xp: 1999, tour: 1 },
    });
    seedCollection(`users/${userModel.uid}/workouts`, []);
    window.history.pushState({}, '', '/log/cardio');
    const { default: App } = await import('@/App');
    const user = userEvent.setup();

    render(<App />);

    await user.type(await screen.findByLabelText(/Enter minutes/i), '10');
    await user.click(screen.getByRole('button', { name: /Log It/i }));

    expect(await screen.findByText(/Advance Cardio/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Advance Tour/i }));

    await waitFor(() => {
      expect(getStoredDoc(`users/${userModel.uid}`)?.data).toMatchObject({
        tracks: {
          cardio: { xp: 0, tour: 2 },
        },
      });
    });

    expect(await screen.findByText(/Tour Advanced/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Tour 2$/i })).toBeInTheDocument();
    expect(screen.getByText(/Cardio reset to Recruit/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/Tap anywhere to continue/i, {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    await user.click(screen.getByText(/Tour Advanced/i));
    expect(await screen.findByRole('heading', { name: /Service Record/i })).toBeInTheDocument();
  });

  it('keeps the Tour confirmation prompt open when the advancement write fails', async () => {
    const userModel = seedSignedInState(createMockUser(), {
      cardio: { xp: 1999, tour: 1 },
    });
    seedCollection(`users/${userModel.uid}/workouts`, []);
    window.history.pushState({}, '', '/log/cardio');
    const { default: App } = await import('@/App');
    const user = userEvent.setup();

    render(<App />);

    await user.type(await screen.findByLabelText(/Enter minutes/i), '10');
    await user.click(screen.getByRole('button', { name: /Log It/i }));

    expect(await screen.findByText(/Advance Cardio/i)).toBeInTheDocument();
    setBatchCommitError(new Error('Tour write failed.'));
    await user.click(screen.getByRole('button', { name: /Advance Tour/i }));

    expect(await screen.findByText(/Tour write failed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Advance Tour/i })).toBeInTheDocument();
    expect(screen.queryByText(/Tour Advanced/i)).not.toBeInTheDocument();
  });

  it('returns home when Tour advancement is deferred', async () => {
    const userModel = seedSignedInState(createMockUser(), {
      cardio: { xp: 1999, tour: 1 },
    });
    seedCollection(`users/${userModel.uid}/workouts`, []);
    window.history.pushState({}, '', '/log/cardio');
    const { default: App } = await import('@/App');
    const user = userEvent.setup();

    render(<App />);

    await user.type(await screen.findByLabelText(/Enter minutes/i), '10');
    await user.click(screen.getByRole('button', { name: /Log It/i }));

    expect(await screen.findByText(/Advance Cardio/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Later/i }));

    expect(await screen.findByRole('heading', { name: /Service Record/i })).toBeInTheDocument();
  });

  it('records auth and bootstrap lifecycle events in the dev log buffer', async () => {
    const userModel = seedSignedInState(createMockUser({ uid: 'log-auth-user' }));
    seedCollection(`users/${userModel.uid}/workouts`, []);
    const { default: App } = await import('@/App');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /Service Record/i })).toBeInTheDocument();

    expect(getDevLogEvents()).toEqual(
      expect.arrayContaining([
        'redirect_result_started',
        'auth_state_changed',
        'bootstrap_started',
        'bootstrap_succeeded',
      ]),
    );
  });

  it('records offline transitions in the dev log buffer', async () => {
    const userModel = seedSignedInState();
    seedCollection(`users/${userModel.uid}/workouts`, []);
    const { default: App } = await import('@/App');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /Service Record/i })).toBeInTheDocument();

    await act(async () => {
      setOnlineState(false);
      window.dispatchEvent(new Event('offline'));
    });

    expect(getDevLogEvents()).toContain('network_status_changed');
  });

  it('records write and modal events for rank-up and Tour flows', async () => {
    const userModel = seedSignedInState(createMockUser(), {
      cardio: { xp: 1999, tour: 1 },
    });
    seedCollection(`users/${userModel.uid}/workouts`, []);
    window.history.pushState({}, '', '/log/cardio');
    const { default: App } = await import('@/App');
    const user = userEvent.setup();

    render(<App />);

    await user.type(await screen.findByLabelText(/Enter minutes/i), '10');
    await user.click(screen.getByRole('button', { name: /Log It/i }));

    expect(await screen.findByText(/Advance Cardio/i)).toBeInTheDocument();
    expect(getDevLogEvents()).toEqual(
      expect.arrayContaining([
        'log_workout_started',
        'log_workout_succeeded',
        'rank_up_detected',
        'rank_up_modal_opened',
        'tour_advance_available_detected',
        'tour_prompt_opened',
      ]),
    );

    await user.click(screen.getByRole('button', { name: /Advance Tour/i }));

    expect(await screen.findByText(/Tour Advanced/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/Tap anywhere to continue/i, {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    await user.click(screen.getByText(/Tour Advanced/i));
    expect(await screen.findByRole('heading', { name: /Service Record/i })).toBeInTheDocument();
    expect(getDevLogEvents()).toEqual(
      expect.arrayContaining([
        'tour_prompt_confirmed',
        'tour_advance_started',
        'tour_advance_succeeded',
        'tour_modal_opened',
        'tour_modal_closed',
        'post_log_return_home_started',
      ]),
    );
  });
});
