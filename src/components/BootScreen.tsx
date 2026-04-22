export function BootScreen() {
  return (
    <div className="app-shell flex items-center justify-center px-4">
      <div className="mobile-frame flex items-center justify-center">
        <section className="service-frame w-full max-w-xl p-8 text-center">
          <p className="hud-kicker font-hud text-xs">UNSC uplink</p>
          <h1 className="font-display mt-4 text-4xl uppercase tracking-[0.1em] text-slate-100">
            Spartan Gains
          </h1>
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            Syncing service record and waiting for Firebase auth state.
          </p>
          <div className="service-well mt-8 p-3">
            <div className="h-3 overflow-hidden border border-[var(--color-panel-border)] bg-[rgba(4,9,18,0.8)]">
              <div className="h-full w-2/3 animate-pulse bg-[linear-gradient(90deg,#c5d5eb,#7f9bc2,#3b5985)]" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
