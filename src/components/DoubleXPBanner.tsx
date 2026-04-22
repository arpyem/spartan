import type { DoubleXPStatus } from '@/lib/types';

interface DoubleXPBannerProps {
  status: DoubleXPStatus;
}

export function DoubleXPBanner({ status }: DoubleXPBannerProps) {
  if (!status.active && !status.upcoming) {
    return null;
  }

  const isActive = status.active;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`service-frame px-4 py-4 ${
        isActive
          ? 'border-[rgba(122,163,218,0.34)]'
          : 'border-[rgba(217,134,59,0.4)]'
      }`}
    >
      <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white">
        {isActive ? 'Double XP Active' : 'Double XP This Weekend'}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
        {isActive
          ? 'Friday through Sunday operations now award two times the normal EXP.'
          : 'A scheduled playlist bonus window is approaching. Friday begins the two-times multiplier.'}
      </p>
    </div>
  );
}
