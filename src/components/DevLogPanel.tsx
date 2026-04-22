import { useMemo, useState, useSyncExternalStore } from 'react';
import type { DevLogCategory, DevLogEntry, DevLogLevel } from '@/lib/types';
import { devLog, devLogStore } from '@/lib/dev-logging';

const LEVEL_FILTERS: Array<DevLogLevel | 'all'> = ['all', 'debug', 'info', 'warn', 'error'];
const CATEGORY_FILTERS: Array<DevLogCategory | 'all'> = [
  'all',
  'app',
  'auth',
  'route',
  'network',
  'snapshot',
  'write',
  'ui',
  'modal',
  'pwa',
  'error',
];

function formatTimestamp(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

async function downloadEntries(entries: DevLogEntry[]) {
  const blob = new Blob([JSON.stringify(entries, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'spartan-dev-logs.json';
  anchor.click();
  URL.revokeObjectURL(url);
}

export function DevLogPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [levelFilter, setLevelFilter] = useState<DevLogLevel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<DevLogCategory | 'all'>('all');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'done'>('idle');
  const entries = useSyncExternalStore(devLogStore.subscribe, devLogStore.getEntries);
  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        const levelMatches = levelFilter === 'all' || entry.level === levelFilter;
        const categoryMatches = categoryFilter === 'all' || entry.category === categoryFilter;
        return levelMatches && categoryMatches;
      }),
    [categoryFilter, entries, levelFilter],
  );

  async function handleCopyVisible() {
    await devLogStore.copy(filteredEntries);
    setCopyStatus('done');
    window.setTimeout(() => setCopyStatus('idle'), 1200);
    devLog.info('ui', 'dev_log_panel_copied_visible_logs', {
      visibleEntries: filteredEntries.length,
    });
  }

  function handleClear() {
    devLog.info('ui', 'dev_log_panel_cleared', {
      clearedEntries: entries.length,
    });
    devLogStore.clear();
  }

  async function handleDownload() {
    await downloadEntries(filteredEntries);
    devLog.info('ui', 'dev_log_panel_downloaded', {
      visibleEntries: filteredEntries.length,
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          devLog.info('ui', nextOpen ? 'dev_log_panel_opened' : 'dev_log_panel_closed', {
            totalEntries: entries.length,
          });
        }}
        className="focus-shell fixed bottom-3 right-3 z-[60] rounded-full border border-[var(--color-steel)]/40 bg-[rgba(5,8,11,0.94)] px-4 py-2 text-[0.72rem] uppercase tracking-[0.24em] text-[var(--color-steel)] shadow-[0_12px_24px_rgba(0,0,0,0.35)] lg:top-4 lg:bottom-auto"
        aria-expanded={isOpen}
        aria-controls="dev-log-panel"
      >
        Dev Logs ({entries.length})
      </button>

      {isOpen ? (
        <aside
          id="dev-log-panel"
          aria-label="Dev log panel"
          className="fixed inset-x-3 bottom-16 z-[60] max-h-[48vh] overflow-hidden rounded-[1.5rem] border border-[var(--color-steel)]/30 bg-[rgba(5,8,11,0.96)] shadow-[0_18px_50px_rgba(0,0,0,0.48)] backdrop-blur-md lg:inset-x-auto lg:bottom-4 lg:right-4 lg:top-16 lg:w-[24rem] lg:max-h-[calc(100vh-5rem)]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div>
              <p className="hud-kicker font-hud text-[0.58rem]">Browser QA</p>
              <h2 className="font-display mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Dev Event Log
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                devLog.info('ui', 'dev_log_panel_closed', {
                  totalEntries: entries.length,
                });
              }}
              className="focus-shell rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-text-muted)]"
            >
              Close
            </button>
          </div>

          <div className="flex flex-wrap gap-3 border-b border-white/10 px-4 py-3">
            <label className="flex min-w-[9rem] flex-1 flex-col gap-1 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Level
              <select
                value={levelFilter}
                onChange={(event) => setLevelFilter(event.target.value as DevLogLevel | 'all')}
                className="focus-shell rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white"
              >
                {LEVEL_FILTERS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-[10rem] flex-[1.2] flex-col gap-1 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Category
              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value as DevLogCategory | 'all')
                }
                className="focus-shell rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white"
              >
                {CATEGORY_FILTERS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-white/10 px-4 py-3">
            <button
              type="button"
              onClick={() => void handleCopyVisible()}
              className="focus-shell rounded-full border border-[var(--color-hud)]/25 px-3 py-2 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-hud)]"
            >
              {copyStatus === 'done' ? 'Copied' : 'Copy Visible Logs'}
            </button>
            <button
              type="button"
              onClick={() => void handleDownload()}
              className="focus-shell rounded-full border border-[var(--color-steel)]/30 px-3 py-2 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-steel)]"
            >
              Download JSON
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="focus-shell rounded-full border border-red-500/25 px-3 py-2 text-[0.65rem] uppercase tracking-[0.18em] text-red-200"
            >
              Clear
            </button>
          </div>

          <div className="max-h-[calc(48vh-12rem)] overflow-y-auto px-4 py-3 lg:max-h-[calc(100vh-19rem)]">
            {filteredEntries.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">
                No events match the current filters.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredEntries
                  .slice()
                  .reverse()
                  .map((entry) => (
                    <article
                      key={entry.id}
                      className="rounded-[1.1rem] border border-white/8 bg-black/25 p-3"
                    >
                      <div className="flex items-center justify-between gap-3 text-[0.62rem] uppercase tracking-[0.18em]">
                        <span className="text-[var(--color-hud)]">{formatTimestamp(entry.timestamp)}</span>
                        <span className="text-[var(--color-steel)]">
                          {entry.category} / {entry.level}
                        </span>
                      </div>
                      <p className="mt-2 font-display text-sm font-semibold tracking-[0.08em] text-white">
                        {entry.event}
                      </p>
                      <p className="mt-1 text-[0.7rem] text-[var(--color-text-muted)]">
                        Route: {entry.route ?? 'n/a'}
                      </p>
                      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-[0.7rem] leading-5 text-[var(--color-text-muted)]">
                        {entry.data ? JSON.stringify(entry.data) : '{}'}
                      </pre>
                    </article>
                  ))}
              </div>
            )}
          </div>
        </aside>
      ) : null}
    </>
  );
}
