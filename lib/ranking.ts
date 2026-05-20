export type NormalizedSwap = {
  txHash: string;
  status: "success" | "failed";
  usdValue?: number | null;
  timestamp?: string | number;
  tokenIn?: NormalizedSwapToken;
  tokenOut?: NormalizedSwapToken;
  source?: string;
  chain?: string | number;
};

export type NormalizedSwapToken = {
  address?: string;
  symbol?: string;
};

export type RankName =
  | "No Swap Data"
  | "Baby Nad"
  | "Curious Nad"
  | "Active Nad"
  | "Heavy Nad"
  | "Whale Nad"
  | "Monad Monster";

export type RankResult = {
  rank: RankName;
  volumeUsd: number;
};

export type WalletRankResult = {
  walletAddress: string;
  rank: RankResult;
  estimatedSwapVolume: number;
  totalSwaps: number;
  tokensHeld: number;
  nftsHeld: number;
  lastUpdated: string;
};

export function calculateTotalSwapVolume(swaps: NormalizedSwap[]): number {
  const seenTransactionHashes = new Set<string>();

  return swaps.reduce((totalVolume, swap) => {
    const transactionHash = swap.txHash.trim().toLowerCase();

    if (
      swap.status !== "success" ||
      transactionHash.length === 0 ||
      seenTransactionHashes.has(transactionHash) ||
      swap.usdValue === undefined ||
      swap.usdValue === null ||
      !Number.isFinite(swap.usdValue) ||
      swap.usdValue < 0
    ) {
      return totalVolume;
    }

    seenTransactionHashes.add(transactionHash);
    return totalVolume + swap.usdValue;
  }, 0);
}

export function getRankFromVolume(volumeUsd: number): RankResult {
  const safeVolumeUsd = Number.isFinite(volumeUsd) && volumeUsd > 0 ? volumeUsd : 0;

  if (safeVolumeUsd === 0) {
    return { rank: "No Swap Data", volumeUsd: safeVolumeUsd };
  }

  if (safeVolumeUsd < 100) {
    return { rank: "Baby Nad", volumeUsd: safeVolumeUsd };
  }

  if (safeVolumeUsd < 1_000) {
    return { rank: "Curious Nad", volumeUsd: safeVolumeUsd };
  }

  if (safeVolumeUsd < 10_000) {
    return { rank: "Active Nad", volumeUsd: safeVolumeUsd };
  }

  if (safeVolumeUsd < 100_000) {
    return { rank: "Heavy Nad", volumeUsd: safeVolumeUsd };
  }

  if (safeVolumeUsd < 1_000_000) {
    return { rank: "Whale Nad", volumeUsd: safeVolumeUsd };
  }

  return { rank: "Monad Monster", volumeUsd: safeVolumeUsd };
}

export function formatUsd(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: safeValue % 1 === 0 ? 0 : 2,
    minimumFractionDigits: safeValue % 1 === 0 ? 0 : 2
  }).format(safeValue);
}
