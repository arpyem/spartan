import { AnimatePresence, motion } from 'framer-motion';
import type { TourAdvanceEvent } from '@/lib/types';

interface TourAdvancePromptProps {
  event: TourAdvanceEvent | null;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function TourAdvancePrompt({
  event,
  isSubmitting = false,
  error = null,
  onClose,
  onConfirm,
}: TourAdvancePromptProps) {
  return (
    <AnimatePresence>
      {event ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/68 px-4 pb-6 pt-12 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            className="panel w-full max-w-sm rounded-[2rem] border-[rgba(245,166,35,0.22)] bg-[linear-gradient(180deg,rgba(19,13,8,0.96),rgba(10,12,15,0.94))] px-6 py-7"
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={(nextEvent) => nextEvent.stopPropagation()}
          >
            <p className="font-hud text-[0.68rem] uppercase tracking-[0.3em] text-[var(--color-amber)]">
              Tour threshold reached
            </p>
            <h2 className="font-display mt-3 text-2xl font-bold tracking-[0.12em] text-white">
              Advance {event.trackLabel}
            </h2>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
              Promote this track from {event.previousTourLabel} to {event.nextTourLabel}.
              The track resets to {event.nextRankName} so the new shield becomes the
              permanent prestige backdrop.
            </p>

            <div className="mt-5 rounded-[1.4rem] border border-[var(--color-amber)]/20 bg-[rgba(245,166,35,0.08)] px-4 py-3 text-sm text-[var(--color-text)]">
              {event.previousRankName} retires. {event.nextTourLabel} unlocks on
              confirm.
            </div>

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
                className="focus-shell flex-1 rounded-[1.2rem] border border-[var(--color-amber)]/40 bg-[rgba(245,166,35,0.14)] px-4 py-3 font-display text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-amber)] disabled:opacity-60"
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
