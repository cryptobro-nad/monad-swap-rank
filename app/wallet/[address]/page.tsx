import Link from "next/link";
import { headers } from "next/headers";
import { AlertCircle, ArrowLeft, CheckCircle2, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareResultButton } from "@/components/share-result-button";
import { StatsCard } from "@/components/stats-card";
import { ShareableRankCard } from "@/components/shareable-rank-card";
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
      appUrl: string;
      error?: never;
    }
  | {
      appUrl: string;
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
  const appUrl = `${protocol}://${host}`;
  let response: Response;

  try {
    response = await fetch(
      `${appUrl}/api/wallet/${encodeURIComponent(address)}`,
      { cache: "no-store" }
    );
  } catch {
    return {
      appUrl,
      error: "Unable to reach the wallet result service right now."
    };
  }

  const payload = await safelyReadJson(response);

  if (!response.ok) {
    return {
      appUrl,
      error: getApiErrorMessage(payload)
    };
  }

  if (!isWalletRankResult(payload)) {
    return {
      appUrl,
      error: "Wallet result data came back in an unexpected format."
    };
  }

  return { result: payload, appUrl };
}

export default async function WalletPage({ params }: WalletPageProps) {
  const { address } = await params;
  const walletAddress = decodeURIComponent(address);
  const { result, error, appUrl } = await fetchWalletResult(walletAddress);

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

  const display = getWalletResultDisplay(result, appUrl);
  const StatusIcon = display.hasSwapData ? CheckCircle2 : Info;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(263_77%_20%),transparent_34rem),radial-gradient(circle_at_bottom_right,hsl(160_58%_18%),transparent_30rem),linear-gradient(135deg,hsl(260_45%_8%),hsl(232_34%_10%))] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8">
          <Button
            asChild
            variant="ghost"
            className="gap-2 px-0 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
        </div>

        <ShareableRankCard visual={display.rankVisual} />

        <section className="mt-6 rounded-md border border-white/10 bg-white/[0.07] p-5 shadow-xl shadow-black/20 backdrop-blur">
          <div className="flex gap-3">
            <StatusIcon
              className="mt-0.5 h-5 w-5 shrink-0 text-secondary"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-white">
                {display.statusTitle}
              </p>
              <p className="mt-1 text-sm leading-6 text-white/70">
                {display.statusDescription}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <StatsCard
            label="Estimated Swap Volume"
            value={display.estimatedSwapVolume}
          />
          <StatsCard label="Mobula-Detected Swaps" value={display.totalSwaps} />
          <StatsCard label="Last Updated" value={result.lastUpdated} />
        </section>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <ShareResultButton resultText={display.shareText} />
          <p className="text-sm text-white/65">
            Last updated {result.lastUpdated}
          </p>
        </div>

        <section className="mt-6 max-w-3xl rounded-md border border-white/10 bg-white/[0.07] p-5 text-sm leading-6 text-white/72 shadow-sm">
          <p>
            This rank is based on Mobula-detected swaps on Monad mainnet.
          </p>
          <p className="mt-3">
            Token holdings, NFT holdings, and total transactions from explorers
            like MonadVision are not included yet.
          </p>
        </section>

        <p className="mt-8 max-w-3xl rounded-md border border-white/10 bg-white/[0.07] p-4 text-sm leading-6 text-white/68 shadow-sm">
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
    typeof value.lastUpdated === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
