import { describe, expect, it } from "vitest";
import { calculateTotalSwapVolume } from "../lib/ranking";
import {
  normalizeMobulaTrade,
  normalizeMobulaWalletTradesResponse
} from "../lib/providers/mobula";

const liveLikeMobulaResponse = {
  data: {
    trades: [
      {
        transactionHash: "0xswap1",
        timestamp: "2026-05-20T18:40:00.000Z",
        baseTokenAmountUSD: 250.75,
        quoteTokenAmountUSD: 251.25,
        gasFeesUSD: 0.18,
        mevFeesUSD: 0.01,
        platformFeesUSD: 0.02,
        totalFeesUSD: 0.21,
        baseToken: {
          address: "0x0000000000000000000000000000000000000001",
          symbol: "MON"
        },
        quoteToken: {
          address: "0x0000000000000000000000000000000000000002",
          symbol: "USDC"
        },
        blockchain: "Monad",
        source: "test-dex"
      },
      {
        hash: "0xswap2",
        date: 1_779_299_200,
        baseTokenAmountUSD: "42.5",
        baseToken: {
          address: "0x0000000000000000000000000000000000000003",
          symbol: "DAK"
        },
        quoteToken: {
          address: "0x0000000000000000000000000000000000000004",
          symbol: "MON"
        },
        network: "monad-mainnet"
      }
    ]
  }
};

describe("normalizeMobulaWalletTradesResponse", () => {
  it("converts live-like Mobula trade records into normalized swaps", () => {
    expect(normalizeMobulaWalletTradesResponse(liveLikeMobulaResponse)).toEqual([
      {
        txHash: "0xswap1",
        status: "success",
        usdValue: 251.25,
        timestamp: "2026-05-20T18:40:00.000Z",
        tokenIn: {
          address: "0x0000000000000000000000000000000000000001",
          symbol: "MON"
        },
        tokenOut: {
          address: "0x0000000000000000000000000000000000000002",
          symbol: "USDC"
        },
        source: "test-dex",
        chain: "Monad"
      },
      {
        txHash: "0xswap2",
        status: "success",
        usdValue: 42.5,
        timestamp: 1_779_299_200,
        tokenIn: {
          address: "0x0000000000000000000000000000000000000003",
          symbol: "DAK"
        },
        tokenOut: {
          address: "0x0000000000000000000000000000000000000004",
          symbol: "MON"
        },
        source: "",
        chain: "monad-mainnet"
      }
    ]);
  });

  it("uses quoteTokenAmountUSD before baseTokenAmountUSD and does not add both sides", () => {
    const swaps = normalizeMobulaWalletTradesResponse(liveLikeMobulaResponse);

    expect(swaps[0].usdValue).toBe(251.25);
    expect(calculateTotalSwapVolume([swaps[0]])).toBe(251.25);
  });

  it("falls back to baseTokenAmountUSD when quoteTokenAmountUSD is missing", () => {
    const swap = normalizeMobulaTrade({
      transactionHash: "0xswap",
      baseTokenAmountUSD: "99.99"
    });

    expect(swap.usdValue).toBe(99.99);
  });

  it("does not use fee USD fields as swap volume", () => {
    const swap = normalizeMobulaTrade({
      transactionHash: "0xfeeonly",
      gasFeesUSD: 1,
      mevFeesUSD: 2,
      platformFeesUSD: 3,
      totalFeesUSD: 6
    });

    expect(swap.usdValue).toBeNull();
    expect(calculateTotalSwapVolume([swap])).toBe(0);
  });

  it("handles missing fields safely", () => {
    expect(normalizeMobulaTrade({})).toEqual({
      txHash: "",
      status: "success",
      usdValue: null,
      timestamp: undefined,
      tokenIn: undefined,
      tokenOut: undefined,
      source: "",
      chain: undefined
    });
  });

  it("marks failed Mobula trades as failed", () => {
    expect(
      normalizeMobulaTrade({
        transactionHash: "0xfailed",
        status: "failed",
        quoteTokenAmountUSD: 500
      })
    ).toMatchObject({
      txHash: "0xfailed",
      status: "failed",
      usdValue: 500
    });
  });
});
