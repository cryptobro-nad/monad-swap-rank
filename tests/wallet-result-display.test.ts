import { describe, expect, it } from "vitest";
import { getWalletResultDisplay } from "../lib/wallet-result-display";
import type { WalletRankResult } from "../lib/ranking";

describe("getWalletResultDisplay", () => {
  it("builds display copy for wallets with real swap data", () => {
    const display = getWalletResultDisplay(
      createWalletResult({
        estimatedSwapVolume: 1_250.5,
        totalSwaps: 12,
        rank: {
          rank: "Active Nad",
          volumeUsd: 1_250.5
        }
      })
    );

    expect(display).toMatchObject({
      estimatedSwapVolume: "$1,250.50",
      totalSwaps: "12",
      hasSwapData: true,
      statusTitle: "Real swap data found"
    });
    expect(display.shareText).toContain("Active Nad");
    expect(display.shareText).toContain("$1,250.50");
  });

  it("builds display copy for wallets with no swap data", () => {
    const display = getWalletResultDisplay(
      createWalletResult({
        estimatedSwapVolume: 0,
        totalSwaps: 0,
        rank: {
          rank: "No Swap Data",
          volumeUsd: 0
        }
      })
    );

    expect(display).toMatchObject({
      estimatedSwapVolume: "$0",
      totalSwaps: "0",
      hasSwapData: false,
      statusTitle: "No swap data found"
    });
    expect(display.shareText).toBe(
      "Monad Swap Rank: 0xa4bB6472656E8D75A3590E4fDbE0d8C16C6d3369 has no swap data yet."
    );
  });
});

function createWalletResult(
  overrides: Partial<WalletRankResult>
): WalletRankResult {
  return {
    walletAddress: "0xa4bB6472656E8D75A3590E4fDbE0d8C16C6d3369",
    rank: {
      rank: "No Swap Data",
      volumeUsd: 0
    },
    estimatedSwapVolume: 0,
    totalSwaps: 0,
    tokensHeld: 12,
    nftsHeld: 6,
    lastUpdated: "just now",
    ...overrides
  };
}
