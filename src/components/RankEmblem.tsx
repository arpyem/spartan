import { useId } from 'react';
import type { ReactNode } from 'react';
import type { TourLevel } from '@/lib/types';
import { ShieldBackground } from '@/components/ShieldBackground';

interface RankEmblemProps {
  rankId: number;
  tour: TourLevel;
  size?: number;
}

interface RankPalette {
  plate: string;
  plateInner: string;
}

const rankAssetModules = import.meta.glob('../assets/ranks/H3_Rank_*.svg', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const rankAssetUrls = Object.fromEntries(
  Object.entries(rankAssetModules).map(([path, url]) => [path.split('/').pop() ?? path, url]),
) as Record<string, string>;

const RANK_ASSET_FILES = [
  'H3_Rank_Recruit_Icon.svg',
  'H3_Rank_Apprentice_Icon.svg',
  'H3_Rank_Apprentice_G2_Icon.svg',
  'H3_Rank_Private_Icon.svg',
  'H3_Rank_Private_G2_Icon.svg',
  'H3_Rank_Corporal_Icon.svg',
  'H3_Rank_Corporal_G2_Icon.svg',
  'H3_Rank_Sergeant_Icon.svg',
  'H3_Rank_Sergeant_G2_Icon.svg',
  'H3_Rank_Sergeant_G3_Icon.svg',
  'H3_Rank_GSgt_Icon.svg',
  'H3_Rank_GSgt_G2_Icon.svg',
  'H3_Rank_GSgt_G3_Icon.svg',
  'H3_Rank_GSgt_G4_Icon.svg',
  'H3_Rank_Lt_Icon.svg',
  'H3_Rank_Lt_G2_Icon.svg',
  'H3_Rank_Lt_G3_Icon.svg',
  'H3_Rank_Lt_G4_Icon.svg',
  'H3_Rank_Captain_Icon.svg',
  'H3_Rank_Captain_G2_Icon.svg',
  'H3_Rank_Captain_G3_Icon.svg',
  'H3_Rank_Captain_G4_Icon.svg',
  'H3_Rank_Major_Icon.svg',
  'H3_Rank_Major_G2_Icon.svg',
  'H3_Rank_Major_G3_Icon.svg',
  'H3_Rank_Major_G4_Icon.svg',
  'H3_Rank_Cmdr_Icon.svg',
  'H3_Rank_Cmdr_G2_Icon.svg',
  'H3_Rank_Cmdr_G3_Icon.svg',
  'H3_Rank_Cmdr_G4_Icon.svg',
  'H3_Rank_Colonel_Icon.svg',
  'H3_Rank_Colonel_G2_Icon.svg',
  'H3_Rank_Colonel_G3_Icon.svg',
  'H3_Rank_Colonel_G4_Icon.svg',
  'H3_Rank_Brigadier_Icon.svg',
  'H3_Rank_Brigadier_G2_Icon.svg',
  'H3_Rank_Brigadier_G3_Icon.svg',
  'H3_Rank_Brigadier_G4_Icon.svg',
  'H3_Rank_General_Icon.svg',
  'H3_Rank_General_G2_Icon.svg',
  'H3_Rank_General_G3_Icon.svg',
  'H3_Rank_General_G4_Icon.svg',
] as const;

function clampRankId(rankId: number) {
  return Math.max(0, Math.min(41, rankId));
}

function getPalette(rankId: number): RankPalette {
  if (rankId >= 38) {
    return {
      plate: '#231a09',
      plateInner: '#4d3810',
    };
  }

  if (rankId >= 14) {
    return {
      plate: '#152235',
      plateInner: '#324765',
    };
  }

  return {
    plate: '#291f0c',
    plateInner: '#5a3a0d',
  };
}

function getRankAssetUrl(rankId: number) {
  const filename = RANK_ASSET_FILES[rankId];
  return filename ? rankAssetUrls[filename] : undefined;
}

function getStageMetrics(tour: TourLevel) {
  if (tour > 1) {
    return {
      plateCx: 50,
      plateCy: 49,
      plateRx: 23.5,
      plateRy: 23,
      glyphX: 24,
      glyphY: 22,
      glyphSize: 52,
    };
  }

  return {
    plateCx: 50,
    plateCy: 49.5,
    plateRx: 25.5,
    plateRy: 24.75,
    glyphX: 22.5,
    glyphY: 21.5,
    glyphSize: 55,
  };
}

function renderRankGlyph(rankId: number, metrics: ReturnType<typeof getStageMetrics>): ReactNode {
  const rankAssetUrl = getRankAssetUrl(rankId);

  if (!rankAssetUrl) {
    return null;
  }

  return (
    <image
      href={rankAssetUrl}
      x={metrics.glyphX}
      y={metrics.glyphY}
      width={metrics.glyphSize}
      height={metrics.glyphSize}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}

export function RankEmblem({ rankId, tour, size = 72 }: RankEmblemProps) {
  const normalizedRankId = clampRankId(rankId);
  const palette = getPalette(normalizedRankId);
  const gradientId = useId().replace(/:/g, '-');
  const metrics = getStageMetrics(tour);
  const backlightOpacity = size >= 96 ? 0.32 : 0.24;

  return (
    <span
      className="rank-emblem-shell"
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
    >
      <span
        className="rank-emblem-backlight"
        style={{
          backgroundColor: palette.plateInner,
          boxShadow: `0 0 18px 8px ${palette.plate}`,
          opacity: backlightOpacity,
        }}
      />
      <svg
        data-testid="rank-emblem"
        data-rank-id={normalizedRankId}
        data-tour={tour}
        data-shield={tour > 1 ? 'on' : 'off'}
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="rank-emblem-svg"
      >
        <defs>
          <radialGradient id={`rank-emblem-plate-${gradientId}`} cx="50%" cy="42%" r="68%">
            <stop offset="0%" stopColor={palette.plateInner} />
            <stop offset="55%" stopColor={palette.plate} />
            <stop offset="100%" stopColor={palette.plate} stopOpacity="0.92" />
          </radialGradient>
        </defs>

        <ShieldBackground tour={tour} />

        <ellipse
          data-testid="rank-emblem-plate"
          cx={metrics.plateCx}
          cy={metrics.plateCy}
          rx={metrics.plateRx}
          ry={metrics.plateRy}
          fill={`url(#rank-emblem-plate-${gradientId})`}
          opacity="0.9"
        />
        <g data-testid="rank-emblem-glyph">
          {renderRankGlyph(normalizedRankId, metrics)}
        </g>
      </svg>
    </span>
  );
}
