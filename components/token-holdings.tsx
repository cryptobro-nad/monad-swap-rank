type TokenHoldingsProps = {
  count: string;
};

export function TokenHoldings({ count }: TokenHoldingsProps) {
  return (
    <section className="rounded-md border bg-white/80 p-5 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">Tokens Held</p>
      <p className="mt-2 text-3xl font-semibold text-foreground">{count}</p>
    </section>
  );
}
