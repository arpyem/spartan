import { motion, useReducedMotion } from 'framer-motion';

interface XPBarProps {
  progress: number;
  doubleXPActive?: boolean;
  label?: string;
}

function readReducedMotionPreference() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function XPBar({
  progress,
  doubleXPActive = false,
  label,
}: XPBarProps) {
  const reduceMotion = useReducedMotion() || readReducedMotionPreference();
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  const compact = !label;
  const fillClassName = doubleXPActive
    ? 'from-[#f4c37f] via-[#d9863b] to-[#8b4e1b]'
    : 'from-[#bfcde0] via-[#7f9bc2] to-[#39557f]';

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2'} aria-live={label ? 'polite' : undefined}>
      {label ? (
        <div className="flex items-center justify-between text-[0.66rem] uppercase tracking-[0.18em] text-[var(--color-text-dim)]">
          <span>{label}</span>
          <span>{normalizedProgress}%</span>
        </div>
      ) : null}
      <div
        className={`relative overflow-hidden border bg-[rgba(4,10,19,0.82)] ${
          compact ? 'h-[0.8rem] border-[rgba(190,204,228,0.22)]' : 'h-3 border-[var(--color-panel-border)]'
        }`}
        data-testid="xp-bar"
        data-double-xp={doubleXPActive ? 'true' : 'false'}
      >
        <div
          aria-hidden="true"
          className="absolute inset-[1px] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent_26%,rgba(255,255,255,0.05)_100%)]"
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ${compact ? 'opacity-[0.18]' : 'opacity-[0.14]'}`}
          style={{
            background:
              compact
                ? 'repeating-linear-gradient(90deg, rgba(255,255,255,0.65) 0, rgba(255,255,255,0.65) 1px, transparent 1px, transparent 9px)'
                : 'repeating-linear-gradient(90deg, rgba(255,255,255,0.6) 0, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 10px)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[1px] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_40%,rgba(0,0,0,0.18)_100%)]"
        />
        <motion.div
          data-testid="xp-bar-fill"
          className={`absolute inset-y-[1px] left-[1px] bg-gradient-to-r ${fillClassName}`}
          animate={{ width: normalizedProgress === 0 ? '0%' : `calc(${normalizedProgress}% - 2px)` }}
          transition={
            reduceMotion
              ? { duration: 0.2, ease: 'easeOut' }
              : { type: 'spring', stiffness: 70, damping: 16, mass: 1.1 }
          }
          style={{
            minWidth: normalizedProgress === 0 ? '0' : '0.35rem',
            boxShadow: doubleXPActive
              ? '0 0 18px rgba(217, 134, 59, 0.38)'
              : '0 0 16px rgba(151, 177, 216, 0.3)',
          }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-[1px] left-[1px] bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,255,255,0.08))]"
          animate={{ width: normalizedProgress === 0 ? '0%' : `calc(${normalizedProgress}% - 2px)` }}
          transition={
            reduceMotion
              ? { duration: 0.18, ease: 'easeOut' }
              : { type: 'spring', stiffness: 72, damping: 17, mass: 1 }
          }
          style={{
            height: compact ? '1px' : '2px',
            top: '1px',
            opacity: 0.7,
          }}
        />
        <motion.div
          aria-hidden="true"
          className={`absolute inset-y-[1px] ${compact ? 'w-4' : 'w-6'} bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.52),transparent)] opacity-80`}
          animate={{ left: normalizedProgress === 0 ? '0%' : `calc(${normalizedProgress}% - 0.9rem)` }}
          transition={
            reduceMotion
              ? { duration: 0.18, ease: 'easeOut' }
              : { type: 'spring', stiffness: 72, damping: 17, mass: 1 }
          }
        />
      </div>
    </div>
  );
}
