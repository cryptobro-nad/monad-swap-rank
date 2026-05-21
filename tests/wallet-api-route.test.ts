import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "../app/api/wallet/[address]/route";
import type { WalletRankResult } from "../lib/ranking";

const VALID_WALLET = "0xa4bB6472656E8D75A3590E4fDbE0d8C16C6d3369";
const ORIGINAL_MOBULA_API_KEY = process.env.MOBULA_API_KEY;

afterEach(() => {
  if (ORIGINAL_MOBULA_API_KEY === undefined) {
    delete process.env.MOBULA_API_KEY;
  } else {
    process.env.MOBULA_API_KEY = ORIGINAL_MOBULA_API_KEY;
  }

  vi.unstubAllGlobals();
});

describe("GET /api/wallet/[address]", () => {
  it("returns 400 for invalid wallet addresses", async () => {
    process.env.MOBULA_API_KEY = "test-key";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(createRequest("invalid"), createContext("invalid"));
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(payload.error).toContain("valid EVM wallet address");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a friendly 503 when MOBULA_API_KEY is missing", async () => {
    delete process.env.MOBULA_API_KEY;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      createRequest(VALID_WALLET),
      createContext(VALID_WALLET)
    );
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(503);
    expect(payload.error).toContain("Mobula is not configured");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns real-rank payload fields from mocked Mobula trades", async () => {
    process.env.MOBULA_API_KEY = "test-key";
    const fetchMock = vi.fn(async () =>
      Response.json({
        data: [
          {
            transactionHash: "0xswap1",
            quoteTokenAmountUSD: 250,
            baseTokenAmountUSD: 255,
            date: 1_779_299_200,
            baseToken: {
              address: "0x0000000000000000000000000000000000000001",
              symbol: "MON"
            },
            quoteToken: {
              address: "0x0000000000000000000000000000000000000002",
              symbol: "USDC"
            },
            blockchain: "Monad"
          },
          {
            transactionHash: "0xswap2",
            baseTokenAmountUSD: "150",
            gasFeesUSD: 10,
            totalFeesUSD: 12,
            baseToken: {
              symbol: "DAK"
            },
            quoteToken: {
              symbol: "MON"
            },
            blockchain: "Monad"
          }
        ],
        pagination: {
          offset: 0,
          limit: 100,
          pageEntries: 2
        }
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      createRequest(VALID_WALLET),
      createContext(VALID_WALLET)
    );
    const payload = (await response.json()) as WalletRankResult;
    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
    const requestInit = fetchMock.mock.calls[0][1] as RequestInit;

    expect(response.status).toBe(200);
    expect(requestedUrl.searchParams.get("wallet")).toBe(VALID_WALLET);
    expect(requestedUrl.searchParams.get("chainIds")).toBe("evm:143");
    expect(requestedUrl.searchParams.get("limit")).toBe("100");
    expect(requestInit.headers).toMatchObject({
      Authorization: "test-key"
    });
    expect(payload).toMatchObject({
      walletAddress: VALID_WALLET,
      rank: {
        rank: "Curious Nad",
        volumeUsd: 400
      },
      estimatedSwapVolume: 400,
      totalSwaps: 2,
      lastUpdated: "just now"
    });
    expect(payload).not.toHaveProperty("tokensHeld");
    expect(payload).not.toHaveProperty("nftsHeld");
  });

  it("returns No Swap Data when Mobula returns no trades", async () => {
    process.env.MOBULA_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          data: [],
          pagination: {
            offset: 0,
            limit: 100,
            pageEntries: 0
          }
        })
      )
    );

    const response = await GET(
      createRequest(VALID_WALLET),
      createContext(VALID_WALLET)
    );
    const payload = (await response.json()) as WalletRankResult;

    expect(response.status).toBe(200);
    expect(payload.rank).toEqual({
      rank: "No Swap Data",
      volumeUsd: 0
    });
    expect(payload.estimatedSwapVolume).toBe(0);
    expect(payload.totalSwaps).toBe(0);
  });

  it("returns a friendly error when Mobula fails", async () => {
    process.env.MOBULA_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ error: "provider failed" }, { status: 500 })
      )
    );

    const response = await GET(
      createRequest(VALID_WALLET),
      createContext(VALID_WALLET)
    );
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(502);
    expect(payload.error).toContain("Mobula wallet trades could not be loaded");
  });
});

function createRequest(address: string): Request {
  return new Request(`http://localhost:3000/api/wallet/${address}`);
}

function createContext(address: string) {
  return {
    params: Promise.resolve({
      address
    })
  };
}
