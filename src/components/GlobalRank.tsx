import { useEffect, useRef, useState } from 'react';
import { RankEmblem } from '@/components/RankEmblem';
import { XPBar } from '@/components/XPBar';

interface GlobalRankProps {
  rankId: number;
  rankName: string;
  progress: number;
  doubleXPActive?: boolean;
}

export function GlobalRank({
  rankId,
  rankName,
  progress,
  doubleXPActive = false,
}: GlobalRankProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isInfoOpen) {
      return;
    }

    function closePopover(restoreFocus = false) {
      setIsInfoOpen(false);

      if (restoreFocus) {
        window.requestAnimationFrame(() => {
          triggerRef.current?.focus();
        });
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (!popoverRef.current?.contains(event.target as Node)) {
        closePopover(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePopover(true);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isInfoOpen]);

  return (
    <section className="service-frame service-command-surface p-4 sm:p-5">
      <div className="service-header flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="service-label">Global rank</p>
          <h2 className="font-display mt-2 text-[1.65rem] uppercase tracking-[0.08em] text-white sm:text-2xl">
            {rankName}
          </h2>
        </div>
        <div ref={popoverRef} className="relative shrink-0">
          <button
            ref={triggerRef}
            type="button"
            aria-label="Open global rank info"
            aria-expanded={isInfoOpen}
            aria-haspopup="dialog"
            onClick={() => setIsInfoOpen((current) => !current)}
            className="focus-shell service-icon-button"
          >
            i
          </button>
          {isInfoOpen ? (
            <div
              role="dialog"
              aria-label="Global rank info"
              className="service-popover"
            >
              <div className="service-popover-section">
                <p className="service-label">Global rank aggregate</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  Composite standing is derived from the floor average of the five
                  Spartan track rank indices, keeping the overall ladder tied to
                  balanced progress.
                </p>
              </div>
              <div className="service-popover-section">
                <p className="service-label">Log workout</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  Select a track row to log one session. Cardio records minutes;
                  strength tracks record sets. After each resolved log flow, the deck
                  returns here automatically.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[auto,1fr] sm:items-center sm:gap-5">
        <div className="flex justify-center sm:justify-start">
          <RankEmblem rankId={rankId} tour={1} size={98} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="service-label">Composite tier progress</p>
            <p className="font-hud text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-text-dim)]">
              Aggregate
            </p>
          </div>
          <XPBar
            progress={progress}
            doubleXPActive={doubleXPActive}
            label="Composite tier progress"
          />
        </div>
      </div>
    </section>
  );
}
