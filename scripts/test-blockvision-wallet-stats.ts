{
const BLOCKVISION_BASE_URL = "https://api.blockvision.org/v2/monad";
const BLOCKVISION_API_KEY = "BLOCKVISION_API_KEY";
const FIRST_PAGE_LIMIT = "50";

type JsonRecord = Record<string, unknown>;

type CountSummary = {
  value?: number;
  source: "response-field" | "first-page-records" | "unavailable";
};

type EndpointSummary = {
  name: string;
  endpoint: string;
  status: number;
  ok: boolean;
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
  error?: unknown;
};

type BlockVisionSummary = {
  wallet: string;
  provider: "BlockVision";
  network: "Monad";
  tokenCount?: number;
  nftCount?: number;
  transactionCount?: number;
  endpoints: EndpointSummary[];
};

type BlockVisionEndpoint = {
  name: string;
  path: string;
  params: Record<string, string>;
  countKeys: string[];
  includeSampleRecords?: boolean;
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

function getWalletArgument(): string | undefined {
  return process.argv
    .slice(2)
    .find((argument) => argument !== "--")
    ?.trim();
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

function summarizeRecords(records: JsonRecord[]): JsonRecord[] {
  return records.slice(0, 3).map((record) => {
    const summary: JsonRecord = {
      keys: Object.keys(record).sort().slice(0, 18)
    };

    const hash = asStringOrNumber(
      firstDefined(record, [
        "hash",
        "txHash",
        "transactionHash",
        "transaction_hash"
      ])
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
  });
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
  payload: unknown
): EndpointSummary {
  const records = findFirstRecordArray(payload);
  const paginationFields = collectPaginationFields(payload);

  return {
    name: endpoint.name,
    endpoint: endpoint.path,
    status,
    ok,
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

async function requestEndpoint(
  endpoint: BlockVisionEndpoint,
  apiKey: string
): Promise<EndpointSummary> {
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

  return createEndpointSummary(endpoint, response.status, response.ok, payload);
}

async function main(): Promise<void> {
  loadLocalEnv();

  const wallet = getWalletArgument();
  const apiKey = process.env[BLOCKVISION_API_KEY]?.trim();

  if (!wallet) {
    console.error(
      "Missing wallet address. Usage: pnpm test:blockvision -- <wallet-address>"
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
      "Missing BLOCKVISION_API_KEY. Add it to your shell environment or .env.local before running this server-side research script."
    );
    process.exitCode = 1;
    return;
  }

  const endpoints: BlockVisionEndpoint[] = [
    {
      name: "accountTokens",
      path: "/account/tokens",
      params: { address: wallet },
      countKeys: ["tokenCount", "tokensCount", "total", "totalCount", "count"]
    },
    {
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

  const summaries = await Promise.all(
    endpoints.map((endpoint) => requestEndpoint(endpoint, apiKey))
  );

  const tokenSummary = summaries.find((summary) => summary.name === "accountTokens");
  const nftSummary = summaries.find((summary) => summary.name === "accountNfts");
  const transactionSummary = summaries.find(
    (summary) => summary.name === "accountTransactions"
  );

  const result: BlockVisionSummary = {
    wallet,
    provider: "BlockVision",
    network: "Monad",
    tokenCount: tokenSummary?.count.value,
    nftCount: nftSummary?.count.value,
    transactionCount: transactionSummary?.count.value,
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
