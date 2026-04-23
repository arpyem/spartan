import { AnimatePresence, motion } from 'framer-motion';
import { RankEmblem } from '@/components/RankEmblem';
import { ShieldBackground } from '@/components/ShieldBackground';
import { TrackBadge } from '@/components/TrackBadge';
import { useDialogSurface } from '@/hooks/useDialogSurface';
import { RANKS } from '@/lib/ranks';
import { TRACKS } from '@/lib/tracks';
import { getTourDescriptor, getTourLabel, TOUR_LEVELS } from '@/lib/tours';
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

function TourBackgroundPreview({ level }: { level: (typeof TOUR_LEVELS)[number] }) {
  const descriptor = getTourDescriptor(level);

  return (
    <div className="service-table-preview" aria-hidden="true">
      <svg viewBox="0 0 100 100" className="h-12 w-12">
        {descriptor.hasShield ? (
          <ShieldBackground tour={descriptor.level} />
        ) : (
          <>
            <circle
              cx="50"
              cy="49"
              r="36"
              fill="none"
              stroke="rgba(190,203,221,0.56)"
              strokeWidth="1.8"
            />
            <circle
              cx="50"
              cy="49"
              r="31"
              fill="none"
              stroke="rgba(190,203,221,0.22)"
              strokeWidth="0.9"
            />
          </>
        )}
      </svg>
    </div>
  );
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
  const currentRank = RANKS.find((rank) => rank.id === globalRankId) ?? RANKS[0];
  const tracksByTour = TOUR_LEVELS.reduce<Record<(typeof TOUR_LEVELS)[number], number>>(
    (counts, level) => {
      counts[level] = Object.values(tracks).filter((track) => track.tour === level).length;
      return counts;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  );

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
            <div data-testid="service-record-header" className="service-strip service-strip-record">
              <div className="min-w-0 flex-1">
                <p className="service-label">Spartan details</p>
                <h2
                  id={titleId}
                  className="font-display mt-1 break-words text-xl uppercase tracking-[0.08em] text-white"
                >
                  Service Record
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="focus-shell service-button-ghost ml-auto shrink-0 rounded-none px-3 py-2 text-xs uppercase tracking-[0.22em]"
              >
                Close
              </button>
            </div>

            <div
              id={descriptionId}
              data-testid="service-record-scroll"
              className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5"
            >
              <div className="space-y-5">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]">
                  <section className="space-y-3">
                    <p className="service-label">Account</p>
                    <div className="service-well p-4">
                      <div className="flex flex-wrap items-start gap-4 sm:flex-nowrap">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt=""
                            className="h-16 w-16 shrink-0 border border-[var(--color-panel-border)] object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-[var(--color-panel-border)] bg-[rgba(4,9,18,0.7)] text-xl text-white">
                            {user.displayName.slice(0, 1) || 'S'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-display break-words text-xl uppercase leading-tight tracking-[0.06em] text-white">
                            {user.displayName || 'Spartan'}
                          </p>
                          <p className="mt-1 break-all text-sm leading-6 text-[var(--color-text-muted)]">
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
                    <p className="service-label">Current rank</p>
                    <div className="service-well service-command-surface p-4">
                      <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
                        <div className="service-home-strip-emblem-frame h-20 w-20">
                          <RankEmblem rankId={currentRank.id} tour={1} size={72} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="service-label">Global rank aggregate</p>
                          <p className="font-display mt-2 break-words text-2xl uppercase leading-tight tracking-[0.06em] text-white">
                            {currentRank.name}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                            Floor average of all five track rank ladders. Current index{' '}
                            {currentRank.id + 1} of {RANKS.length}.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

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
                            className="flex flex-col gap-2 border-b border-[var(--color-divider)] pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <TrackBadge badgeKey={track.badgeKey} size={30} variant="glyph" />
                              <span className="text-sm text-white">{track.label}</span>
                            </div>
                            <span className="text-left text-[0.8rem] text-[var(--color-text-muted)] sm:text-right">
                              {trackStats.workouts} sessions | {trackStats.totalValue} {valueLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <section className="space-y-3">
                    <p className="service-label">Full rank table</p>
                    <div
                      data-testid="service-record-rank-table"
                      className="service-well service-selection-glow overflow-hidden"
                    >
                      <div
                        data-testid="service-record-rank-table-scroll"
                        className="h-[400px] overflow-y-auto"
                      >
                        <div className="service-rank-table-current">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="service-label">Current global rank</p>
                              <p className="font-display mt-1 break-words text-lg uppercase tracking-[0.06em] text-white">
                                {currentRank.name}
                              </p>
                            </div>
                            <p className="text-sm text-[var(--color-text-muted)]">
                              Index {currentRank.id + 1} of {RANKS.length}
                            </p>
                          </div>
                        </div>

                        <div>
                          {RANKS.map((rank) => (
                            <div
                              key={rank.id}
                              aria-current={rank.id === globalRankId ? 'true' : undefined}
                              className="service-rank-row flex flex-col gap-3 border-b border-[var(--color-divider)] px-4 py-3 text-sm last:border-b-0 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <RankEmblem rankId={rank.id} tour={1} size={36} />
                                <div className="min-w-0">
                                  <p className="font-display break-words text-base uppercase leading-tight tracking-[0.04em] text-white">
                                    {rank.name}
                                  </p>
                                  <p className="mt-1 text-[0.8rem] leading-5 text-[var(--color-text-muted)]">
                                    Unlocked at {rank.xpRequired} EXP
                                  </p>
                                </div>
                              </div>
                              <div className="text-left sm:text-right">
                                <p className="service-label">
                                  {rank.id === globalRankId ? 'Current rank' : 'Track ladder'}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                                  {rank.xpRequired} EXP
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <p className="service-label">Tour backgrounds</p>
                    <div
                      data-testid="service-record-tour-table"
                      className="service-well service-selection-glow overflow-hidden"
                    >
                      <div
                        data-testid="service-record-tour-table-scroll"
                        className="h-[400px] overflow-y-auto"
                      >
                        <div className="service-rank-table-current">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="service-label">Shield ladder</p>
                              <p className="font-display mt-1 break-words text-lg uppercase tracking-[0.06em] text-white">
                                Base through Diamond
                              </p>
                            </div>
                            <p className="text-sm text-[var(--color-text-muted)]">
                              Bronze and above add shield backgrounds
                            </p>
                          </div>
                        </div>

                        <div>
                          {TOUR_LEVELS.map((level) => {
                            const descriptor = getTourDescriptor(level);
                            const trackCount = tracksByTour[level];

                            return (
                              <div
                                key={level}
                                className="service-rank-row flex flex-col gap-3 border-b border-[var(--color-divider)] px-4 py-3 text-sm last:border-b-0 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4"
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <TourBackgroundPreview level={level} />
                                  <div className="min-w-0">
                                    <p className="font-display break-words text-base uppercase leading-tight tracking-[0.04em] text-white">
                                      {descriptor.label}
                                    </p>
                                    <p className="mt-1 text-[0.8rem] leading-5 text-[var(--color-text-muted)]">
                                      {descriptor.hasShield
                                        ? `${descriptor.name} shield background`
                                        : 'No shield background on Base Tour'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-left sm:text-right">
                                  <p className="service-label">
                                    {trackCount === 1 ? '1 track now' : `${trackCount} tracks now`}
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                                    {descriptor.hasShield ? 'Shield active' : 'No shield'}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <section className="space-y-3">
                    <p className="service-label">Tour status</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {TRACKS.map((track) => (
                        <div
                          key={track.key}
                          className="service-well flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <TrackBadge badgeKey={track.badgeKey} size={30} variant="glyph" />
                            <span className="text-sm text-white">{track.label}</span>
                          </div>
                          <span className="text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                            {getTourLabel(tracks[track.key].tour)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="space-y-5">
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
                  </div>
                </div>

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
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
