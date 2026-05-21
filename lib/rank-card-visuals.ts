import type { RankName } from "./ranking";

export type RankCardVisual = {
  rank: RankName;
  tagline: string;
  imagePath: string;
};

export const RANK_CARD_VISUALS: Record<RankName, RankCardVisual> = {
  "No Swap Data": {
    rank: "No Swap Data",
    tagline: "No swaps, only aura.",
    imagePath: "/rank-images/no-swap-data.webp"
  },
  "Baby Nad": {
    rank: "Baby Nad",
    tagline: "Just dipped the toes in.",
    imagePath: "/rank-images/baby-nad.webp"
  },
  "Curious Nad": {
    rank: "Curious Nad",
    tagline: "Curious... and slightly degen.",
    imagePath: "/rank-images/curious-nad.webp"
  },
  "Active Nad": {
    rank: "Active Nad",
    tagline: "Activity detected. Nad confirmed.",
    imagePath: "/rank-images/active-nad.webp"
  },
  "Heavy Nad": {
    rank: "Heavy Nad",
    tagline: "Rotating harder than a washing machine.",
    imagePath: "/rank-images/heavy-nad.webp"
  },
  "Whale Nad": {
    rank: "Whale Nad",
    tagline: "Liquidity can hear this wallet coming.",
    imagePath: "/rank-images/whale-nad.webp"
  },
  "Monad Monster": {
    rank: "Monad Monster",
    tagline: "This wallet needs its own warning label.",
    imagePath: "/rank-images/monad-monster.webp"
  }
};

export function getRankCardVisual(rank: RankName): RankCardVisual {
  return RANK_CARD_VISUALS[rank];
}
