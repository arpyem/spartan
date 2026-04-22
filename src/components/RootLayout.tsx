import { Outlet } from 'react-router-dom';

export function RootLayout() {
  return (
    <div className="app-shell">
      <div className="mobile-frame service-shell">
        <main className="relative z-10">
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
