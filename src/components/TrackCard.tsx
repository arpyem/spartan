import type { TrackMeta } from '@/lib/tracks';
import type { TourLevel } from '@/lib/types';
import { RankEmblem } from '@/components/RankEmblem';
import { TrackBadge } from '@/components/TrackBadge';
import { XPBar } from '@/components/XPBar';

interface TrackCardProps {
  track: TrackMeta;
  rankId: number;
  rankName: string;
  tour: TourLevel;
  progress: number;
  xp: number;
  xpToNextRank: number | null;
  onSelect: () => void;
  doubleXPActive?: boolean;
  tourAdvanceAvailable?: boolean;
}

export function TrackCard({
  track,
  rankId,
  rankName,
  tour,
  progress,
  xp,
  xpToNextRank,
  onSelect,
  doubleXPActive = false,
  tourAdvanceAvailable = false,
}: TrackCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${track.label}, ${rankName}, ${xp} EXP${
        xpToNextRank === null ? ', Max rank' : `, ${xpToNextRank} EXP to next rank`
      }`}
      className="focus-shell service-row service-track-card service-selection-glow block h-full w-full cursor-pointer px-3 py-3.5 text-left sm:px-3.5 sm:py-4"
      data-selected={tourAdvanceAvailable ? 'true' : 'false'}
    >
      <div className="grid h-full grid-rows-[auto,1fr,auto] gap-2.5">
        <div className="flex min-w-0 items-center justify-center gap-2.5 text-center">
          <TrackBadge badgeKey={track.badgeKey} size={30} variant="glyph" />
          <p className="text-[0.61rem] uppercase tracking-[0.18em] text-[rgba(214,225,244,0.66)]">
            {track.label}
          </p>
        </div>
        <div className="service-track-card-stage flex min-h-0 items-center">
          <div className="mx-auto flex w-full max-w-[6.95rem] flex-1 items-center justify-center">
            <RankEmblem rankId={rankId} tour={tour} size={82} />
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-[7rem] flex-col gap-2 text-center">
          <div className="space-y-1.5">
            <p className="font-display text-[0.6rem] uppercase leading-[1.18] tracking-[0.05em] text-[rgba(214,225,244,0.72)]">
              {rankName}
            </p>
            <div className="flex items-center justify-between gap-3 text-[0.58rem] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              <span>{xp} EXP</span>
              <span>{progress}%</span>
            </div>
          </div>
          <XPBar progress={progress} doubleXPActive={doubleXPActive} />
        </div>
      </div>
    </button>
  );
}
