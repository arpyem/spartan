import { AnimatePresence, motion } from 'framer-motion';
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
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-40 flex items-end bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            className="panel max-h-[88vh] w-full overflow-y-auto rounded-[1.8rem] p-5"
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="hud-kicker font-hud text-[0.65rem]">Service record</p>
                <h2 className="font-display mt-2 text-2xl font-bold tracking-[0.12em] text-white">
                  Spartan Details
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="focus-shell rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <section className="space-y-3">
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-white">
                  Account
                </h3>
                <div className="flex items-center gap-4 rounded-[1.4rem] border border-white/8 bg-black/25 p-4">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="h-14 w-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-xl text-[var(--color-hud)]">
                      {user.displayName.slice(0, 1) || 'S'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-display text-base font-semibold tracking-[0.06em] text-white">
                      {user.displayName || 'Spartan'}
                    </p>
                    <p className="mt-1 break-all text-sm text-[var(--color-text-muted)]">
                      {user.email || 'No email available'}
                    </p>
                    <p className="mt-1 text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-steel)]">
                      Member since {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-white">
                  Your stats
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-white/8 bg-black/25 p-4">
                    <p className="text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                      Total workouts
                    </p>
                    <p className="mt-2 font-display text-3xl font-semibold text-white">
                      {stats.totalWorkouts}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/8 bg-black/25 p-4">
                    <p className="text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                      Total EXP earned
                    </p>
                    <p className="mt-2 font-display text-3xl font-semibold text-white">
                      {stats.totalXp}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 rounded-[1.4rem] border border-white/8 bg-black/25 p-4">
                  {TRACKS.map((track) => {
                    const trackStats = stats.byTrack[track.key];
                    const valueLabel = track.key === 'cardio' ? 'minutes' : 'sets';

                    return (
                      <div
                        key={track.key}
                        className="flex items-center justify-between gap-4 text-sm"
                      >
                        <span className="text-white">{track.label}</span>
                        <span className="text-right text-[var(--color-text-muted)]">
                          {trackStats.workouts} sessions | {trackStats.totalValue} {valueLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-white">
                  Tour status
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {TRACKS.map((track) => (
                    <div
                      key={track.key}
                      className="rounded-[1.4rem] border border-white/8 bg-black/25 p-4"
                    >
                      <p className="text-sm text-white">{track.label}</p>
                      <p className="mt-1 text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                        Tour {tracks[track.key].tour}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-white">
                  Full rank table
                </h3>
                <div className="max-h-64 overflow-y-auto rounded-[1.4rem] border border-white/8 bg-black/25">
                  {RANKS.map((rank) => (
                    <div
                      key={rank.id}
                      className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${
                        rank.id === globalRankId
                          ? 'bg-[rgba(0,255,65,0.14)] text-white'
                          : 'text-[var(--color-text-muted)]'
                      }`}
                    >
                      <span>{rank.name}</span>
                      <span>{rank.xpRequired} EXP</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-white">
                  Double XP
                </h3>
                <div className="rounded-[1.4rem] border border-white/8 bg-black/25 p-4 text-sm leading-6 text-[var(--color-text-muted)]">
                  <p>
                    Every fifth week runs a Double XP weekend from Friday through Sunday.
                  </p>
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
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-white">
                  Sign out
                </h3>
                {error ? (
                  <div className="rounded-[1.2rem] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {error}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => void onSignOut()}
                  disabled={isSigningOut}
                  className="focus-shell w-full rounded-[1.2rem] border border-[var(--color-amber)]/40 bg-[rgba(245,166,35,0.12)] px-4 py-3 font-display text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-amber)] disabled:opacity-60"
                >
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </button>
              </section>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
