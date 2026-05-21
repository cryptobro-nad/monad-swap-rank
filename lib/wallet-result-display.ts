import {
  formatUsd,
  type RankName,
  type WalletRankResult
} from "./ranking";

export type WalletResultDisplay = {
  estimatedSwapVolume: string;
  totalSwaps: string;
  tokensHeld: string;
  nftsHeld: string;
  hasSwapData: boolean;
  statusTitle: string;
  statusDescription: string;
  shareText: string;
};

export function getWalletResultDisplay(
  result: WalletRankResult
): WalletResultDisplay {
  const estimatedSwapVolume = formatUsd(result.estimatedSwapVolume);
  const totalSwaps = result.totalSwaps.toLocaleString("en-US");
  const hasSwapData =
    result.rank.rank !== "No Swap Data" &&
    result.estimatedSwapVolume > 0 &&
    result.totalSwaps > 0;

  return {
    estimatedSwapVolume,
    totalSwaps,
    tokensHeld: result.tokensHeld.toLocaleString("en-US"),
    nftsHeld: result.nftsHeld.toLocaleString("en-US"),
    hasSwapData,
    statusTitle: hasSwapData ? "Real swap data found" : "No swap data found",
    statusDescription: hasSwapData
      ? "Calculated from successful Mobula wallet trades with reliable USD values."
      : "Mobula did not return successful swaps with reliable USD values for this wallet yet.",
    shareText: getShareText(
      result.walletAddress,
      result.rank.rank,
      estimatedSwapVolume,
      totalSwaps,
      hasSwapData
    )
  };
}

function getShareText(
  walletAddress: string,
  rank: RankName,
  estimatedSwapVolume: string,
  totalSwaps: string,
  hasSwapData: boolean
): string {
  if (!hasSwapData) {
    return `Monad Swap Rank: ${walletAddress} has no swap data yet.`;
  }

  return `Monad Swap Rank: ${walletAddress} is ${rank} with ${estimatedSwapVolume} estimated swap volume across ${totalSwaps} swaps.`;
}
