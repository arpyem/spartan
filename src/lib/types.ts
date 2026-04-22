export type TrackKey = 'cardio' | 'legs' | 'push' | 'pull' | 'core';
export type TourLevel = 1 | 2 | 3 | 4 | 5;

export interface TrackProgress {
  xp: number;
  tour: TourLevel;
}

export type TracksMap = Record<TrackKey, TrackProgress>;

export interface Rank {
  id: number;
  name: string;
  xpRequired: number;
}

export interface DoubleXPStatus {
  active: boolean;
  upcoming: boolean;
}

export interface WorkoutTrackStats {
  workouts: number;
  totalValue: number;
  totalXp: number;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalXp: number;
  byTrack: Record<TrackKey, WorkoutTrackStats>;
}

export interface UserDoc {
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: unknown;
  tracks: TracksMap;
}

export interface WorkoutDoc {
  track: TrackKey;
  value: number;
  xpEarned: number;
  doubleXP: boolean;
  note: string;
  timestamp: unknown;
}

export interface RankUpEvent {
  track: TrackKey;
  previousRankId: number;
  nextRankId: number;
  xpBefore: number;
  xpAfter: number;
}

export interface TourAdvanceEvent {
  track: TrackKey;
  previousTour: TourLevel;
  nextTour: TourLevel;
}

export interface LogWorkoutInput {
  uid: string;
  track: TrackKey;
  value: number;
  note?: string | null;
  currentTrack: TrackProgress;
  now?: Date;
}

export interface LogWorkoutResult {
  workoutId: string;
  xpEarned: number;
  doubleXP: boolean;
  xpBefore: number;
  xpAfter: number;
  tourBefore: TourLevel;
  tourAfter: TourLevel;
  tourAdvanceAvailable: boolean;
}

export interface AdvanceTourInput {
  uid: string;
  track: TrackKey;
  currentTrack: TrackProgress;
}

export interface AdvanceTourResult {
  previousTour: TourLevel;
  nextTour: TourLevel;
  xpBefore: number;
  xpAfter: 0;
}
