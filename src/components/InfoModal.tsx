import { AnimatePresence, motion } from 'framer-motion';
import { RankEmblem } from '@/components/RankEmblem';
import { TrackBadge } from '@/components/TrackBadge';
import { useDialogSurface } from '@/hooks/useDialogSurface';
import { RANKS } from '@/lib/ranks';
import { TRACKS } from '@/lib/tracks';
import type { DoubleXPStatus, TracksMap, UserDoc, WorkoutStats } from '@/lib/types';

interface InfoModalProps {
  isOpen: boolean;
  user: UserDoc;
  tracks: TracksMap;
  stats: WorkoutStats;
  doubleXPStatus: DoubleXPStatus;
  globalRankId: number;
  isSigningOut?: boolean;
  error?: string | null;
  onClose: () => void;
  onSignOut: () => Promise<void> | void;
}

function formatDate(value: unknown): string {
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const nextValue = value as { toDate: () => Date };
    return nextValue.toDate().toLocaleDateString();
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const nextDate = new Date(value);

    if (!Number.isNaN(nextDate.getTime())) {
      return nextDate.toLocaleDateString();
    }
  }

  return 'Unknown';
}

export function InfoModal({
  isOpen,
  user,
  tracks,
  stats,
  doubleXPStatus,
  globalRankId,
  isSigningOut = false,
  error = null,
  onClose,
  onSignOut,
}: InfoModalProps) {
  const { containerRef, descriptionId, titleId } = useDialogSurface({
    isOpen,
    onClose,
  });

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-40 bg-[rgba(2,4,8,0.84)] p-3 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={onClose}
        >
          <motion.section
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            className="service-frame mx-auto flex max-h-[100%] w-full max-w-5xl flex-col overflow-hidden"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="service-strip items-start">
              <div className="min-w-0">
                <p className="service-label">Spartan details</p>
                <h2
                  id={titleId}
                  className="font-display mt-1 text-xl uppercase tracking-[0.08em] text-white"
                >
                  Service Record
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="focus-shell service-button-ghost rounded-none px-3 py-2 text-xs uppercase tracking-[0.22em]"
              >
                Close
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 md:grid-cols-[1.1fr,0.9fr]">
              <div className="min-h-0 overflow-y-auto p-5">
                <div id={descriptionId} className="space-y-6">
                  <section className="space-y-3">
                    <p className="service-label">Account</p>
                    <div className="service-well p-4">
                      <div className="flex items-center gap-4">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt=""
                            className="h-16 w-16 border border-[var(--color-panel-border)] object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center border border-[var(--color-panel-border)] bg-[rgba(4,9,18,0.7)] text-xl text-white">
                            {user.displayName.slice(0, 1) || 'S'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-display text-xl uppercase tracking-[0.06em] text-white">
                            {user.displayName || 'Spartan'}
                          </p>
                          <p className="mt-1 break-all text-sm text-[var(--color-text-muted)]">
                            {user.email || 'No email available'}
                          </p>
                          <p className="mt-1 text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-text-dim)]">
                            Member since {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <p className="service-label">Your stats</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="service-well p-4">
                        <p className="service-label">Total workouts</p>
                        <p className="mt-2 font-display text-3xl uppercase text-white">
                          {stats.totalWorkouts}
                        </p>
                      </div>
                      <div className="service-well p-4">
                        <p className="service-label">Total EXP earned</p>
                        <p className="mt-2 font-display text-3xl uppercase text-white">
                          {stats.totalXp}
                        </p>
                      </div>
                    </div>
                    <div className="service-well p-4">
                      <div className="space-y-3">
                        {TRACKS.map((track) => {
                          const trackStats = stats.byTrack[track.key];
                          const valueLabel = track.key === 'cardio' ? 'minutes' : 'sets';

                          return (
                            <div
                              key={track.key}
                              className="flex items-center justify-between gap-3 border-b border-[var(--color-divider)] pb-3 last:border-b-0 last:pb-0"
                            >
                              <div className="flex items-center gap-3">
                                <TrackBadge badgeKey={track.badgeKey} size={30} variant="glyph" />
                                <span className="text-sm text-white">{track.label}</span>
                              </div>
                              <span className="text-right text-[0.8rem] text-[var(--color-text-muted)]">
                                {trackStats.workouts} sessions | {trackStats.totalValue} {valueLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <p className="service-label">Info</p>
                    <div className="service-well space-y-4 p-4">
                      <div>
                        <p className="service-label">Global rank aggregate</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                          Global rank is the floor average of the five Spartan track rank
                          indices.
                        </p>
                      </div>
                      <div className="border-t border-[var(--color-divider)] pt-4">
                        <p className="service-label">Log workout</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                          Tap any track tile to log one session. Cardio uses minutes; strength
                          tracks use sets.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <p className="service-label">Tour status</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {TRACKS.map((track) => (
                        <div
                          key={track.key}
                          className="service-well flex items-center justify-between gap-3 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <TrackBadge badgeKey={track.badgeKey} size={30} variant="glyph" />
                            <span className="text-sm text-white">{track.label}</span>
                          </div>
                          <span className="text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                            Tour {tracks[track.key].tour}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-3">
                    <p className="service-label">Double XP</p>
                    <div className="service-well p-4 text-sm leading-6 text-[var(--color-text-muted)]">
                      <p>Every fifth week runs a Double XP weekend from Friday through Sunday.</p>
                      <p className="mt-2 text-white">
                        Current status:{' '}
                        {doubleXPStatus.active
                          ? 'Active now'
                          : doubleXPStatus.upcoming
                            ? 'Starts this weekend'
                            : 'Normal XP window'}
                      </p>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <p className="service-label">Sign out</p>
                    {error ? (
                      <div
                        role="alert"
                        className="service-frame border-red-500/35 bg-[linear-gradient(180deg,rgba(76,15,15,0.46),rgba(21,8,8,0.42))] px-4 py-3 text-sm text-red-100"
                      >
                        {error}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void onSignOut()}
                      disabled={isSigningOut}
                      className="focus-shell service-button-amber w-full rounded-none px-4 py-3 font-display text-sm font-semibold uppercase tracking-[0.22em]"
                    >
                      {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                    </button>
                  </section>
                </div>
              </div>

              <div className="flex min-h-0 flex-col border-t border-[var(--color-divider)] md:border-l md:border-t-0">
                <div className="service-art-panel m-5 mb-0 flex-1" />
                <div className="min-h-0 overflow-y-auto p-5">
                  <section className="space-y-3">
                    <p className="service-label">Full rank table</p>
                    <div className="service-well max-h-[26rem] overflow-y-auto">
                      {RANKS.map((rank) => (
                        <div
                          key={rank.id}
                          className={`grid grid-cols-[1fr,auto,auto] items-center gap-3 border-b border-[var(--color-divider)] px-4 py-3 text-sm last:border-b-0 ${
                            rank.id === globalRankId
                              ? 'bg-[linear-gradient(90deg,rgba(217,134,59,0.18),rgba(10,18,31,0.1))] text-white'
                              : 'text-[var(--color-text-muted)]'
                          }`}
                        >
                          <span>{rank.name}</span>
                          <RankEmblem rankId={rank.id} tour={1} size={28} />
                          <span>{rank.xpRequired} EXP</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
