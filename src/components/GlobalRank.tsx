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
  const { primary, secondary } = splitRankName(rankName);

  return (
    <section className="service-frame service-command-surface service-global-rank service-home-strip p-4 sm:p-5">
      <div className="service-home-strip-layout">
        <div className="service-home-strip-actions">
          <button
            type="button"
            onClick={onOpenRecord}
            className="focus-shell service-button service-home-strip-record rounded-none px-4 py-3 text-left"
            aria-label={`Open service record for ${displayName || 'Spartan'}`}
          >
            <span className="service-label text-[0.74rem] tracking-[0.22em] text-[var(--color-text-muted)]">
              Service record
            </span>
            <span className="mt-1 block truncate font-display text-[1rem] uppercase tracking-[0.08em] text-white sm:text-[1.12rem]">
              {displayName || 'Spartan'}
            </span>
          </button>
        </div>

        <div className="service-home-strip-rank">
          <div className="min-w-0">
            <p className="service-label">Global rank</p>
            <h2 className="font-display text-[1.25rem] uppercase leading-[1] tracking-[0.08em] text-white sm:text-[1.55rem]">
              {primary}
            </h2>
            {secondary ? (
              <p className="font-display text-[0.88rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)] sm:text-[0.98rem]">
                {secondary}
              </p>
            ) : null}
          </div>
          <div className="service-home-strip-emblem-frame">
            <RankEmblem rankId={rankId} tour={1} size={92} />
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-[var(--color-divider)] pt-3">
        <XPBar
          progress={progress}
          doubleXPActive={doubleXPActive}
          label="Composite progress"
        />
      </div>
    </section>
  );
}
