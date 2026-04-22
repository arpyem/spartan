import { useEffect, useRef, useState } from 'react';
import { RankEmblem } from '@/components/RankEmblem';
import { XPBar } from '@/components/XPBar';

interface GlobalRankProps {
  displayName: string;
  rankId: number;
  rankName: string;
  progress: number;
  onOpenRecord: () => void;
  doubleXPActive?: boolean;
}

function splitRankName(rankName: string) {
  const match = rankName.match(/^(.*?)\s*\((.*?)\)$/);

  if (!match) {
    return {
      primary: rankName,
      secondary: null,
    };
  }

  return {
    primary: match[1],
    secondary: match[2],
  };
}

export function GlobalRank({
  displayName,
  rankId,
  rankName,
  progress,
  onOpenRecord,
  doubleXPActive = false,
}: GlobalRankProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const { primary, secondary } = splitRankName(rankName);

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
    <section className="service-frame service-command-surface service-global-rank p-4 sm:p-5 lg:p-6">
      <div className="service-strip mb-4">
        <div className="min-w-0">
          <p className="service-label">Spartan gains</p>
          <p className="truncate text-sm text-white">{displayName || 'Spartan'}</p>
        </div>
        <button
          type="button"
          onClick={onOpenRecord}
          className="focus-shell service-button shrink-0 rounded-none px-3 py-2 text-[0.72rem] uppercase tracking-[0.22em]"
          aria-label="Open service record"
        >
          Record
        </button>
      </div>
      <div className="service-header">
        <div className="flex items-center justify-between gap-4">
          <p className="service-label">Global rank</p>
          <div ref={popoverRef} className="relative shrink-0">
            <button
              ref={triggerRef}
              type="button"
              aria-label="Open global rank info"
              aria-expanded={isInfoOpen}
              aria-haspopup="dialog"
              onClick={() => setIsInfoOpen((current) => !current)}
              className="focus-shell service-icon-button service-icon-button-compact"
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
                    Global rank is the floor average of the five Spartan track rank
                    indices.
                  </p>
                </div>
                <div className="service-popover-section">
                  <p className="service-label">Log workout</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                    Tap any track tile to log one session. Cardio uses minutes;
                    strength tracks use sets.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-3 min-w-0 space-y-1">
          <h2 className="font-display text-[1.7rem] uppercase leading-[0.98] tracking-[0.07em] text-white sm:text-[2.15rem] lg:text-[2.45rem]">
            {primary}
          </h2>
          {secondary ? (
            <p className="font-display text-[1rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)] sm:text-[1.2rem]">
              {secondary}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex min-h-[22rem] flex-col justify-between gap-4 lg:min-h-[31rem]">
        <div className="service-global-rank-stage flex min-h-[16rem] flex-1 items-center justify-center overflow-visible lg:min-h-[23rem]">
          <div className="lg:hidden">
            <RankEmblem rankId={rankId} tour={1} size={256} />
          </div>
          <div className="hidden lg:block">
            <RankEmblem rankId={rankId} tour={1} size={364} />
          </div>
        </div>
        <div className="space-y-3 border-t border-[var(--color-divider)] pt-3">
          <XPBar
            progress={progress}
            doubleXPActive={doubleXPActive}
            label="Composite progress"
          />
        </div>
      </div>
    </section>
  );
}
