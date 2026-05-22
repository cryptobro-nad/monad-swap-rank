import type { RankName } from "./ranking";

export type RankCardVisual = {
  rank: RankName;
  tagline: string;
  imagePath: string;
};

export type RankCardVisualConfig = {
  rank: RankName;
  taglines: readonly string[];
  imagePath: string;
};

export const RANK_CARD_VISUALS: Record<RankName, RankCardVisualConfig> = {
  "No Swap Data": {
    rank: "No Swap Data",
    taglines: [
      "No swaps, only aura.",
      "Observer mode activated.",
      "This wallet came to watch, not rotate.",
      "Still loading the degen arc.",
      "Zero swaps, maximum mystery."
    ],
    imagePath: "/rank-images/no-swap-data.webp"
  },
  "Baby Nad": {
    rank: "Baby Nad",
    taglines: [
      "Just dipped the toes in.",
      "Tiny swaps, big dreams.",
      "The Nad journey has begun.",
      "Small steps, purple future.",
      "Still learning where the swap button is."
    ],
    imagePath: "/rank-images/baby-nad.webp"
  },
  "Curious Nad": {
    rank: "Curious Nad",
    taglines: [
      "Curious... and slightly degen.",
      "This wallet is asking questions.",
      "Testing the waters like a scientist.",
      "Not fully degen yet, but interested.",
      "The curiosity is getting expensive."
    ],
    imagePath: "/rank-images/curious-nad.webp"
  },
  "Active Nad": {
    rank: "Active Nad",
    taglines: [
      "Activity detected. Nad confirmed.",
      "This wallet has been outside.",
      "Not a tourist anymore.",
      "The chain has seen this wallet move.",
      "Active enough to earn respect."
    ],
    imagePath: "/rank-images/active-nad.webp"
  },
  "Heavy Nad": {
    rank: "Heavy Nad",
    taglines: [
      "Rotating harder than a washing machine.",
      "The swap button knows this wallet personally.",
      "Bro has been doing cardio on-chain.",
      "This wallet does not believe in sitting still.",
      "Heavy hands, heavier vibes."
    ],
    imagePath: "/rank-images/heavy-nad.webp"
  },
  "Whale Nad": {
    rank: "Whale Nad",
    taglines: [
      "Liquidity can hear this wallet coming.",
      "This wallet makes waves before it arrives.",
      "Not just swimming, moving oceans.",
      "The pool felt that one.",
      "Whale behavior detected."
    ],
    imagePath: "/rank-images/whale-nad.webp"
  },
  "Monad Monster": {
    rank: "Monad Monster",
    taglines: [
      "This wallet needs its own warning label.",
      "Final boss energy detected.",
      "The chain remembers this one.",
      "Absolutely unhinged on-chain.",
      "This is no longer a wallet, it's a creature."
    ],
    imagePath: "/rank-images/monad-monster.webp"
  }
};

export function getRankCardVisual(
  rank: RankName,
  walletAddress = ""
): RankCardVisual {
  const visual = RANK_CARD_VISUALS[rank];

  return {
    rank: visual.rank,
    tagline: getRankCardTagline(rank, walletAddress),
    imagePath: visual.imagePath
  };
}

export function getRankCardTagline(
  rank: RankName,
  walletAddress = ""
): string {
  const taglines = RANK_CARD_VISUALS[rank].taglines;
  const seed = `${rank}:${walletAddress.trim().toLowerCase() || "wallet"}`;
  const index = getDeterministicIndex(seed, taglines.length);

  return taglines[index] ?? taglines[0];
}

function getDeterministicIndex(seed: string, modulo: number): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) % modulo;
}
