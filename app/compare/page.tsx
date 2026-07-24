import Link from "next/link";
import dataset from "@/lib/data/crops.json";
import type { Crop, Season } from "@/lib/types";
import { ALL_SEASONS, cropsForSeason, seasonLabel } from "@/lib/seasons";

const crops = (dataset as { crops: Crop[] }).crops;

export default function ComparePage({
  searchParams,
}: {
  searchParams: { season?: string };
}) {
  const activeSeason = searchParams.season as Season | undefined;
  const rows = (activeSeason ? cropsForSeason(crops, activeSeason) : crops)
    .slice()
    .sort((a, b) => b.calculator.profitPerDay - a.calculator.profitPerDay);

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <Link href="/" className="label-eyebrow mb-6 inline-block hover:text-harvest">
        ← Voltar ao almanaque
      </Link>

      <header className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-parchment">
          Comparar culturas
        </h1>
        <p className="mt-2 text-parchment/60">
          Ordenado por lucro/dia, plantio no dia 1 da estação, qualidade normal, sem fertilizante.
          Abra uma cultura para simular outros cenários.
        </p>
      </header>

      <nav className="mb-6 flex flex-wrap gap-2">
        <FilterLink season={undefined} active={!activeSeason}>
          Todas
        </FilterLink>
        {ALL_SEASONS.map((s) => (
          <FilterLink key={s} season={s} active={activeSeason === s}>
            {seasonLabel(s)}
          </FilterLink>
        ))}
      </nav>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-soil-700 text-left text-xs uppercase tracking-wide text-parchment/40">
              <th className="px-4 py-3 font-normal">Cultura</th>
              <th className="px-4 py-3 font-normal">Estação</th>
              <th className="px-4 py-3 font-normal text-right">Semente</th>
              <th className="px-4 py-3 font-normal text-right">Venda</th>
              <th className="px-4 py-3 font-normal text-right">Dias</th>
              <th className="px-4 py-3 font-normal text-right">Colheitas</th>
              <th className="px-4 py-3 font-normal text-right">Lucro/dia</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((crop) => (
              <tr key={crop.id} className="border-b border-soil-800 last:border-0 hover:bg-soil-800/50">
                <td className="px-4 py-3">
                  <Link href={`/crop/${crop.id}`} className="hover:text-harvest-light">
                    {crop.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-parchment/60">
                  {crop.season.map(seasonLabel).join(" / ")}
                </td>
                <td className="tabular px-4 py-3 text-right">
                  {crop.seed.price ? `${crop.seed.price}g` : "—"}
                </td>
                <td className="tabular px-4 py-3 text-right">{crop.crop.price.normal}g</td>
                <td className="tabular px-4 py-3 text-right">{crop.growth.days}</td>
                <td className="tabular px-4 py-3 text-right">{crop.calculator.maxHarvests}</td>
                <td
                  className={`tabular px-4 py-3 text-right font-medium ${
                    crop.calculator.profitPerDay >= 0 ? "text-harvest" : "text-clay"
                  }`}
                >
                  {crop.calculator.profitPerDay.toFixed(2)}g
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function FilterLink({
  season,
  active,
  children,
}: {
  season: Season | undefined;
  active: boolean;
  children: React.ReactNode;
}) {
  const href = season ? `/compare?season=${season}` : "/compare";
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
        active
          ? "bg-harvest text-soil-950 font-medium"
          : "bg-soil-800 text-parchment/70 hover:bg-soil-700"
      }`}
    >
      {children}
    </Link>
  );
}
