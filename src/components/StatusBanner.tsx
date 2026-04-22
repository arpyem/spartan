interface StatusBannerProps {
  tone?: 'info' | 'warning' | 'error';
  title: string;
  body: string;
}

export function StatusBanner({
  tone = 'info',
  title,
  body,
}: StatusBannerProps) {
  const toneClassName =
    tone === 'warning'
      ? 'border-[rgba(217,134,59,0.4)] bg-[linear-gradient(180deg,rgba(63,35,16,0.55),rgba(15,13,14,0.46))] text-[#ffd3aa]'
      : tone === 'error'
        ? 'border-red-500/35 bg-[linear-gradient(180deg,rgba(76,15,15,0.46),rgba(21,8,8,0.42))] text-red-100'
        : 'border-[rgba(167,188,219,0.32)] bg-[linear-gradient(180deg,rgba(16,29,52,0.68),rgba(9,17,31,0.7))] text-[var(--color-text)]';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`service-frame px-4 py-3 ${toneClassName}`}
    >
      <p className="font-display text-sm font-semibold uppercase tracking-[0.18em]">
        {title}
      </p>
      <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">{body}</p>
    </div>
  );
}
