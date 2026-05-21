import type { WalletRankResult } from "./ranking";

export const WALLET_RANK_CACHE_TTL_MS = 5 * 60 * 1000;

export type WalletRankCacheEntry = {
  result: WalletRankResult;
  expiresAtMs: number;
};

export type WalletRankCache = Map<string, WalletRankCacheEntry>;

const walletRankCache: WalletRankCache = new Map();

export function getWalletRankCacheKey(walletAddress: string): string {
  return walletAddress.trim().toLowerCase();
}

export function readWalletRankCache(
  cache: WalletRankCache,
  cacheKey: string,
  nowMs = Date.now()
): WalletRankResult | undefined {
  const entry = cache.get(cacheKey);

  if (!entry) {
    return undefined;
  }

  if (entry.expiresAtMs <= nowMs) {
    cache.delete(cacheKey);
    return undefined;
  }

  return entry.result;
}

export function writeWalletRankCache(
  cache: WalletRankCache,
  cacheKey: string,
  result: WalletRankResult,
  nowMs = Date.now(),
  ttlMs = WALLET_RANK_CACHE_TTL_MS
) {
  cache.set(cacheKey, {
    result,
    expiresAtMs: nowMs + ttlMs
  });
}

export function readCachedWalletRankResult(
  walletAddress: string
): WalletRankResult | undefined {
  return readWalletRankCache(
    walletRankCache,
    getWalletRankCacheKey(walletAddress)
  );
}

export function writeCachedWalletRankResult(
  walletAddress: string,
  result: WalletRankResult
) {
  writeWalletRankCache(
    walletRankCache,
    getWalletRankCacheKey(walletAddress),
    result
  );
}

export function clearWalletRankResultCache() {
  walletRankCache.clear();
}
