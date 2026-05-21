import { NextResponse } from "next/server";
import { normalizeMobulaWalletTradesResponse } from "../../../../lib/providers/mobula";
import {
  MOBULA_TRADES_MAX_PAGES,
  MOBULA_TRADES_PAGE_LIMIT,
  shouldFetchNextMobulaTradesPage
} from "../../../../lib/providers/mobula-pagination";
import {
  calculateTotalSwapVolume,
  getRankFromVolume,
  type NormalizedSwap,
  type WalletRankResult
} from "../../../../lib/ranking";
import { validateWalletAddress } from "../../../../lib/wallet-address";
import {
  readCachedWalletRankResult,
  writeCachedWalletRankResult
} from "../../../../lib/wallet-rank-cache";

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

  const cachedResult = readCachedWalletRankResult(walletAddress);

  if (cachedResult) {
    return NextResponse.json(cachedResult);
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

  const result = createWalletRankResult(walletAddress, mobulaResult.swaps);
  writeCachedWalletRankResult(walletAddress, result);

  return NextResponse.json(result);
}

async function fetchMobulaWalletTrades(
  walletAddress: string,
  mobulaApiKey: string
): Promise<MobulaFetchResult> {
  const swaps: NormalizedSwap[] = [];

  for (let page = 0; page < MOBULA_TRADES_MAX_PAGES; page += 1) {
    const currentOffset = page * MOBULA_TRADES_PAGE_LIMIT;
    const payload = await fetchMobulaWalletTradesPage(
      walletAddress,
      mobulaApiKey,
      currentOffset
    );

    if (!payload.ok) {
      return payload;
    }

    const pageSwaps = normalizeMobulaWalletTradesResponse(payload.data);
    swaps.push(...pageSwaps);

    if (
      !shouldFetchNextMobulaTradesPage({
        payload: payload.data,
        currentOffset,
        pageLimit: MOBULA_TRADES_PAGE_LIMIT,
        normalizedSwapCount: pageSwaps.length
      })
    ) {
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
  url.searchParams.set("limit", String(MOBULA_TRADES_PAGE_LIMIT));
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
