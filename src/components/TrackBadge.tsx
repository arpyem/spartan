interface TrackBadgeProps {
  badgeKey: 'cardio' | 'legs' | 'push' | 'pull' | 'core';
  size?: number;
  variant?: 'crest' | 'glyph';
}

const TRACK_BADGE_LABELS: Record<TrackBadgeProps['badgeKey'], string> = {
  cardio: 'CD',
  legs: 'LG',
  push: 'PS',
  pull: 'PL',
  core: 'CR',
};

const TRACK_BADGE_ACCENTS: Record<TrackBadgeProps['badgeKey'], string> = {
  cardio: '#8ea9d4',
  legs: '#d28a46',
  push: '#c7d6ef',
  pull: '#88a1cb',
  core: '#cdb182',
};

function renderGlyph(badgeKey: TrackBadgeProps['badgeKey'], accent: string) {
  const strokeProps = {
    fill: 'none',
    stroke: accent,
    strokeWidth: 3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (badgeKey) {
    case 'cardio':
      return (
        <>
          <circle cx="36" cy="36" r="14" {...strokeProps} />
          <path d="M36 36 L46 26" {...strokeProps} />
          <path d="M44 26 H50 V32" {...strokeProps} />
        </>
      );
    case 'legs':
      return (
        <>
          <path d="M28 20 L24 38 L30 52" {...strokeProps} />
          <path d="M44 20 L48 38 L42 52" {...strokeProps} />
          <path d="M24 38 H48" {...strokeProps} />
        </>
      );
    case 'push':
      return (
        <>
          <path d="M22 44 H50" {...strokeProps} />
          <path d="M26 44 L36 24 L46 44" {...strokeProps} />
          <path d="M36 52 V24" {...strokeProps} />
        </>
      );
    case 'pull':
      return (
        <>
          <path d="M22 28 H50" {...strokeProps} />
          <path d="M26 28 L36 48 L46 28" {...strokeProps} />
          <path d="M36 20 V48" {...strokeProps} />
        </>
      );
    case 'core':
      return (
        <>
          <circle cx="36" cy="36" r="14" {...strokeProps} />
          <path d="M36 22 V50" {...strokeProps} />
          <path d="M26 36 H46" {...strokeProps} />
        </>
      );
  }
}

export function TrackBadge({
  badgeKey,
  size = 56,
  variant = 'crest',
}: TrackBadgeProps) {
  const accent = TRACK_BADGE_ACCENTS[badgeKey];
  const label = TRACK_BADGE_LABELS[badgeKey];

  if (variant === 'glyph') {
    return (
      <svg
        aria-hidden="true"
        data-testid={`track-badge-${badgeKey}`}
        data-variant={variant}
        viewBox="0 0 72 72"
        width={size}
        height={size}
        className="shrink-0"
      >
        <circle
          cx="36"
          cy="36"
          r="24"
          fill="rgba(8,18,33,0.64)"
          stroke="rgba(195,209,231,0.2)"
          strokeWidth="1.4"
        />
        {renderGlyph(badgeKey, accent)}
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      data-testid={`track-badge-${badgeKey}`}
      data-variant={variant}
      viewBox="0 0 72 72"
      width={size}
      height={size}
      className="shrink-0"
    >
      <defs>
        <linearGradient id={`badge-shell-${badgeKey}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#20324e" />
          <stop offset="100%" stopColor="#0b1321" />
        </linearGradient>
      </defs>
      <path
        d="M12 14 H60 V48 L36 58 L12 48 Z"
        fill={`url(#badge-shell-${badgeKey})`}
        stroke="#c3d1e7"
        strokeOpacity="0.58"
        strokeWidth="1.5"
      />
      <path
        d="M18 20 H54 V44 L36 52 L18 44 Z"
        fill="rgba(255,255,255,0.02)"
        stroke={accent}
        strokeOpacity="0.68"
        strokeWidth="1.2"
      />
      <path d="M18 25 H54" stroke="#eef5ff" strokeOpacity="0.32" strokeWidth="1" />
      <circle
        cx="36"
        cy="34"
        r="10.5"
        fill={accent}
        fillOpacity="0.15"
        stroke={accent}
        strokeOpacity="0.6"
      />
      <text
        x="36"
        y="39"
        textAnchor="middle"
        fill="#f0f6ff"
        fontSize="11"
        fontFamily="Arial Narrow, Arial, sans-serif"
        letterSpacing="1.5"
        fontWeight="700"
      >
        {label}
      </text>
      <path d="M24 49 H48" stroke={accent} strokeOpacity="0.7" strokeWidth="1.2" />
    </svg>
  );
}
