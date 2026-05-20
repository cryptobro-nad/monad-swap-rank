type StatsCardProps = {
  label: string;
  value: string;
};

export function StatsCard({ label, value }: StatsCardProps) {
  return (
    <section className="rounded-md border bg-white/80 p-5 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
    </section>
  );
}
