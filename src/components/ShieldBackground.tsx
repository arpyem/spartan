import type { TourLevel } from '@/lib/types';

interface ShieldBackgroundProps {
  tour: TourLevel;
}

const TOUR_STYLES: Record<
  Exclude<TourLevel, 1>,
  { fill: string; stroke: string; accent: string }
> = {
  2: { fill: '#cd7f32', stroke: '#a0522d', accent: '#f0bc8d' },
  3: { fill: '#c0c0c0', stroke: '#808080', accent: '#f3f4f6' },
  4: { fill: '#ffd700', stroke: '#b8860b', accent: '#fff3a6' },
  5: { fill: '#1a1a2e', stroke: '#ffd700', accent: '#f5c542' },
};

export function ShieldBackground({ tour }: ShieldBackgroundProps) {
  if (tour === 1) {
    return null;
  }

  const style = TOUR_STYLES[tour];

  return (
    <>
      <path
        d="M50 8 L82 20 L82 52 C82 74 68 89 50 96 C32 89 18 74 18 52 L18 20 Z"
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth="4"
      />
      <path
        d="M50 18 L72 26 L72 50 C72 66 62 78 50 84 C38 78 28 66 28 50 L28 26 Z"
        fill="none"
        stroke={style.accent}
        strokeWidth="2"
        opacity="0.75"
      />
    </>
  );
}
