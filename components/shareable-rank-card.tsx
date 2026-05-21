"use client";

import { forwardRef } from "react";
import type { RankCardVisual } from "@/lib/rank-card-visuals";

type ShareableRankCardProps = {
  visual: RankCardVisual;
};

export const ShareableRankCard = forwardRef<HTMLElement, ShareableRankCardProps>(
  function ShareableRankCard({ visual }, ref) {
    return (
      <section
        ref={ref}
        aria-label={`${visual.rank} share card`}
        className="relative isolate aspect-[4/5] min-h-[430px] w-full overflow-hidden rounded-md border border-white/15 bg-[#12051f] shadow-2xl shadow-primary/20 sm:aspect-[16/10] sm:min-h-[520px]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${visual.imagePath})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,3,19,0.2)_0%,rgba(9,3,19,0.58)_46%,rgba(9,3,19,0.94)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(146,82,255,0.5),transparent_24rem),radial-gradient(circle_at_82%_12%,rgba(29,185,148,0.24),transparent_20rem)]" />

        <div className="relative flex h-full flex-col justify-between p-5 text-white sm:p-8">
          <div className="w-fit rounded-md border border-white/20 bg-black/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/85 shadow-lg backdrop-blur">
            Monad Swap Rank
          </div>

          <div className="max-w-3xl pb-1">
            <h1 className="text-5xl font-black leading-[0.95] tracking-normal text-white drop-shadow-[0_4px_22px_rgba(0,0,0,0.85)] sm:text-7xl lg:text-8xl">
              {visual.rank}
            </h1>
            <p className="mt-4 max-w-2xl text-2xl font-bold leading-tight tracking-normal text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.9)] sm:text-4xl">
              {visual.tagline}
            </p>
          </div>
        </div>
      </section>
    );
  }
);
