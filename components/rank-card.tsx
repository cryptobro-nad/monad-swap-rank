type RankCardProps = {
  rank: string;
  estimatedSwapVolume: string;
  totalSwaps: string;
  lastUpdated: string;
};

export function RankCard({
  rank,
  estimatedSwapVolume,
  totalSwaps,
  lastUpdated
}: RankCardProps) {
  return (
    <section className="rounded-md border bg-white/80 p-6 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">Rank</p>
      <h2 className="mt-3 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
        {rank}
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Estimated Swap Volume</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {estimatedSwapVolume}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Swaps</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {totalSwaps}
          </p>
        </div>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Last updated {lastUpdated}
      </p>
    </section>
  );
}
