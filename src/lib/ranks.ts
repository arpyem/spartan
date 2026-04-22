import type { Rank, TracksMap } from '@/lib/types';

export const RANKS: Rank[] = [
  { id: 0, name: 'Recruit', xpRequired: 0 },
  { id: 1, name: 'Apprentice', xpRequired: 2 },
  { id: 2, name: 'Apprentice G2', xpRequired: 3 },
  { id: 3, name: 'Private', xpRequired: 4 },
  { id: 4, name: 'Private G2', xpRequired: 5 },
  { id: 5, name: 'Corporal', xpRequired: 7 },
  { id: 6, name: 'Corporal G2', xpRequired: 10 },
  { id: 7, name: 'Sergeant', xpRequired: 12 },
  { id: 8, name: 'Sergeant G2', xpRequired: 15 },
  { id: 9, name: 'Sergeant G3', xpRequired: 20 },
  { id: 10, name: 'Gunnery Sergeant', xpRequired: 25 },
  { id: 11, name: 'Gunnery Sergeant G2', xpRequired: 30 },
  { id: 12, name: 'Gunnery Sergeant G3', xpRequired: 35 },
  { id: 13, name: 'Master Gunnery Sgt', xpRequired: 40 },
  { id: 14, name: 'Lieutenant', xpRequired: 50 },
  { id: 15, name: 'Lieutenant G2', xpRequired: 60 },
  { id: 16, name: 'Lieutenant G3', xpRequired: 70 },
  { id: 17, name: 'First Lieutenant', xpRequired: 80 },
  { id: 18, name: 'Captain', xpRequired: 100 },
  { id: 19, name: 'Captain G2', xpRequired: 110 },
  { id: 20, name: 'Captain G3', xpRequired: 120 },
  { id: 21, name: 'Staff Captain', xpRequired: 135 },
  { id: 22, name: 'Major', xpRequired: 150 },
  { id: 23, name: 'Major G2', xpRequired: 160 },
  { id: 24, name: 'Major G3', xpRequired: 170 },
  { id: 25, name: 'Field Major', xpRequired: 185 },
  { id: 26, name: 'Commander', xpRequired: 200 },
  { id: 27, name: 'Commander G2', xpRequired: 225 },
  { id: 28, name: 'Commander G3', xpRequired: 250 },
  { id: 29, name: 'Strike Commander', xpRequired: 275 },
  { id: 30, name: 'Colonel', xpRequired: 300 },
  { id: 31, name: 'Colonel G2', xpRequired: 325 },
  { id: 32, name: 'Colonel G3', xpRequired: 350 },
  { id: 33, name: 'Force Colonel', xpRequired: 375 },
  { id: 34, name: 'Brigadier', xpRequired: 400 },
  { id: 35, name: 'Brigadier G2', xpRequired: 425 },
  { id: 36, name: 'Brigadier G3', xpRequired: 450 },
  { id: 37, name: 'Brigadier General', xpRequired: 475 },
  { id: 38, name: 'General', xpRequired: 500 },
  { id: 39, name: 'General G2', xpRequired: 1000 },
  { id: 40, name: 'General G3', xpRequired: 1500 },
  { id: 41, name: '5-Star General', xpRequired: 2000 },
];

function normalizeXp(xp: number) {
  return Math.max(0, xp);
}

export function getRankFromXP(xp: number): Rank {
  const normalizedXp = normalizeXp(xp);
  let currentRank = RANKS[0];

  for (const rank of RANKS) {
    if (normalizedXp >= rank.xpRequired) {
      currentRank = rank;
      continue;
    }

    break;
  }

  return currentRank;
}

export function getNextRankXP(xp: number): number | null {
  const normalizedXp = normalizeXp(xp);
  const nextRank = RANKS.find((rank) => rank.xpRequired > normalizedXp);

  return nextRank?.xpRequired ?? null;
}

export function getRankProgress(xp: number): number {
  const normalizedXp = normalizeXp(xp);
  const currentRank = getRankFromXP(normalizedXp);
  const nextRankXp = getNextRankXP(normalizedXp);

  if (nextRankXp === null) {
    return 100;
  }

  const tierSize = nextRankXp - currentRank.xpRequired;
  const tierProgress = normalizedXp - currentRank.xpRequired;

  return Math.floor((tierProgress / tierSize) * 100);
}

export function getGlobalRankIndex(tracks: TracksMap): number {
  const totalRankIndex = Object.values(tracks).reduce((sum, track) => {
    return sum + getRankFromXP(track.xp).id;
  }, 0);

  return Math.floor(totalRankIndex / Object.values(tracks).length);
}
