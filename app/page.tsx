import Link from "next/link";
import dataset from "@/lib/data/crops.json";
import type { Crop, Season } from "@/lib/types";
import { ALL_SEASONS, cropsForSeason, seasonLabel } from "@/lib/seasons";
import { CropCard } from "@/components/CropCard";

const crops = (dataset as { crops: Crop[] }).crops;

export default function HomePage({
  searchParams,
}: {
  searchParams: { season?: string };
}) {
  const activeSeason = (searchParams.season as Season | undefined) ?? undefined;
  const visibleCrops = activeSeason ? cropsForSeason(crops, activeSeason) : crops;

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <header className="mb-10 max-w-2xl">
        <p className="label-eyebrow mb-3">Almanaque de culturas</p>
        <h1 className="font-display text-4xl font-semibold leading-tight text-parchment sm:text-5xl">
          Calculadora Joja 2
        </h1>
        <p className="mt-4 text-parchment/60">
          Escolha uma cultura para ver o calendário de crescimento e o lucro esperado
        </p>
      </header>

      <nav className="mb-8 flex flex-wrap items-center gap-2">
        <FilterLink season={undefined} active={!activeSeason}>
          Todas
        </FilterLink>
        {ALL_SEASONS.map((s) => (
          <FilterLink key={s} season={s} active={activeSeason === s}>
            {seasonLabel(s)}
          </FilterLink>
        ))}
        <Link href="/compare" className="btn-ghost ml-auto">
          Comparar culturas →
        </Link>
      </nav>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCrops.map((crop) => (
          <CropCard key={crop.id} crop={crop} />
        ))}
      </div>
       <p className="mt-4 text-parchment/60">
          Criado por Ícaro Pinto Lira
        </p>
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
  const href = season ? `/?season=${season}` : "/";
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
