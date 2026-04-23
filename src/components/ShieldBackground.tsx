import type { TourLevel } from '@/lib/types';
import { getTourMaterial, hasTourShield } from '@/lib/tours';

interface ShieldBackgroundProps {
  tour: TourLevel;
}

interface TourStyle {
  ring: string;
  accent: string;
  shadow: string;
  halo?: string;
}

const CX = 50;
const CY = 49;
const OUTER_RING_RADIUS = 41.48;
const INNER_RING_RADIUS = 38.68;
const HALO_RADIUS = 46.57;
const PIP_RADIUS = 48.27;

const TOUR_STYLES: Record<Exclude<TourLevel, 1>, TourStyle> = {
  2: {
    ring: '#c98a42',
    accent: '#efc58e',
    shadow: 'rgba(201, 138, 66, 0.14)',
  },
  3: {
    ring: '#d5dde7',
    accent: '#8d9caf',
    shadow: 'rgba(213, 221, 231, 0.12)',
  },
  4: {
    ring: '#f1c63a',
    accent: '#fff1b0',
    shadow: 'rgba(241, 198, 58, 0.2)',
  },
  5: {
    ring: '#9fd2ee',
    accent: '#e8f8ff',
    shadow: 'rgba(159, 210, 238, 0.18)',
  },
  6: {
    ring: '#dff6ff',
    accent: '#b0ebff',
    shadow: 'rgba(223, 246, 255, 0.24)',
    halo: '#66b7e6',
  },
};

function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngleDegrees: number,
  endAngleDegrees: number,
) {
  const startAngle = (startAngleDegrees * Math.PI) / 180;
  const endAngle = (endAngleDegrees * Math.PI) / 180;
  const startX = cx + radius * Math.cos(startAngle);
  const startY = cy + radius * Math.sin(startAngle);
  const endX = cx + radius * Math.cos(endAngle);
  const endY = cy + radius * Math.sin(endAngle);
  const span = ((endAngleDegrees - startAngleDegrees) % 360 + 360) % 360;
  const largeArcFlag = span > 180 ? 1 : 0;

  return `M${startX.toFixed(2)},${startY.toFixed(2)} A${radius},${radius} 0 ${largeArcFlag},1 ${endX.toFixed(2)},${endY.toFixed(2)}`;
}

function diamondPoints(cx: number, cy: number, radius: number) {
  return `${(cx + radius).toFixed(2)},${cy.toFixed(2)} ${cx.toFixed(2)},${(cy + radius).toFixed(2)} ${(cx - radius).toFixed(2)},${cy.toFixed(2)} ${cx.toFixed(2)},${(cy - radius).toFixed(2)}`;
}

function tickLine(angleDegrees: number, radius: number, halfLength: number) {
  const angle = (angleDegrees * Math.PI) / 180;
  const x = CX + radius * Math.cos(angle);
  const y = CY + radius * Math.sin(angle);
  const px = -Math.sin(angle) * halfLength;
  const py = Math.cos(angle) * halfLength;

  return {
    x1: (x - px).toFixed(2),
    y1: (y - py).toFixed(2),
    x2: (x + px).toFixed(2),
    y2: (y + py).toFixed(2),
  };
}

function renderBronze(style: TourStyle) {
  const ticks = [0, 90, 180, 270];

  return (
    <>
      <circle
        cx={CX}
        cy={CY}
        r={OUTER_RING_RADIUS}
        fill="none"
        stroke={style.ring}
        strokeWidth="1.8"
        opacity="0.6"
      />
      {ticks.map((angle) => {
        const line = tickLine(angle, OUTER_RING_RADIUS + 4.7, 2.6);

        return (
          <line
            key={`bronze-tick-${angle}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={style.ring}
            strokeWidth="1.45"
            strokeLinecap="round"
            opacity="0.5"
          />
        );
      })}
    </>
  );
}

function renderSilver(style: TourStyle) {
  const sideTicks = [0, 180];

  return (
    <>
      <circle
        cx={CX}
        cy={CY}
        r={OUTER_RING_RADIUS}
        fill="none"
        stroke={style.ring}
        strokeWidth="2"
        opacity="0.62"
      />
      <circle
        cx={CX}
        cy={CY}
        r={INNER_RING_RADIUS}
        fill="none"
        stroke={style.accent}
        strokeWidth="0.82"
        opacity="0.15"
      />
      <path
        d={arcPath(CX, CY, OUTER_RING_RADIUS + 1.2, 248, 292)}
        fill="none"
        stroke={style.ring}
        strokeWidth="1.65"
        strokeLinecap="round"
        opacity="0.38"
      />
      <path
        d={arcPath(CX, CY, OUTER_RING_RADIUS + 1.2, 68, 112)}
        fill="none"
        stroke={style.ring}
        strokeWidth="1.65"
        strokeLinecap="round"
        opacity="0.38"
      />
      {sideTicks.map((angle) => {
        const line = tickLine(angle, OUTER_RING_RADIUS + 5.1, 2.4);

        return (
          <line
            key={`silver-tick-${angle}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={style.accent}
            strokeWidth="1.28"
            strokeLinecap="round"
            opacity="0.28"
          />
        );
      })}
    </>
  );
}

function renderSegmentedRing(style: TourStyle, glowOpacity = 0.68, pipOpacity = 0.62) {
  const segments: Array<[number, number]> = [
    [48, 132],
    [138, 222],
    [228, 312],
    [318, 42],
  ];

  return (
    <>
      {segments.map(([start, end], index) => (
        <path
          key={`segment-${index}`}
          d={arcPath(CX, CY, OUTER_RING_RADIUS, start, end)}
          fill="none"
          stroke={style.ring}
          strokeWidth="2.35"
          strokeLinecap="round"
          opacity={glowOpacity}
        />
      ))}
      <circle
        cx={CX}
        cy={CY}
        r={INNER_RING_RADIUS}
        fill="none"
        stroke={style.accent}
        strokeWidth="0.88"
        opacity="0.14"
      />
      {[45, 135, 225, 315].map((angle) => {
        const radians = (angle * Math.PI) / 180;
        const x = CX + OUTER_RING_RADIUS * Math.cos(radians);
        const y = CY + OUTER_RING_RADIUS * Math.sin(radians);

        return (
          <polygon
            key={`diag-pip-${angle}`}
            points={diamondPoints(x, y, 2.4)}
            fill={style.ring}
            opacity={pipOpacity}
          />
        );
      })}
    </>
  );
}

function renderGold(style: TourStyle) {
  const flankSegments: Array<[number, number]> = [
    [28, 62],
    [118, 152],
    [208, 242],
    [298, 332],
  ];

  return (
    <>
      <circle
        cx={CX}
        cy={CY}
        r={OUTER_RING_RADIUS}
        fill="none"
        stroke={style.ring}
        strokeWidth="2.2"
        opacity="0.64"
      />
      <circle
        cx={CX}
        cy={CY}
        r={INNER_RING_RADIUS}
        fill="none"
        stroke={style.accent}
        strokeWidth="0.9"
        opacity="0.17"
      />
      <path
        d={arcPath(CX, CY, OUTER_RING_RADIUS + 1.25, 246, 294)}
        fill="none"
        stroke={style.ring}
        strokeWidth="1.72"
        strokeLinecap="round"
        opacity="0.42"
      />
      <path
        d={arcPath(CX, CY, OUTER_RING_RADIUS + 1.25, 66, 114)}
        fill="none"
        stroke={style.ring}
        strokeWidth="1.72"
        strokeLinecap="round"
        opacity="0.42"
      />
      {flankSegments.map(([start, end], index) => (
        <path
          key={`gold-flank-${index}`}
          d={arcPath(CX, CY, OUTER_RING_RADIUS + 0.55, start, end)}
          fill="none"
          stroke={style.ring}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.34"
        />
      ))}
      {[45, 135, 225, 315].map((angle) => {
        const radians = (angle * Math.PI) / 180;
        const x = CX + OUTER_RING_RADIUS * Math.cos(radians);
        const y = CY + OUTER_RING_RADIUS * Math.sin(radians);

        return (
          <polygon
            key={`gold-pip-${angle}`}
            points={diamondPoints(x, y, 2.25)}
            fill={style.ring}
            opacity="0.54"
          />
        );
      })}
    </>
  );
}

function renderPlatinum(style: TourStyle) {
  return (
    <>
      {renderGold(style)}
      {renderSegmentedRing(style, 0.22, 0.32)}
      {[0, 90, 180, 270].map((angle) => {
        const radians = (angle * Math.PI) / 180;
        const x = CX + PIP_RADIUS * Math.cos(radians);
        const y = CY + PIP_RADIUS * Math.sin(radians);

        return (
          <polygon
            key={`plat-pip-${angle}`}
            points={diamondPoints(x, y, 2.85)}
            fill={style.accent}
            opacity="0.58"
          />
        );
      })}
    </>
  );
}

function renderDiamond(style: TourStyle) {
  const haloSegments = new Array(8).fill(0).map((_, index) => [index * 45 + 9, index * 45 + 36]);

  return (
    <>
      {haloSegments.map(([start, end], index) => (
        <path
          key={`diamond-halo-${index}`}
          d={arcPath(CX, CY, HALO_RADIUS, start, end)}
          fill="none"
          stroke={style.halo}
          strokeWidth="1.05"
          strokeLinecap="round"
          opacity="0.18"
        />
      ))}
      <path
        d={arcPath(CX, CY, OUTER_RING_RADIUS + 0.4, -110, -70)}
        fill="none"
        stroke={style.accent}
        strokeWidth="2.7"
        strokeLinecap="round"
        opacity="0.36"
      />
      {renderPlatinum(style)}
      <polygon
        points={diamondPoints(CX, CY - (PIP_RADIUS + 2.8), 3.2)}
        fill={style.accent}
        opacity="0.58"
      />
    </>
  );
}

function renderShieldLayers(tour: Exclude<TourLevel, 1>, style: TourStyle) {
  switch (tour) {
    case 2:
      return renderBronze(style);
    case 3:
      return renderSilver(style);
    case 4:
      return renderGold(style);
    case 5:
      return renderPlatinum(style);
    case 6:
      return renderDiamond(style);
    default:
      return null;
  }
}

export function ShieldBackground({ tour }: ShieldBackgroundProps) {
  if (tour === 1 || !hasTourShield(tour)) {
    return null;
  }

  const style = TOUR_STYLES[tour];
  const material = getTourMaterial(tour);

  return (
    <g aria-hidden="true" data-tour-material={material}>
      <g style={{ filter: `drop-shadow(0 0 1.5px ${style.shadow})` }}>
        {renderShieldLayers(tour, style)}
      </g>
    </g>
  );
}
