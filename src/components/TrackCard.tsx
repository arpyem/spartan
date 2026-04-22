import { motion } from 'framer-motion';
import type { TrackMeta } from '@/lib/tracks';
import type { TourLevel } from '@/lib/types';
import { RankEmblem } from '@/components/RankEmblem';
import { XPBar } from '@/components/XPBar';

interface TrackCardProps {
  track: TrackMeta;
  rankId: number;
  rankName: string;
  tour: TourLevel;
  progress: number;
  xp: number;
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
  onSelect,
  doubleXPActive = false,
  tourAdvanceAvailable = false,
}: TrackCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="focus-shell panel block w-full rounded-[1.6rem] p-4 text-left transition hover:border-[var(--color-steel)]/40 hover:bg-white/4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-2xl">
            <span aria-hidden="true">{track.icon}</span>
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-[0.08em] text-white">
              {track.label}
            </p>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
              {rankName}
            </p>
            <p className="mt-1 text-[0.72rem] uppercase tracking-[0.18em] text-[var(--color-steel)]">
              Tour {tour}
            </p>
          </div>
        </div>
        <RankEmblem rankId={rankId} tour={tour} size={58} />
      </div>
      <div className="mt-4 space-y-3">
        <XPBar
          progress={progress}
          doubleXPActive={doubleXPActive}
          label={`${xp} total EXP`}
        />
        {tourAdvanceAvailable ? (
          <motion.div
            className="rounded-2xl border border-[var(--color-amber)]/40 bg-[rgba(245,166,35,0.12)] px-3 py-2 text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-amber)]"
            animate={{
              boxShadow: [
                '0 0 0 rgba(245,166,35,0)',
                '0 0 18px rgba(245,166,35,0.28)',
                '0 0 0 rgba(245,166,35,0)',
              ],
              opacity: [0.84, 1, 0.84],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            Tour advancement available
          </motion.div>
        ) : null}
      </div>
    </button>
  );
}
