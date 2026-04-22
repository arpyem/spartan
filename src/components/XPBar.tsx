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
    ? 'bg-gradient-to-r from-[var(--color-amber)] via-[#ffd56a] to-[var(--color-amber)]'
    : 'bg-gradient-to-r from-[var(--color-hud)] via-[#6bff93] to-[var(--color-hud)]';

  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex items-center justify-between text-[0.68rem] uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          <span>{label}</span>
          <span>{normalizedProgress}%</span>
        </div>
      ) : null}
      <div className="relative h-3 overflow-hidden rounded-full border border-white/10 bg-black/40">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${fillClassName}`}
          animate={{ width: `${normalizedProgress}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 12, mass: 1.2 }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              'repeating-linear-gradient(180deg, rgba(255,255,255,0.9) 0, rgba(255,255,255,0.9) 1px, transparent 1px, transparent 4px)',
          }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute inset-y-0 w-5 rounded-full bg-white/35 blur-sm"
          animate={{ left: `calc(${normalizedProgress}% - 0.75rem)` }}
          transition={{ type: 'spring', stiffness: 60, damping: 14, mass: 1 }}
        />
      </div>
    </div>
  );
}
