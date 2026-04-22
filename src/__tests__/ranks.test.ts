import {
  getGlobalRankIndex,
  getGlobalRankProgress,
  getNextRankXP,
  getRankFromXP,
  getRankProgress,
  getXpToNextRank,
  RANKS,
} from '@/lib/ranks';
import type { TracksMap } from '@/lib/types';

function createTracksMap(overrides: Partial<TracksMap> = {}): TracksMap {
  return {
    cardio: { xp: 0, tour: 1 },
    legs: { xp: 0, tour: 1 },
    push: { xp: 0, tour: 1 },
    pull: { xp: 0, tour: 1 },
    core: { xp: 0, tour: 1 },
    ...overrides,
  };
}

describe('getRankFromXP', () => {
  it('returns Recruit at 0 XP', () => {
    expect(getRankFromXP(0).name).toBe('Recruit');
  });

  it('returns Recruit at 1 XP', () => {
    expect(getRankFromXP(1).name).toBe('Recruit');
  });

  it('returns Apprentice at exactly 2 XP', () => {
    expect(getRankFromXP(2).name).toBe('Apprentice');
  });

  it('returns the top general title at exactly 2000 XP and above', () => {
    expect(getRankFromXP(2000).name).toBe('General (Grade 4) 5-Star General');
    expect(getRankFromXP(2500).name).toBe('General (Grade 4) 5-Star General');
  });

  it('handles every rank threshold boundary', () => {
    for (const [index, rank] of RANKS.entries()) {
      expect(getRankFromXP(rank.xpRequired)).toEqual(rank);

      if (index < RANKS.length - 1) {
        expect(getRankFromXP(RANKS[index + 1].xpRequired - 1)).toEqual(rank);
      }
    }
  });
});

describe('getNextRankXP', () => {
  it('returns the next threshold for mid-tier XP', () => {
    expect(getNextRankXP(105)).toBe(110);
  });

  it('returns null at max rank', () => {
    expect(getNextRankXP(2000)).toBeNull();
    expect(getNextRankXP(2500)).toBeNull();
  });
});

describe('getXpToNextRank', () => {
  it('returns the remaining XP inside a tier', () => {
    expect(getXpToNextRank(105)).toBe(5);
    expect(getXpToNextRank(40)).toBe(10);
  });

  it('returns null at max rank', () => {
    expect(getXpToNextRank(2000)).toBeNull();
    expect(getXpToNextRank(2500)).toBeNull();
  });
});

describe('getRankProgress', () => {
  it('returns 0 at the start of a tier', () => {
    expect(getRankProgress(100)).toBe(0);
  });

  it('returns correct midpoint percentage', () => {
    expect(getRankProgress(105)).toBe(50);
  });

  it('returns 100 at max rank', () => {
    expect(getRankProgress(2000)).toBe(100);
    expect(getRankProgress(2500)).toBe(100);
  });
});

describe('getGlobalRankIndex', () => {
  it('returns 0 when all tracks are at 0 XP', () => {
    expect(getGlobalRankIndex(createTracksMap())).toBe(0);
  });

  it('returns the floored average of mixed track ranks', () => {
    const tracks = createTracksMap({
      cardio: { xp: 2, tour: 1 },
      legs: { xp: 10, tour: 1 },
      push: { xp: 100, tour: 1 },
      pull: { xp: 500, tour: 1 },
      core: { xp: 0, tour: 1 },
    });

    expect(getGlobalRankIndex(tracks)).toBe(Math.floor((1 + 6 + 18 + 38 + 0) / 5));
  });
});

describe('getGlobalRankProgress', () => {
  it('returns 0 when all tracks are at the start of their tiers', () => {
    expect(getGlobalRankProgress(createTracksMap())).toBe(0);
  });

  it('returns the averaged fractional remainder across mixed track progress', () => {
    const tracks = createTracksMap({
      cardio: { xp: 2, tour: 1 },
      legs: { xp: 11, tour: 1 },
      push: { xp: 105, tour: 1 },
      pull: { xp: 500, tour: 1 },
      core: { xp: 0, tour: 1 },
    });

    expect(getGlobalRankProgress(tracks)).toBe(80);
  });

  it('returns 100 when every track is at max rank', () => {
    const tracks = createTracksMap({
      cardio: { xp: 2000, tour: 1 },
      legs: { xp: 2000, tour: 1 },
      push: { xp: 2000, tour: 1 },
      pull: { xp: 2000, tour: 1 },
      core: { xp: 2000, tour: 1 },
    });

    expect(getGlobalRankProgress(tracks)).toBe(100);
  });
});
