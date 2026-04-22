import { Link, useParams } from 'react-router-dom';
import { TRACKS_BY_KEY, isTrackKey } from '@/lib/tracks';

export function LogScreen() {
  const { track } = useParams();

  if (!isTrackKey(track)) {
    return (
      <section className="panel p-5">
        <p className="hud-kicker font-hud text-[0.65rem]">Route guard</p>
        <h2 className="font-display mt-3 text-2xl font-bold tracking-[0.1em] text-white">
          Unknown Training Track
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
          The route contract only accepts cardio, legs, push, pull, or core.
        </p>
        <Link
          to="/"
          className="focus-shell mt-6 inline-flex rounded-full border border-[var(--color-steel)]/40 px-4 py-2 text-sm uppercase tracking-[0.2em] text-[var(--color-steel)]"
        >
          Return home
        </Link>
      </section>
    );
  }

  const trackMeta = TRACKS_BY_KEY[track];
  const unitLabel = track === 'cardio' ? 'minutes' : 'sets';

  return (
    <section className="space-y-6">
      <div className="panel p-5">
        <p className="hud-kicker font-hud text-[0.65rem]">Log route ready</p>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-black/35 text-3xl">
            <span aria-hidden="true">{trackMeta.icon}</span>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-[0.12em] text-white">
              {trackMeta.label}
            </h2>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
              Placeholder {unitLabel} logger
            </p>
          </div>
        </div>
      </div>

      <div className="panel p-5">
        <label
          htmlFor="track-value"
          className="hud-kicker font-hud text-[0.65rem]"
        >
          Workout input scaffold
        </label>
        <input
          id="track-value"
          type="number"
          inputMode="numeric"
          placeholder={`Enter ${unitLabel}`}
          className="focus-shell mt-4 w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-base text-white placeholder:text-[var(--color-text-muted)]"
        />
        <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
          Live XP preview and Firestore write flows are intentionally deferred to
          later milestones. This route exists to validate navigation, layout, and
          track-param handling.
        </p>
      </div>
    </section>
  );
}

