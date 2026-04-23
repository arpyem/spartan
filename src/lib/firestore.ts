import {
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { devLog, sanitizeErrorForDevLog, summarizeTrackProgressForDevLog } from '@/lib/dev-logging';
import { getFirebaseServices } from '@/lib/firebase';
import type {
  AdvanceTourInput,
  AdvanceTourResult,
  AppUser,
  LogWorkoutInput,
  LogWorkoutResult,
  TracksMap,
  UserDoc,
  WorkoutDoc,
} from '@/lib/types';
import { TRACKS } from '@/lib/tracks';
import { TOUR_ADVANCEMENT_XP, canAdvanceTour, getNextTourLevel, MAX_TOUR_LEVEL } from '@/lib/tours';
import { calculateXP, isDoubleXPWeekend } from '@/lib/xp';

export function createInitialTracks(): TracksMap {
  return TRACKS.reduce<TracksMap>((tracks, track) => {
    tracks[track.key] = { xp: 0, tour: 1 };
    return tracks;
  }, {} as TracksMap);
}

function getUserRef(uid: string) {
  const { db } = getFirebaseServices();
  return doc(db, 'users', uid);
}

function normalizeNote(note?: string | null) {
  return note?.trim() ?? '';
}

export async function ensureUserDoc(user: AppUser): Promise<boolean> {
  const userRef = getUserRef(user.uid);
  const existingUser = await getDoc(userRef);

  if (existingUser.exists()) {
    devLog.debug('auth', 'ensure_user_doc_skipped', {
      uidSuffix: user.uid.slice(-6),
      reason: 'already_exists',
    });
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
  devLog.info('auth', 'ensure_user_doc_created', {
    uidSuffix: user.uid.slice(-6),
  });

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

  const { db } = getFirebaseServices();
  const batch = writeBatch(db);
  batch.set(workoutRef, workoutDoc);
  batch.update(userRef, {
    [`tracks.${input.track}.xp`]: increment(xpEarned),
  });
  devLog.debug('write', 'log_workout_batch_commit_started', {
    track: input.track,
    uidSuffix: input.uid.slice(-6),
    value: input.value,
    currentTrack: summarizeTrackProgressForDevLog(input.currentTrack),
    xpEarned,
  });

  try {
    await batch.commit();
  } catch (error) {
    devLog.error('write', 'log_workout_batch_commit_failed', {
      track: input.track,
      uidSuffix: input.uid.slice(-6),
      error: sanitizeErrorForDevLog(error),
    });
    throw error;
  }

  devLog.info('write', 'log_workout_batch_commit_succeeded', {
    track: input.track,
    uidSuffix: input.uid.slice(-6),
    workoutId: workoutRef.id,
    xpBefore,
    xpAfter,
    tourBefore,
  });

  return {
    workoutId: workoutRef.id,
    xpEarned,
    doubleXP,
    xpBefore,
    xpAfter,
    tourBefore,
    tourAfter: tourBefore,
    tourAdvanceAvailable: canAdvanceTour({ xp: xpAfter, tour: tourBefore }),
  };
}

export async function advanceTour(
  input: AdvanceTourInput,
): Promise<AdvanceTourResult> {
  if (input.currentTrack.xp < TOUR_ADVANCEMENT_XP) {
    throw new RangeError('Track has not reached the Tour advancement threshold.');
  }

  if (input.currentTrack.tour >= MAX_TOUR_LEVEL) {
    throw new RangeError('Track is already at the maximum Tour.');
  }

  const nextTour = getNextTourLevel(input.currentTrack.tour);
  const userRef = getUserRef(input.uid);
  const { db } = getFirebaseServices();
  const batch = writeBatch(db);

  batch.update(userRef, {
    [`tracks.${input.track}.xp`]: 0,
    [`tracks.${input.track}.tour`]: nextTour,
  });
  devLog.debug('write', 'advance_tour_batch_commit_started', {
    track: input.track,
    uidSuffix: input.uid.slice(-6),
    currentTrack: summarizeTrackProgressForDevLog(input.currentTrack),
    nextTour,
  });

  try {
    await batch.commit();
  } catch (error) {
    devLog.error('write', 'advance_tour_batch_commit_failed', {
      track: input.track,
      uidSuffix: input.uid.slice(-6),
      error: sanitizeErrorForDevLog(error),
    });
    throw error;
  }

  devLog.info('write', 'advance_tour_batch_commit_succeeded', {
    track: input.track,
    uidSuffix: input.uid.slice(-6),
    previousTour: input.currentTrack.tour,
    nextTour,
  });

  return {
    previousTour: input.currentTrack.tour,
    nextTour,
    xpBefore: input.currentTrack.xp,
    xpAfter: 0,
  };
}
