interface HomeStatusRailItem {
  key: string;
  tone: 'info' | 'warning' | 'boost';
  title: string;
  detail: string;
}

interface HomeStatusRailProps {
  items: HomeStatusRailItem[];
}

export function HomeStatusRail({ items }: HomeStatusRailProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.key}
          role="status"
          aria-live="polite"
          data-tone={item.tone}
          className="service-status-chip"
        >
          <p className="font-display text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white">
            {item.title}
          </p>
          <p className="text-[0.72rem] leading-5 text-[var(--color-text-muted)]">
            {item.detail}
          </p>
        </div>
      ))}
    </div>
  );
}
