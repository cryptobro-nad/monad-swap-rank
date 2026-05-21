import Link from "next/link";
import { headers } from "next/headers";
import { AlertCircle, ArrowLeft, CheckCircle2, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NftHoldings } from "@/components/nft-holdings";
import { RankCard } from "@/components/rank-card";
import { ShareResultButton } from "@/components/share-result-button";
import { StatsCard } from "@/components/stats-card";
import { TokenHoldings } from "@/components/token-holdings";
import { DISCLAIMER } from "@/lib/constants";
import { type WalletRankResult } from "@/lib/ranking";
import { getWalletResultDisplay } from "@/lib/wallet-result-display";

type WalletPageProps = {
  params: Promise<{
    address: string;
  }>;
};

type WalletResultState =
  | {
      result: WalletRankResult;
      error?: never;
    }
  | {
      result?: never;
      error: string;
    };

async function fetchWalletResult(address: string): Promise<WalletResultState> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");
  let response: Response;

  try {
    response = await fetch(
      `${protocol}://${host}/api/wallet/${encodeURIComponent(address)}`,
      { cache: "no-store" }
    );
  } catch {
    return {
      error: "Unable to reach the wallet result service right now."
    };
  }

  const payload = await safelyReadJson(response);

  if (!response.ok) {
    return {
      error: getApiErrorMessage(payload)
    };
  }

  if (!isWalletRankResult(payload)) {
    return {
      error: "Wallet result data came back in an unexpected format."
    };
  }

  return { result: payload };
}

export default async function WalletPage({ params }: WalletPageProps) {
  const { address } = await params;
  const walletAddress = decodeURIComponent(address);
  const { result, error } = await fetchWalletResult(walletAddress);

  if (error || !result) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(263_77%_90%),transparent_32rem),linear-gradient(135deg,hsl(220_36%_98%),hsl(168_38%_94%))]">
        <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-5 py-8 sm:px-8 sm:py-12">
          <div className="mb-8">
            <Button asChild variant="ghost" className="gap-2 px-0">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <section className="rounded-md border bg-white/85 p-6 shadow-sm">
              <div className="inline-flex items-center gap-2 rounded-md border bg-white/80 px-3 py-2 text-sm font-medium text-muted-foreground">
                <AlertCircle className="h-4 w-4 text-accent" aria-hidden="true" />
                Wallet result
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
                Wallet result unavailable
              </h1>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {getFriendlyErrorSummary(error)}
              </p>
              <p className="mt-5 break-all rounded-md border bg-white/75 px-4 py-3 text-sm font-medium text-muted-foreground">
                {walletAddress}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-11 gap-2">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Try another wallet
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 gap-2">
                  <Link href={`/wallet/${encodeURIComponent(walletAddress)}`}>
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Try again
                  </Link>
                </Button>
              </div>
            </section>

            <section className="rounded-md border bg-white/80 p-5 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">
                What happened
              </p>
              <p className="mt-3 text-sm leading-6 text-foreground">{error}</p>
              <p className="mt-5 text-sm leading-6 text-muted-foreground">
                No wallet data was saved or changed.
              </p>
            </section>
          </div>

          <p className="mt-8 max-w-3xl rounded-md border bg-white/75 p-4 text-sm leading-6 text-muted-foreground shadow-sm">
            {DISCLAIMER}
          </p>
        </section>
      </main>
    );
  }

  const display = getWalletResultDisplay(result);
  const StatusIcon = display.hasSwapData ? CheckCircle2 : Info;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(263_77%_90%),transparent_32rem),linear-gradient(135deg,hsl(220_36%_98%),hsl(168_38%_94%))]">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8">
          <Button asChild variant="ghost" className="gap-2 px-0">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
        </div>

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-md border bg-white/75 px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-secondary" aria-hidden="true" />
            Live wallet result
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            Monad Swap Rank
          </h1>
          <p className="mt-4 break-all rounded-md border bg-white/75 px-4 py-3 text-sm font-medium text-muted-foreground shadow-sm">
            {result.walletAddress}
          </p>

          <section className="mt-4 rounded-md border bg-white/80 p-4 shadow-sm">
            <div className="flex gap-3">
              <StatusIcon
                className="mt-0.5 h-5 w-5 shrink-0 text-secondary"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {display.statusTitle}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {display.statusDescription}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <RankCard
            rank={result.rank.rank}
            estimatedSwapVolume={display.estimatedSwapVolume}
            totalSwaps={display.totalSwaps}
            lastUpdated={result.lastUpdated}
          />

          <div className="grid gap-4">
            <StatsCard label="Total Swaps" value={display.totalSwaps} />
            <TokenHoldings count={display.tokensHeld} />
            <NftHoldings count={display.nftsHeld} />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <ShareResultButton resultText={display.shareText} />
          <p className="text-sm text-muted-foreground">
            Last updated {result.lastUpdated}
          </p>
        </div>

        <p className="mt-6 max-w-3xl rounded-md border bg-white/75 p-4 text-sm leading-6 text-muted-foreground shadow-sm">
          Swap volume is live from Mobula wallet trades. Token and NFT counts
          are placeholder values for now.
        </p>

        <p className="mt-8 max-w-3xl rounded-md border bg-white/75 p-4 text-sm leading-6 text-muted-foreground shadow-sm">
          {DISCLAIMER}
        </p>
      </section>
    </main>
  );
}

async function safelyReadJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function getApiErrorMessage(payload: unknown): string {
  if (isRecord(payload) && typeof payload.error === "string") {
    return payload.error;
  }

  return "Unable to load this wallet result right now.";
}

function getFriendlyErrorSummary(error: string): string {
  if (error.toLowerCase().includes("mobula is not configured")) {
    return "The live wallet data provider is not configured on this server yet.";
  }

  return "The wallet result service could not finish this lookup.";
}

function isWalletRankResult(value: unknown): value is WalletRankResult {
  return (
    isRecord(value) &&
    typeof value.walletAddress === "string" &&
    isRecord(value.rank) &&
    typeof value.rank.rank === "string" &&
    typeof value.rank.volumeUsd === "number" &&
    typeof value.estimatedSwapVolume === "number" &&
    typeof value.totalSwaps === "number" &&
    typeof value.tokensHeld === "number" &&
    typeof value.nftsHeld === "number" &&
    typeof value.lastUpdated === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
