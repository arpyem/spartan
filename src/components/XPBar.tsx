import { motion } from 'framer-motion';

interface XPBarProps {
  progress: number;
  doubleXPActive?: boolean;
  label?: string;
}

export function XPBar({
  progress,
  doubleXPActive = false,
  label,
}: XPBarProps) {
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  const fillClassName = doubleXPActive
    ? 'from-[var(--color-amber)] via-[#ffe086] to-[#f7b733]'
    : 'from-[var(--color-hud)] via-[#6bff93] to-[#11d76b]';
  const edgeGlowClassName = doubleXPActive ? 'bg-[#ffe5a3]/75' : 'bg-[#d8ffe7]/75';

  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex items-center justify-between text-[0.68rem] uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          <span>{label}</span>
          <span>{normalizedProgress}%</span>
        </div>
      ) : null}
      <div
        className="relative h-3.5 overflow-hidden rounded-full border border-white/10 bg-black/40"
        data-testid="xp-bar"
        data-double-xp={doubleXPActive ? 'true' : 'false'}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),transparent_45%,rgba(255,255,255,0.06)_100%)]" />
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${fillClassName}`}
          animate={{ width: `${normalizedProgress}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 12, mass: 1.2 }}
          style={{
            boxShadow: doubleXPActive
              ? '0 0 18px rgba(245, 166, 35, 0.42)'
              : '0 0 16px rgba(0, 255, 65, 0.32)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            background:
              'repeating-linear-gradient(180deg, rgba(255,255,255,0.9) 0, rgba(255,255,255,0.9) 1px, transparent 1px, transparent 4px)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.14) 26%, rgba(255,255,255,0.04) 100%)',
          }}
        />
        <motion.div
          aria-hidden="true"
          className={`absolute inset-y-[2px] w-6 rounded-full ${edgeGlowClassName} blur-md`}
          animate={{ left: `calc(${normalizedProgress}% - 0.75rem)` }}
          transition={{ type: 'spring', stiffness: 60, damping: 14, mass: 1 }}
        />
      </div>
    </div>
  );
}
