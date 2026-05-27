{
const BLOCKVISION_BASE_URL = "https://api.blockvision.org/v2/monad";
const BLOCKVISION_API_KEY = "BLOCKVISION_API_KEY";
const FIRST_PAGE_LIMIT = "50";
const BETWEEN_ENDPOINT_DELAY_MS = 1750;
const BETWEEN_TRANSACTION_PAGE_DELAY_MS = 1750;
const RATE_LIMIT_RETRY_DELAY_MS = 7500;
const RATE_LIMIT_STATUS = 429;
const DEFAULT_TRANSACTION_MAX_PAGES = 5;
const MAX_TRANSACTION_MAX_PAGES = 10;
const TRANSACTION_CURSOR_PARAM = "cursor";

type JsonRecord = Record<string, unknown>;
type EndpointKey = "tokens" | "nfts" | "transactions" | "activities";

type CountSummary = {
  value?: number;
  source:
    | "response-field"
    | "first-page-records"
    | "paginated-records"
    | "unavailable";
};

type RetrySummary = {
  attempted: boolean;
  initialStatus?: number;
  finalStatus?: number;
  delayMs?: number;
  recovered?: boolean;
};

type EndpointSummary = {
  key: EndpointKey;
  name: string;
  endpoint: string;
  status: number;
  ok: boolean;
  rateLimited: boolean;
  retry: RetrySummary;
  recordsReturned: number;
  count: CountSummary;
  paginationFieldsExist: boolean;
  paginationFields: string[];
  responseShapeNotes: {
    topLevelKeys: string[];
    nestedKeys: string[];
    firstRecordKeys: string[];
  };
  sampleRecords: JsonRecord[];
  transactionPagination?: TransactionPaginationSummary;
  message?: string;
  error?: unknown;
};

type TransactionPaginationSummary = {
  endpoint: "transactions";
  pagesFetched: number;
  recordsFetched: number;
  maxPages: number;
  hasMoreAfterMaxPages: boolean;
  lastNextPageCursorExists: boolean;
  rateLimit: {
    pagesRateLimited: number;
    retriesAttempted: number;
    recoveredRetries: number;
    stoppedByRateLimit: boolean;
  };
  firstSampleTransaction?: JsonRecord;
  lastSampleTransaction?: JsonRecord;
  stopReason:
    | "no-next-page"
    | "max-pages-reached"
    | "provider-error"
    | "no-records";
  pageStatuses: number[];
  pageRecordCounts: number[];
  pageDelayMs: number;
  cursorParam: typeof TRANSACTION_CURSOR_PARAM;
};

type BlockVisionSummary = {
  wallet: string;
  provider: "BlockVision";
  network: "Monad";
  endpointFilter: EndpointKey | "all";
  requestPolicy: {
    sequential: boolean;
    betweenEndpointDelayMs: number;
    transactionPageDelayMs: number;
    rateLimitRetryDelayMs: number;
    maxRetriesPerEndpoint: number;
    transactionPaginationEnabled: boolean;
    transactionMaxPages: number;
    transactionMaxPagesLimit: number;
  };
  tokenCount?: number;
  nftCount?: number;
  transactionCount?: number;
  transactionPagination?: TransactionPaginationSummary;
  endpoints: EndpointSummary[];
};

type BlockVisionEndpoint = {
  key: EndpointKey;
  name: string;
  path: string;
  params: Record<string, string>;
  countKeys: string[];
  includeSampleRecords?: boolean;
};

type EndpointResponse = {
  status: number;
  ok: boolean;
  payload: unknown;
  retry: RetrySummary;
  rateLimited: boolean;
  message?: string;
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

function parseArguments(args: string[]): {
  wallet?: string;
  endpointFilter?: EndpointKey;
  endpointError?: string;
  maxPages: number;
  maxPagesError?: string;
} {
  let wallet: string | undefined;
  let endpointFilter: EndpointKey | undefined;
  let endpointError: string | undefined;
  let maxPages = DEFAULT_TRANSACTION_MAX_PAGES;
  let maxPagesError: string | undefined;

  for (const argument of args) {
    if (argument === "--") {
      continue;
    }

    if (argument.startsWith("--endpoint=")) {
      const rawEndpoint = argument.slice("--endpoint=".length).trim();

      if (isEndpointKey(rawEndpoint)) {
        endpointFilter = rawEndpoint;
      } else {
        endpointError = `Invalid endpoint "${rawEndpoint}". Use one of: tokens, nfts, transactions, activities.`;
      }

      continue;
    }

    if (argument.startsWith("--max-pages=")) {
      const rawMaxPages = argument.slice("--max-pages=".length).trim();
      const parsedMaxPages = Number(rawMaxPages);

      if (
        Number.isInteger(parsedMaxPages) &&
        parsedMaxPages >= 1 &&
        parsedMaxPages <= MAX_TRANSACTION_MAX_PAGES
      ) {
        maxPages = parsedMaxPages;
      } else {
        maxPagesError = `Invalid --max-pages value "${rawMaxPages}". Use an integer from 1 to ${MAX_TRANSACTION_MAX_PAGES}.`;
      }

      continue;
    }

    if (!wallet) {
      wallet = argument.trim();
    }
  }

  return {
    wallet,
    endpointFilter,
    endpointError,
    maxPages,
    maxPagesError
  };
}

function isEndpointKey(value: string): value is EndpointKey {
  return (
    value === "tokens" ||
    value === "nfts" ||
    value === "transactions" ||
    value === "activities"
  );
}

function isEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

function isErrorWithCode(error: unknown, code: string): boolean {
  return isRecord(error) && error.code === code;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRecordKeys(value: unknown): string[] {
  return isRecord(value) ? Object.keys(value).sort() : [];
}

function firstDefined(record: JsonRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return undefined;
}

function findStringField(value: unknown, keys: string[]): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const normalizedKeys = new Set(keys.map((key) => key.toLowerCase()));

  for (const [key, childValue] of Object.entries(value)) {
    if (
      normalizedKeys.has(key.toLowerCase()) &&
      typeof childValue === "string" &&
      childValue.trim().length > 0
    ) {
      return childValue;
    }
  }

  for (const childValue of Object.values(value)) {
    const nestedValue = findStringField(childValue, keys);

    if (nestedValue !== undefined) {
      return nestedValue;
    }
  }

  return undefined;
}

function findNextPageCursor(value: unknown): string | undefined {
  return findStringField(value, ["nextPageCursor", "nextCursor"]);
}

function asStringOrNumber(value: unknown): string | number | undefined {
  return typeof value === "string" || typeof value === "number"
    ? value
    : undefined;
}

function asFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function findFirstRecordArray(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  if (!isRecord(value)) {
    return [];
  }

  const preferredKeys = [
    "data",
    "result",
    "items",
    "list",
    "records",
    "tokens",
    "nfts",
    "transactions",
    "activities"
  ];

  for (const key of preferredKeys) {
    const childValue = value[key];

    if (Array.isArray(childValue)) {
      return childValue.filter(isRecord);
    }

    const nestedRecords = findFirstRecordArray(childValue);

    if (nestedRecords.length > 0) {
      return nestedRecords;
    }
  }

  for (const childValue of Object.values(value)) {
    const nestedRecords = findFirstRecordArray(childValue);

    if (nestedRecords.length > 0) {
      return nestedRecords;
    }
  }

  return [];
}

function findNestedKeys(value: unknown): string[] {
  if (!isRecord(value)) {
    return [];
  }

  const dataKeys = getRecordKeys(value.data);
  const resultKeys = getRecordKeys(value.result);

  return [...new Set([...dataKeys, ...resultKeys])].sort();
}

function collectPaginationFields(value: unknown, prefix = ""): string[] {
  if (!isRecord(value)) {
    return [];
  }

  const paginationPatterns = [
    "cursor",
    "page",
    "limit",
    "offset",
    "total",
    "hasnext",
    "next"
  ];

  const fields = new Set<string>();

  for (const [key, childValue] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const normalizedKey = key.toLowerCase();

    if (paginationPatterns.some((pattern) => normalizedKey.includes(pattern))) {
      fields.add(path);
    }

    if (isRecord(childValue)) {
      for (const childField of collectPaginationFields(childValue, path)) {
        fields.add(childField);
      }
    }
  }

  return [...fields].sort();
}

function findCountField(
  value: unknown,
  countKeys: string[]
): number | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const normalizedKeys = new Set(countKeys.map((key) => key.toLowerCase()));

  for (const [key, childValue] of Object.entries(value)) {
    if (normalizedKeys.has(key.toLowerCase())) {
      const count = asFiniteNumber(childValue);

      if (count !== undefined) {
        return count;
      }
    }
  }

  for (const childValue of Object.values(value)) {
    const nestedCount = findCountField(childValue, countKeys);

    if (nestedCount !== undefined) {
      return nestedCount;
    }
  }

  return undefined;
}

function summarizeRecord(record: JsonRecord): JsonRecord {
  const summary: JsonRecord = {
    keys: Object.keys(record).sort().slice(0, 18)
  };

  const hash = asStringOrNumber(
    firstDefined(record, ["hash", "txHash", "transactionHash", "transaction_hash"])
  );
  const timestamp = asStringOrNumber(
    firstDefined(record, ["timestamp", "blockTime", "time", "date"])
  );
  const type = asStringOrNumber(
    firstDefined(record, ["type", "activityType", "method"])
  );
  const status = asStringOrNumber(firstDefined(record, ["status", "success"]));
  const from = asStringOrNumber(firstDefined(record, ["from", "fromAddress"]));
  const to = asStringOrNumber(firstDefined(record, ["to", "toAddress"]));

  if (hash !== undefined) {
    summary.hash = hash;
  }

  if (timestamp !== undefined) {
    summary.timestamp = timestamp;
  }

  if (type !== undefined) {
    summary.type = type;
  }

  if (status !== undefined) {
    summary.status = status;
  }

  if (from !== undefined) {
    summary.from = from;
  }

  if (to !== undefined) {
    summary.to = to;
  }

  return summary;
}

function summarizeRecords(records: JsonRecord[]): JsonRecord[] {
  return records.slice(0, 3).map(summarizeRecord);
}

function getCountSummary(
  payload: unknown,
  recordsReturned: number,
  countKeys: string[]
): CountSummary {
  const responseCount = findCountField(payload, countKeys);

  if (responseCount !== undefined) {
    return {
      value: responseCount,
      source: "response-field"
    };
  }

  if (recordsReturned > 0) {
    return {
      value: recordsReturned,
      source: "first-page-records"
    };
  }

  return {
    source: "unavailable"
  };
}

function createEndpointSummary(
  endpoint: BlockVisionEndpoint,
  status: number,
  ok: boolean,
  payload: unknown,
  retry: RetrySummary = { attempted: false },
  message?: string
): EndpointSummary {
  const records = findFirstRecordArray(payload);
  const paginationFields = collectPaginationFields(payload);

  return {
    key: endpoint.key,
    name: endpoint.name,
    endpoint: endpoint.path,
    status,
    ok,
    rateLimited: status === RATE_LIMIT_STATUS,
    retry,
    recordsReturned: records.length,
    count: getCountSummary(payload, records.length, endpoint.countKeys),
    paginationFieldsExist: paginationFields.length > 0,
    paginationFields,
    responseShapeNotes: {
      topLevelKeys: getRecordKeys(payload),
      nestedKeys: findNestedKeys(payload),
      firstRecordKeys: getRecordKeys(records[0])
    },
    sampleRecords: endpoint.includeSampleRecords ? summarizeRecords(records) : [],
    message,
    error: ok ? undefined : payload
  };
}

function parseJsonResponse(responseText: string): unknown {
  if (!responseText) {
    return {};
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return {
      parseError: "Response was not valid JSON.",
      rawBodyPreview: responseText.slice(0, 500)
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function requestEndpointPayloadOnce(
  endpoint: BlockVisionEndpoint,
  apiKey: string
): Promise<EndpointResponse> {
  const url = new URL(`${BLOCKVISION_BASE_URL}${endpoint.path}`);

  for (const [key, value] of Object.entries(endpoint.params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-api-key": apiKey
    }
  });
  const responseText = await response.text();
  const payload = parseJsonResponse(responseText);

  return {
    status: response.status,
    ok: response.ok,
    payload,
    retry: { attempted: false },
    rateLimited: response.status === RATE_LIMIT_STATUS
  };
}

async function requestEndpointWithRateLimitRetry(
  endpoint: BlockVisionEndpoint,
  apiKey: string
): Promise<EndpointSummary> {
  const response = await requestEndpointWithRateLimitRetryPayload(endpoint, apiKey);

  return createEndpointSummary(
    endpoint,
    response.status,
    response.ok,
    response.payload,
    response.retry,
    response.message
  );
}

async function requestEndpointWithRateLimitRetryPayload(
  endpoint: BlockVisionEndpoint,
  apiKey: string
): Promise<EndpointResponse> {
  const firstAttempt = await requestEndpointPayloadOnce(endpoint, apiKey);

  if (firstAttempt.status !== RATE_LIMIT_STATUS) {
    return firstAttempt;
  }

  await delay(RATE_LIMIT_RETRY_DELAY_MS);

  const retryAttempt = await requestEndpointPayloadOnce(endpoint, apiKey);
  const recovered = retryAttempt.status !== RATE_LIMIT_STATUS && retryAttempt.ok;
  const retry: RetrySummary = {
    attempted: true,
    initialStatus: firstAttempt.status,
    finalStatus: retryAttempt.status,
    delayMs: RATE_LIMIT_RETRY_DELAY_MS,
    recovered
  };
  const message = recovered
    ? "Endpoint initially returned HTTP 429, then succeeded after one delayed retry."
    : "Endpoint returned HTTP 429. Retried once after a delay; still limited or unavailable.";

  return {
    ...retryAttempt,
    rateLimited: retryAttempt.status === RATE_LIMIT_STATUS,
    retry,
    message
  };
}

function createEndpointWithCursor(
  endpoint: BlockVisionEndpoint,
  cursor?: string
): BlockVisionEndpoint {
  if (!cursor) {
    return endpoint;
  }

  return {
    ...endpoint,
    params: {
      ...endpoint.params,
      [TRANSACTION_CURSOR_PARAM]: cursor
    }
  };
}

async function requestPaginatedTransactionEndpoint(
  endpoint: BlockVisionEndpoint,
  apiKey: string,
  maxPages: number
): Promise<EndpointSummary> {
  const records: JsonRecord[] = [];
  const pageStatuses: number[] = [];
  const pageRecordCounts: number[] = [];
  let nextPageCursor: string | undefined;
  let lastPayload: unknown = {};
  let lastResponse: EndpointResponse | undefined;
  let pagesRateLimited = 0;
  let retriesAttempted = 0;
  let recoveredRetries = 0;
  let stopReason: TransactionPaginationSummary["stopReason"] = "max-pages-reached";

  for (let pageIndex = 0; pageIndex < maxPages; pageIndex += 1) {
    if (pageIndex > 0) {
      await delay(BETWEEN_TRANSACTION_PAGE_DELAY_MS);
    }

    const pageEndpoint = createEndpointWithCursor(endpoint, nextPageCursor);
    const response = await requestEndpointWithRateLimitRetryPayload(
      pageEndpoint,
      apiKey
    );
    const pageRecords = findFirstRecordArray(response.payload);
    const pageNextCursor = findNextPageCursor(response.payload);

    lastPayload = response.payload;
    lastResponse = response;
    pageStatuses.push(response.status);
    pageRecordCounts.push(pageRecords.length);
    records.push(...pageRecords);

    if (response.rateLimited || response.retry.initialStatus === RATE_LIMIT_STATUS) {
      pagesRateLimited += 1;
    }

    if (response.retry.attempted) {
      retriesAttempted += 1;

      if (response.retry.recovered) {
        recoveredRetries += 1;
      }
    }

    if (!response.ok) {
      stopReason = "provider-error";
      break;
    }

    if (pageRecords.length === 0) {
      stopReason = "no-records";
      nextPageCursor = pageNextCursor;
      break;
    }

    if (!pageNextCursor) {
      stopReason = "no-next-page";
      nextPageCursor = undefined;
      break;
    }

    nextPageCursor = pageNextCursor;
  }

  const pagesFetched = pageStatuses.length;
  const hasMoreAfterMaxPages =
    stopReason === "max-pages-reached" && Boolean(nextPageCursor);
  const lastNextPageCursorExists = Boolean(nextPageCursor);
  const pagination: TransactionPaginationSummary = {
    endpoint: "transactions",
    pagesFetched,
    recordsFetched: records.length,
    maxPages,
    hasMoreAfterMaxPages,
    lastNextPageCursorExists,
    rateLimit: {
      pagesRateLimited,
      retriesAttempted,
      recoveredRetries,
      stoppedByRateLimit: lastResponse?.status === RATE_LIMIT_STATUS
    },
    firstSampleTransaction: records[0] ? summarizeRecord(records[0]) : undefined,
    lastSampleTransaction: records.at(-1)
      ? summarizeRecord(records.at(-1) as JsonRecord)
      : undefined,
    stopReason,
    pageStatuses,
    pageRecordCounts,
    pageDelayMs: BETWEEN_TRANSACTION_PAGE_DELAY_MS,
    cursorParam: TRANSACTION_CURSOR_PARAM
  };
  const baseSummary = createEndpointSummary(
    endpoint,
    lastResponse?.status ?? 0,
    lastResponse?.ok ?? false,
    lastPayload,
    lastResponse?.retry ?? { attempted: false },
    lastResponse?.message
  );

  return {
    ...baseSummary,
    recordsReturned: records.length,
    count:
      records.length > 0
        ? { value: records.length, source: "paginated-records" }
        : baseSummary.count,
    sampleRecords: summarizeRecords(records),
    transactionPagination: pagination
  };
}

async function requestEndpointsSequentially(
  endpoints: BlockVisionEndpoint[],
  apiKey: string,
  options: { paginateTransactions: boolean; maxPages: number }
): Promise<EndpointSummary[]> {
  const summaries: EndpointSummary[] = [];

  for (const [index, endpoint] of endpoints.entries()) {
    if (index > 0) {
      await delay(BETWEEN_ENDPOINT_DELAY_MS);
    }

    summaries.push(
      options.paginateTransactions && endpoint.key === "transactions"
        ? await requestPaginatedTransactionEndpoint(
            endpoint,
            apiKey,
            options.maxPages
          )
        : await requestEndpointWithRateLimitRetry(endpoint, apiKey)
    );
  }

  return summaries;
}

async function main(): Promise<void> {
  loadLocalEnv();

  const options = parseArguments(process.argv.slice(2));
  const wallet = options.wallet;
  const apiKey = process.env[BLOCKVISION_API_KEY]?.trim();

  if (!wallet) {
    console.error(
      "Missing wallet address. Usage: pnpm test:blockvision -- <wallet-address> [--endpoint=tokens|nfts|transactions|activities] [--max-pages=5]"
    );
    process.exitCode = 1;
    return;
  }

  if (options.endpointError) {
    console.error(options.endpointError);
    process.exitCode = 1;
    return;
  }

  if (options.maxPagesError) {
    console.error(options.maxPagesError);
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
      "Missing BLOCKVISION_API_KEY. Add it to your shell environment or .env.local before running this server-side research script."
    );
    process.exitCode = 1;
    return;
  }

  const endpoints: BlockVisionEndpoint[] = [
    {
      key: "tokens",
      name: "accountTokens",
      path: "/account/tokens",
      params: { address: wallet },
      countKeys: ["tokenCount", "tokensCount", "total", "totalCount", "count"]
    },
    {
      key: "nfts",
      name: "accountNfts",
      path: "/account/nfts",
      params: {
        address: wallet,
        pageIndex: "1",
        verified: "false",
        unknown: "true"
      },
      countKeys: ["nftCount", "nftsCount", "total", "totalCount", "count"]
    },
    {
      key: "transactions",
      name: "accountTransactions",
      path: "/account/transactions",
      params: {
        address: wallet,
        limit: FIRST_PAGE_LIMIT,
        ascendingOrder: "false"
      },
      countKeys: [
        "transactionCount",
        "transactionsCount",
        "txCount",
        "total",
        "totalCount",
        "count"
      ],
      includeSampleRecords: true
    },
    {
      key: "activities",
      name: "accountActivities",
      path: "/account/activities",
      params: {
        address: wallet,
        limit: FIRST_PAGE_LIMIT,
        ascendingOrder: "false"
      },
      countKeys: ["activityCount", "activitiesCount", "total", "totalCount", "count"],
      includeSampleRecords: true
    }
  ];
  const selectedEndpoints = options.endpointFilter
    ? endpoints.filter((endpoint) => endpoint.key === options.endpointFilter)
    : endpoints;

  const shouldPaginateTransactions = options.endpointFilter === "transactions";
  const summaries = await requestEndpointsSequentially(selectedEndpoints, apiKey, {
    paginateTransactions: shouldPaginateTransactions,
    maxPages: options.maxPages
  });

  const tokenSummary = summaries.find((summary) => summary.name === "accountTokens");
  const nftSummary = summaries.find((summary) => summary.name === "accountNfts");
  const transactionSummary = summaries.find(
    (summary) => summary.name === "accountTransactions"
  );

  const result: BlockVisionSummary = {
    wallet,
    provider: "BlockVision",
    network: "Monad",
    endpointFilter: options.endpointFilter ?? "all",
    requestPolicy: {
      sequential: true,
      betweenEndpointDelayMs: BETWEEN_ENDPOINT_DELAY_MS,
      transactionPageDelayMs: BETWEEN_TRANSACTION_PAGE_DELAY_MS,
      rateLimitRetryDelayMs: RATE_LIMIT_RETRY_DELAY_MS,
      maxRetriesPerEndpoint: 1,
      transactionPaginationEnabled: shouldPaginateTransactions,
      transactionMaxPages: options.maxPages,
      transactionMaxPagesLimit: MAX_TRANSACTION_MAX_PAGES
    },
    tokenCount: tokenSummary?.count.value,
    nftCount: nftSummary?.count.value,
    transactionCount: transactionSummary?.count.value,
    transactionPagination: transactionSummary?.transactionPagination,
    endpoints: summaries
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error: unknown) => {
  console.error("BlockVision wallet stats test failed unexpectedly.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
}
