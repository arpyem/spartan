import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalRank } from '@/components/GlobalRank';
import { HomeStatusRail } from '@/components/HomeStatusRail';
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
  const homeStatusItems = [
    ...(!isOnline
      ? [
          {
            key: 'offline',
            tone: 'warning' as const,
            title: 'Offline',
            detail: 'Showing your last synced Spartan record until the connection returns.',
          },
        ]
      : userData.error || workoutStats.error
        ? [
            {
              key: 'live-sync-paused',
              tone: 'warning' as const,
              title: 'Live sync paused',
              detail: 'The latest Firebase update failed. The deck is showing your last known data.',
            },
          ]
        : []),
    ...(doubleXpStatus.active || doubleXpStatus.upcoming
      ? [
          {
            key: 'double-xp',
            tone: 'boost' as const,
            title: doubleXpStatus.active ? 'Double XP Active' : 'Double XP This Weekend',
            detail: doubleXpStatus.active
              ? 'All Friday-through-Sunday workout logs are paying out at 2x EXP.'
              : 'The next scheduled two-times multiplier window starts on Friday.',
          },
        ]
      : []),
  ];
  return (
    <>
      <section className="space-y-4 pt-1">
        <h1 className="sr-only">Service Record</h1>
        <GlobalRank
          displayName={userDoc.displayName || 'Spartan'}
          rankId={globalRankId}
          rankName={globalRank.name}
          progress={globalProgress}
          onOpenRecord={() => setIsInfoOpen(true)}
          doubleXPActive={doubleXpStatus.active}
        />
        <HomeStatusRail items={homeStatusItems} />

        <div className="service-track-deck">
          {TRACKS.map((track) => {
            const progress = userDoc.tracks[track.key];
            const rank = getRankFromXP(progress.xp);

            return (
              <div key={track.key} className="service-track-slot min-h-0">
                <TrackCard
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
              </div>
            );
          })}
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
