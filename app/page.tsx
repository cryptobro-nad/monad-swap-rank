import { ShieldCheck } from "lucide-react";
import { WalletInputForm } from "@/components/wallet-input-form";
import { DISCLAIMER } from "@/lib/constants";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(263_77%_90%),transparent_32rem),linear-gradient(135deg,hsl(220_36%_98%),hsl(168_38%_94%))]">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-5 py-12 sm:px-8">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border bg-white/70 px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm">
            <ShieldCheck className="h-4 w-4 text-secondary" aria-hidden="true" />
            MVP foundation
          </div>
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
            Monad Swap Rank
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Check your Monad Swap Rank. Paste your wallet and see your
            estimated swap volume, total swaps, and rank.
          </p>
        </div>

        <WalletInputForm />

        <p className="mt-8 max-w-2xl rounded-md border bg-white/75 p-4 text-sm leading-6 text-muted-foreground shadow-sm">
          {DISCLAIMER}
        </p>
      </section>
    </main>
  );
}
