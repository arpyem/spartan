import { Link } from 'react-router-dom';
import { TRACKS } from '@/lib/tracks';

export function HomeScreen() {
  return (
    <section className="space-y-6">
      <div className="panel p-5">
        <p className="hud-kicker font-hud text-[0.65rem]">Home route ready</p>
        <h2 className="font-display mt-3 text-2xl font-bold tracking-[0.12em] text-white">
          Global Rank Placeholder
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
          This shell confirms the route tree, mobile frame, and HUD styling
          foundation. Real progression data arrives in later milestones.
        </p>
      </div>

      <div className="grid gap-3">
        {TRACKS.map((track) => (
          <Link
            key={track.key}
            to={`/log/${track.key}`}
            className="focus-shell panel block rounded-3xl p-4 transition hover:border-[var(--color-steel)]/40 hover:bg-white/4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-2xl">
                  <span aria-hidden="true">{track.icon}</span>
                </div>
                <div>
                  <p className="font-display text-lg font-semibold tracking-[0.08em] text-white">
                    {track.label}
                  </p>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                    Placeholder track surface
                  </p>
                </div>
              </div>
              <span className="text-sm text-[var(--color-hud)]">Open</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

