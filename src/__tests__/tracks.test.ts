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

  it('maps each track to a stable local badge key', () => {
    expect(TRACKS.map((track) => track.badgeKey)).toEqual([
      'cardio',
      'legs',
      'push',
      'pull',
      'core',
    ]);
  });

  it('provides stable preset keys for each track', () => {
    expect(TRACKS.find((track) => track.key === 'cardio')?.presets.map((preset) => preset.key)).toEqual([
      'run',
      'bike',
      'interval',
    ]);
    expect(TRACKS.find((track) => track.key === 'core')?.presets.map((preset) => preset.key)).toEqual([
      'plank',
      'rotation',
      'carry',
    ]);
  });
});
