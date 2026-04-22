import type { TourLevel } from '@/lib/types';
import { ShieldBackground } from '@/components/ShieldBackground';

interface RankEmblemProps {
  rankId: number;
  tour: TourLevel;
  size?: number;
}

function getRankPalette(rankId: number) {
  if (rankId >= 38) {
    return { fill: '#f5c542', stroke: '#f7e08f', glow: 'rgba(245, 197, 66, 0.35)' };
  }

  if (rankId >= 14) {
    return { fill: '#4a90d9', stroke: '#8ab7ea', glow: 'rgba(74, 144, 217, 0.28)' };
  }

  return { fill: '#bfc8d2', stroke: '#eef2f7', glow: 'rgba(191, 200, 210, 0.24)' };
}

export function RankEmblem({
  rankId,
  tour,
  size = 72,
}: RankEmblemProps) {
  const palette = getRankPalette(rankId);
  const chevronCount = Math.min(4, Math.floor(rankId / 10) + 1);
  const starCount = Math.min(4, Math.max(0, rankId - 37));

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="overflow-visible drop-shadow-[0_0_12px_rgba(0,0,0,0.35)]"
    >
      <defs>
        <filter id={`rank-glow-${tour}-${rankId}`}>
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <g filter={`url(#rank-glow-${tour}-${rankId})`}>
        <ShieldBackground tour={tour} />
        <circle
          cx="50"
          cy="46"
          r={tour > 1 ? 20 : 24}
          fill={palette.fill}
          stroke={palette.stroke}
          strokeWidth="3"
          style={{ filter: `drop-shadow(0 0 10px ${palette.glow})` }}
        />
        {Array.from({ length: chevronCount }).map((_, index) => (
          <path
            key={`chevron-${index}`}
            d={`M34 ${60 + index * 7} L50 ${72 + index * 7} L66 ${60 + index * 7}`}
            fill="none"
            stroke={palette.stroke}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {Array.from({ length: starCount }).map((_, index) => (
          <circle
            key={`star-${index}`}
            cx={38 + index * 8}
            cy="27"
            r="2.8"
            fill={palette.stroke}
          />
        ))}
        <text
          x="50"
          y="51"
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill="#081114"
        >
          {rankId + 1}
        </text>
      </g>
    </svg>
  );
}
