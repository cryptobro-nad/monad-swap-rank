import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DISCLAIMER } from "@/lib/constants";

export default function WalletLoading() {
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

        <div className="max-w-3xl animate-pulse">
          <div className="h-9 w-40 rounded-md border bg-white/70" />
          <div className="mt-5 h-12 w-72 max-w-full rounded-md bg-white/80 sm:h-14 sm:w-96" />
          <div className="mt-4 h-12 w-full rounded-md border bg-white/70" />
          <div className="mt-4 h-24 w-full rounded-md border bg-white/70" />
        </div>

        <div className="mt-8 grid animate-pulse gap-4 lg:grid-cols-[1.25fr_1fr]">
          <div className="h-72 rounded-md border bg-white/75 shadow-sm" />
          <div className="grid gap-4">
            <div className="h-28 rounded-md border bg-white/75 shadow-sm" />
            <div className="h-28 rounded-md border bg-white/75 shadow-sm" />
            <div className="h-28 rounded-md border bg-white/75 shadow-sm" />
          </div>
        </div>

        <p className="mt-8 max-w-3xl rounded-md border bg-white/75 p-4 text-sm leading-6 text-muted-foreground shadow-sm">
          {DISCLAIMER}
        </p>
      </section>
    </main>
  );
}
