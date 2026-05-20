import { describe, expect, it } from "vitest";
import {
  calculateTotalSwapVolume,
  formatUsd,
  getRankFromVolume,
  type NormalizedSwap
} from "../lib/ranking";

describe("calculateTotalSwapVolume", () => {
  it("sums valid successful swaps", () => {
    const swaps: NormalizedSwap[] = [
      { txHash: "0xaaa", status: "success", usdValue: 100 },
      { txHash: "0xbbb", status: "success", usdValue: 250.5 },
      { txHash: "0xccc", status: "success", usdValue: 50 }
    ];

    expect(calculateTotalSwapVolume(swaps)).toBe(400.5);
  });

  it("ignores failed swaps", () => {
    const swaps: NormalizedSwap[] = [
      { txHash: "0xaaa", status: "success", usdValue: 100 },
      { txHash: "0xbbb", status: "failed", usdValue: 250 }
    ];

    expect(calculateTotalSwapVolume(swaps)).toBe(100);
  });

  it("ignores swaps with missing USD values", () => {
    const swaps: NormalizedSwap[] = [
      { txHash: "0xaaa", status: "success", usdValue: 100 },
      { txHash: "0xbbb", status: "success" },
      { txHash: "0xccc", status: "success", usdValue: null }
    ];

    expect(calculateTotalSwapVolume(swaps)).toBe(100);
  });

  it("ignores duplicate transaction hashes", () => {
    const swaps: NormalizedSwap[] = [
      { txHash: "0xaaa", status: "success", usdValue: 100 },
      { txHash: "0xbbb", status: "success", usdValue: 250 },
      { txHash: "0xAAA", status: "success", usdValue: 500 }
    ];

    expect(calculateTotalSwapVolume(swaps)).toBe(350);
  });

  it("returns 0 for zero swaps", () => {
    expect(calculateTotalSwapVolume([])).toBe(0);
  });
});

describe("getRankFromVolume", () => {
  it.each([
    [0, "No Swap Data"],
    [50, "Baby Nad"],
    [100, "Curious Nad"],
    [999.99, "Curious Nad"],
    [1_000, "Active Nad"],
    [9_999.99, "Active Nad"],
    [10_000, "Heavy Nad"],
    [99_999.99, "Heavy Nad"],
    [100_000, "Whale Nad"],
    [999_999.99, "Whale Nad"],
    [1_000_000, "Monad Monster"]
  ] as const)("maps $%s to %s", (volumeUsd, expectedRank) => {
    expect(getRankFromVolume(volumeUsd)).toMatchObject({
      rank: expectedRank,
      volumeUsd
    });
  });
});

describe("formatUsd", () => {
  it("formats whole dollar values without cents", () => {
    expect(formatUsd(42_180)).toBe("$42,180");
  });

  it("formats decimal dollar values with cents", () => {
    expect(formatUsd(42_180.75)).toBe("$42,180.75");
  });
});
