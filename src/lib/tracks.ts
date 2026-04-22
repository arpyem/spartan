import type { TrackKey } from '@/lib/types';

export interface TrackMeta {
  key: TrackKey;
  label: string;
  icon: string;
}

export const TRACKS: TrackMeta[] = [
  { key: 'cardio', label: 'Cardio', icon: '🫀' },
  { key: 'legs', label: 'Legs', icon: '🦵' },
  { key: 'push', label: 'Push', icon: '🫸' },
  { key: 'pull', label: 'Pull', icon: '🤜' },
  { key: 'core', label: 'Core', icon: '🧱' },
];

const trackKeySet = new Set<TrackKey>(TRACKS.map((track) => track.key));

export function isTrackKey(value: string | undefined | null): value is TrackKey {
  return value !== undefined && value !== null && trackKeySet.has(value as TrackKey);
}

export const TRACKS_BY_KEY = Object.fromEntries(
  TRACKS.map((track) => [track.key, track]),
) as Record<TrackKey, TrackMeta>;

