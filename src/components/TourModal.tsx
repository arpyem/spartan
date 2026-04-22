import { AnimatePresence, motion } from 'framer-motion';
import { TRACKS_BY_KEY } from '@/lib/tracks';
import type { TourAdvanceEvent } from '@/lib/types';

interface TourModalProps {
  event: TourAdvanceEvent | null;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function TourModal({
  event,
  isSubmitting = false,
  error = null,
  onClose,
  onConfirm,
}: TourModalProps) {
  return (
    <AnimatePresence>
      {event ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            className="panel w-full max-w-sm rounded-[2rem] px-6 py-7"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: [0.92, 1.04, 1], opacity: [0, 1, 1] }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.45, times: [0, 0.65, 1], ease: 'easeOut' }}
            onClick={(nextEvent) => nextEvent.stopPropagation()}
          >
            <p className="hud-kicker font-hud text-[0.65rem]">Tour threshold reached</p>
            <h2 className="font-display mt-3 text-2xl font-bold tracking-[0.12em] text-white">
              Advance {TRACKS_BY_KEY[event.track].label}
            </h2>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
              Promote this track from Tour {event.previousTour} to Tour {event.nextTour}.
              The track EXP resets to Recruit when the new shield unlocks.
            </p>
            {error ? (
              <div className="mt-4 rounded-[1.2rem] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="focus-shell flex-1 rounded-[1.2rem] border border-white/10 px-4 py-3 text-sm uppercase tracking-[0.22em] text-[var(--color-text-muted)]"
              >
                Later
              </button>
              <button
                type="button"
                onClick={() => void onConfirm()}
                disabled={isSubmitting}
                className="focus-shell flex-1 rounded-[1.2rem] border border-[var(--color-amber)]/40 bg-[rgba(245,166,35,0.12)] px-4 py-3 font-display text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-amber)] disabled:opacity-60"
              >
                {isSubmitting ? 'Advancing...' : 'Advance Tour'}
              </button>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
