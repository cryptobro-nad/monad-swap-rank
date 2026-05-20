const MOBULA_API_URL = "https://api.mobula.io/api/2/wallet/trades";
const MOBULA_API_KEY = "MOBULA_API_KEY";
const MONAD_CHAIN_IDS = "evm:143";
const DEFAULT_LIMIT = "10";

type JsonRecord = Record<string, unknown>;

type TokenSummary = {
  address?: string;
  symbol?: string;
  name?: string;
};

type MobulaSummary = {
  wallet: string;
  endpoint: string;
  chainIds: string;
  tradesReturned: number;
  usdValuesExist: boolean;
  usdValueFields: string[];
  sampleTransactionHash?: string;
  sampleTimestamp?: string | number;
  sampleTokenFields: {
    tokenIn?: unknown;
    tokenOut?: unknown;
    baseToken?: TokenSummary;
    quoteToken?: TokenSummary;
    base?: unknown;
    quote?: unknown;
    token0Address?: unknown;
    token1Address?: unknown;
  };
  paginationFieldsExist: boolean;
  paginationFields: string[];
  chainOrNetworkField?: unknown;
};

function loadLocalEnv(): void {
  try {
    process.loadEnvFile(".env.local");
  } catch (error: unknown) {
    if (!isErrorWithCode(error, "ENOENT")) {
      throw error;
    }
  }
}

function isEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

function getWalletArgument(): string | undefined {
  return process.argv
    .slice(2)
    .find((argument) => argument !== "--")
    ?.trim();
}

function isErrorWithCode(error: unknown, code: string): boolean {
  return isRecord(error) && error.code === code;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): JsonRecord | undefined {
  return isRecord(value) ? value : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

function asStringOrNumber(value: unknown): string | number | undefined {
  return typeof value === "string" || typeof value === "number"
    ? value
    : undefined;
}

function isUsdValue(value: unknown): boolean {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return Number.isFinite(Number(value));
  }

  return false;
}

function firstDefined(record: JsonRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return undefined;
}

function getTrades(payload: unknown): JsonRecord[] {
  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.data)) {
    return payload.data.filter(isRecord);
  }

  const data = asRecord(payload.data);

  if (data && Array.isArray(data.trades)) {
    return data.trades.filter(isRecord);
  }

  if (Array.isArray(payload.trades)) {
    return payload.trades.filter(isRecord);
  }

  return [];
}

function getPagination(payload: unknown): JsonRecord | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }

  const directPagination = asRecord(payload.pagination);

  if (directPagination) {
    return directPagination;
  }

  const data = asRecord(payload.data);

  return data ? asRecord(data.pagination) : undefined;
}

function getUsdValueFields(trades: JsonRecord[]): string[] {
  const fields = new Set<string>();

  for (const trade of trades) {
    for (const [key, value] of Object.entries(trade)) {
      if (key.toLowerCase().includes("usd") && isUsdValue(value)) {
        fields.add(key);
      }
    }
  }

  return [...fields].sort();
}

function summarizeToken(value: unknown): TokenSummary | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    address: asString(value.address),
    symbol: asString(value.symbol),
    name: asString(value.name)
  };
}

function summarizePayload(wallet: string, payload: unknown): MobulaSummary {
  const trades = getTrades(payload);
  const sampleTrade = trades[0];
  const pagination = getPagination(payload);
  const usdValueFields = getUsdValueFields(trades);

  return {
    wallet,
    endpoint: "/api/2/wallet/trades",
    chainIds: MONAD_CHAIN_IDS,
    tradesReturned: trades.length,
    usdValuesExist: usdValueFields.length > 0,
    usdValueFields,
    sampleTransactionHash: sampleTrade
      ? asString(
          firstDefined(sampleTrade, [
            "transactionHash",
            "transaction_hash",
            "hash",
            "txHash"
          ])
        )
      : undefined,
    sampleTimestamp: sampleTrade
      ? asStringOrNumber(
          firstDefined(sampleTrade, ["date", "timestamp", "time", "blockTime"])
        )
      : undefined,
    sampleTokenFields: sampleTrade
      ? {
          tokenIn: firstDefined(sampleTrade, [
            "tokenIn",
            "swapAssetIn",
            "assetIn"
          ]),
          tokenOut: firstDefined(sampleTrade, [
            "tokenOut",
            "swapAssetOut",
            "assetOut"
          ]),
          baseToken: summarizeToken(sampleTrade.baseToken),
          quoteToken: summarizeToken(sampleTrade.quoteToken),
          base: firstDefined(sampleTrade, ["base", "base_token"]),
          quote: firstDefined(sampleTrade, ["quote", "quote_token"]),
          token0Address: firstDefined(sampleTrade, [
            "token0Address",
            "token0_address"
          ]),
          token1Address: firstDefined(sampleTrade, [
            "token1Address",
            "token1_address"
          ])
        }
      : {},
    paginationFieldsExist: Boolean(pagination && Object.keys(pagination).length),
    paginationFields: pagination ? Object.keys(pagination).sort() : [],
    chainOrNetworkField: sampleTrade
      ? firstDefined(sampleTrade, [
          "blockchain",
          "chainId",
          "chain_id",
          "network",
          "chain"
        ])
      : undefined
  };
}

async function main(): Promise<void> {
  loadLocalEnv();

  const wallet = getWalletArgument();
  const apiKey = process.env[MOBULA_API_KEY]?.trim();

  if (!wallet) {
    console.error(
      "Missing wallet address. Usage: pnpm test:mobula -- <wallet-address>"
    );
    process.exitCode = 1;
    return;
  }

  if (!isEvmAddress(wallet)) {
    console.error("Invalid wallet address. Expected a 42-character 0x EVM address.");
    process.exitCode = 1;
    return;
  }

  if (!apiKey) {
    console.error(
      "Missing MOBULA_API_KEY. Add it to your shell environment or .env.local before running this server-side script."
    );
    process.exitCode = 1;
    return;
  }

  const url = new URL(MOBULA_API_URL);
  url.searchParams.set("wallet", wallet);
  url.searchParams.set("chainIds", MONAD_CHAIN_IDS);
  url.searchParams.set("limit", DEFAULT_LIMIT);
  url.searchParams.set("offset", "0");
  url.searchParams.set("order", "desc");

  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
      Accept: "application/json"
    }
  });

  const responseText = await response.text();
  const payload = responseText ? JSON.parse(responseText) : {};

  if (!response.ok) {
    console.error("Mobula wallet trades request failed.");
    console.error(
      JSON.stringify(
        {
          status: response.status,
          statusText: response.statusText,
          body: payload
        },
        null,
        2
      )
    );
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify(summarizePayload(wallet, payload), null, 2));
}

main().catch((error: unknown) => {
  console.error("Mobula wallet trades test failed unexpectedly.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
