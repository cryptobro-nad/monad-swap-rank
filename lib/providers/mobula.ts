import type { NormalizedSwap, NormalizedSwapToken } from "../ranking";

type JsonRecord = Record<string, unknown>;

export type MobulaTradeRecord = JsonRecord;

export function normalizeMobulaWalletTradesResponse(
  payload: unknown
): NormalizedSwap[] {
  return getMobulaTradeRecords(payload).map(normalizeMobulaTrade);
}

export function normalizeMobulaTrade(trade: MobulaTradeRecord): NormalizedSwap {
  const baseToken = asRecord(trade.baseToken);
  const quoteToken = asRecord(trade.quoteToken);

  return {
    txHash: getStringField(trade, [
      "transactionHash",
      "transaction_hash",
      "hash",
      "txHash"
    ]),
    status: getSwapStatus(trade),
    usdValue: getSwapUsdValue(trade),
    timestamp: getStringOrNumberField(trade, [
      "timestamp",
      "date",
      "time",
      "blockTime"
    ]),
    tokenIn: getTokenSummary(baseToken),
    tokenOut: getTokenSummary(quoteToken),
    source: getStringField(trade, ["source", "dex", "exchange", "platform"]),
    chain: getStringOrNumberField(trade, [
      "blockchain",
      "network",
      "chain",
      "chainId",
      "chain_id"
    ])
  };
}

function getMobulaTradeRecords(payload: unknown): MobulaTradeRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

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

function getSwapStatus(trade: MobulaTradeRecord): NormalizedSwap["status"] {
  const status = getStringField(trade, ["status", "transactionStatus"]).toLowerCase();

  if (status === "failed" || status === "fail" || status === "error") {
    return "failed";
  }

  if (trade.success === false || trade.isSuccessful === false) {
    return "failed";
  }

  return "success";
}

function getSwapUsdValue(trade: MobulaTradeRecord): number | null {
  const quoteTokenAmountUsd = toFiniteNumber(trade.quoteTokenAmountUSD);

  if (quoteTokenAmountUsd !== null) {
    return quoteTokenAmountUsd;
  }

  return toFiniteNumber(trade.baseTokenAmountUSD);
}

function getTokenSummary(
  token: JsonRecord | undefined
): NormalizedSwapToken | undefined {
  if (!token) {
    return undefined;
  }

  const address = getStringField(token, ["address", "contractAddress"]);
  const symbol = getStringField(token, ["symbol"]);

  if (!address && !symbol) {
    return undefined;
  }

  return {
    address: address || undefined,
    symbol: symbol || undefined
  };
}

function getStringField(record: JsonRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
}

function getStringOrNumberField(
  record: JsonRecord,
  keys: string[]
): string | number | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsedValue = Number(value);

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return null;
}

function asRecord(value: unknown): JsonRecord | undefined {
  return isRecord(value) ? value : undefined;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
