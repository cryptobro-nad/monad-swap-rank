import { getRankFromVolume, type WalletRankResult } from "./ranking";

const MOCK_ESTIMATED_SWAP_VOLUME_USD = 42_180;

export function getMockWalletRankResult(walletAddress: string): WalletRankResult {
  return {
    walletAddress,
    rank: getRankFromVolume(MOCK_ESTIMATED_SWAP_VOLUME_USD),
    estimatedSwapVolume: MOCK_ESTIMATED_SWAP_VOLUME_USD,
    totalSwaps: 74,
    lastUpdated: "2 minutes ago"
  };
}
