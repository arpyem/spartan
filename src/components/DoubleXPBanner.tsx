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
      className={`rounded-[1.4rem] border px-4 py-3 ${
        isActive
          ? 'border-[rgba(0,255,65,0.45)] bg-[rgba(0,255,65,0.12)] text-[var(--color-hud)]'
          : 'border-[rgba(245,166,35,0.45)] bg-[rgba(245,166,35,0.12)] text-[var(--color-amber)]'
      }`}
    >
      <p className="font-display text-sm font-semibold uppercase tracking-[0.24em]">
        {isActive ? 'Double XP Active' : 'Double XP This Weekend'}
      </p>
      <p className="mt-1 text-sm leading-6 text-[var(--color-text)]">
        {isActive
          ? 'All workout logs from Friday through Sunday award 2x EXP.'
          : 'Weekend operations are approaching. Friday starts the 2x multiplier.'}
      </p>
    </div>
  );
}
