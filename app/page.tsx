import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
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
            A simple wallet ranking app for Monad swap activity. This first
            version sets up the app shell, styling, and test foundation before
            any live data is connected.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-[1fr_auto]">
          <label className="sr-only" htmlFor="wallet-address">
            Wallet address
          </label>
          <input
            id="wallet-address"
            type="text"
            disabled
            placeholder="Wallet input coming in the next task"
            className="h-12 rounded-md border bg-white/80 px-4 text-base shadow-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-80"
          />
          <Button disabled className="h-12 gap-2">
            Check Rank
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <p className="mt-8 max-w-2xl rounded-md border bg-white/75 p-4 text-sm leading-6 text-muted-foreground shadow-sm">
          {DISCLAIMER}
        </p>
      </section>
    </main>
  );
}
