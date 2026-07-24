"use client";

import { useMemo, useState } from "react";
import type { Crop, Quality } from "@/lib/types";
import { GROWTH_FERTILIZERS, QUALITY_LABELS } from "@/lib/types";
import { calculateCrop, resolvePlantCount, type PlantCountMode, type SprinklerType } from "@/lib/calculator";
import { seasonLabel } from "@/lib/seasons";
import { SeasonCalendar } from "./SeasonCalendar";
import { ProfitSummary } from "./ProfitSummary";

export function CropCalculatorForm({ crop }: { crop: Crop }) {
  const [plantedDay, setPlantedDay] = useState(1);
  const [quality, setQuality] = useState<Quality>("normal");
  const [plantCountMode, setPlantCountMode] = useState<PlantCountMode>("direct");
  const [plantCount, setPlantCount] = useState(1);
  const [sprinklerCount, setSprinklerCount] = useState(1);
  const [sprinklerType, setSprinklerType] = useState<SprinklerType>("normal");
  const [unitsPerHarvest, setUnitsPerHarvest] = useState(1);
  const [fertilizerId, setFertilizerId] = useState(GROWTH_FERTILIZERS[0]!.id);
  const [extendSeason, setExtendSeason] = useState(false);

  const canExtend = crop.season.length > 1 && crop.growth.multiHarvest;
  const lastAllowedDay = extendSeason && canExtend ? 28 * crop.season.length : 28;
  const fertilizer = GROWTH_FERTILIZERS.find((f) => f.id === fertilizerId)!;

  const resolvedPlantCount = useMemo(
    () => resolvePlantCount(plantCountMode, plantCount, sprinklerCount, sprinklerType),
    [plantCountMode, plantCount, sprinklerCount, sprinklerType]
  );

  const { schedule, profit } = useMemo(
    () =>
      calculateCrop(
        crop,
        { plantedDay, lastAllowedDay, fertilizer },
        { quality, plantCount: resolvedPlantCount, unitsPerHarvest }
      ),
    [crop, plantedDay, lastAllowedDay, fertilizer, quality, resolvedPlantCount, unitsPerHarvest]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="card h-fit space-y-5">
        <p className="label-eyebrow">Parâmetros do plantio</p>

        <Field label={`Dia do plantio (1–${canExtend ? 28 : 28})`}>
          <input
            type="range"
            min={1}
            max={28}
            value={plantedDay}
            onChange={(e) => setPlantedDay(Number(e.target.value))}
            className="w-full accent-harvest"
          />
          <span className="tabular text-sm text-parchment/70">Dia {plantedDay}</span>
        </Field>

        <Field label="Qualidade colhida">
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as Quality)}
            className="w-full rounded-md border border-soil-700 bg-soil-800 px-3 py-2 text-sm"
          >
            {(Object.keys(QUALITY_LABELS) as Quality[]).map((q) => (
              <option key={q} value={q}>
                {QUALITY_LABELS[q]} — {crop.crop.price[q]}g
              </option>
            ))}
          </select>
        </Field>

        <Field label="Nº de plantas">
          <div className="grid gap-2">
            <select
              value={plantCountMode}
              onChange={(e) => setPlantCountMode(e.target.value as PlantCountMode)}
              className="w-full rounded-md border border-soil-700 bg-soil-800 px-3 py-2 text-sm"
            >
              <option value="direct">Número direto</option>
              <option value="sprinklers">Calcular por aspersores</option>
            </select>

            {plantCountMode === "direct" ? (
              <input
                type="number"
                min={1}
                value={plantCount}
                onChange={(e) => setPlantCount(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-md border border-soil-700 bg-soil-800 px-3 py-2 text-sm tabular"
              />
            ) : (
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  type="number"
                  min={1}
                  value={sprinklerCount}
                  onChange={(e) => setSprinklerCount(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-md border border-soil-700 bg-soil-800 px-3 py-2 text-sm tabular"
                  placeholder="Qtd. aspersores"
                />
                <select
                  value={sprinklerType}
                  onChange={(e) => setSprinklerType(e.target.value as SprinklerType)}
                  className="rounded-md border border-soil-700 bg-soil-800 px-3 py-2 text-sm"
                >
                  <option value="normal">Aspersor</option>
                  <option value="quality">Aspersor de qualidade</option>
                  <option value="iridium">Aspersor de irídio</option>
                </select>
              </div>
            )}

            <p className="text-xs text-parchment/50">
              {plantCountMode === "direct"
                ? "Informe o número total de plantas diretamente."
                : `Total estimado: ${resolvedPlantCount} plantas (${sprinklerCount} aspersor${sprinklerCount > 1 ? "es" : ""} × ${sprinklerType === "normal" ? 4 : sprinklerType === "quality" ? 8 : 24})`}
            </p>
          </div>
        </Field>

        <Field label="Unidades por colheita">
          <input
            type="number"
            min={1}
            step={0.1}
            value={unitsPerHarvest}
            onChange={(e) => setUnitsPerHarvest(Math.max(0.1, Number(e.target.value)))}
            className="w-full rounded-md border border-soil-700 bg-soil-800 px-3 py-2 text-sm tabular"
          />
          <p className="text-xs text-parchment/40">
            Algumas culturas rendem mais de 1 item por colheita (ex: Mirtilo ≈3, Grão de Café ≈4,
            Oxicoco = 2). Ajuste aqui se for o caso.
          </p>
        </Field>

        <Field label="Fertilizante de crescimento">
          <select
            value={fertilizerId}
            onChange={(e) => setFertilizerId(e.target.value as typeof fertilizerId)}
            className="w-full rounded-md border border-soil-700 bg-soil-800 px-3 py-2 text-sm"
          >
            {GROWTH_FERTILIZERS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </Field>

        {canExtend && (
          <label className="flex items-center gap-2 text-sm text-parchment/70">
            <input
              type="checkbox"
              checked={extendSeason}
              onChange={(e) => setExtendSeason(e.target.checked)}
              className="accent-harvest"
            />
            Estender para a estação seguinte ({crop.season.map(seasonLabel).join(" + ")})
          </label>
        )}
      </div>

      <div className="space-y-6">
        <SeasonCalendar
          plantedDay={plantedDay}
          harvestDays={schedule.harvestDays}
          lastAllowedDay={lastAllowedDay}
          seasonLabels={crop.season.map(seasonLabel)}
        />
        <ProfitSummary profit={profit} neverMatures={schedule.neverMatures} />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-parchment/60">{label}</span>
      {children}
    </label>
  );
}
