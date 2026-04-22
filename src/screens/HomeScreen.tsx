import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoubleXPBanner } from '@/components/DoubleXPBanner';
import { GlobalRank } from '@/components/GlobalRank';
import { InfoModal } from '@/components/InfoModal';
import { TrackCard } from '@/components/TrackCard';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useDoubleXP } from '@/hooks/useDoubleXP';
import { useUserData } from '@/hooks/useUserData';
import { useWorkoutStats } from '@/hooks/useWorkoutStats';
import {
  RANKS,
  getGlobalRankIndex,
  getGlobalRankProgress,
  getRankFromXP,
  getRankProgress,
} from '@/lib/ranks';
import { TRACKS } from '@/lib/tracks';

export function HomeScreen() {
  const navigate = useNavigate();
  const { busyAction, error, signOutUser, user } = useAuthSession();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const doubleXpStatus = useDoubleXP();
  const userData = useUserData(user?.uid);
  const workoutStats = useWorkoutStats(user?.uid);

  if (userData.status === 'loading' || workoutStats.status === 'loading') {
    return (
      <section className="space-y-6 pt-4">
        <div className="panel p-5">
          <p className="hud-kicker font-hud text-[0.65rem]">Syncing</p>
          <h2 className="font-display mt-3 text-2xl font-bold tracking-[0.12em] text-white">
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
      <section className="space-y-6 pt-4">
        <div className="panel p-5">
          <p className="hud-kicker font-hud text-[0.65rem]">Sync issue</p>
          <h2 className="font-display mt-3 text-2xl font-bold tracking-[0.12em] text-white">
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
    return (
      <section className="space-y-6 pt-4">
        <div className="panel p-5">
          <p className="hud-kicker font-hud text-[0.65rem]">Awaiting bootstrap</p>
          <h2 className="font-display mt-3 text-2xl font-bold tracking-[0.12em] text-white">
            Preparing your Spartan profile
          </h2>
        </div>
      </section>
    );
  }

  const userDoc = userData.userDoc;
  const globalRankId = getGlobalRankIndex(userDoc.tracks);
  const globalRank = RANKS[globalRankId];
  const globalProgress = getGlobalRankProgress(userDoc.tracks);

  return (
    <>
      <section className="space-y-6 pt-4">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="hud-kicker font-hud text-[0.65rem]">Spartan gains</p>
            <h1 className="font-display mt-2 text-2xl font-bold tracking-[0.16em] text-white">
              Field Deck
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setIsInfoOpen(true)}
            className="focus-shell rounded-full border border-white/10 px-3 py-2 text-sm uppercase tracking-[0.22em] text-[var(--color-steel)]"
            aria-label="Open service record"
          >
            Info
          </button>
        </header>

        <GlobalRank
          rankId={globalRankId}
          rankName={globalRank.name}
          progress={globalProgress}
          doubleXPActive={doubleXpStatus.active}
        />

        <div className="grid gap-3">
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
                doubleXPActive={doubleXpStatus.active}
                tourAdvanceAvailable={progress.xp >= 2000 && progress.tour < 5}
                onSelect={() => navigate(`/log/${track.key}`)}
              />
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="panel rounded-[1.6rem] p-4">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-white">
              Log workout
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              Pick one of the track cards above to enter a workout for that training
              lane.
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
        onClose={() => setIsInfoOpen(false)}
        onSignOut={signOutUser}
      />
    </>
  );
}
