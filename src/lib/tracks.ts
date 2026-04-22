import type { TrackKey } from '@/lib/types';

export interface TrackMeta {
  key: TrackKey;
  label: string;
  badgeKey: TrackKey;
  presets: Array<{
    key: string;
    label: string;
  }>;
}

export const TRACKS: TrackMeta[] = [
  {
    key: 'cardio',
    label: 'Cardio',
    badgeKey: 'cardio',
    presets: [
      { key: 'run', label: 'Run' },
      { key: 'bike', label: 'Bike' },
      { key: 'interval', label: 'Interval' },
    ],
  },
  {
    key: 'legs',
    label: 'Legs',
    badgeKey: 'legs',
    presets: [
      { key: 'squat', label: 'Squat' },
      { key: 'hinge', label: 'Hinge' },
      { key: 'unilateral', label: 'Unilateral' },
    ],
  },
  {
    key: 'push',
    label: 'Push',
    badgeKey: 'push',
    presets: [
      { key: 'bench', label: 'Bench' },
      { key: 'overhead', label: 'Overhead' },
      { key: 'dip', label: 'Dip' },
    ],
  },
  {
    key: 'pull',
    label: 'Pull',
    badgeKey: 'pull',
    presets: [
      { key: 'row', label: 'Row' },
      { key: 'pull-up', label: 'Pull-Up' },
      { key: 'curl', label: 'Curl' },
    ],
  },
  {
    key: 'core',
    label: 'Core',
    badgeKey: 'core',
    presets: [
      { key: 'plank', label: 'Plank' },
      { key: 'rotation', label: 'Rotation' },
      { key: 'carry', label: 'Carry' },
    ],
  },
];

const trackKeySet = new Set<TrackKey>(TRACKS.map((track) => track.key));

export function isTrackKey(value: string | undefined | null): value is TrackKey {
  return value !== undefined && value !== null && trackKeySet.has(value as TrackKey);
}

export const TRACKS_BY_KEY = Object.fromEntries(
  TRACKS.map((track) => [track.key, track]),
) as Record<TrackKey, TrackMeta>;
