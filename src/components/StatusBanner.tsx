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
      ? 'border-[rgba(245,166,35,0.45)] bg-[rgba(245,166,35,0.12)] text-[var(--color-amber)]'
      : tone === 'error'
        ? 'border-red-500/40 bg-red-500/10 text-red-100'
        : 'border-[rgba(74,144,217,0.45)] bg-[rgba(74,144,217,0.12)] text-[var(--color-steel)]';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-[1.4rem] border px-4 py-3 ${toneClassName}`}
    >
      <p className="font-display text-sm font-semibold uppercase tracking-[0.24em]">
        {title}
      </p>
      <p className="mt-1 text-sm leading-6 text-[var(--color-text)]">{body}</p>
    </div>
  );
}
