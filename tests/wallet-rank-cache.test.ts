import { describe, expect, it } from "vitest";
import {
  getWalletRankCacheKey,
  readWalletRankCache,
  WALLET_RANK_CACHE_TTL_MS,
  writeWalletRankCache,
  type WalletRankCache
} from "../lib/wallet-rank-cache";
import type { WalletRankResult } from "../lib/ranking";

describe("wallet rank cache", () => {
  it("normalizes wallet cache keys", () => {
    expect(
      getWalletRankCacheKey("  0xa4bB6472656E8D75A3590E4fDbE0d8C16C6d3369  ")
    ).toBe("0xa4bb6472656e8d75a3590e4fdbe0d8c16c6d3369");
  });

  it("returns cached results before the TTL expires", () => {
    const cache: WalletRankCache = new Map();
    const result = createWalletResult();
    const cacheKey = getWalletRankCacheKey(result.walletAddress);

    writeWalletRankCache(cache, cacheKey, result, 1_000);

    expect(
      readWalletRankCache(cache, cacheKey, 1_000 + WALLET_RANK_CACHE_TTL_MS - 1)
    ).toBe(result);
  });

  it("drops cached results after the TTL expires", () => {
    const cache: WalletRankCache = new Map();
    const result = createWalletResult();
    const cacheKey = getWalletRankCacheKey(result.walletAddress);

    writeWalletRankCache(cache, cacheKey, result, 1_000);

    expect(
      readWalletRankCache(cache, cacheKey, 1_000 + WALLET_RANK_CACHE_TTL_MS)
    ).toBeUndefined();
    expect(cache.has(cacheKey)).toBe(false);
  });
});

function createWalletResult(): WalletRankResult {
  return {
    walletAddress: "0xa4bB6472656E8D75A3590E4fDbE0d8C16C6d3369",
    rank: {
      rank: "Curious Nad",
      volumeUsd: 220
    },
    estimatedSwapVolume: 220,
    totalSwaps: 1,
    lastUpdated: "just now"
  };
}
