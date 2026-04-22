import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoubleXPBanner } from '@/components/DoubleXPBanner';
import { GlobalRank } from '@/components/GlobalRank';
import { InfoModal } from '@/components/InfoModal';
import { StatusBanner } from '@/components/StatusBanner';
import { TrackCard } from '@/components/TrackCard';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useDoubleXP } from '@/hooks/useDoubleXP';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useUserData } from '@/hooks/useUserData';
import { useWorkoutStats } from '@/hooks/useWorkoutStats';
import { devLog } from '@/lib/dev-logging';
import {
  RANKS,
  getGlobalRankIndex,
  getGlobalRankProgress,
  getRankFromXP,
  getRankProgress,
  getXpToNextRank,
} from '@/lib/ranks';
import { TRACKS } from '@/lib/tracks';

export function HomeScreen() {
  const navigate = useNavigate();
  const {
    bootstrapError,
    bootstrapStatus,
    busyAction,
    error,
    retryBootstrap,
    signOutUser,
    user,
  } = useAuthSession();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const { isOnline } = useNetworkStatus();
  const doubleXpStatus = useDoubleXP();
  const userData = useUserData(user?.uid);
  const workoutStats = useWorkoutStats(user?.uid);

  useEffect(() => {
    if (user) {
      devLog.info('ui', 'home_screen_viewed', {
        uidSuffix: user.uid.slice(-6),
      });
    }
  }, [user]);

  useEffect(() => {
    if (isInfoOpen) {
      devLog.info('modal', 'info_modal_opened');
    }
  }, [isInfoOpen]);

  if (userData.status === 'loading' || workoutStats.status === 'loading') {
    return (
      <section className="space-y-5 pt-3">
        <div className="service-frame p-5">
          <p className="service-label">Syncing</p>
          <h2 className="font-display mt-3 text-3xl uppercase tracking-[0.08em] text-white">
            Loading service record
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            Pulling your live Spartan progression from Firestore.
          </p>
        </div>
      </section>
    );
  }

  if (userData.status === 'error' || workoutStats.status === 'error') {
    return (
      <section className="space-y-5 pt-3">
        <div role="alert" className="service-frame p-5">
          <p className="service-label">Sync issue</p>
          <h2 className="font-display mt-3 text-3xl uppercase tracking-[0.08em] text-white">
            Unable to load home screen
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            {userData.error?.message ?? workoutStats.error?.message ?? 'Unknown error.'}
          </p>
        </div>
      </section>
    );
  }

  if (!userData.userDoc) {
    if (bootstrapStatus === 'error') {
      return (
        <section className="space-y-5 pt-3">
          <div role="alert" className="service-frame p-5">
            <p className="service-label">Profile sync failed</p>
            <h2 className="font-display mt-3 text-3xl uppercase tracking-[0.08em] text-white">
              Unable to prepare your Spartan profile
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
              {bootstrapError ?? 'The initial Firestore profile write did not complete.'}
            </p>
            {!isOnline ? (
              <div className="mt-4">
                <StatusBanner
                  tone="warning"
                  title="Offline"
                  body="Reconnect before retrying the initial service record sync."
                />
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => void retryBootstrap()}
              disabled={!isOnline}
              className="focus-shell service-button-amber mt-5 rounded-none px-4 py-3 font-display text-sm font-semibold uppercase tracking-[0.22em]"
            >
              Retry Profile Sync
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="space-y-5 pt-3">
        <div className="service-frame p-5">
          <p className="service-label">
            {bootstrapStatus === 'running' ? 'Profile sync' : 'Awaiting bootstrap'}
          </p>
          <h2 className="font-display mt-3 text-3xl uppercase tracking-[0.08em] text-white">
            Preparing your Spartan profile
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            Finalizing your service record so the home screen can subscribe to live track
            data.
          </p>
        </div>
      </section>
    );
  }

  const userDoc = userData.userDoc;
  const globalRankId = getGlobalRankIndex(userDoc.tracks);
  const globalRank = RANKS[globalRankId];
  const globalProgress = getGlobalRankProgress(userDoc.tracks);
  const statusBanner = !isOnline
    ? {
        tone: 'warning' as const,
        title: 'Offline',
        body: 'Showing your last synced Spartan record. Live Firebase updates are paused until you reconnect.',
      }
    : userData.error || workoutStats.error
      ? {
          tone: 'warning' as const,
          title: 'Live sync paused',
          body: 'The latest Firebase subscription update failed. The field deck is still showing your last known data.',
        }
      : null;

  return (
    <>
      <section className="space-y-4 pt-1">
        <div className="service-strip">
          <div className="min-w-0">
            <p className="service-label">Spartan gains</p>
            <p className="truncate text-sm text-white">{userDoc.displayName || 'Spartan'}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsInfoOpen(true)}
            className="focus-shell service-button rounded-none px-3 py-2 text-[0.72rem] uppercase tracking-[0.22em]"
            aria-label="Open service record"
          >
            Record
          </button>
        </div>

        <header className="service-header pb-3">
          <p className="service-label">Field Deck</p>
          <h1 className="font-display service-title mt-3 text-white">Service Record</h1>
          <p className="service-subtitle mt-2">
            Five-track Halo 3 progression dossier.
          </p>
        </header>

        <GlobalRank
          rankId={globalRankId}
          rankName={globalRank.name}
          progress={globalProgress}
          doubleXPActive={doubleXpStatus.active}
        />

        {statusBanner ? (
          <StatusBanner
            tone={statusBanner.tone}
            title={statusBanner.title}
            body={statusBanner.body}
          />
        ) : null}

        <div className="space-y-3">
          {TRACKS.map((track) => {
            const progress = userDoc.tracks[track.key];
            const rank = getRankFromXP(progress.xp);

            return (
              <TrackCard
                key={track.key}
                track={track}
                rankId={rank.id}
                rankName={rank.name}
                tour={progress.tour}
                progress={getRankProgress(progress.xp)}
                xp={progress.xp}
                xpToNextRank={getXpToNextRank(progress.xp)}
                doubleXPActive={doubleXpStatus.active}
                tourAdvanceAvailable={progress.xp >= 2000 && progress.tour < 5}
                onSelect={() => {
                  devLog.info('ui', 'track_card_selected', {
                    track: track.key,
                    xp: progress.xp,
                    tour: progress.tour,
                  });
                  navigate(`/log/${track.key}`);
                }}
              />
            );
          })}
        </div>

        <div className="grid gap-3">
          <div className="service-frame p-4">
            <p className="service-label">Log workout</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)] sm:hidden">
              Select a track row to log one session, then drop back to the deck.
            </p>
            <p className="mt-2 hidden text-sm leading-6 text-[var(--color-text-muted)] sm:block">
              Select a track row above to enter minutes or sets for the next training
              session.
            </p>
          </div>
          <DoubleXPBanner status={doubleXpStatus} />
        </div>
      </section>

      <InfoModal
        isOpen={isInfoOpen}
        user={userDoc}
        tracks={userDoc.tracks}
        stats={workoutStats.stats}
        doubleXPStatus={doubleXpStatus}
        globalRankId={globalRankId}
        isSigningOut={busyAction === 'sign_out'}
        error={error}
        onClose={() => {
          devLog.info('modal', 'info_modal_closed');
          setIsInfoOpen(false);
        }}
        onSignOut={signOutUser}
      />
    </>
  );
}
