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
        <section className="panel w-full max-w-sm p-8">
          <p className="hud-kicker font-hud text-xs">UNSC identity uplink</p>
          <h1 className="font-display mt-4 text-3xl font-bold tracking-[0.12em] text-white">
            Spartan ID Required
          </h1>
          <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
            Sign in with your Google account to sync your service record, live track
            progress, and Tour unlocks across devices.
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
              className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100"
            >
              <div className="flex items-start justify-between gap-4">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={clearError}
                  className="focus-shell rounded-full border border-white/10 px-2 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-white/80"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            disabled={isSignInDisabled}
            className="focus-shell mt-8 w-full rounded-2xl border border-[var(--color-amber)]/40 bg-[rgba(245,166,35,0.12)] px-4 py-3 font-display text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-amber)] disabled:opacity-70"
          >
            {busyAction === 'sign_in' ? 'Redirecting...' : 'Sign In With Google'}
          </button>
          <p className="mt-4 text-[0.72rem] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            {isOnline
              ? 'Redirect flow is used for stable PWA and mobile behavior.'
              : 'Reconnect to continue with the redirect sign-in flow.'}
          </p>
        </section>
      </div>
    </div>
  );
}
