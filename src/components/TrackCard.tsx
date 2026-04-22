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
      className="focus-shell service-row service-selection-glow block w-full cursor-pointer p-4 text-left"
      data-selected={tourAdvanceAvailable ? 'true' : 'false'}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <TrackBadge badgeKey={track.badgeKey} size={34} variant="glyph" />
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-text-dim)]">
              {track.label}
            </p>
          </div>
          <div className="flex min-w-0 items-center justify-end gap-3 text-right">
            <div className="min-w-0">
              <p className="text-[0.72rem] leading-4 text-[var(--color-text-muted)]">
                {rankName}
              </p>
            </div>
            <RankEmblem rankId={rankId} tour={tour} size={76} />
          </div>
        </div>
        <div className="space-y-2">
          <XPBar
            progress={progress}
            doubleXPActive={doubleXPActive}
            label={`${xp} EXP`}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-[0.66rem] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            <span>{xp} EXP</span>
            <span>
              {xpToNextRank === null ? 'Max rank' : `${xpToNextRank} EXP to next rank`}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
