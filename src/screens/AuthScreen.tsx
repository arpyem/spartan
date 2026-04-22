export function AuthScreen() {
  return (
    <div className="app-shell flex items-center justify-center px-4">
      <div className="mobile-frame flex items-center justify-center">
        <section className="panel w-full max-w-sm p-8">
          <p className="hud-kicker font-hud text-xs">Google auth staging</p>
          <h1 className="font-display mt-4 text-3xl font-bold tracking-[0.12em] text-white">
            Spartan ID Required
          </h1>
          <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
            Firebase Auth is wired and persistence is configured. The real Google
            sign-in flow lands in Milestone 03, but the signed-out gate is now
            structurally in place.
          </p>
          <button
            type="button"
            disabled
            className="focus-shell mt-8 w-full rounded-2xl border border-[var(--color-amber)]/40 bg-[rgba(245,166,35,0.12)] px-4 py-3 font-display text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-amber)] opacity-80"
          >
            Sign-In Surface Pending
          </button>
        </section>
      </div>
    </div>
  );
}

