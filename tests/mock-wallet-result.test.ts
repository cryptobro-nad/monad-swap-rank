import { describe, expect, it } from "vitest";
import { getMockWalletRankResult } from "../lib/mock-wallet-result";

describe("getMockWalletRankResult", () => {
  it("returns the Task 6 mock wallet rank payload", () => {
    const result = getMockWalletRankResult(
      "0x1234567890abcdef1234567890ABCDEF12345678"
    );

    expect(result).toMatchObject({
      walletAddress: "0x1234567890abcdef1234567890ABCDEF12345678",
      rank: {
        rank: "Heavy Nad",
        volumeUsd: 42_180
      },
      estimatedSwapVolume: 42_180,
      totalSwaps: 74,
      tokensHeld: 12,
      nftsHeld: 6,
      lastUpdated: "2 minutes ago"
    });
  });
});
