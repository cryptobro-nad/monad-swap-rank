import { Download, ShieldCheck, Sparkles } from "lucide-react";
import { WalletInputForm } from "@/components/wallet-input-form";
import { DISCLAIMER } from "@/lib/constants";

const highlights = [
  {
    title: "Ranks by Mobula-detected swaps",
    description: "Monad mainnet swap volume, not total transactions.",
    icon: ShieldCheck
  },
  {
    title: "Generates a funny Nad card",
    description: "Get a rank, image, and stable tagline for your wallet.",
    icon: Sparkles
  },
  {
    title: "Download or share your result",
    description: "Built for dropping your card on the timeline.",
    icon: Download
  }
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,hsl(263_77%_26%),transparent_34rem),radial-gradient(circle_at_bottom_right,hsl(160_58%_17%),transparent_28rem),linear-gradient(135deg,hsl(260_45%_8%),hsl(232_34%_10%))] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-10 sm:px-8 sm:py-14">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-white/55">
            Monad Swap Rank
          </p>
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white/85 shadow-lg shadow-black/20 backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-secondary" aria-hidden="true" />
            Monad wallet checker
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-[0.92] tracking-normal text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] sm:text-7xl">
            What kind of Nad is your wallet?
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
            Paste a Monad wallet, get a swap-volume based rank, and download a
            shareable card for the timeline.
          </p>
        </div>

        <div className="mt-8 max-w-2xl rounded-md border border-white/12 bg-white/[0.08] p-4 shadow-2xl shadow-black/25 backdrop-blur sm:p-5 [&>form]:mt-0 [&_input]:text-foreground">
          <WalletInputForm />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {highlights.map((highlight) => {
            const Icon = highlight.icon;

            return (
              <article
                key={highlight.title}
                className="rounded-md border border-white/10 bg-white/[0.07] p-4 shadow-lg shadow-black/15 backdrop-blur"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-md border border-white/10 bg-white/10 p-2 text-secondary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      {highlight.title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-white/65">
                      {highlight.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-5 max-w-2xl text-sm leading-6 text-white/58">
          Early version - more stats and card upgrades are coming.
        </p>

        <p className="mt-8 max-w-3xl rounded-md border border-white/10 bg-white/[0.07] p-4 text-sm leading-6 text-white/68 shadow-sm backdrop-blur">
          {DISCLAIMER}
        </p>
      </section>
    </main>
  );
}
