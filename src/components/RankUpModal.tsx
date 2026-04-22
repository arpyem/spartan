import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { RankUpEvent } from '@/lib/types';
import { RankEmblem } from '@/components/RankEmblem';
import { useDialogSurface } from '@/hooks/useDialogSurface';
import { devLog } from '@/lib/dev-logging';

interface RankUpModalProps {
  event: RankUpEvent | null;
  onClose: () => void;
}

function readReducedMotionPreference() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function RankUpModal({ event, onClose }: RankUpModalProps) {
  const reduceMotion = useReducedMotion() || readReducedMotionPreference();

  useEffect(() => {
    if (event) {
      devLog.info('modal', 'rank_up_modal_opened', {
        track: event.track,
        previousRankId: event.previousRankId,
        nextRankId: event.nextRankId,
        tour: event.tour,
      });
    }
  }, [event]);

  function closeRankUpModal(reason: 'auto' | 'manual') {
    if (!event) {
      return;
    }

    devLog.info('modal', 'rank_up_modal_closed', {
      track: event.track,
      reason,
      nextRankId: event.nextRankId,
    });
    onClose();
  }

  const { containerRef, descriptionId, titleId } = useDialogSurface({
    isOpen: Boolean(event),
    onClose: () => closeRankUpModal('manual'),
  });

  return (
    <AnimatePresence>
      {event ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[rgba(2,5,10,0.88)] px-4 text-left backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => closeRankUpModal('manual')}
        >
          <motion.div
            key={`rank-up-close-${event.track}-${event.xpAfter}-${event.tour}`}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 4, ease: 'easeInOut' }}
            style={{ transformOrigin: '0% 50%' }}
            onAnimationComplete={() => closeRankUpModal('auto')}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.88)_0%,rgba(191,215,255,0.5)_24%,rgba(0,0,0,0)_58%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: reduceMotion ? [0, 0.22, 0] : [0, 0.55, 0] }}
            transition={{
              duration: reduceMotion ? 0.22 : 0.38,
              times: [0, 0.2, 1],
            }}
          />
          <motion.div
            ref={(node) => {
              containerRef.current = node;
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            className="service-frame relative w-full max-w-xl overflow-hidden px-6 py-8 text-center"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <div className="service-strip">
              <span className="service-label">Promotion confirmed</span>
              <span className="service-label">{event.trackLabel}</span>
            </div>

            <div className="relative mt-8 flex justify-center">
              <motion.div
                aria-hidden="true"
                className="absolute h-40 w-40 border border-[rgba(210,226,251,0.35)]"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{
                  opacity: reduceMotion ? [0, 0.42, 0] : [0, 0.75, 0],
                  scale: reduceMotion ? [0.92, 1.04, 1.1] : [0.7, 1.2, 1.45],
                }}
                transition={{
                  delay: reduceMotion ? 0.08 : 0.32,
                  duration: reduceMotion ? 0.35 : 0.8,
                  ease: 'easeOut',
                }}
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: reduceMotion ? [0.92, 1] : [0, 1.24, 1],
                  opacity: [0, 1, 1],
                }}
                transition={{
                  duration: reduceMotion ? 0.24 : 0.55,
                  times: [0, 0.68, 1],
                  ease: 'easeOut',
                }}
              >
                <RankEmblem rankId={event.nextRankId} tour={event.tour} size={132} />
              </motion.div>
            </div>

            <div className="mt-6 flex justify-center gap-1 overflow-hidden">
              {'RANK UP'.split('').map((character, index) => (
                <motion.span
                  key={`${character}-${index}`}
                  className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-[#d1deef]"
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.32 + index * 0.035, duration: 0.2, ease: 'easeOut' }}
                >
                  {character === ' ' ? '\u00A0' : character}
                </motion.span>
              ))}
            </div>

            <motion.h2
              id={titleId}
              className="font-display mt-3 text-3xl uppercase tracking-[0.08em] text-white"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: reduceMotion ? 0.12 : 0.62,
                duration: reduceMotion ? 0.18 : 0.25,
                ease: 'easeOut',
              }}
            >
              {event.nextRankName}
            </motion.h2>
            <motion.p
              id={descriptionId}
              className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: reduceMotion ? 0.18 : 0.74,
                duration: reduceMotion ? 0.18 : 0.25,
                ease: 'easeOut',
              }}
            >
              {event.trackLabel} advanced from {event.previousRankName}.
            </motion.p>
            <motion.p
              className="mt-5 text-[0.68rem] uppercase tracking-[0.24em] text-[var(--color-text-dim)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduceMotion ? 0.2 : 1, duration: 0.2 }}
            >
              {event.xpBefore} to {event.xpAfter} EXP
            </motion.p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
