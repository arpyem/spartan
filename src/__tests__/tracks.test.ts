import { TRACKS, isTrackKey } from '@/lib/tracks';

describe('track metadata', () => {
  it('exposes the canonical track order', () => {
    expect(TRACKS.map((track) => track.key)).toEqual([
      'cardio',
      'legs',
      'push',
      'pull',
      'core',
    ]);
  });

  it('accepts valid track keys and rejects invalid values', () => {
    expect(isTrackKey('cardio')).toBe(true);
    expect(isTrackKey('pull')).toBe(true);
    expect(isTrackKey('arms')).toBe(false);
    expect(isTrackKey(undefined)).toBe(false);
  });
});

