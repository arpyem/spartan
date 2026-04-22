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

