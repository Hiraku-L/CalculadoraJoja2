import type { ProfitBreakdown } from "@/lib/calculator";

function formatGold(value: number): string {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}g`;
}

export function ProfitSummary({
  profit,
  neverMatures,
}: {
  profit: ProfitBreakdown;
  neverMatures: boolean;
}) {
  if (neverMatures) {
    return (
      <div className="card border-clay/40 bg-clay/10">
        <p className="label-eyebrow text-clay-dark">Sem colheita</p>
        <p className="mt-1 text-sm text-parchment/80">
          Plantada nesse dia, a lavoura não amadurece antes do fim da estação. Escolha um dia mais
          cedo ou adicione mais estações à janela de crescimento.
        </p>
      </div>
    );
  }

  const stats: { label: string; value: string; accent?: string }[] = [
    { label: "Colheitas", value: String(profit.harvestCount) },
    { label: "Unidades colhidas", value: String(profit.totalUnitsHarvested) },
    { label: "Receita", value: formatGold(profit.revenue) },
    { label: "Custo de sementes", value: formatGold(profit.seedCost) },
    {
      label: "Lucro total",
      value: formatGold(profit.profit),
      accent: profit.profit >= 0 ? "text-sprout-light" : "text-clay",
    },
    {
      label: "Lucro / dia",
      value: profit.profitPerDay !== null ? `${profit.profitPerDay.toFixed(2)}g` : "—",
      accent: "text-harvest",
    },
    {
      label: "ROI",
      value: profit.roi !== null ? `${(profit.roi * 100).toFixed(0)}%` : "—",
    },
  ];

  return (
    <div className="card">
      <p className="label-eyebrow mb-4">Resultado</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="text-xs text-parchment/50">{s.label}</dt>
            <dd className={`tabular text-lg font-medium ${s.accent ?? "text-parchment"}`}>
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
