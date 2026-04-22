import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RankEmblem } from '@/components/RankEmblem';
import { RankUpModal } from '@/components/RankUpModal';
import { TourModal } from '@/components/TourModal';
import { XPBar } from '@/components/XPBar';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useDoubleXP } from '@/hooks/useDoubleXP';
import { useUserData } from '@/hooks/useUserData';
import { advanceTour, logWorkout } from '@/lib/firestore';
import { getRankFromXP, getRankProgress } from '@/lib/ranks';
import { TRACKS_BY_KEY, isTrackKey } from '@/lib/tracks';
import type { RankUpEvent, TourAdvanceEvent, TourLevel } from '@/lib/types';
import { calculateXP, getBaseXP } from '@/lib/xp';

export function LogScreen() {
  const { track } = useParams();
  const { user } = useAuthSession();
  const doubleXpStatus = useDoubleXP();
  const userData = useUserData(user?.uid);
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancingTour, setIsAdvancingTour] = useState(false);
  const [rankUpEvent, setRankUpEvent] = useState<RankUpEvent | null>(null);
  const [tourEvent, setTourEvent] = useState<TourAdvanceEvent | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [tourError, setTourError] = useState<string | null>(null);

  if (!isTrackKey(track)) {
    return (
      <section className="panel mt-4 p-5">
        <p className="hud-kicker font-hud text-[0.65rem]">Route guard</p>
        <h2 className="font-display mt-3 text-2xl font-bold tracking-[0.1em] text-white">
          Unknown Training Track
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
          The route contract only accepts cardio, legs, push, pull, or core.
        </p>
        <Link
          to="/"
          className="focus-shell mt-6 inline-flex rounded-full border border-[var(--color-steel)]/40 px-4 py-2 text-sm uppercase tracking-[0.2em] text-[var(--color-steel)]"
        >
          Return home
        </Link>
      </section>
    );
  }

  const trackMeta = TRACKS_BY_KEY[track];
  const unitLabel = track === 'cardio' ? 'minutes' : 'sets';
  const adjustStep = track === 'cardio' ? 5 : 1;

  if (userData.status === 'loading') {
    return (
      <section className="panel mt-4 p-5">
        <p className="hud-kicker font-hud text-[0.65rem]">Syncing</p>
        <h2 className="font-display mt-3 text-2xl font-bold tracking-[0.12em] text-white">
          Loading {trackMeta.label}
        </h2>
      </section>
    );
  }

  if (userData.status === 'error' || !userData.userDoc || !user?.uid) {
    return (
      <section className="panel mt-4 p-5">
        <p className="hud-kicker font-hud text-[0.65rem]">Unavailable</p>
        <h2 className="font-display mt-3 text-2xl font-bold tracking-[0.12em] text-white">
          Unable to load this track
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
          {userData.error?.message ?? 'Missing user context.'}
        </p>
      </section>
    );
  }

  const trackKey = track;
  const userDoc = userData.userDoc;
  const signedInUser = user;
  const currentTrack = userDoc.tracks[trackKey];
  const currentRank = getRankFromXP(currentTrack.xp);
  const currentProgress = getRankProgress(currentTrack.xp);
  const numericValue = Number(value);
  const isValidValue = Number.isInteger(numericValue) && numericValue > 0;
  const preview = isValidValue
    ? {
        baseXp: getBaseXP(trackKey, numericValue),
        totalXp: calculateXP(trackKey, numericValue),
      }
    : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!preview) {
      return;
    }

    setSubmitError(null);
    setTourError(null);
    setIsSubmitting(true);

    try {
      const result = await logWorkout({
        uid: signedInUser.uid,
        track: trackKey,
        value: numericValue,
        note,
        currentTrack,
      });

      const previousRank = getRankFromXP(result.xpBefore);
      const nextRank = getRankFromXP(result.xpAfter);

      if (previousRank.id !== nextRank.id) {
        setRankUpEvent({
          track: trackKey,
          previousRankId: previousRank.id,
          nextRankId: nextRank.id,
          xpBefore: result.xpBefore,
          xpAfter: result.xpAfter,
        });
      }

      if (result.tourAdvanceAvailable) {
        setTourEvent({
          track: trackKey,
          previousTour: result.tourBefore,
          nextTour: (result.tourBefore + 1) as TourLevel,
        });
      }

      setValue('');
      setNote('');
    } catch (nextError) {
      setSubmitError(
        nextError instanceof Error
          ? nextError.message
          : 'Unable to log the workout right now.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAdvanceTour() {
    setTourError(null);
    setIsAdvancingTour(true);

    try {
      await advanceTour({
        uid: signedInUser.uid,
        track: trackKey,
        currentTrack: userDoc.tracks[trackKey],
      });
      setTourEvent(null);
    } catch (nextError) {
      setTourError(
        nextError instanceof Error
          ? nextError.message
          : 'Unable to advance the Tour right now.',
      );
    } finally {
      setIsAdvancingTour(false);
    }
  }

  return (
    <>
      <section className="space-y-6 pt-4">
        <div className="panel p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="hud-kicker font-hud text-[0.65rem]">Workout log</p>
              <Link
                to="/"
                className="mt-3 inline-flex text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-steel)]"
              >
                Return home
              </Link>
            </div>
            <RankEmblem rankId={currentRank.id} tour={currentTrack.tour} size={70} />
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-black/35 text-3xl">
              <span aria-hidden="true">{trackMeta.icon}</span>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-[0.12em] text-white">
                {trackMeta.label}
              </h2>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                {currentRank.name} | Tour {currentTrack.tour}
              </p>
            </div>
          </div>
          <div className="mt-5">
            <XPBar
              progress={currentProgress}
              doubleXPActive={doubleXpStatus.active}
              label={`${currentTrack.xp} total EXP`}
            />
          </div>
        </div>

        <form className="panel p-5" onSubmit={handleSubmit}>
          <label
            htmlFor="track-value"
            className="hud-kicker font-hud text-[0.65rem]"
          >
            Enter {unitLabel}
          </label>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setValue(String(Math.max(0, (Number(value) || 0) - adjustStep)))
              }
              className="focus-shell rounded-2xl border border-white/10 px-4 py-3 text-xl text-white"
              aria-label={`Decrease ${unitLabel}`}
            >
              -
            </button>
            <input
              id="track-value"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={value}
              onChange={(nextEvent) => setValue(nextEvent.target.value)}
              placeholder={`Enter ${unitLabel}`}
              className="focus-shell min-w-0 flex-1 rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-center text-3xl text-white placeholder:text-[var(--color-text-muted)]"
            />
            <button
              type="button"
              onClick={() => setValue(String((Number(value) || 0) + adjustStep))}
              className="focus-shell rounded-2xl border border-white/10 px-4 py-3 text-xl text-white"
              aria-label={`Increase ${unitLabel}`}
            >
              +
            </button>
          </div>

          <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-black/25 p-4">
            <p className="text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              XP preview
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-white">
              {preview
                ? doubleXpStatus.active
                  ? `${preview.baseXp} x 2 = ${preview.totalXp} EXP`
                  : `${preview.totalXp} EXP`
                : 'Enter a positive whole number'}
            </p>
          </div>

          <label
            htmlFor="workout-note"
            className="mt-5 block text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-text-muted)]"
          >
            Workout note
          </label>
          <input
            id="workout-note"
            type="text"
            value={note}
            onChange={(nextEvent) => setNote(nextEvent.target.value)}
            placeholder="What did you do? (optional)"
            className="focus-shell mt-2 w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-base text-white placeholder:text-[var(--color-text-muted)]"
          />

          {submitError ? (
            <div className="mt-4 rounded-[1.2rem] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {submitError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!preview || isSubmitting}
            className="focus-shell mt-5 w-full rounded-[1.4rem] border border-[var(--color-amber)]/40 bg-[rgba(245,166,35,0.12)] px-4 py-3 font-display text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-amber)] disabled:opacity-60"
          >
            {isSubmitting ? 'Logging...' : 'Log It'}
          </button>
        </form>
      </section>

      <RankUpModal event={rankUpEvent} onClose={() => setRankUpEvent(null)} />
      <TourModal
        event={tourEvent}
        isSubmitting={isAdvancingTour}
        error={tourError}
        onClose={() => {
          setTourEvent(null);
          setTourError(null);
        }}
        onConfirm={handleAdvanceTour}
      />
    </>
  );
}
