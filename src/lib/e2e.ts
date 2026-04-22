import type { AppUser, DoubleXPStatus, UserDoc, WorkoutDoc } from '@/lib/types';

export interface SeededWorkoutDoc extends WorkoutDoc {
  id?: string;
}

export interface SpartanE2EFailures {
  bootstrap?: string | null;
  logWorkout?: string | null;
  advanceTour?: string | null;
  signIn?: string | null;
  signOut?: string | null;
}

export interface SpartanE2EAuthScenario {
  status?: 'signed_out' | 'signed_in';
  user?: AppUser | null;
  redirectResult?: AppUser | null;
  signInResult?: AppUser | null;
}

export interface SpartanE2EScenario {
  auth?: SpartanE2EAuthScenario;
  userDoc?: UserDoc | null;
  workouts?: SeededWorkoutDoc[];
  doubleXPStatus?: DoubleXPStatus;
  failures?: SpartanE2EFailures;
}

export interface SpartanE2EControls {
  getScenario: () => SpartanE2EScenario;
  setScenario: (scenario: SpartanE2EScenario) => void;
}

declare global {
  interface Window {
    __SPARTAN_E2E__?: SpartanE2EControls;
  }
}

function hasWindow() {
  return typeof window !== 'undefined';
}

export function hasE2EControls() {
  return hasWindow() && Boolean(window.__SPARTAN_E2E__);
}

export function readE2EScenario(): SpartanE2EScenario | null {
  if (!hasE2EControls()) {
    return null;
  }

  return window.__SPARTAN_E2E__?.getScenario() ?? null;
}
