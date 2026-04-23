import { usePwaSession } from '@/hooks/usePwaSession';

export function PwaInstallBanner() {
  const {
    canInstall,
    installApp,
    installError,
    installInProgress,
    showIosInstallInstructions,
    clearInstallError,
  } = usePwaSession();

  if (!canInstall && !showIosInstallInstructions && !installError) {
    return null;
  }

  const title = canInstall ? 'Install Spartan' : 'Add To Home Screen';
  const body = canInstall
    ? 'Install the standalone app for fullscreen launch, faster relaunches, and a cached Spartan shell when the network drops.'
    : 'On iPhone, open the browser share menu and choose Add to Home Screen. Launch from that icon to use the standalone Spartan shell.';

  return (
    <div className="service-frame p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="service-label">PWA access</p>
          <h2 className="font-display mt-2 text-lg uppercase tracking-[0.08em] text-white">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{body}</p>
        </div>
        {canInstall ? (
          <button
            type="button"
            onClick={() => void installApp()}
            disabled={installInProgress}
            className="focus-shell service-button-amber self-start rounded-none px-4 py-3 font-display text-xs font-semibold uppercase tracking-[0.22em]"
          >
            {installInProgress ? 'Installing...' : 'Install App'}
          </button>
        ) : null}
      </div>
      {installError ? (
        <div
          role="alert"
          className="service-frame mt-4 border-red-500/35 bg-[linear-gradient(180deg,rgba(76,15,15,0.46),rgba(21,8,8,0.42))] px-4 py-3 text-sm text-red-100"
        >
          <div className="flex items-start justify-between gap-4">
            <span>{installError}</span>
            <button
              type="button"
              onClick={clearInstallError}
              className="focus-shell service-button-ghost rounded-none px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em]"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
