import type { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  AdvanceTourInput,
  AdvanceTourResult,
  LogWorkoutInput,
  LogWorkoutResult,
  TourLevel,
  TracksMap,
  UserDoc,
  WorkoutDoc,
} from '@/lib/types';
import { TRACKS } from '@/lib/tracks';
import { calculateXP, isDoubleXPWeekend } from '@/lib/xp';

export function createInitialTracks(): TracksMap {
  return TRACKS.reduce<TracksMap>((tracks, track) => {
    tracks[track.key] = { xp: 0, tour: 1 };
    return tracks;
  }, {} as TracksMap);
}

function getUserRef(uid: string) {
  return doc(db, 'users', uid);
}

function normalizeNote(note?: string | null) {
  return note?.trim() ?? '';
}

export async function ensureUserDoc(user: User): Promise<boolean> {
  const userRef = getUserRef(user.uid);
  const existingUser = await getDoc(userRef);

  if (existingUser.exists()) {
    return false;
  }

  const nextUserDoc: UserDoc = {
    displayName: user.displayName ?? '',
    email: user.email ?? '',
    photoURL: user.photoURL ?? '',
    createdAt: serverTimestamp(),
    tracks: createInitialTracks(),
  };

  await setDoc(userRef, nextUserDoc);

  return true;
}

export async function logWorkout(
  input: LogWorkoutInput,
): Promise<LogWorkoutResult> {
  const timestamp = input.now ?? new Date();
  const xpEarned = calculateXP(input.track, input.value, timestamp);
  const doubleXP = isDoubleXPWeekend(timestamp);
  const xpBefore = input.currentTrack.xp;
  const xpAfter = xpBefore + xpEarned;
  const tourBefore = input.currentTrack.tour;
  const note = normalizeNote(input.note);
  const userRef = getUserRef(input.uid);
  const workoutsRef = collection(userRef, 'workouts');
  const workoutRef = doc(workoutsRef);
  const workoutDoc: WorkoutDoc = {
    track: input.track,
    value: input.value,
    xpEarned,
    doubleXP,
    note,
    timestamp: serverTimestamp(),
  };

  const batch = writeBatch(db);
  batch.set(workoutRef, workoutDoc);
  batch.update(userRef, {
    [`tracks.${input.track}.xp`]: increment(xpEarned),
  });
  await batch.commit();

  return {
    workoutId: workoutRef.id,
    xpEarned,
    doubleXP,
    xpBefore,
    xpAfter,
    tourBefore,
    tourAfter: tourBefore,
    tourAdvanceAvailable: xpAfter >= 2000 && tourBefore < 5,
  };
}

function toNextTour(currentTour: TourLevel): TourLevel {
  return (currentTour + 1) as TourLevel;
}

export async function advanceTour(
  input: AdvanceTourInput,
): Promise<AdvanceTourResult> {
  if (input.currentTrack.xp < 2000) {
    throw new RangeError('Track has not reached the Tour advancement threshold.');
  }

  if (input.currentTrack.tour >= 5) {
    throw new RangeError('Track is already at the maximum Tour.');
  }

  const nextTour = toNextTour(input.currentTrack.tour);
  const userRef = getUserRef(input.uid);
  const batch = writeBatch(db);

  batch.update(userRef, {
    [`tracks.${input.track}.xp`]: 0,
    [`tracks.${input.track}.tour`]: nextTour,
  });
  await batch.commit();

  return {
    previousTour: input.currentTrack.tour,
    nextTour,
    xpBefore: input.currentTrack.xp,
    xpAfter: 0,
  };
}
