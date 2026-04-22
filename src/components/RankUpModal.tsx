import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { RankUpEvent } from '@/lib/types';
import { RankEmblem } from '@/components/RankEmblem';
import { useDialogSurface } from '@/hooks/useDialogSurface';

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
  const { containerRef, descriptionId, titleId } = useDialogSurface({
    isOpen: Boolean(event),
    onClose,
  });

  useEffect(() => {
    if (!event) {
      return;
    }

    const timerId = window.setTimeout(() => {
      onClose();
    }, 4000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [event, onClose]);

  return (
    <AnimatePresence>
      {event ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[rgba(7,9,11,0.86)] px-4 text-left backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.9)_0%,rgba(245,166,35,0.7)_22%,rgba(245,166,35,0)_55%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: reduceMotion ? [0, 0.28, 0] : [0, 0.8, 0] }}
            transition={{
              duration: reduceMotion ? 0.2 : 0.38,
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
            className="panel relative w-full max-w-sm overflow-hidden rounded-[2rem] border-[rgba(245,166,35,0.25)] bg-[linear-gradient(180deg,rgba(28,18,8,0.96),rgba(10,12,15,0.95))] px-6 py-8 text-center"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <motion.div
              aria-hidden="true"
              className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,240,170,0.95),transparent)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.12, duration: 0.18 }}
            />

            <div className="relative flex justify-center">
              <motion.div
                aria-hidden="true"
                className="absolute h-36 w-36 rounded-full border border-[rgba(255,240,170,0.38)]"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{
                  opacity: reduceMotion ? [0, 0.5, 0] : [0, 0.95, 0],
                  scale: reduceMotion ? [0.92, 1.05, 1.12] : [0.7, 1.18, 1.48],
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
                <RankEmblem rankId={event.nextRankId} tour={1} size={126} />
              </motion.div>
            </div>

            <div className="mt-6 flex justify-center gap-1 overflow-hidden">
              {'RANK UP'.split('').map((character, index) => (
                <motion.span
                  key={`${character}-${index}`}
                  className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-amber)]"
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
              className="font-display mt-3 text-3xl font-bold tracking-[0.12em] text-white"
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
              className="mt-5 font-hud text-[0.68rem] uppercase tracking-[0.28em] text-[rgba(255,240,190,0.78)]"
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
