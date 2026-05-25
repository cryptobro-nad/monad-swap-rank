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
        className="relative isolate aspect-[5/6] min-h-[370px] w-full overflow-hidden rounded-md border border-white/15 bg-[#12051f] shadow-2xl shadow-primary/20 sm:aspect-[16/9] sm:min-h-[420px] lg:min-h-[460px]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${visual.imagePath})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,3,19,0.08)_0%,rgba(9,3,19,0.28)_34%,rgba(9,3,19,0.76)_68%,rgba(9,3,19,0.97)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-[linear-gradient(180deg,transparent_0%,rgba(6,2,14,0.72)_48%,rgba(6,2,14,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(146,82,255,0.44),transparent_24rem),radial-gradient(circle_at_82%_12%,rgba(29,185,148,0.22),transparent_20rem)]" />

        <div className="relative flex h-full flex-col p-5 text-left text-white sm:p-6">
          <div className="w-fit rounded-md border border-white/15 bg-black/25 px-2.5 py-1.5 text-[10px] font-semibold uppercase leading-none text-white/78 shadow-md backdrop-blur sm:text-[11px]">
            MONAD SWAP RANK
          </div>

          <div className="mt-auto max-w-3xl pb-8 sm:pb-10">
            <h1 className="max-w-3xl text-4xl font-black leading-[0.95] tracking-normal text-white drop-shadow-[0_5px_24px_rgba(0,0,0,0.9)] sm:text-5xl lg:text-6xl">
              {visual.rank}
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-bold leading-tight tracking-normal text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)] sm:mt-5 sm:text-2xl">
              {visual.tagline}
            </p>
          </div>
        </div>
      </section>
    );
  }
);
