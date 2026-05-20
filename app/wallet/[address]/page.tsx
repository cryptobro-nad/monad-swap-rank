import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NftHoldings } from "@/components/nft-holdings";
import { RankCard } from "@/components/rank-card";
import { ShareResultButton } from "@/components/share-result-button";
import { StatsCard } from "@/components/stats-card";
import { TokenHoldings } from "@/components/token-holdings";
import { DISCLAIMER } from "@/lib/constants";

const mockResult = {
  rank: "Heavy Nad",
  estimatedSwapVolume: "$42,180",
  totalSwaps: "74",
  tokensHeld: "12",
  nftsHeld: "6",
  lastUpdated: "2 minutes ago"
};

type WalletPageProps = {
  params: Promise<{
    address: string;
  }>;
};

export default async function WalletPage({ params }: WalletPageProps) {
  const { address } = await params;
  const walletAddress = decodeURIComponent(address);
  const shareText = `Monad Swap Rank: ${walletAddress} is ${mockResult.rank} with ${mockResult.estimatedSwapVolume} estimated swap volume across ${mockResult.totalSwaps} swaps.`;

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
            {walletAddress}
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <RankCard
            rank={mockResult.rank}
            estimatedSwapVolume={mockResult.estimatedSwapVolume}
            totalSwaps={mockResult.totalSwaps}
            lastUpdated={mockResult.lastUpdated}
          />

          <div className="grid gap-4">
            <StatsCard label="Total Swaps" value={mockResult.totalSwaps} />
            <TokenHoldings count={mockResult.tokensHeld} />
            <NftHoldings count={mockResult.nftsHeld} />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <ShareResultButton resultText={shareText} />
          <p className="text-sm text-muted-foreground">
            Last updated {mockResult.lastUpdated}
          </p>
        </div>

        <p className="mt-8 max-w-3xl rounded-md border bg-white/75 p-4 text-sm leading-6 text-muted-foreground shadow-sm">
          {DISCLAIMER}
        </p>
      </section>
    </main>
  );
}
