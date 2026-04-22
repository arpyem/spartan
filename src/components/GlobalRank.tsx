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
  return (
    <section className="service-frame p-4 sm:p-5">
      <div className="service-header flex items-center justify-between gap-4">
        <div>
          <p className="service-label">Global rank</p>
          <h2 className="font-display mt-2 text-[1.65rem] uppercase tracking-[0.08em] text-white sm:text-2xl">
            {rankName}
          </h2>
        </div>
        <div className="max-w-40 text-right text-[0.72rem] leading-5 text-[var(--color-text-dim)]">
          <p className="sm:hidden">Five-track average standing.</p>
          <p className="hidden sm:block">
            Composite standing averaged across all Spartan training tracks.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[auto,1fr] sm:items-center sm:gap-5">
        <div className="flex justify-center sm:justify-start">
          <RankEmblem rankId={rankId} tour={1} size={92} />
        </div>
        <div className="space-y-3">
          <div className="service-well p-3 sm:p-4">
            <p className="service-label">Service record aggregate</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)] sm:hidden">
              Floor average of the five track rank indices.
            </p>
            <p className="mt-2 hidden text-sm leading-6 text-[var(--color-text-muted)] sm:block">
              Promotion state is derived from the floor average of the five track rank
              indices, matching the canonical playlist ladder.
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
