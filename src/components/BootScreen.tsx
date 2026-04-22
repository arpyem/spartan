export function BootScreen() {
  return (
    <div className="app-shell flex items-center justify-center px-4">
      <div className="mobile-frame flex items-center justify-center">
        <section className="panel glow-green w-full max-w-sm p-8 text-center">
          <p className="hud-kicker font-hud text-xs">UNSC uplink</p>
          <h1 className="font-display mt-4 text-3xl font-extrabold tracking-[0.18em] text-slate-100">
            SPARTAN GAINS
          </h1>
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            Syncing service record and waiting for Firebase auth state.
          </p>
          <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-900/80">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-[var(--color-hud)]" />
          </div>
        </section>
      </div>
    </div>
  );
}

