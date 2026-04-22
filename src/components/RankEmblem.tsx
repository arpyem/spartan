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
  fill: string;
  stroke: string;
  accent: string;
  shadow: string;
  plate: string;
}

function clampRankId(rankId: number) {
  return Math.max(0, Math.min(41, rankId));
}

function getRankPalette(rankId: number): RankPalette {
  if (rankId >= 38) {
    return {
      fill: '#e0ab28',
      stroke: '#fff0a7',
      accent: '#fff6cf',
      shadow: 'rgba(245, 197, 66, 0.45)',
      plate: '#49360b',
    };
  }

  if (rankId >= 14) {
    return {
      fill: '#4e82c5',
      stroke: '#9bd0ff',
      accent: '#d9ecff',
      shadow: 'rgba(74, 144, 217, 0.38)',
      plate: '#122438',
    };
  }

  return {
    fill: '#b5becb',
    stroke: '#eff4fa',
    accent: '#f8fbff',
    shadow: 'rgba(191, 200, 210, 0.32)',
    plate: '#172028',
  };
}

function getChevronPath(y: number, width: number, depth: number) {
  const left = 50 - width / 2;
  const right = 50 + width / 2;
  const innerLeft = 50 - width / 6;
  const innerRight = 50 + width / 6;
  const tipY = y + depth;

  return `M ${left} ${y} L ${innerLeft} ${y} L 50 ${tipY} L ${innerRight} ${y} L ${right} ${y} L 50 ${tipY + depth / 1.9} Z`;
}

function getDiamondPath(cx: number, cy: number, width: number, height: number) {
  return `M ${cx} ${cy - height / 2} L ${cx + width / 2} ${cy} L ${cx} ${cy + height / 2} L ${cx - width / 2} ${cy} Z`;
}

function getStarPath(
  cx: number,
  cy: number,
  points: number,
  outerRadius: number,
  innerRadius: number,
) {
  const angleStep = Math.PI / points;
  const path: string[] = [];

  for (let index = 0; index < points * 2; index += 1) {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + index * angleStep;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    path.push(`${index === 0 ? 'M' : 'L'} ${x} ${y}`);
  }

  path.push('Z');
  return path.join(' ');
}

function renderEnlistedIcon(rankId: number, palette: RankPalette) {
  if (rankId === 0) {
    return (
      <>
        <circle cx="50" cy="45" r="13" fill={palette.fill} stroke={palette.stroke} strokeWidth="2.8" />
        <path d="M38 60 L50 69 L62 60" fill="none" stroke={palette.stroke} strokeWidth="5" strokeLinecap="round" />
      </>
    );
  }

  const enlistedIndex = rankId;
  const chevronCount = Math.min(4, Math.floor((enlistedIndex + 2) / 3));
  const ribbonCount = Math.min(3, Math.floor(enlistedIndex / 5));
  const pipCount = enlistedIndex % 3;

  return (
    <>
      <path
        d={getDiamondPath(50, 38, 18 + ribbonCount * 4, 18 + ribbonCount * 4)}
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth="2.4"
      />
      {Array.from({ length: ribbonCount }).map((_, index) => (
        <rect
          key={`ribbon-${index}`}
          x={38 - index * 2}
          y={26 - index * 4}
          width={24 + index * 4}
          height="3.2"
          rx="1.6"
          fill={palette.stroke}
          opacity={0.92 - index * 0.14}
        />
      ))}
      {Array.from({ length: chevronCount }).map((_, index) => (
        <path
          key={`chevron-${index}`}
          d={getChevronPath(54 + index * 7, 30 - index * 2, 8)}
          fill={palette.fill}
          stroke={palette.stroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      ))}
      {Array.from({ length: pipCount }).map((_, index) => (
        <circle
          key={`pip-${index}`}
          cx={44 + index * 6}
          cy="24"
          r="2.4"
          fill={palette.accent}
        />
      ))}
    </>
  );
}

function renderOfficerIcon(rankId: number, palette: RankPalette) {
  const officerIndex = rankId - 14;
  const wingCount = 2 + Math.floor(officerIndex / 8);
  const stripeCount = 1 + (officerIndex % 4);
  const topStarCount = Math.floor(officerIndex / 4) % 4;
  const sideFinCount = 1 + Math.floor((officerIndex % 8) / 2);

  return (
    <>
      <path
        d={getDiamondPath(50, 46, 24, 26)}
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth="2.6"
      />
      <path
        d="M28 48 L39 39 L39 57 Z"
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth="2"
      />
      <path
        d="M72 48 L61 39 L61 57 Z"
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth="2"
      />
      {Array.from({ length: wingCount }).map((_, index) => (
        <rect
          key={`wing-left-${index}`}
          x={18 - index * 1.4}
          y={34 + index * 7}
          width={12 + index * 4}
          height="3"
          rx="1.5"
          fill={palette.stroke}
          opacity={0.92 - index * 0.1}
        />
      ))}
      {Array.from({ length: wingCount }).map((_, index) => (
        <rect
          key={`wing-right-${index}`}
          x={70 - index * 2.6}
          y={34 + index * 7}
          width={12 + index * 4}
          height="3"
          rx="1.5"
          fill={palette.stroke}
          opacity={0.92 - index * 0.1}
        />
      ))}
      {Array.from({ length: stripeCount }).map((_, index) => (
        <rect
          key={`stripe-${index}`}
          x="43"
          y={35 + index * 5}
          width="14"
          height="2.8"
          rx="1.4"
          fill={palette.accent}
          opacity={0.9 - index * 0.14}
        />
      ))}
      {Array.from({ length: sideFinCount }).map((_, index) => (
        <circle
          key={`fin-left-${index}`}
          cx={32 - index * 3}
          cy={51 + index * 4}
          r="2.1"
          fill={palette.accent}
        />
      ))}
      {Array.from({ length: sideFinCount }).map((_, index) => (
        <circle
          key={`fin-right-${index}`}
          cx={68 + index * 3}
          cy={51 + index * 4}
          r="2.1"
          fill={palette.accent}
        />
      ))}
      {Array.from({ length: topStarCount }).map((_, index) => (
        <path
          key={`star-${index}`}
          d={getStarPath(41 + index * 6, 22, 4, 3.4, 1.5)}
          fill={palette.accent}
        />
      ))}
    </>
  );
}

function renderGeneralIcon(rankId: number, palette: RankPalette) {
  const generalIndex = rankId - 38;
  const starCount = generalIndex + 1;
  const wingSpan = 18 + generalIndex * 2;

  return (
    <>
      <path
        d="M50 24 L58 36 L74 39 L62 49 L65 66 L50 58 L35 66 L38 49 L26 39 L42 36 Z"
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d={`M14 54 L${32 - generalIndex} 42 L${42 - generalIndex / 2} 49 L26 62 Z`}
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d={`M86 54 L${68 + generalIndex} 42 L${58 + generalIndex / 2} 49 L74 62 Z`}
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="46" y="56" width="8" height="18" rx="3" fill={palette.stroke} />
      {Array.from({ length: starCount }).map((_, index) => (
        <path
          key={`command-star-${index}`}
          d={getStarPath(50 - ((starCount - 1) * 6) / 2 + index * 6, 18, 5, 3.4, 1.5)}
          fill={palette.accent}
        />
      ))}
      <path
        d={`M25 ${72 - generalIndex} L50 ${78 + generalIndex} L75 ${72 - generalIndex}`}
        fill="none"
        stroke={palette.stroke}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x={50 - wingSpan / 2}
        y="69"
        width={wingSpan}
        height="3"
        rx="1.5"
        fill={palette.accent}
        opacity="0.85"
      />
    </>
  );
}

function renderRankIcon(rankId: number, palette: RankPalette): ReactNode {
  if (rankId >= 38) {
    return renderGeneralIcon(rankId, palette);
  }

  if (rankId >= 14) {
    return renderOfficerIcon(rankId, palette);
  }

  return renderEnlistedIcon(rankId, palette);
}

export function RankEmblem({
  rankId,
  tour,
  size = 72,
}: RankEmblemProps) {
  const normalizedRankId = clampRankId(rankId);
  const palette = getRankPalette(normalizedRankId);
  const glowId = useId().replace(/:/g, '-');
  const heroSurface = size >= 96;
  const iconScale = tour > 1 ? 0.82 : 1;

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
          <feGaussianBlur stdDeviation="3.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <ShieldBackground tour={tour} />

      <motion.g
        filter={`url(#rank-emblem-glow-${glowId})`}
        animate={
          heroSurface
            ? { scale: [1, 1.028, 1], opacity: [0.92, 1, 0.94] }
            : undefined
        }
        transition={
          heroSurface
            ? { duration: 3.4, ease: 'easeInOut', repeat: Infinity }
            : undefined
        }
        style={{ transformOrigin: '50px 50px' }}
      >
        <circle
          cx="50"
          cy={tour > 1 ? '48' : '50'}
          r={tour > 1 ? '24' : '27'}
          fill={palette.plate}
          opacity="0.86"
        />
        <g transform={`translate(50 50) scale(${iconScale}) translate(-50 -50)`}>
          {renderRankIcon(normalizedRankId, palette)}
        </g>
      </motion.g>
    </svg>
  );
}
