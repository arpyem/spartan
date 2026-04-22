import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import {
  devLog,
  sanitizeErrorForDevLog,
  summarizeWorkoutStatsForDevLog,
} from '@/lib/dev-logging';
import { db } from '@/lib/firebase';
import type {
  TrackKey,
  WorkoutDoc,
  WorkoutStats,
  WorkoutTrackStats,
} from '@/lib/types';
import { TRACKS } from '@/lib/tracks';

export type WorkoutStatsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseWorkoutStatsResult {
  status: WorkoutStatsStatus;
  stats: WorkoutStats;
  error: Error | null;
}

function createEmptyTrackStats(): WorkoutTrackStats {
  return {
    workouts: 0,
    totalValue: 0,
    totalXp: 0,
  };
}

export function createEmptyWorkoutStats(): WorkoutStats {
  return {
    totalWorkouts: 0,
    totalXp: 0,
    byTrack: TRACKS.reduce<Record<TrackKey, WorkoutTrackStats>>((result, track) => {
      result[track.key] = createEmptyTrackStats();
      return result;
    }, {} as Record<TrackKey, WorkoutTrackStats>),
  };
}

function buildWorkoutStats(workouts: WorkoutDoc[]): WorkoutStats {
  return workouts.reduce<WorkoutStats>((result, workout) => {
    const currentTrack = result.byTrack[workout.track];
    currentTrack.workouts += 1;
    currentTrack.totalValue += workout.value;
    currentTrack.totalXp += workout.xpEarned;
    result.totalWorkouts += 1;
    result.totalXp += workout.xpEarned;
    return result;
  }, createEmptyWorkoutStats());
}

export function useWorkoutStats(uid?: string | null): UseWorkoutStatsResult {
  const [state, setState] = useState<UseWorkoutStatsResult>({
    status: uid ? 'loading' : 'idle',
    stats: createEmptyWorkoutStats(),
    error: null,
  });

  useEffect(() => {
    if (!uid) {
      setState({
        status: 'idle',
        stats: createEmptyWorkoutStats(),
        error: null,
      });
      return;
    }

    setState({
      status: 'loading',
      stats: createEmptyWorkoutStats(),
      error: null,
    });

    devLog.info('snapshot', 'workout_stats_subscribed', {
      uidSuffix: uid.slice(-6),
    });
    const workoutsRef = collection(doc(db, 'users', uid), 'workouts');
    const unsubscribe = onSnapshot(
      workoutsRef,
      (snapshot) => {
        const workouts = snapshot.docs.map(
          (workoutDoc) => workoutDoc.data() as WorkoutDoc,
        );
        const nextStats = buildWorkoutStats(workouts);
        devLog.debug('snapshot', 'workout_stats_snapshot_received', {
          uidSuffix: uid.slice(-6),
          workouts: snapshot.docs.length,
          summary: summarizeWorkoutStatsForDevLog(nextStats),
        });

        setState({
          status: 'ready',
          stats: nextStats,
          error: null,
        });
      },
      (error) => {
        devLog.error('snapshot', 'workout_stats_snapshot_failed', {
          uidSuffix: uid.slice(-6),
          error: sanitizeErrorForDevLog(error),
        });
        setState((currentState) => ({
          status: currentState.status === 'ready' ? 'ready' : 'error',
          stats: currentState.stats,
          error,
        }));
      },
    );

    return () => {
      devLog.debug('snapshot', 'workout_stats_unsubscribed', {
        uidSuffix: uid.slice(-6),
      });
      unsubscribe();
    };
  }, [uid]);

  return state;
}
