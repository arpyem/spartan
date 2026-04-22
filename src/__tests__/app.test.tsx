import { act, render, screen } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { MemoryRouter } from 'react-router-dom';
import {
  emitAuthState,
  firebaseApp,
  googleProvider,
  auth,
  db,
  onAuthStateChangedMock,
  resetFirebaseMocks,
  setAuthBootstrapMode,
  setInitialAuthState,
} from '@/__tests__/mocks/firebase';

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
    onAuthStateChanged: onAuthStateChangedMock,
  };
});

vi.mock('virtual:pwa-register', () => ({
  registerSW: () => vi.fn(),
}));

describe('App foundation shell', () => {
  beforeEach(() => {
    resetFirebaseMocks();
    vi.resetModules();
  });

  it('renders the boot surface while auth state is unresolved', async () => {
    setAuthBootstrapMode('deferred');
    const { default: App } = await import('@/App');

    render(<App />);

    expect(screen.getByText(/Syncing service record/i)).toBeInTheDocument();
  });

  it('renders the signed-out placeholder when auth resolves with no user', async () => {
    setInitialAuthState(null);
    const { default: App } = await import('@/App');

    render(<App />);

    expect(screen.getByText(/Spartan ID Required/i)).toBeInTheDocument();
  });

  it('renders the routed shell when auth resolves with a user', async () => {
    setInitialAuthState({ uid: '117' } as User);
    const { default: App } = await import('@/App');

    render(<App />);

    expect(screen.getByText(/Global Rank Placeholder/i)).toBeInTheDocument();
    expect(screen.getByTestId('modal-host')).toBeInTheDocument();
  });

  it('updates when auth changes after mount', async () => {
    setAuthBootstrapMode('deferred');
    const { default: App } = await import('@/App');

    render(<App />);
    await act(async () => {
      emitAuthState({ uid: 'chief' } as User);
    });

    expect(await screen.findByText(/Global Rank Placeholder/i)).toBeInTheDocument();
  });
});

describe('AppRoutes', () => {
  it('renders the log route for a valid track', async () => {
    const { AppRoutes } = await import('@/router');

    render(
      <MemoryRouter
        initialEntries={['/log/cardio']}
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Cardio/i)).toBeInTheDocument();
    expect(screen.getByText(/Placeholder minutes logger/i)).toBeInTheDocument();
  });
});
