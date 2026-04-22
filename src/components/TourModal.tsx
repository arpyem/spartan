import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'framer-motion';
import type { TourAdvanceEvent } from '@/lib/types';
import { RankEmblem } from '@/components/RankEmblem';
import { ShieldBackground } from '@/components/ShieldBackground';
import { useDialogSurface } from '@/hooks/useDialogSurface';
import { devLog } from '@/lib/dev-logging';

interface TourModalProps {
  event: TourAdvanceEvent | null;
  onClose: () => void;
}

function readReducedMotionPreference() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function TourModal({ event, onClose }: TourModalProps) {
  const [scope, animate] = useAnimate();
  const reduceMotion = useReducedMotion() || readReducedMotionPreference();
  const [isDismissEnabled, setIsDismissEnabled] = useState(false);

  function closeTourModal(reason: 'manual' | 'escape') {
    if (!event) {
      return;
    }

    devLog.info('modal', 'tour_modal_closed', {
      track: event.track,
      reason,
      nextTour: event.nextTour,
    });
    onClose();
  }

  const { containerRef, descriptionId, titleId } = useDialogSurface({
    isOpen: Boolean(event),
    dismissOnEscape: isDismissEnabled,
    onClose: isDismissEnabled ? () => closeTourModal('escape') : undefined,
  });
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 14 - Math.PI / 2;
        const distance = index % 2 === 0 ? 78 : 58;

        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
        };
      }),
    [],
  );

  useEffect(() => {
    if (event) {
      devLog.info('modal', 'tour_modal_opened', {
        track: event.track,
        previousTour: event.previousTour,
        nextTour: event.nextTour,
      });
    }
  }, [event]);

  useEffect(() => {
    containerRef.current = scope.current as HTMLDivElement | null;
  }, [containerRef, event, scope]);

  useEffect(() => {
    if (!event) {
      setIsDismissEnabled(false);
      return;
    }

    let isCancelled = false;

    async function runSequence() {
      setIsDismissEnabled(false);
      const scopeElement = scope.current as HTMLDivElement | null;

      if (!scopeElement) {
        return;
      }

      const oldEmblem = scopeElement.querySelector('[data-tour-old-emblem]') as HTMLElement | null;
      const shield = scopeElement.querySelector('[data-tour-shield]') as HTMLElement | null;
      const newEmblem = scopeElement.querySelector('[data-tour-new-emblem]') as HTMLElement | null;
      const copy = scopeElement.querySelector('[data-tour-copy]') as HTMLElement | null;
      const particleElements = Array.from(
        scopeElement.querySelectorAll('[data-tour-particle]'),
      ) as HTMLElement[];

      if (oldEmblem) {
        await animate(
          oldEmblem,
          { opacity: [1, 0], scale: reduceMotion ? [1, 0.94] : [1, 0.82] },
          { duration: reduceMotion ? 0.14 : 0.32, ease: 'easeOut' },
        );
      }

      if (shield) {
        await animate(
          shield,
          {
            opacity: [0, 1, 1],
            scale: reduceMotion ? [0.92, 1.04, 1] : [0, 1.3, 1],
          },
          {
            duration: reduceMotion ? 0.36 : 1.4,
            times: [0, 0.7, 1],
            ease: 'easeOut',
          },
        );
      }

      if (newEmblem) {
        await animate(
          newEmblem,
          { opacity: [0, 1], scale: reduceMotion ? [0.94, 1] : [0.78, 1] },
          { duration: reduceMotion ? 0.18 : 0.36, ease: 'easeOut' },
        );
      }

      if (!reduceMotion) {
        await Promise.all(
          particleElements.map((particle, index) =>
            animate(
              particle,
              {
                x: [0, particles[index]?.x ?? 0],
                y: [0, particles[index]?.y ?? 0],
                opacity: [0, 1, 0],
                scale: [0.25, 1, 0.4],
              },
              {
                duration: 0.8,
                delay: index * 0.018,
                ease: 'easeOut',
              },
            ),
          ),
        );
      }

      if (copy) {
        await animate(
          copy,
          { opacity: [0, 1], y: [16, 0] },
          { duration: reduceMotion ? 0.18 : 0.35, ease: 'easeOut' },
        );
      }

      if (!isCancelled) {
        setIsDismissEnabled(true);
      }
    }

    void runSequence();

    return () => {
      isCancelled = true;
    };
  }, [animate, event, particles, reduceMotion, scope]);

  return (
    <AnimatePresence>
      {event ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[rgba(1,2,5,0.94)] px-4 py-8 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (isDismissEnabled) {
              closeTourModal('manual');
            }
          }}
        >
          <div
            ref={scope}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            className="relative w-full max-w-xl"
          >
            <div className="service-frame relative overflow-hidden px-6 py-8">
              <div className="service-strip">
                <span className="service-label">Tour advancement</span>
                <span className="service-label">{event.trackLabel}</span>
              </div>

              <div className="relative mx-auto mt-6 flex h-64 items-center justify-center">
                <div
                  data-tour-old-emblem
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <RankEmblem
                    rankId={event.previousRankId}
                    tour={event.previousTour}
                    size={144}
                  />
                </div>

                <div
                  data-tour-shield
                  className="absolute inset-0 flex items-center justify-center opacity-0"
                  style={{ transform: 'scale(0)' }}
                >
                  <svg viewBox="0 0 100 100" width="168" height="168" aria-hidden="true">
                    <ShieldBackground tour={event.nextTour} />
                  </svg>
                </div>

                <div
                  data-tour-new-emblem
                  className="absolute inset-0 flex items-center justify-center opacity-0"
                  style={{ transform: 'scale(0.78)' }}
                >
                  <RankEmblem rankId={event.nextRankId} tour={1} size={112} />
                </div>

                {particles.map((particle, index) => (
                  <span
                    key={`tour-particle-${index}`}
                    data-tour-particle
                    className="absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full bg-[#f6c57f] opacity-0"
                    style={{
                      marginLeft: '-0.3125rem',
                      marginTop: '-0.3125rem',
                      boxShadow: '0 0 16px rgba(246, 197, 127, 0.72)',
                    }}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <div data-tour-copy className="opacity-0 text-center">
                <p className="font-display text-sm font-semibold uppercase tracking-[0.32em] text-[#f6c57f]">
                  Tour Advanced
                </p>
                <h2
                  id={titleId}
                  className="font-display mt-3 text-3xl uppercase tracking-[0.08em] text-white"
                >
                  {event.nextTourLabel}
                </h2>
                <p
                  id={descriptionId}
                  className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]"
                >
                  {event.trackLabel} reset to {event.nextRankName} beneath a permanent
                  new shield.
                </p>
                <p
                  role="status"
                  aria-live="polite"
                  className="mt-4 text-[0.68rem] uppercase tracking-[0.28em] text-[var(--color-text-dim)]"
                >
                  {isDismissEnabled ? 'Tap anywhere to continue' : 'Ceremony in progress'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
