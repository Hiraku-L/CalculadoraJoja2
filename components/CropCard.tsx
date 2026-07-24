import Link from "next/link";
import type { Crop } from "@/lib/types";
import { seasonLabel } from "@/lib/seasons";

export function CropCard({ crop }: { crop: Crop }) {
  const profitable = crop.calculator.profitPerDay >= 0;

  return (
    <Link
      href={`/crop/${crop.id}`}
      className="card group flex flex-col gap-3 transition-colors hover:border-harvest/50"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg leading-tight text-parchment group-hover:text-harvest-light">
            {crop.name}
          </h3>
          <p className="text-xs text-parchment/40">{crop.englishName}</p>
        </div>
        <div className="flex gap-1">
          {crop.season.map((s) => (
            <span
              key={s}
              className="rounded-sm bg-soil-800 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-parchment/60"
            >
              {seasonLabel(s).slice(0, 3)}
            </span>
          ))}
        </div>
      </div>

      <p className="line-clamp-2 text-sm text-parchment/60">{crop.crop.description}</p>

      <div className="mt-auto flex items-end justify-between border-t border-soil-700 pt-3">
        <div>
          <p className="text-[10px] text-parchment/40">Cresce em</p>
          <p className="tabular text-sm">{crop.growth.days} dias</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-parchment/40">Lucro / dia</p>
          <p className={`tabular text-sm font-medium ${profitable ? "text-harvest" : "text-clay"}`}>
            {crop.calculator.profitPerDay.toFixed(2)}g
          </p>
        </div>
      </div>
    </Link>
  );
}
