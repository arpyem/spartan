import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RANKS } from '@/lib/ranks';
import { TRACKS_BY_KEY } from '@/lib/tracks';
import type { RankUpEvent } from '@/lib/types';
import { RankEmblem } from '@/components/RankEmblem';

interface RankUpModalProps {
  event: RankUpEvent | null;
  onClose: () => void;
}

export function RankUpModal({ event, onClose }: RankUpModalProps) {
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
        <motion.button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(245,166,35,0.12)] px-4 text-left backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="panel glow-amber w-full max-w-sm rounded-[2rem] px-6 py-8 text-center"
            initial={{ scale: 0.86, opacity: 0 }}
            animate={{ scale: [0.86, 1.08, 1], opacity: [0, 1, 1] }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.5, times: [0, 0.6, 1], ease: 'easeOut' }}
          >
            <motion.div
              className="mx-auto mb-5 h-3 w-24 rounded-full bg-[rgba(255,255,255,0.22)]"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            />
            <div className="flex justify-center">
              <RankEmblem rankId={event.nextRankId} tour={1} size={120} />
            </div>
            <p className="font-display mt-6 text-sm font-semibold uppercase tracking-[0.42em] text-[var(--color-amber)]">
              Rank Up
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-[0.12em] text-white">
              {RANKS[event.nextRankId].name}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
              {TRACKS_BY_KEY[event.track].label} advanced from{' '}
              {RANKS[event.previousRankId].name}.
            </p>
          </motion.div>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
