import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDialogSurface } from '@/hooks/useDialogSurface';
import { devLog } from '@/lib/dev-logging';
import type { TourAdvanceEvent } from '@/lib/types';

interface TourAdvancePromptProps {
  event: TourAdvanceEvent | null;
  isSubmitting?: boolean;
  isOffline?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function TourAdvancePrompt({
  event,
  isSubmitting = false,
  isOffline = false,
  error = null,
  onClose,
  onConfirm,
}: TourAdvancePromptProps) {
  useEffect(() => {
    if (event) {
      devLog.info('modal', 'tour_prompt_opened', {
        track: event.track,
        previousTour: event.previousTour,
        nextTour: event.nextTour,
      });
    }
  }, [event]);

  function closePrompt(reason: 'cancel' | 'manual') {
    if (!event) {
      return;
    }

    devLog.info('modal', 'tour_prompt_closed', {
      track: event.track,
      reason,
      nextTour: event.nextTour,
    });
    onClose();
  }

  const { containerRef, descriptionId, titleId } = useDialogSurface({
    isOpen: Boolean(event),
    onClose: () => closePrompt('manual'),
  });

  return (
    <AnimatePresence>
      {event ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(2,4,8,0.82)] px-4 pb-6 pt-12 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => closePrompt('manual')}
        >
          <motion.section
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            className="service-frame w-full max-w-2xl px-6 py-7"
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={(nextEvent) => nextEvent.stopPropagation()}
          >
            <div className="service-strip">
              <span className="service-label">Tour threshold reached</span>
              <span className="service-label">Prestige confirmation</span>
            </div>
            <h2
              id={titleId}
              className="font-display mt-5 text-3xl uppercase tracking-[0.08em] text-white"
            >
              Advance {event.trackLabel}
            </h2>
            <p
              id={descriptionId}
              className="mt-4 text-sm leading-7 text-[var(--color-text-muted)]"
            >
              Promote this track from {event.previousTourLabel} to {event.nextTourLabel}.
              The track resets to {event.nextRankName} so the new shield becomes the
              permanent prestige backdrop.
            </p>

            <div className="service-well mt-5 px-4 py-3 text-sm text-[var(--color-text)]">
              {event.previousRankName} retires. {event.nextTourLabel} unlocks on
              confirm.
            </div>

            {isOffline ? (
              <div
                role="status"
                aria-live="polite"
                className="service-frame mt-4 px-4 py-3 text-sm text-[var(--color-text)]"
              >
                Reconnect to commit the Tour advancement write.
              </div>
            ) : null}

            {error ? (
              <div
                role="alert"
                className="service-frame mt-4 border-red-500/35 bg-[linear-gradient(180deg,rgba(76,15,15,0.46),rgba(21,8,8,0.42))] px-4 py-3 text-sm text-red-100"
              >
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => closePrompt('cancel')}
                className="focus-shell service-button-ghost flex-1 rounded-none px-4 py-3 text-sm uppercase tracking-[0.22em]"
              >
                Later
              </button>
              <button
                type="button"
                onClick={() => {
                  if (event) {
                    devLog.info('modal', 'tour_prompt_confirmed', {
                      track: event.track,
                      nextTour: event.nextTour,
                    });
                  }
                  void onConfirm();
                }}
                disabled={isSubmitting || isOffline}
                className="focus-shell service-button-amber flex-1 rounded-none px-4 py-3 font-display text-sm font-semibold uppercase tracking-[0.22em]"
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
