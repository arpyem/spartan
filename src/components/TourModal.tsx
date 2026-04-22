import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useAnimate } from 'framer-motion';
import type { TourAdvanceEvent } from '@/lib/types';
import { RankEmblem } from '@/components/RankEmblem';
import { ShieldBackground } from '@/components/ShieldBackground';

interface TourModalProps {
  event: TourAdvanceEvent | null;
  onClose: () => void;
}

export function TourModal({ event, onClose }: TourModalProps) {
  const [scope, animate] = useAnimate();
  const [isDismissEnabled, setIsDismissEnabled] = useState(false);
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
        await animate(oldEmblem, { opacity: [1, 0], scale: [1, 0.82] }, { duration: 0.32, ease: 'easeOut' });
      }

      if (shield) {
        await animate(
          shield,
          { opacity: [0, 1, 1], scale: [0, 1.3, 1] },
          { duration: 1.4, times: [0, 0.7, 1], ease: 'easeOut' },
        );
      }

      if (newEmblem) {
        await animate(
          newEmblem,
          { opacity: [0, 1], scale: [0.78, 1] },
          { duration: 0.36, ease: 'easeOut' },
        );
      }

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

      if (copy) {
        await animate(
          copy,
          { opacity: [0, 1], y: [16, 0] },
          { duration: 0.35, ease: 'easeOut' },
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
  }, [animate, event, particles, scope]);

  return (
    <AnimatePresence>
      {event ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[rgba(2,3,5,0.92)] px-4 py-8 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (isDismissEnabled) {
              onClose();
            }
          }}
        >
          <div ref={scope} className="relative w-full max-w-sm">
            <div className="panel relative overflow-hidden rounded-[2.2rem] border-[rgba(245,166,35,0.2)] bg-[radial-gradient(circle_at_top,rgba(67,47,18,0.36),transparent_38%),linear-gradient(180deg,rgba(8,9,12,0.96),rgba(3,4,6,0.98))] px-6 py-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,166,35,0.14),transparent_46%)]" />

              <div className="relative mx-auto flex h-64 items-center justify-center">
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
                    className="absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full bg-[#ffd977] opacity-0"
                    style={{
                      marginLeft: '-0.3125rem',
                      marginTop: '-0.3125rem',
                      boxShadow: '0 0 16px rgba(255, 217, 119, 0.72)',
                    }}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <div data-tour-copy className="opacity-0 text-center">
                <p className="font-display text-sm font-semibold uppercase tracking-[0.38em] text-[var(--color-amber)]">
                  Tour Advanced
                </p>
                <h2 className="font-display mt-3 text-3xl font-bold tracking-[0.12em] text-white">
                  {event.nextTourLabel}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                  {event.trackLabel} reset to {event.nextRankName} beneath a permanent
                  new shield.
                </p>
                <p className="mt-4 font-hud text-[0.68rem] uppercase tracking-[0.3em] text-[rgba(255,240,190,0.76)]">
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
