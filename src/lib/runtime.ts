import type { User as FirebaseUser } from 'firebase/auth';
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { readE2EScenario } from '@/lib/e2e';
import { getFirebaseServices } from '@/lib/firebase';
import {
  advanceTour as advanceTourWithFirestore,
  createInitialTracks,
  ensureUserDoc,
  logWorkout as logWorkoutWithFirestore,
} from '@/lib/firestore';
import type {
  AdvanceTourInput,
  AdvanceTourResult,
  AppUser,
  DoubleXPStatus,
  LogWorkoutInput,
  LogWorkoutResult,
  UserDoc,
  WorkoutDoc,
} from '@/lib/types';
import { getBaseXP, isDoubleXPWeekend } from '@/lib/xp';

export interface AppRuntime {
  getRedirectResult: () => Promise<AppUser | null>;
  onAuthStateChanged: (listener: (user: AppUser | null) => void) => () => void;
  signInWithGoogle: () => Promise<AppUser | null>;
  signOut: () => Promise<void>;
  ensureUserDoc: (user: AppUser) => Promise<boolean>;
  subscribeUserDoc: (
    uid: string,
    next: (userDoc: UserDoc | null) => void,
    error?: (error: Error) => void,
  ) => () => void;
  subscribeWorkouts: (
    uid: string,
    next: (workouts: WorkoutDoc[]) => void,
    error?: (error: Error) => void,
  ) => () => void;
  logWorkout: (input: LogWorkoutInput) => Promise<LogWorkoutResult>;
  advanceTour: (input: AdvanceTourInput) => Promise<AdvanceTourResult>;
  getDoubleXPStatusOverride: () => DoubleXPStatus | null;
}

function toAppUser(user: FirebaseUser | null | undefined): AppUser | null {
  if (!user) {
    return null;
  }

  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };
}

const productionRuntime: AppRuntime = {
  async getRedirectResult() {
    const { auth } = getFirebaseServices();
    const result = await getRedirectResult(auth);
    return toAppUser(result?.user);
  },
  onAuthStateChanged(listener) {
    const { auth } = getFirebaseServices();
    return onAuthStateChanged(auth, (user) => {
      listener(toAppUser(user));
    });
  },
  async signInWithGoogle() {
    const { auth, googleProvider } = getFirebaseServices();

    if (import.meta.env.DEV) {
      const result = await signInWithPopup(auth, googleProvider);
      return toAppUser(result.user);
    }

    await signInWithRedirect(auth, googleProvider);
    return null;
  },
  async signOut() {
    const { auth } = getFirebaseServices();
    await signOut(auth);
  },
  ensureUserDoc,
  subscribeUserDoc(uid, next, error) {
    const { db } = getFirebaseServices();
    const userRef = doc(db, 'users', uid);
    return onSnapshot(
      userRef,
      (snapshot) => {
        next(snapshot.exists() ? (snapshot.data() as UserDoc) : null);
      },
      error,
    );
  },
  subscribeWorkouts(uid, next, error) {
    const { db } = getFirebaseServices();
    const workoutsRef = collection(doc(db, 'users', uid), 'workouts');
    return onSnapshot(
      workoutsRef,
      (snapshot) => {
        next(snapshot.docs.map((workoutDoc) => workoutDoc.data() as WorkoutDoc));
      },
      error,
    );
  },
  logWorkout: logWorkoutWithFirestore,
  advanceTour: advanceTourWithFirestore,
  getDoubleXPStatusOverride() {
    return null;
  },
};

function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

function createDefaultUser(): AppUser {
  return {
    uid: 'spartan-117',
    displayName: 'Master Chief',
    email: 'chief@example.com',
    photoURL: 'https://example.com/chief.png',
  };
}

function createInitialUserDoc(user: AppUser): UserDoc {
  return {
    displayName: user.displayName ?? '',
    email: user.email ?? '',
    photoURL: user.photoURL ?? '',
    createdAt: new Date('2026-04-01T00:00:00.000Z').toISOString(),
    tracks: createInitialTracks(),
  };
}

type UserDocListener = (userDoc: UserDoc | null) => void;
type WorkoutListener = (workouts: WorkoutDoc[]) => void;

class E2EMockRuntime implements AppRuntime {
  private redirectResultConsumed = false;

  private readonly authListeners = new Set<(user: AppUser | null) => void>();

  private readonly userDocListeners = new Set<UserDocListener>();

  private readonly workoutListeners = new Set<WorkoutListener>();

  private currentUser: AppUser | null;

  private userDoc: UserDoc | null;

  private workouts: WorkoutDoc[];

  private nextWorkoutId = 1;

  constructor() {
    const scenario = readE2EScenario();
    const initialUser = scenario?.auth?.user ?? createDefaultUser();
    const status = scenario?.auth?.status ?? (scenario?.auth?.user ? 'signed_in' : 'signed_out');

    this.currentUser = status === 'signed_in' ? cloneValue(initialUser) : null;
    this.userDoc = scenario?.userDoc ? cloneValue(scenario.userDoc) : null;
    this.workouts = cloneValue(scenario?.workouts ?? []).map(({ id: _id, ...workout }) => workout);
    this.nextWorkoutId = (scenario?.workouts?.length ?? 0) + 1;
  }

  private getScenario() {
    return readE2EScenario() ?? {};
  }

  private createAuthUser() {
    const scenario = this.getScenario();
    return cloneValue(scenario.auth?.signInResult ?? scenario.auth?.user ?? createDefaultUser());
  }

  private emitAuthState() {
    this.authListeners.forEach((listener) => listener(this.currentUser ? cloneValue(this.currentUser) : null));
  }

  private emitUserDocState() {
    this.userDocListeners.forEach((listener) => listener(this.userDoc ? cloneValue(this.userDoc) : null));
  }

  private emitWorkoutState() {
    this.workoutListeners.forEach((listener) => listener(cloneValue(this.workouts)));
  }

  private assertUserDocExists() {
    if (!this.userDoc) {
      throw new Error('Missing user document in the E2E runtime.');
    }
  }

  async getRedirectResult() {
    if (this.redirectResultConsumed) {
      return null;
    }

    this.redirectResultConsumed = true;
    const result = this.getScenario().auth?.redirectResult ?? null;
    return result ? cloneValue(result) : null;
  }

  onAuthStateChanged(listener: (user: AppUser | null) => void) {
    this.authListeners.add(listener);
    listener(this.currentUser ? cloneValue(this.currentUser) : null);
    return () => {
      this.authListeners.delete(listener);
    };
  }

  async signInWithGoogle() {
    const scenario = this.getScenario();

    if (scenario.failures?.signIn) {
      throw new Error(scenario.failures.signIn);
    }

    this.currentUser = this.createAuthUser();
    this.emitAuthState();
    return cloneValue(this.currentUser);
  }

  async signOut() {
    const scenario = this.getScenario();

    if (scenario.failures?.signOut) {
      throw new Error(scenario.failures.signOut);
    }

    this.currentUser = null;
    this.emitAuthState();
  }

  async ensureUserDoc(user: AppUser) {
    const scenario = this.getScenario();

    if (scenario.failures?.bootstrap) {
      throw new Error(scenario.failures.bootstrap);
    }

    if (this.userDoc) {
      return false;
    }

    this.userDoc = createInitialUserDoc(user);
    this.emitUserDocState();
    return true;
  }

  subscribeUserDoc(_uid: string, next: (userDoc: UserDoc | null) => void) {
    this.userDocListeners.add(next);
    next(this.userDoc ? cloneValue(this.userDoc) : null);
    return () => {
      this.userDocListeners.delete(next);
    };
  }

  subscribeWorkouts(_uid: string, next: (workouts: WorkoutDoc[]) => void) {
    this.workoutListeners.add(next);
    next(cloneValue(this.workouts));
    return () => {
      this.workoutListeners.delete(next);
    };
  }

  async logWorkout(input: LogWorkoutInput) {
    const scenario = this.getScenario();

    if (scenario.failures?.logWorkout) {
      throw new Error(scenario.failures.logWorkout);
    }

    this.assertUserDocExists();

    const now = input.now ?? new Date();
    const baseXp = getBaseXP(input.track, input.value);
    const doubleXP = scenario.doubleXPStatus?.active ?? isDoubleXPWeekend(now);
    const xpEarned = doubleXP ? baseXp * 2 : baseXp;
    const xpBefore = input.currentTrack.xp;
    const xpAfter = xpBefore + xpEarned;
    const tourBefore = input.currentTrack.tour;
    const workoutDoc: WorkoutDoc = {
      track: input.track,
      value: input.value,
      xpEarned,
      doubleXP,
      note: input.note?.trim() ?? '',
      timestamp: now.toISOString(),
    };

    this.workouts = [...this.workouts, workoutDoc];
    this.userDoc = {
      ...this.userDoc!,
      tracks: {
        ...this.userDoc!.tracks,
        [input.track]: {
          ...this.userDoc!.tracks[input.track],
          xp: xpAfter,
        },
      },
    };

    this.emitUserDocState();
    this.emitWorkoutState();

    return {
      workoutId: `e2e-workout-${this.nextWorkoutId++}`,
      xpEarned,
      doubleXP,
      xpBefore,
      xpAfter,
      tourBefore,
      tourAfter: tourBefore,
      tourAdvanceAvailable: xpAfter >= 2000 && tourBefore < 5,
    };
  }

  async advanceTour(input: AdvanceTourInput): Promise<AdvanceTourResult> {
    const scenario = this.getScenario();

    if (scenario.failures?.advanceTour) {
      throw new Error(scenario.failures.advanceTour);
    }

    this.assertUserDocExists();

    if (input.currentTrack.xp < 2000) {
      throw new RangeError('Track has not reached the Tour advancement threshold.');
    }

    if (input.currentTrack.tour >= 5) {
      throw new RangeError('Track is already at the maximum Tour.');
    }

    const nextTour = (input.currentTrack.tour + 1) as AdvanceTourResult['nextTour'];

    this.userDoc = {
      ...this.userDoc!,
      tracks: {
        ...this.userDoc!.tracks,
        [input.track]: {
          xp: 0,
          tour: nextTour,
        },
      },
    };

    this.emitUserDocState();

    return {
      previousTour: input.currentTrack.tour,
      nextTour,
      xpBefore: input.currentTrack.xp,
      xpAfter: 0 as const,
    };
  }

  getDoubleXPStatusOverride() {
    return this.getScenario().doubleXPStatus ?? null;
  }
}

let e2eRuntime: AppRuntime | null = null;

export function getAppRuntime(): AppRuntime {
  if (readE2EScenario()) {
    if (!e2eRuntime) {
      e2eRuntime = new E2EMockRuntime();
    }

    return e2eRuntime!;
  }

  e2eRuntime = null;
  return productionRuntime;
}
