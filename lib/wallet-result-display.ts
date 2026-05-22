import {
  formatUsd,
  type WalletRankResult
} from "./ranking";
import { getRankCardVisual, type RankCardVisual } from "./rank-card-visuals";

export type WalletResultDisplay = {
  estimatedSwapVolume: string;
  totalSwaps: string;
  rankVisual: RankCardVisual;
  hasSwapData: boolean;
  statusTitle: string;
  statusDescription: string;
  shareText: string;
};

export function getWalletResultDisplay(
  result: WalletRankResult,
  appUrl: string
): WalletResultDisplay {
  const estimatedSwapVolume = formatUsd(result.estimatedSwapVolume);
  const totalSwaps = result.totalSwaps.toLocaleString("en-US");
  const rankVisual = getRankCardVisual(result.rank.rank, result.walletAddress);
  const hasSwapData =
    result.rank.rank !== "No Swap Data" &&
    result.estimatedSwapVolume > 0 &&
    result.totalSwaps > 0;

  return {
    estimatedSwapVolume,
    totalSwaps,
    rankVisual,
    hasSwapData,
    statusTitle: hasSwapData ? "Real swap data found" : "No swap data found",
    statusDescription: hasSwapData
      ? "Calculated from successful Mobula wallet trades with reliable USD values."
      : "Mobula did not return successful swaps with reliable USD values for this wallet yet.",
    shareText: getShareText(rankVisual, appUrl)
  };
}

function getShareText(visual: RankCardVisual, appUrl: string): string {
  return `Monad Swap Rank: ${visual.rank}. ${visual.tagline} ${appUrl}`;
}
