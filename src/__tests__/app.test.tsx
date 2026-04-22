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
  serverTimestampMock,
  setAuthBootstrapMode,
  setInitialAuthState,
  setDocMock,
  signInWithRedirectMock,
  signOutMock,
  updateDocMock,
  writeBatchMock,
} from '@/__tests__/mocks/firebase';
import type { DoubleXPStatus } from '@/lib/types';

let currentDoubleXpStatus: DoubleXPStatus = { active: false, upcoming: false };

vi.mock('@/lib/firebase', () => ({
  firebaseApp,
  auth,
  db,
  googleProvider,
}));

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual<typeof import('firebase/auth')>(
    'firebase/auth',
  );

  return {
    ...actual,
    getRedirectResult: getRedirectResultMock,
    onAuthStateChanged: onAuthStateChangedMock,
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
    window.history.pushState({}, '', '/');
  });

  it('renders the boot surface while auth state is unresolved', async () => {
    setAuthBootstrapMode('deferred');
    const { default: App } = await import('@/App');

    render(<App />);

    expect(screen.getByText(/Syncing service record/i)).toBeInTheDocument();
  });

  it('renders the auth surface and starts Google redirect sign-in', async () => {
    setInitialAuthState(null);
    const { default: App } = await import('@/App');
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByText(/Spartan ID Required/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Sign In With Google/i }));

    expect(getAuthActionCalls().signInWithRedirect).toBe(1);
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

    expect(await screen.findByText(/Field Deck/i)).toBeInTheDocument();
    expect(screen.getByText(/Double XP Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Cardio/i)).toBeInTheDocument();
    expect(screen.getByText(/Legs/i)).toBeInTheDocument();
    expect(screen.getByText(/Push/i)).toBeInTheDocument();
    expect(screen.getByText(/Pull/i)).toBeInTheDocument();
    expect(screen.getByText(/Core/i)).toBeInTheDocument();
    expect(screen.getByText(/Tour advancement available/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Open service record/i }));
    expect(await screen.findByText(/Spartan Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Total workouts/i)).toBeInTheDocument();
    expect(screen.getByText(/^2$/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Sign Out$/i }));
    await waitFor(() => {
      expect(screen.getByText(/Spartan ID Required/i)).toBeInTheDocument();
    });
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

    expect(await screen.findByText(/Field Deck/i)).toBeInTheDocument();
  });

  it('updates the log preview live and shows a rank-up modal after submit', async () => {
    const userModel = seedSignedInState(createMockUser(), {
      cardio: { xp: 1, tour: 1 },
    });
    seedCollection(`users/${userModel.uid}/workouts`, []);
    window.history.pushState({}, '', '/log/cardio');
    const { default: App } = await import('@/App');
    const user = userEvent.setup();

    render(<App />);

    expect(await screen.findByText(/^Cardio$/i)).toBeInTheDocument();
    const valueInput = screen.getByLabelText(/Enter minutes/i);
    await user.type(valueInput, '10');

    expect(screen.getByText(/^1 EXP$/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Log It/i }));

    expect(await screen.findByText(/Rank Up/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Apprentice$/i })).toBeInTheDocument();
    expect(getCommittedBatches()).toHaveLength(1);
  });

  it('surfaces Tour advancement and applies the atomic Tour reset on confirm', async () => {
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
  });
});
