import { StatusBanner } from '@/components/StatusBanner';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function AuthScreen() {
  const { isOnline } = useNetworkStatus();
  const { busyAction, clearError, error, signInWithGoogle } = useAuthSession();
  const isSignInDisabled = busyAction === 'sign_in' || !isOnline;

  return (
    <div className="app-shell flex items-center justify-center px-4">
      <div className="mobile-frame flex items-center justify-center">
        <section className="service-frame w-full max-w-2xl p-8">
          <div className="service-strip">
            <span className="service-label">UNSC identity uplink</span>
            <span className="service-label">Service record access</span>
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-[1.2fr,0.8fr] md:items-end">
            <div>
              <p className="service-label">Authentication gate</p>
              <h1 className="font-display mt-3 text-4xl uppercase tracking-[0.08em] text-white">
                Spartan ID Required
              </h1>
              <p className="mt-4 text-sm leading-7 text-[var(--color-text-muted)]">
                Sign in with your Google account to restore the service record, live
                progression feeds, and Tour shield history across devices.
              </p>
              {!isOnline ? (
                <div className="mt-6">
                  <StatusBanner
                    tone="warning"
                    title="Offline"
                    body="A network connection is required before Google sign-in can begin."
                  />
                </div>
              ) : null}
              {error ? (
                <div
                  role="alert"
                  className="service-frame mt-6 border-red-500/35 bg-[linear-gradient(180deg,rgba(76,15,15,0.46),rgba(21,8,8,0.42))] px-4 py-3 text-sm text-red-100"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span>{error}</span>
                    <button
                      type="button"
                      onClick={clearError}
                      className="focus-shell service-button-ghost rounded-none px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em]"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="service-art-panel min-h-[13rem]">
              <div className="absolute inset-x-5 bottom-5 border border-[rgba(221,232,255,0.18)] bg-[rgba(3,8,15,0.62)] px-4 py-3 backdrop-blur-sm">
                <p className="service-label">Deployment note</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  Redirect flow remains the stable path for the PWA and narrow-screen
                  mobile install.
                </p>
              </div>
            </div>
          </div>
          <div className="service-rule mt-8 pt-6">
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              disabled={isSignInDisabled}
              className="focus-shell service-button-amber w-full rounded-none px-4 py-3 font-display text-sm font-semibold uppercase tracking-[0.24em]"
            >
              {busyAction === 'sign_in' ? 'Redirecting...' : 'Sign In With Google'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
