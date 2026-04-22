interface SubtrackPresetIconProps {
  presetKey: string;
  size?: number;
}

function renderPresetGlyph(presetKey: string) {
  const strokeProps = {
    fill: 'none',
    stroke: '#d9e4f7',
    strokeWidth: 2.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (presetKey) {
    case 'run':
      return (
        <>
          <circle cx="18" cy="10" r="3" fill="#d9e4f7" />
          <path d="M18 13 L15 20 L20 24 L17 31" {...strokeProps} />
          <path d="M15 18 L10 21" {...strokeProps} />
          <path d="M20 24 L26 21" {...strokeProps} />
        </>
      );
    case 'bike':
      return (
        <>
          <circle cx="11" cy="24" r="6" {...strokeProps} />
          <circle cx="25" cy="24" r="6" {...strokeProps} />
          <path d="M11 24 L16 14 L21 24 L16 24" {...strokeProps} />
          <path d="M16 14 H23 L25 18" {...strokeProps} />
        </>
      );
    case 'interval':
      return <path d="M7 25 L11 15 L15 23 L19 9 L24 25 L28 17" {...strokeProps} />;
    case 'squat':
      return (
        <>
          <path d="M8 11 H28" {...strokeProps} />
          <path d="M12 11 V18 L18 21 L24 18 V11" {...strokeProps} />
          <path d="M14 21 V28" {...strokeProps} />
          <path d="M22 21 V28" {...strokeProps} />
        </>
      );
    case 'hinge':
      return (
        <>
          <path d="M10 12 V28" {...strokeProps} />
          <path d="M10 20 H22 L26 28" {...strokeProps} />
          <path d="M22 20 L27 12" {...strokeProps} />
        </>
      );
    case 'unilateral':
      return (
        <>
          <path d="M12 10 V28" {...strokeProps} />
          <path d="M22 10 V20" {...strokeProps} />
          <path d="M12 18 H22" {...strokeProps} />
          <path d="M22 20 L26 28" {...strokeProps} />
        </>
      );
    case 'bench':
      return (
        <>
          <path d="M8 18 H28" {...strokeProps} />
          <path d="M12 18 V26" {...strokeProps} />
          <path d="M24 18 V26" {...strokeProps} />
          <path d="M10 12 H14" {...strokeProps} />
          <path d="M22 12 H26" {...strokeProps} />
        </>
      );
    case 'overhead':
      return (
        <>
          <path d="M8 10 H28" {...strokeProps} />
          <path d="M12 10 V16" {...strokeProps} />
          <path d="M24 10 V16" {...strokeProps} />
          <path d="M18 16 V28" {...strokeProps} />
        </>
      );
    case 'dip':
      return (
        <>
          <path d="M10 10 V28" {...strokeProps} />
          <path d="M26 10 V28" {...strokeProps} />
          <path d="M10 16 H26" {...strokeProps} />
          <path d="M18 16 V24" {...strokeProps} />
        </>
      );
    case 'row':
      return (
        <>
          <path d="M8 24 H18 L24 14" {...strokeProps} />
          <path d="M18 24 L24 24" {...strokeProps} />
          <path d="M24 14 H28" {...strokeProps} />
        </>
      );
    case 'pull-up':
      return (
        <>
          <path d="M8 10 H28" {...strokeProps} />
          <path d="M14 10 V20" {...strokeProps} />
          <path d="M22 10 V20" {...strokeProps} />
          <path d="M14 20 H22" {...strokeProps} />
        </>
      );
    case 'curl':
      return (
        <>
          <path d="M10 24 C14 18 22 18 26 24" {...strokeProps} />
          <path d="M8 24 H12" {...strokeProps} />
          <path d="M24 24 H28" {...strokeProps} />
        </>
      );
    case 'plank':
      return (
        <>
          <path d="M9 22 H26" {...strokeProps} />
          <path d="M12 22 L9 28" {...strokeProps} />
          <path d="M23 22 L27 28" {...strokeProps} />
        </>
      );
    case 'rotation':
      return (
        <>
          <path d="M11 18 A7 7 0 1 1 18 25" {...strokeProps} />
          <path d="M18 11 L22 11 L22 15" {...strokeProps} />
        </>
      );
    case 'carry':
      return (
        <>
          <path d="M12 14 H24 V26 H12 Z" {...strokeProps} />
          <path d="M15 14 V10 H21 V14" {...strokeProps} />
          <path d="M18 26 V30" {...strokeProps} />
        </>
      );
    default:
      return <circle cx="18" cy="18" r="8" {...strokeProps} />;
  }
}

export function SubtrackPresetIcon({
  presetKey,
  size = 36,
}: SubtrackPresetIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 36 36"
      width={size}
      height={size}
      className="shrink-0"
    >
      {renderPresetGlyph(presetKey)}
    </svg>
  );
}
