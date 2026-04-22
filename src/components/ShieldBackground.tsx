import type { TourLevel } from '@/lib/types';

interface ShieldBackgroundProps {
  tour: TourLevel;
}

const TOUR_STYLES: Record<
  Exclude<TourLevel, 1>,
  {
    outerPath: string;
    innerPath: string;
    detailPath: string;
    fill: string;
    stroke: string;
    accent: string;
    shadow: string;
  }
> = {
  2: {
    outerPath:
      'M50 10 L81 22 L78 55 C76 74 65 88 50 95 C35 88 24 74 22 55 L19 22 Z',
    innerPath:
      'M50 18 L70 26 L68 52 C66 66 59 76 50 82 C41 76 34 66 32 52 L30 26 Z',
    detailPath: 'M50 21 L58 37 L50 44 L42 37 Z',
    fill: '#7b4b25',
    stroke: '#d39763',
    accent: '#f2c59e',
    shadow: 'rgba(164, 98, 45, 0.36)',
  },
  3: {
    outerPath:
      'M50 8 L84 24 L79 58 C76 77 64 90 50 96 C36 90 24 77 21 58 L16 24 Z',
    innerPath:
      'M50 18 L69 28 L66 51 C64 66 58 75 50 81 C42 75 36 66 34 51 L31 28 Z',
    detailPath: 'M38 37 L50 27 L62 37 L57 48 L43 48 Z',
    fill: '#8e949d',
    stroke: '#e2e7ef',
    accent: '#f8fbff',
    shadow: 'rgba(193, 200, 209, 0.34)',
  },
  4: {
    outerPath:
      'M50 7 L86 21 L82 58 C79 80 66 92 50 98 C34 92 21 80 18 58 L14 21 Z',
    innerPath:
      'M50 17 L71 25 L69 50 C67 68 59 78 50 84 C41 78 33 68 31 50 L29 25 Z',
    detailPath: 'M50 19 L60 35 L67 36 L61 46 L63 59 L50 52 L37 59 L39 46 L33 36 L40 35 Z',
    fill: '#ad7312',
    stroke: '#ffd45d',
    accent: '#fff3b0',
    shadow: 'rgba(229, 174, 47, 0.38)',
  },
  5: {
    outerPath:
      'M50 5 L88 20 L84 60 C80 83 67 95 50 99 C33 95 20 83 16 60 L12 20 Z',
    innerPath:
      'M50 15 L72 23 L69 48 C66 70 58 81 50 87 C42 81 34 70 31 48 L28 23 Z',
    detailPath: 'M50 16 L58 28 L72 30 L61 40 L64 56 L50 48 L36 56 L39 40 L28 30 L42 28 Z',
    fill: '#171927',
    stroke: '#f5c542',
    accent: '#fff0a6',
    shadow: 'rgba(245, 197, 66, 0.42)',
  },
};

export function ShieldBackground({ tour }: ShieldBackgroundProps) {
  if (tour === 1) {
    return null;
  }

  const style = TOUR_STYLES[tour];

  return (
    <g aria-hidden="true">
      <path
        d={style.outerPath}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth="4.4"
        style={{ filter: `drop-shadow(0 0 8px ${style.shadow})` }}
      />
      <path
        d={style.innerPath}
        fill="none"
        stroke={style.accent}
        strokeWidth="2.6"
        opacity="0.8"
      />
      <path
        d={style.detailPath}
        fill="none"
        stroke={style.accent}
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.72"
      />
    </g>
  );
}
