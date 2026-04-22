import { RankEmblem } from '@/components/RankEmblem';
import { XPBar } from '@/components/XPBar';

interface GlobalRankProps {
  rankId: number;
  rankName: string;
  progress: number;
}

export function GlobalRank({
  rankId,
  rankName,
  progress,
}: GlobalRankProps) {
  return (
    <section className="panel glow-green rounded-[1.8rem] p-5">
      <p className="hud-kicker font-hud text-[0.65rem]">Global rank</p>
      <div className="mt-4 flex items-center gap-4">
        <RankEmblem rankId={rankId} tour={1} size={84} />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl font-bold tracking-[0.12em] text-white">
            {rankName}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            Composite standing across all five Spartan training tracks.
          </p>
        </div>
      </div>
      <div className="mt-5">
        <XPBar progress={progress} label="Composite tier progress" />
      </div>
    </section>
  );
}
