import { Outlet } from 'react-router-dom';

export function RootLayout() {
  return (
    <div className="app-shell">
      <div className="mobile-frame">
        <header className="relative z-10 flex items-center justify-between border-b border-white/8 pb-4">
          <div>
            <p className="hud-kicker font-hud text-[0.65rem]">Spartan gains</p>
            <h1 className="font-display mt-2 text-lg font-bold tracking-[0.18em] text-white">
              FOUNDATION BUILD
            </h1>
          </div>
          <div className="rounded-full border border-[var(--color-panel-border)] px-3 py-1 text-[0.68rem] uppercase tracking-[0.28em] text-[var(--color-steel)]">
            Plan 01
          </div>
        </header>

        <main className="relative z-10 pt-6">
          <Outlet />
        </main>

        <div
          aria-hidden="true"
          data-testid="modal-host"
          className="pointer-events-none absolute inset-0 z-20"
        />
      </div>
    </div>
  );
}

