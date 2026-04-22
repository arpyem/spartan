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
  const fillClassName = doubleXPActive
    ? 'from-[#f4c37f] via-[#d9863b] to-[#8b4e1b]'
    : 'from-[#bfcde0] via-[#7f9bc2] to-[#39557f]';

  return (
    <div className="space-y-2" aria-live={label ? 'polite' : undefined}>
      {label ? (
        <div className="flex items-center justify-between text-[0.66rem] uppercase tracking-[0.18em] text-[var(--color-text-dim)]">
          <span>{label}</span>
          <span>{normalizedProgress}%</span>
        </div>
      ) : null}
      <div
        className="relative h-3 overflow-hidden border border-[var(--color-panel-border)] bg-[rgba(4,10,19,0.8)]"
        data-testid="xp-bar"
        data-double-xp={doubleXPActive ? 'true' : 'false'}
      >
        <div
          aria-hidden="true"
          className="absolute inset-[1px] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent_28%,rgba(255,255,255,0.04)_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            background:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.6) 0, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 10px)',
          }}
        />
        <motion.div
          data-testid="xp-bar-fill"
          className={`absolute inset-y-[1px] left-[1px] bg-gradient-to-r ${fillClassName}`}
          animate={{ width: `calc(${normalizedProgress}% - 2px)` }}
          transition={
            reduceMotion
              ? { duration: 0.2, ease: 'easeOut' }
              : { type: 'spring', stiffness: 70, damping: 16, mass: 1.1 }
          }
          style={{
            boxShadow: doubleXPActive
              ? '0 0 16px rgba(217, 134, 59, 0.32)'
              : '0 0 14px rgba(151, 177, 216, 0.24)',
          }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute inset-y-[1px] w-6 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.48),transparent)] opacity-70"
          animate={{ left: `calc(${normalizedProgress}% - 0.9rem)` }}
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
