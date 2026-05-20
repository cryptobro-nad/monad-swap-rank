import { NextResponse } from "next/server";
import { normalizeMobulaWalletTradesResponse } from "../../../../lib/providers/mobula";
import {
  calculateTotalSwapVolume,
  getRankFromVolume,
  type NormalizedSwap,
  type WalletRankResult
} from "../../../../lib/ranking";
import { validateWalletAddress } from "../../../../lib/wallet-address";

type WalletRouteContext = {
  params: Promise<{
    address: string;
  }>;
};

type MobulaFetchResult =
  | {
      ok: true;
      swaps: NormalizedSwap[];
    }
  | {
      ok: false;
      error: string;
      status: number;
    };

const MOBULA_API_URL = "https://api.mobula.io/api/2/wallet/trades";
const MONAD_MAINNET_CHAIN_ID = "evm:143";
const MOBULA_PAGE_LIMIT = 100;
const MOBULA_MAX_PAGES = 5;
const MOCK_TOKENS_HELD = 12;
const MOCK_NFTS_HELD = 6;

export async function GET(_request: Request, { params }: WalletRouteContext) {
  const { address } = await params;
  const walletAddress = decodeURIComponent(address).trim();

  if (!validateWalletAddress(walletAddress)) {
    return NextResponse.json(
      {
        error: "Please enter a valid EVM wallet address that starts with 0x."
      },
      { status: 400 }
    );
  }

  const mobulaApiKey = process.env.MOBULA_API_KEY?.trim();

  if (!mobulaApiKey) {
    return NextResponse.json(
      {
        error:
          "Mobula is not configured yet. Please try this wallet lookup again later."
      },
      { status: 503 }
    );
  }

  const mobulaResult = await fetchMobulaWalletTrades(walletAddress, mobulaApiKey);

  if (!mobulaResult.ok) {
    return NextResponse.json(
      {
        error: mobulaResult.error
      },
      { status: mobulaResult.status }
    );
  }

  return NextResponse.json(
    createWalletRankResult(walletAddress, mobulaResult.swaps)
  );
}

async function fetchMobulaWalletTrades(
  walletAddress: string,
  mobulaApiKey: string
): Promise<MobulaFetchResult> {
  const swaps: NormalizedSwap[] = [];

  for (let page = 0; page < MOBULA_MAX_PAGES; page += 1) {
    const payload = await fetchMobulaWalletTradesPage(
      walletAddress,
      mobulaApiKey,
      page * MOBULA_PAGE_LIMIT
    );

    if (!payload.ok) {
      return payload;
    }

    const pageSwaps = normalizeMobulaWalletTradesResponse(payload.data);
    swaps.push(...pageSwaps);

    if (!hasAnotherMobulaPage(payload.data, pageSwaps.length)) {
      break;
    }
  }

  return {
    ok: true,
    swaps
  };
}

async function fetchMobulaWalletTradesPage(
  walletAddress: string,
  mobulaApiKey: string,
  offset: number
): Promise<
  | {
      ok: true;
      data: unknown;
    }
  | {
      ok: false;
      error: string;
      status: number;
    }
> {
  const url = new URL(MOBULA_API_URL);
  url.searchParams.set("wallet", walletAddress);
  url.searchParams.set("chainIds", MONAD_MAINNET_CHAIN_ID);
  url.searchParams.set("limit", String(MOBULA_PAGE_LIMIT));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("order", "desc");

  let response: Response;

  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: mobulaApiKey
      }
    });
  } catch {
    return {
      ok: false,
      error:
        "Unable to reach Mobula wallet trades right now. Please try again later.",
      status: 502
    };
  }

  const payload = await safelyReadJson(response);

  if (!response.ok) {
    return {
      ok: false,
      error:
        "Mobula wallet trades could not be loaded right now. Please try again later.",
      status: 502
    };
  }

  if (payload === null) {
    return {
      ok: false,
      error:
        "Mobula returned an unreadable wallet trades response. Please try again later.",
      status: 502
    };
  }

  return {
    ok: true,
    data: payload
  };
}

async function safelyReadJson(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function hasAnotherMobulaPage(payload: unknown, normalizedSwapCount: number): boolean {
  const pageEntries = getMobulaPageEntries(payload);

  if (pageEntries !== undefined) {
    return pageEntries >= MOBULA_PAGE_LIMIT;
  }

  return normalizedSwapCount >= MOBULA_PAGE_LIMIT;
}

function getMobulaPageEntries(payload: unknown): number | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }

  const directPagination = asRecord(payload.pagination);
  const data = asRecord(payload.data);
  const nestedPagination = data ? asRecord(data.pagination) : undefined;
  const pagination = directPagination ?? nestedPagination;
  const pageEntries = pagination?.pageEntries;

  return typeof pageEntries === "number" && Number.isFinite(pageEntries)
    ? pageEntries
    : undefined;
}

function createWalletRankResult(
  walletAddress: string,
  swaps: NormalizedSwap[]
): WalletRankResult {
  const estimatedSwapVolume = calculateTotalSwapVolume(swaps);

  return {
    walletAddress,
    rank: getRankFromVolume(estimatedSwapVolume),
    estimatedSwapVolume,
    totalSwaps: countUniqueSuccessfulSwaps(swaps),
    tokensHeld: MOCK_TOKENS_HELD,
    nftsHeld: MOCK_NFTS_HELD,
    lastUpdated: "just now"
  };
}

function countUniqueSuccessfulSwaps(swaps: NormalizedSwap[]): number {
  const transactionHashes = new Set<string>();

  for (const swap of swaps) {
    const transactionHash = swap.txHash.trim().toLowerCase();

    if (swap.status === "success" && transactionHash.length > 0) {
      transactionHashes.add(transactionHash);
    }
  }

  return transactionHashes.size;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
