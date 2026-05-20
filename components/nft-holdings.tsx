type NftHoldingsProps = {
  count: string;
};

export function NftHoldings({ count }: NftHoldingsProps) {
  return (
    <section className="rounded-md border bg-white/80 p-5 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">NFTs Held</p>
      <p className="mt-2 text-3xl font-semibold text-foreground">{count}</p>
    </section>
  );
}
