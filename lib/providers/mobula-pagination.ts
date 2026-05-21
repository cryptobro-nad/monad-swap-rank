export const MOBULA_TRADES_PAGE_LIMIT = 100;
export const MOBULA_TRADES_MAX_PAGES = 10;

type JsonRecord = Record<string, unknown>;

export function shouldFetchNextMobulaTradesPage({
  payload,
  currentOffset,
  pageLimit,
  normalizedSwapCount
}: {
  payload: unknown;
  currentOffset: number;
  pageLimit: number;
  normalizedSwapCount: number;
}): boolean {
  const pagination = getMobulaPagination(payload);

  if (pagination?.hasNextPage === false) {
    return false;
  }

  const pageEntries = pagination?.pageEntries ?? normalizedSwapCount;

  if (pageEntries <= 0) {
    return false;
  }

  if (
    pagination?.totalEntries !== undefined &&
    currentOffset + pageEntries >= pagination.totalEntries
  ) {
    return false;
  }

  if (pageEntries < pageLimit) {
    return false;
  }

  if (pagination?.hasNextPage === true) {
    return true;
  }

  return normalizedSwapCount >= pageLimit;
}

function getMobulaPagination(payload: unknown):
  | {
      pageEntries?: number;
      totalEntries?: number;
      hasNextPage?: boolean;
    }
  | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }

  const data = asRecord(payload.data);
  const pagination =
    asRecord(payload.pagination) ?? (data ? asRecord(data.pagination) : undefined);

  if (!pagination) {
    return undefined;
  }

  return {
    pageEntries: getFiniteNumber(pagination, [
      "pageEntries",
      "page_entries",
      "count",
      "items"
    ]),
    totalEntries: getFiniteNumber(pagination, [
      "total",
      "totalEntries",
      "total_entries",
      "totalItems",
      "total_items"
    ]),
    hasNextPage: getBooleanField(pagination, [
      "hasNextPage",
      "has_next_page",
      "hasMore",
      "has_more"
    ])
  };
}

function getFiniteNumber(
  record: JsonRecord,
  keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return undefined;
}

function getBooleanField(
  record: JsonRecord,
  keys: string[]
): boolean | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "boolean") {
      return value;
    }
  }

  return undefined;
}

function asRecord(value: unknown): JsonRecord | undefined {
  return isRecord(value) ? value : undefined;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
