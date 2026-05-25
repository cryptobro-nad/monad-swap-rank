import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DISCLAIMER } from "@/lib/constants";

export default function WalletLoading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(263_77%_20%),transparent_34rem),radial-gradient(circle_at_bottom_right,hsl(160_58%_18%),transparent_30rem),linear-gradient(135deg,hsl(260_45%_8%),hsl(232_34%_10%))]">
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

        <div className="mx-auto w-full max-w-4xl animate-pulse">
          <div className="aspect-[5/6] min-h-[370px] rounded-md border border-white/10 bg-white/[0.08] shadow-2xl shadow-black/20 sm:aspect-[16/9] sm:min-h-[420px] lg:min-h-[460px]" />
          <div className="mt-3 flex flex-col gap-2.5 sm:mt-4 sm:flex-row sm:gap-3">
            <div className="h-11 rounded-md bg-white/[0.08] sm:w-28" />
            <div className="h-11 rounded-md bg-white/[0.08] sm:w-36" />
            <div className="h-11 rounded-md bg-white/[0.08] sm:w-36" />
          </div>
        </div>

        <div className="mt-6 grid animate-pulse gap-4 md:grid-cols-3">
          <div className="h-28 rounded-md border border-white/10 bg-white/[0.08] shadow-sm" />
          <div className="h-28 rounded-md border border-white/10 bg-white/[0.08] shadow-sm" />
          <div className="h-28 rounded-md border border-white/10 bg-white/[0.08] shadow-sm" />
        </div>

        <p className="mt-8 max-w-3xl rounded-md border border-white/10 bg-white/[0.07] p-4 text-sm leading-6 text-white/68 shadow-sm">
          {DISCLAIMER}
        </p>
      </section>
    </main>
  );
}
