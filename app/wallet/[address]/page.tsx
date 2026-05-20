import Link from "next/link";
import { headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NftHoldings } from "@/components/nft-holdings";
import { RankCard } from "@/components/rank-card";
import { ShareResultButton } from "@/components/share-result-button";
import { StatsCard } from "@/components/stats-card";
import { TokenHoldings } from "@/components/token-holdings";
import { DISCLAIMER } from "@/lib/constants";
import { formatUsd, type WalletRankResult } from "@/lib/ranking";

type WalletPageProps = {
  params: Promise<{
    address: string;
  }>;
};

type WalletApiError = {
  error: string;
};

async function fetchWalletResult(address: string) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");
  const response = await fetch(
    `${protocol}://${host}/api/wallet/${encodeURIComponent(address)}`,
    { cache: "no-store" }
  );
  const payload = (await response.json()) as WalletRankResult | WalletApiError;

  if (!response.ok) {
    return {
      error:
        "error" in payload
          ? payload.error
          : "Unable to load this wallet result right now."
    };
  }

  return { result: payload as WalletRankResult };
}

export default async function WalletPage({ params }: WalletPageProps) {
  const { address } = await params;
  const walletAddress = decodeURIComponent(address);
  const { result, error } = await fetchWalletResult(walletAddress);

  if (error || !result) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(263_77%_90%),transparent_32rem),linear-gradient(135deg,hsl(220_36%_98%),hsl(168_38%_94%))]">
        <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8 sm:px-8 sm:py-12">
          <div className="mb-8">
            <Button asChild variant="ghost" className="gap-2 px-0">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </Link>
            </Button>
          </div>

          <div className="rounded-md border bg-white/80 p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Wallet result
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground">
              We could not load this wallet.
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {error}
            </p>
          </div>

          <p className="mt-8 rounded-md border bg-white/75 p-4 text-sm leading-6 text-muted-foreground shadow-sm">
            {DISCLAIMER}
          </p>
        </section>
      </main>
    );
  }

  const estimatedSwapVolume = formatUsd(result.estimatedSwapVolume);
  const totalSwaps = result.totalSwaps.toLocaleString("en-US");
  const tokensHeld = result.tokensHeld.toLocaleString("en-US");
  const nftsHeld = result.nftsHeld.toLocaleString("en-US");
  const shareText = `Monad Swap Rank: ${result.walletAddress} is ${result.rank.rank} with ${estimatedSwapVolume} estimated swap volume across ${totalSwaps} swaps.`;

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
          <p className="text-sm font-medium text-muted-foreground">
            Wallet result
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            Monad Swap Rank
          </h1>
          <p className="mt-4 break-all rounded-md border bg-white/75 px-4 py-3 text-sm font-medium text-muted-foreground shadow-sm">
            {result.walletAddress}
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <RankCard
            rank={result.rank.rank}
            estimatedSwapVolume={estimatedSwapVolume}
            totalSwaps={totalSwaps}
            lastUpdated={result.lastUpdated}
          />

          <div className="grid gap-4">
            <StatsCard label="Total Swaps" value={totalSwaps} />
            <TokenHoldings count={tokensHeld} />
            <NftHoldings count={nftsHeld} />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <ShareResultButton resultText={shareText} />
          <p className="text-sm text-muted-foreground">
            Last updated {result.lastUpdated}
          </p>
        </div>

        <p className="mt-8 max-w-3xl rounded-md border bg-white/75 p-4 text-sm leading-6 text-muted-foreground shadow-sm">
          {DISCLAIMER}
        </p>
      </section>
    </main>
  );
}
