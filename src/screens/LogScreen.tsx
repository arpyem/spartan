import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RankEmblem } from '@/components/RankEmblem';
import { RankUpModal } from '@/components/RankUpModal';
import { StatusBanner } from '@/components/StatusBanner';
import { TourAdvancePrompt } from '@/components/TourAdvancePrompt';
import { TourModal } from '@/components/TourModal';
import { TrackBadge } from '@/components/TrackBadge';
import { XPBar } from '@/components/XPBar';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useDoubleXP } from '@/hooks/useDoubleXP';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useUserData } from '@/hooks/useUserData';
import { devLog, sanitizeErrorForDevLog } from '@/lib/dev-logging';
import { RANKS, getRankFromXP, getRankProgress, getXpToNextRank } from '@/lib/ranks';
import { getAppRuntime } from '@/lib/runtime';
import { TRACKS_BY_KEY, isTrackKey } from '@/lib/tracks';
import type { RankUpEvent, TourAdvanceEvent, TourLevel, TrackKey } from '@/lib/types';
import { calculateXP, getBaseXP } from '@/lib/xp';

function formatTourLabel(tour: TourLevel) {
  return `Tour ${tour}`;
}

function buildTourAdvanceEvent(trackKey: TrackKey, currentTour: TourLevel): TourAdvanceEvent {
  const nextTour = (currentTour + 1) as TourLevel;

  return {
    track: trackKey,
    trackLabel: TRACKS_BY_KEY[trackKey].label,
    previousTour: currentTour,
    previousTourLabel: formatTourLabel(currentTour),
    nextTour,
    nextTourLabel: formatTourLabel(nextTour),
    previousRankId: RANKS[RANKS.length - 1].id,
    previousRankName: RANKS[RANKS.length - 1].name,
    nextRankId: RANKS[0].id,
    nextRankName: RANKS[0].name,
  };
}

function buildAdjustmentSteps(trackKey: TrackKey) {
  return trackKey === 'cardio' ? [-10, -5, 5, 10] : [-5, -1, 1, 5];
}

export function LogScreen() {
  const appRuntime = getAppRuntime();
  const navigate = useNavigate();
  const { track } = useParams();
  const { user } = useAuthSession();
  const { isOnline } = useNetworkStatus();
  const doubleXpStatus = useDoubleXP();
  const userData = useUserData(user?.uid);
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancingTour, setIsAdvancingTour] = useState(false);
  const [rankUpEvent, setRankUpEvent] = useState<RankUpEvent | null>(null);
  const [pendingTourAdvance, setPendingTourAdvance] = useState<TourAdvanceEvent | null>(null);
  const [tourCelebration, setTourCelebration] = useState<TourAdvanceEvent | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [tourError, setTourError] = useState<string | null>(null);
  const [returnHomeMode, setReturnHomeMode] = useState<'rank' | 'tour' | null>(null);
  const previewSignatureRef = useRef<string | null>(null);
  const trackKey = isTrackKey(track) ? track : null;
  const trackMeta = trackKey ? TRACKS_BY_KEY[trackKey] : null;
  const userDoc = userData.userDoc;
  const signedInUser = user ?? null;
  const currentTrack = trackKey && userDoc ? userDoc.tracks[trackKey] : null;
  const currentRank = currentTrack ? getRankFromXP(currentTrack.xp) : null;
  const currentProgress = currentTrack ? getRankProgress(currentTrack.xp) : 0;
  const xpToNextRank = currentTrack ? getXpToNextRank(currentTrack.xp) : null;
  const unitLabel = trackKey === 'cardio' ? 'minutes' : 'sets';
  const adjustmentSteps = trackKey ? buildAdjustmentSteps(trackKey) : [];
  const numericValue = Number(value);
  const isValidValue = Number.isInteger(numericValue) && numericValue > 0;
  const trimmedNote = note.trim();
  const preview = trackKey && isValidValue
    ? {
        baseXp: getBaseXP(trackKey, numericValue),
        totalXp: doubleXpStatus.active
          ? getBaseXP(trackKey, numericValue) * 2
          : calculateXP(trackKey, numericValue),
      }
    : null;
  const syncBanner = !isOnline
    ? {
        tone: 'warning' as const,
        title: 'Offline',
        body: 'Showing your last synced track state. Reconnect before logging a workout or advancing a Tour.',
      }
    : userData.error
      ? {
          tone: 'warning' as const,
          title: 'Live sync paused',
          body: 'Recent Firebase updates failed. This screen is using the last known track state.',
        }
      : null;

  useEffect(() => {
    if (!trackKey || !currentTrack) {
      return;
    }

    devLog.info('ui', 'log_screen_viewed', {
      track: trackKey,
      isOnline,
      xp: currentTrack.xp,
      tour: currentTrack.tour,
    });
  }, [currentTrack, isOnline, trackKey]);

  useEffect(() => {
    if (!trackKey) {
      return;
    }

    const signature = preview
      ? JSON.stringify({
          track: trackKey,
          value: numericValue,
          baseXp: preview.baseXp,
          totalXp: preview.totalXp,
          doubleXp: doubleXpStatus.active,
        })
      : JSON.stringify({
          track: trackKey,
          value,
          valid: false,
        });

    if (previewSignatureRef.current === signature) {
      return;
    }

    previewSignatureRef.current = signature;
    devLog.debug('ui', 'log_preview_changed', {
      track: trackKey,
      enteredValue: value,
      valid: Boolean(preview),
      preview: preview
        ? {
            baseXp: preview.baseXp,
            totalXp: preview.totalXp,
            doubleXp: doubleXpStatus.active,
          }
        : null,
    });
  }, [doubleXpStatus.active, numericValue, preview, trackKey, value]);

  if (!trackKey || !trackMeta) {
    return (
      <section className="service-frame mt-4 p-5">
        <p className="service-label">Route guard</p>
        <h2 className="font-display mt-3 text-3xl uppercase tracking-[0.08em] text-white">
          Unknown Training Track
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
          The route contract only accepts cardio, legs, push, pull, or core.
        </p>
        <Link
          to="/"
          className="focus-shell service-button mt-6 inline-flex rounded-none px-4 py-2 text-sm uppercase tracking-[0.2em]"
        >
          Return home
        </Link>
      </section>
    );
  }

  if (userData.status === 'loading') {
    return (
      <section className="service-frame mt-4 p-5">
        <p className="service-label">Syncing</p>
        <h2 className="font-display mt-3 text-3xl uppercase tracking-[0.08em] text-white">
          Loading {trackMeta.label}
        </h2>
      </section>
    );
  }

  if (userData.status === 'error' || !userData.userDoc || !user?.uid) {
    return (
      <section role="alert" className="service-frame mt-4 p-5">
        <p className="service-label">Unavailable</p>
        <h2 className="font-display mt-3 text-3xl uppercase tracking-[0.08em] text-white">
          Unable to load this track
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
          {userData.error?.message ?? 'Missing user context.'}
        </p>
      </section>
    );
  }

  const readyTrackKey = trackKey;
  const readyTrackMeta = trackMeta;
  const readyUserDoc = userDoc!;
  const readySignedInUser = signedInUser!;
  const readyCurrentTrack = currentTrack!;
  const readyCurrentRank = currentRank!;

  function returnHome(reason: string) {
    devLog.info('route', 'post_log_return_home_started', {
      track: readyTrackKey,
      reason,
    });
    setReturnHomeMode(null);
    navigate('/', { replace: true });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!preview) {
      devLog.warn('write', 'log_workout_blocked', {
        track: trackKey,
        reason: 'invalid_preview',
        enteredValue: value,
      });
      return;
    }

    if (!isOnline) {
      devLog.warn('write', 'log_workout_blocked', {
        track: trackKey,
        reason: 'offline',
      });
      setSubmitError('Reconnect to log workouts.');
      return;
    }

    setSubmitError(null);
    setTourError(null);
    setRankUpEvent(null);
    setPendingTourAdvance(null);
    setTourCelebration(null);
    setReturnHomeMode(null);
    setIsSubmitting(true);
    devLog.info('write', 'log_workout_started', {
      track: readyTrackKey,
      value: numericValue,
      noteLength: trimmedNote.length,
      currentXp: readyCurrentTrack.xp,
      currentTour: readyCurrentTrack.tour,
    });

    try {
      const result = await appRuntime.logWorkout({
        uid: readySignedInUser.uid,
        track: readyTrackKey,
        value: numericValue,
        note: trimmedNote,
        currentTrack: readyCurrentTrack,
      });

      const previousRank = getRankFromXP(result.xpBefore);
      const nextRank = getRankFromXP(result.xpAfter);
      devLog.info('write', 'log_workout_succeeded', {
        track: readyTrackKey,
        xpEarned: result.xpEarned,
        xpBefore: result.xpBefore,
        xpAfter: result.xpAfter,
        doubleXp: result.doubleXP,
        tourBefore: result.tourBefore,
        tourAdvanceAvailable: result.tourAdvanceAvailable,
      });

      if (previousRank.id !== nextRank.id) {
        devLog.info('write', 'rank_up_detected', {
          track: readyTrackKey,
          previousRankId: previousRank.id,
          nextRankId: nextRank.id,
          xpBefore: result.xpBefore,
          xpAfter: result.xpAfter,
        });
        setRankUpEvent({
          track: readyTrackKey,
          trackLabel: readyTrackMeta.label,
          tour: readyCurrentTrack.tour,
          previousRankId: previousRank.id,
          previousRankName: previousRank.name,
          nextRankId: nextRank.id,
          nextRankName: nextRank.name,
          xpBefore: result.xpBefore,
          xpAfter: result.xpAfter,
        });
      }

      if (result.tourAdvanceAvailable) {
        devLog.info('write', 'tour_advance_available_detected', {
          track: readyTrackKey,
          tourBefore: result.tourBefore,
          xpAfter: result.xpAfter,
        });
        setPendingTourAdvance(buildTourAdvanceEvent(readyTrackKey, result.tourBefore));
      }

      setValue('');
      setNote('');

      if (result.tourAdvanceAvailable) {
        setReturnHomeMode('tour');
      } else if (previousRank.id !== nextRank.id) {
        setReturnHomeMode('rank');
      } else {
        returnHome('plain_log_complete');
      }
    } catch (nextError) {
      devLog.error('write', 'log_workout_failed', {
        track: readyTrackKey,
        error: sanitizeErrorForDevLog(nextError),
      });
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
    if (!pendingTourAdvance) {
      return;
    }

    if (!isOnline) {
      devLog.warn('write', 'tour_advance_blocked', {
        track: readyTrackKey,
        reason: 'offline',
      });
      setTourError('Reconnect to advance the Tour.');
      return;
    }

    setTourError(null);
    setIsAdvancingTour(true);
    devLog.info('write', 'tour_advance_started', {
      track: readyTrackKey,
      previousTour: pendingTourAdvance.previousTour,
      nextTour: pendingTourAdvance.nextTour,
    });

    try {
      const result = await appRuntime.advanceTour({
        uid: readySignedInUser.uid,
        track: readyTrackKey,
        currentTrack: readyUserDoc.tracks[readyTrackKey],
      });
      setPendingTourAdvance(null);
      devLog.info('write', 'tour_advance_succeeded', {
        track: readyTrackKey,
        previousTour: result.previousTour,
        nextTour: result.nextTour,
        xpBefore: result.xpBefore,
      });
      setTourCelebration(buildTourAdvanceEvent(readyTrackKey, result.previousTour));
    } catch (nextError) {
      devLog.error('write', 'tour_advance_failed', {
        track: readyTrackKey,
        error: sanitizeErrorForDevLog(nextError),
      });
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
      <section className="space-y-5 pt-3">
        <div className="service-frame p-5">
          <div className="service-strip">
            <span className="service-label">Workout log</span>
            <Link
              to="/"
              className="focus-shell service-button rounded-none px-3 py-2 text-[0.72rem] uppercase tracking-[0.2em]"
            >
              Return home
            </Link>
          </div>
          <div className="service-row service-track-card service-selection-glow mt-5 px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex flex-wrap items-center justify-center gap-2.5 text-center">
                <TrackBadge badgeKey={readyTrackMeta.badgeKey} size={30} variant="glyph" />
                <h2 className="font-display text-[1.8rem] uppercase tracking-[0.08em] text-white sm:text-[2rem]">
                  {readyTrackMeta.label}
                </h2>
              </div>
              <div className="service-track-card-stage flex min-h-[7.2rem] w-full max-w-[10rem] items-center justify-center overflow-visible sm:min-h-[8rem] sm:max-w-[10.5rem]">
                <RankEmblem rankId={readyCurrentRank.id} tour={readyCurrentTrack.tour} size={96} />
              </div>
              <div className="mx-auto flex w-full max-w-[15rem] flex-col gap-2 text-center">
                <div className="space-y-1.5">
                  <p className="font-display text-[0.82rem] uppercase leading-[1.12] tracking-[0.05em] text-[rgba(214,225,244,0.82)]">
                    {readyCurrentRank.name}
                  </p>
                  <div className="flex items-center justify-between gap-3 text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                    <span>{readyCurrentTrack.xp} EXP</span>
                    <span>{currentProgress}%</span>
                  </div>
                </div>
                <XPBar
                  progress={currentProgress}
                  doubleXPActive={doubleXpStatus.active}
                />
              </div>
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[var(--color-text-dim)]">
                {xpToNextRank === null ? 'Max rank achieved' : `${xpToNextRank} EXP to next rank`}
              </p>
            </div>
          </div>
        </div>

        {syncBanner ? (
          <StatusBanner
            tone={syncBanner.tone}
            title={syncBanner.title}
            body={syncBanner.body}
          />
        ) : null}

        <form className="service-frame p-5" onSubmit={handleSubmit}>
          <label htmlFor="track-value" className="service-label">
            Enter {unitLabel}
          </label>
          <div className="mt-4 flex items-center gap-1.5 sm:gap-2">
            {adjustmentSteps
              .filter((step) => step < 0)
              .map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() =>
                    setValue(String(Math.max(0, (Number(value) || 0) + step)))
                  }
                  className="focus-shell service-button h-12 w-[2.8rem] shrink-0 rounded-none px-0 text-[0.7rem] uppercase tracking-[0.08em] sm:h-14 sm:w-[4.25rem] sm:text-sm sm:tracking-[0.16em]"
                  aria-label={`Decrease ${unitLabel} by ${Math.abs(step)}`}
                >
                  {step}
                </button>
              ))}
            <input
              id="track-value"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={value}
              onChange={(nextEvent) => setValue(nextEvent.target.value)}
              placeholder="0"
              className="focus-shell h-12 min-w-0 flex-1 border border-[var(--color-panel-border)] bg-[rgba(4,9,18,0.72)] px-2 text-center text-[1.7rem] text-white placeholder:text-[var(--color-text-dim)] sm:h-14 sm:px-4 sm:text-3xl"
            />
            {adjustmentSteps
              .filter((step) => step > 0)
              .map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setValue(String((Number(value) || 0) + step))}
                  className="focus-shell service-button h-12 w-[2.8rem] shrink-0 rounded-none px-0 text-[0.7rem] uppercase tracking-[0.08em] sm:h-14 sm:w-[4.25rem] sm:text-sm sm:tracking-[0.16em]"
                  aria-label={`Increase ${unitLabel} by ${step}`}
                >
                  +{step}
                </button>
              ))}
          </div>

          <div className="mt-5">
            <label htmlFor="workout-note" className="service-label">
              Workout notes
            </label>
            <textarea
              id="workout-note"
              rows={4}
              value={note}
              onChange={(nextEvent) => setNote(nextEvent.target.value)}
              placeholder="Optional notes about the session, pace, load, or effort."
              className="focus-shell mt-3 min-h-[7rem] w-full resize-y border border-[var(--color-panel-border)] bg-[rgba(4,9,18,0.72)] px-4 py-3 text-sm leading-6 text-white placeholder:text-[var(--color-text-dim)]"
            />
          </div>

          {submitError ? (
            <div
              role="alert"
              className="service-frame mt-4 border-red-500/35 bg-[linear-gradient(180deg,rgba(76,15,15,0.46),rgba(21,8,8,0.42))] px-4 py-3 text-sm text-red-100"
            >
              {submitError}
            </div>
          ) : null}

          {!isOnline ? (
            <div
              role="status"
              aria-live="polite"
              className="service-frame mt-4 px-4 py-3 text-sm text-[var(--color-text)]"
            >
              Workout logging is disabled while the device is offline.
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!preview || isSubmitting || !isOnline}
            className="focus-shell service-button-amber mt-5 w-full rounded-none px-4 py-3 font-display text-sm font-semibold uppercase tracking-[0.24em]"
          >
            {isSubmitting ? 'Logging...' : 'Log It'}
          </button>
        </form>
      </section>

      <RankUpModal
        event={rankUpEvent}
        onClose={() => {
          setRankUpEvent(null);
          if (returnHomeMode === 'rank') {
            returnHome('rank_up_complete');
          }
        }}
      />
      <TourAdvancePrompt
        event={pendingTourAdvance}
        isSubmitting={isAdvancingTour}
        isOffline={!isOnline}
        error={tourError}
        onClose={() => {
          setPendingTourAdvance(null);
          setTourError(null);
          if (returnHomeMode === 'tour') {
            returnHome('tour_prompt_dismissed');
          }
        }}
        onConfirm={handleAdvanceTour}
      />
      <TourModal
        event={tourCelebration}
        onClose={() => {
          setTourCelebration(null);
          if (returnHomeMode === 'tour') {
            returnHome('tour_ceremony_complete');
          }
        }}
      />
    </>
  );
}
