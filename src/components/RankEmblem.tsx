import { useId } from 'react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { TourLevel } from '@/lib/types';
import { ShieldBackground } from '@/components/ShieldBackground';

interface RankEmblemProps {
  rankId: number;
  tour: TourLevel;
  size?: number;
}

interface RankPalette {
  primary: string;
  secondary: string;
  highlight: string;
  shadow: string;
  plate: string;
}

type ChevronConfig = {
  major: number;
  minor: number;
  notch?: boolean;
};

type PlateConfig = {
  pips: Array<[number, number]>;
  whiteBars: number;
  goldBars: number;
};

function clampRankId(rankId: number) {
  return Math.max(0, Math.min(41, rankId));
}

function getPalette(rankId: number): RankPalette {
  if (rankId >= 38) {
    return {
      primary: '#e3b446',
      secondary: '#b17b1e',
      highlight: '#fff4b2',
      shadow: '#6f4c0a',
      plate: '#231a09',
    };
  }

  if (rankId >= 14) {
    return {
      primary: '#e4ebf7',
      secondary: '#a7b6ca',
      highlight: '#ffffff',
      shadow: '#71829f',
      plate: '#152235',
    };
  }

  return {
    primary: '#ffd24f',
    secondary: '#d39220',
    highlight: '#fff7bb',
    shadow: '#8a5f12',
    plate: '#291f0c',
  };
}

function diamondPath(cx: number, cy: number, width: number, height: number) {
  return `M ${cx} ${cy - height / 2} L ${cx + width / 2} ${cy} L ${cx} ${cy + height / 2} L ${cx - width / 2} ${cy} Z`;
}

function starPath(cx: number, cy: number, outer: number, inner: number, points = 5) {
  const commands: string[] = [];
  const step = Math.PI / points;

  for (let index = 0; index < points * 2; index += 1) {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + index * step;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    commands.push(`${index === 0 ? 'M' : 'L'} ${x} ${y}`);
  }

  commands.push('Z');
  return commands.join(' ');
}

function chevronPath(cx: number, y: number, width: number, height: number, thickness: number) {
  const left = cx - width / 2;
  const right = cx + width / 2;
  const innerLeft = left + thickness;
  const innerRight = right - thickness;
  const tipY = y + height;

  return [
    `M ${left} ${y}`,
    `L ${cx} ${tipY}`,
    `L ${right} ${y}`,
    `L ${right - thickness * 0.9} ${y}`,
    `L ${cx} ${tipY - thickness}`,
    `L ${left + thickness * 0.9} ${y}`,
    'Z',
  ].join(' ');
}

function renderMetalShape({
  d,
  palette,
  fill,
  strokeWidth = 1.2,
  transform,
}: {
  d: string;
  palette: RankPalette;
  fill?: string;
  strokeWidth?: number;
  transform?: string;
}) {
  return (
    <path
      d={d}
      transform={transform}
      fill={fill ?? palette.primary}
      stroke={palette.highlight}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  );
}

function renderDiamondRanks(rankId: number, palette: RankPalette) {
  const lowerDiamond = rankId === 2;

  return (
    <>
      {renderMetalShape({
        d: diamondPath(50, 34, 24, 24),
        palette,
        fill: 'none',
        strokeWidth: 3.3,
      })}
      {rankId >= 1 ? (
        renderMetalShape({
          d: diamondPath(50, 34, 12, 12),
          palette,
          fill: palette.plate,
          strokeWidth: 1.1,
        })
      ) : null}
      {lowerDiamond ? (
        renderMetalShape({
          d: diamondPath(50, 52, 9, 9),
          palette,
          strokeWidth: 1,
        })
      ) : null}
    </>
  );
}

function renderChevrons(config: ChevronConfig, palette: RankPalette) {
  const majorStartY = 25 + Math.max(0, 4 - config.major) * 5;
  const majorWidth = config.major >= 4 ? 30 : config.major >= 3 ? 28 : 24;

  return (
    <>
      {Array.from({ length: config.major }).map((_, index) => (
        <g key={`major-${index}`}>
          {renderMetalShape({
            d: chevronPath(50, majorStartY + index * 9, majorWidth, 7.5, 4.1),
            palette,
          })}
        </g>
      ))}
      {Array.from({ length: config.minor }).map((_, index) => (
        <g key={`minor-${index}`}>
          {renderMetalShape({
            d: chevronPath(50, 61 + index * 6, 18 + index * 2, 5.5, 3.2),
            palette,
            strokeWidth: 0.9,
          })}
        </g>
      ))}
      {config.notch ? (
        <path
          d={diamondPath(50, 77, 9, 9)}
          fill={palette.plate}
          stroke={palette.highlight}
          strokeWidth="1"
        />
      ) : null}
    </>
  );
}

function renderRibbonBars(
  count: number,
  tone: 'white' | 'gold',
  palette: RankPalette,
) {
  const fill = tone === 'gold' ? palette.primary : palette.primary;
  const secondary = tone === 'gold' ? palette.secondary : palette.shadow;

  return Array.from({ length: count }).map((_, index) => (
    <g key={`${tone}-${index}`}>
      <rect
        x="38"
        y={65 + index * 5}
        width="24"
        height="3.6"
        rx="1.2"
        fill={fill}
        stroke={palette.highlight}
        strokeWidth="0.8"
      />
      <rect
        x="38.8"
        y={65.6 + index * 5}
        width="22.4"
        height="1.2"
        rx="0.6"
        fill={secondary}
        opacity="0.55"
      />
    </g>
  ));
}

function renderSinglePlate(config: PlateConfig, palette: RankPalette) {
  return (
    <>
      <rect
        x="40"
        y="20"
        width="20"
        height="40"
        rx="2.4"
        fill={palette.primary}
        stroke={palette.highlight}
        strokeWidth="1.4"
      />
      <rect
        x="42.2"
        y="22.2"
        width="15.6"
        height="4.2"
        rx="1.3"
        fill={palette.highlight}
        opacity="0.34"
      />
      {config.pips.map(([x, y], index) => (
        <path
          key={`single-pip-${index}`}
          d={diamondPath(x, y, 5.2, 7)}
          fill={palette.plate}
          stroke={palette.shadow}
          strokeWidth="0.8"
        />
      ))}
      {renderRibbonBars(config.whiteBars, 'white', palette)}
      {renderRibbonBars(config.goldBars, 'gold', palette)}
    </>
  );
}

function renderDoublePlate(config: PlateConfig, palette: RankPalette) {
  return (
    <>
      <rect
        x="28"
        y="20"
        width="14"
        height="40"
        rx="2.2"
        fill={palette.primary}
        stroke={palette.highlight}
        strokeWidth="1.2"
      />
      <rect
        x="44"
        y="20"
        width="14"
        height="40"
        rx="2.2"
        fill={palette.primary}
        stroke={palette.highlight}
        strokeWidth="1.2"
      />
      <rect x="29.5" y="22.2" width="11" height="3.8" rx="1.2" fill={palette.highlight} opacity="0.28" />
      <rect x="45.5" y="22.2" width="11" height="3.8" rx="1.2" fill={palette.highlight} opacity="0.28" />
      {config.pips.map(([x, y], index) => (
        <path
          key={`double-pip-${index}`}
          d={diamondPath(x, y, 4.6, 6)}
          fill={palette.plate}
          stroke={palette.shadow}
          strokeWidth="0.8"
        />
      ))}
      {renderRibbonBars(config.whiteBars, 'white', palette)}
      {renderRibbonBars(config.goldBars, 'gold', palette)}
    </>
  );
}

function renderStarFamily(
  stars: Array<[number, number, number]>,
  palette: RankPalette,
  whiteBars: number,
  goldBars: number,
) {
  return (
    <>
      {stars.map(([x, y, size], index) => (
        <path
          key={`star-${index}`}
          d={starPath(x, y, size, size * 0.42)}
          fill={palette.primary}
          stroke={palette.highlight}
          strokeWidth="1"
        />
      ))}
      {renderRibbonBars(whiteBars, 'white', palette)}
      {renderRibbonBars(goldBars, 'gold', palette)}
    </>
  );
}

function renderEagleFamily(palette: RankPalette, whiteBars: number, goldBars: number) {
  return (
    <>
      <path
        d="M50 31 L57 26 C59 25 62 25 64 27 L76 39 L69 40 L62 47 L57 49 L54 46 L54 56 L50 60 L46 56 L46 46 L43 49 L38 47 L31 40 L24 39 L36 27 C38 25 41 25 43 26 Z"
        fill={palette.primary}
        stroke={palette.highlight}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M21 42 L35 34 L34 45 L24 49 Z"
        fill={palette.primary}
        stroke={palette.highlight}
        strokeWidth="0.9"
      />
      <path
        d="M79 42 L65 34 L66 45 L76 49 Z"
        fill={palette.primary}
        stroke={palette.highlight}
        strokeWidth="0.9"
      />
      <path
        d="M46 32 L50 36 L54 32"
        fill="none"
        stroke={palette.shadow}
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {renderRibbonBars(whiteBars, 'white', palette)}
      {renderRibbonBars(goldBars, 'gold', palette)}
    </>
  );
}

function renderWreathLeaf(x: number, y: number, rotation: number, palette: RankPalette, flip = false) {
  return (
    <path
      d="M0 0 C2 -4 7 -5 10 -1 C8 4 3 6 0 3 Z"
      transform={`translate(${x} ${y}) rotate(${rotation}) scale(${flip ? -1 : 1} 1)`}
      fill={palette.primary}
      stroke={palette.highlight}
      strokeWidth="0.5"
    />
  );
}

function renderWreathFamily(rankId: number, palette: RankPalette) {
  const leftLeaves: Array<[number, number, number]> = [
    [34, 58, -48],
    [28, 52, -34],
    [24, 45, -18],
    [23, 37, -4],
    [25, 29, 12],
    [30, 22, 28],
  ];
  const innerDiamondCount = rankId - 38;
  const diamonds =
    innerDiamondCount === 0 ? [] :
    innerDiamondCount === 1 ? [[50, 44]] :
    innerDiamondCount === 2 ? [[46, 40], [54, 48]] :
    [[50, 36], [44, 47], [56, 47]];

  return (
    <>
      {leftLeaves.map(([x, y, rotation], index) => (
        <g key={`leaf-${index}`}>
          {renderWreathLeaf(x, y, rotation, palette)}
          {renderWreathLeaf(100 - x, y, -rotation, palette, true)}
        </g>
      ))}
      <circle cx="50" cy="40" r="14.5" fill="none" stroke={palette.primary} strokeWidth="4.8" />
      <circle cx="50" cy="40" r="8.5" fill={palette.plate} stroke={palette.highlight} strokeWidth="1" />
      {diamonds.map(([x, y], index) => (
        <path
          key={`general-diamond-${index}`}
          d={diamondPath(x, y, 5.4, 7.2)}
          fill={palette.highlight}
          stroke={palette.shadow}
          strokeWidth="0.7"
        />
      ))}
      {rankId === 41 ? (
        <path
          d={starPath(50, 57.5, 4.4, 1.8, 4)}
          fill={palette.highlight}
          stroke={palette.shadow}
          strokeWidth="0.6"
        />
      ) : null}
    </>
  );
}

function renderRankGlyph(rankId: number, palette: RankPalette): ReactNode {
  if (rankId <= 2) {
    return renderDiamondRanks(rankId, palette);
  }

  const chevronConfigs: Record<number, ChevronConfig> = {
    3: { major: 1, minor: 0 },
    4: { major: 1, minor: 1 },
    5: { major: 2, minor: 0 },
    6: { major: 2, minor: 1 },
    7: { major: 3, minor: 0 },
    8: { major: 3, minor: 1 },
    9: { major: 3, minor: 2 },
    10: { major: 4, minor: 0 },
    11: { major: 4, minor: 1 },
    12: { major: 4, minor: 2 },
    13: { major: 4, minor: 2, notch: true },
  };

  if (rankId <= 13) {
    return renderChevrons(chevronConfigs[rankId], palette);
  }

  const singlePlateConfigs: Record<number, PlateConfig> = {
    14: { pips: [[50, 40]], whiteBars: 0, goldBars: 0 },
    15: { pips: [[50, 34], [50, 46]], whiteBars: 0, goldBars: 0 },
    16: { pips: [[50, 40]], whiteBars: 2, goldBars: 0 },
    17: { pips: [[50, 40]], whiteBars: 0, goldBars: 3 },
  };

  if (rankId <= 17) {
    return renderSinglePlate(singlePlateConfigs[rankId], palette);
  }

  const doublePlateConfigs: Record<number, PlateConfig> = {
    18: { pips: [[35, 40], [51, 40]], whiteBars: 0, goldBars: 0 },
    19: { pips: [[35, 34], [51, 34], [35, 46], [51, 46]], whiteBars: 0, goldBars: 0 },
    20: { pips: [[35, 40], [51, 40]], whiteBars: 2, goldBars: 0 },
    21: { pips: [[35, 40], [51, 40]], whiteBars: 0, goldBars: 3 },
  };

  if (rankId <= 21) {
    return renderDoublePlate(doublePlateConfigs[rankId], palette);
  }

  if (rankId <= 25) {
    return renderStarFamily(
      [[50, 38, 11]],
      palette,
      rankId === 22 ? 0 : rankId === 23 ? 1 : rankId === 24 ? 2 : 0,
      rankId === 25 ? 3 : 0,
    );
  }

  if (rankId <= 29) {
    return renderStarFamily(
      [[50, 30, 8], [50, 47, 8]],
      palette,
      rankId === 26 ? 0 : rankId === 27 ? 1 : rankId === 28 ? 2 : 0,
      rankId === 29 ? 3 : 0,
    );
  }

  if (rankId <= 33) {
    return renderStarFamily(
      [[50, 26, 7.7], [41.5, 41, 7.7], [58.5, 41, 7.7]],
      palette,
      rankId === 30 ? 0 : rankId === 31 ? 1 : rankId === 32 ? 2 : 0,
      rankId === 33 ? 3 : 0,
    );
  }

  if (rankId <= 37) {
    return renderEagleFamily(
      palette,
      rankId === 34 ? 0 : rankId === 35 ? 1 : rankId === 36 ? 2 : 0,
      rankId === 37 ? 3 : 0,
    );
  }

  return renderWreathFamily(rankId, palette);
}

export function RankEmblem({ rankId, tour, size = 72 }: RankEmblemProps) {
  const normalizedRankId = clampRankId(rankId);
  const palette = getPalette(normalizedRankId);
  const glowId = useId().replace(/:/g, '-');
  const heroSurface = size >= 96;
  const iconScale = tour > 1 ? 0.84 : 1;
  const iconY = tour > 1 ? 48 : 50;

  return (
    <svg
      aria-hidden="true"
      data-testid="rank-emblem"
      data-rank-id={normalizedRankId}
      data-tour={tour}
      data-shield={tour > 1 ? 'on' : 'off'}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="overflow-visible"
    >
      <defs>
        <filter id={`rank-emblem-glow-${glowId}`}>
          <feGaussianBlur stdDeviation="2.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <ShieldBackground tour={tour} />

      <motion.g
        filter={`url(#rank-emblem-glow-${glowId})`}
        animate={heroSurface ? { opacity: [0.94, 1, 0.95] } : undefined}
        transition={heroSurface ? { duration: 3.6, ease: 'easeInOut', repeat: Infinity } : undefined}
      >
        <ellipse
          cx="50"
          cy={iconY}
          rx={tour > 1 ? '24' : '28'}
          ry={tour > 1 ? '24' : '27'}
          fill={palette.plate}
          opacity="0.88"
        />
        <g transform={`translate(50 ${iconY}) scale(${iconScale}) translate(-50 -50)`}>
          {renderRankGlyph(normalizedRankId, palette)}
        </g>
      </motion.g>
    </svg>
  );
}
