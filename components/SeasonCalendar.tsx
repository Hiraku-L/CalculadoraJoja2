import { weekdayLabel } from "@/lib/seasons";

type DayStatus = "before" | "planted" | "growing" | "harvest" | "idle" | "outside";

interface SeasonCalendarProps {
  plantedDay: number;
  harvestDays: number[];
  /** Absolute last day this crop is allowed to keep growing (see calculator.ts). */
  lastAllowedDay: number;
  seasonLabels: string[];
}

const WEEK_HEADER = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function classifyDay(day: number, plantedDay: number, harvestDays: number[]): DayStatus {
  if (day < plantedDay) return "before";
  if (day === plantedDay) return "planted";
  if (harvestDays.includes(day)) return "harvest";

  const firstHarvest = harvestDays[0];
  if (firstHarvest && day < firstHarvest) return "growing";

  const isBetweenHarvests = harvestDays.some((h, i) => {
    const next = harvestDays[i + 1];
    return next !== undefined && day > h && day < next;
  });
  if (isBetweenHarvests) return "growing";

  return "idle";
}

const STATUS_STYLES: Record<DayStatus, string> = {
  before: "bg-soil-900/40 text-parchment/20",
  planted: "bg-dusk text-parchment ring-2 ring-harvest ring-offset-2 ring-offset-soil-950",
  growing: "bg-sprout-dark/50 text-parchment/80",
  harvest: "bg-harvest text-soil-950 font-semibold",
  idle: "bg-soil-900 text-parchment/30",
  outside: "bg-transparent",
};

function SeasonGrid({
  seasonIndex,
  label,
  plantedDay,
  harvestDays,
  lastAllowedDay,
}: {
  seasonIndex: number;
  label: string;
  plantedDay: number;
  harvestDays: number[];
  lastAllowedDay: number;
}) {
  const seasonStart = seasonIndex * 28 + 1;

  return (
    <div className="card">
      <p className="label-eyebrow mb-3">{label}</p>
      <div className="grid grid-cols-7 gap-1.5">
        {WEEK_HEADER.map((w) => (
          <div key={w} className="pb-1 text-center font-mono text-[10px] text-parchment/40">
            {w}
          </div>
        ))}
        {Array.from({ length: 28 }, (_, i) => seasonStart + i).map((absoluteDay) => {
          const dayInSeason = absoluteDay - seasonStart + 1;
          const beyondWindow = absoluteDay > lastAllowedDay;
          const status: DayStatus = beyondWindow
            ? "outside"
            : classifyDay(absoluteDay, plantedDay, harvestDays);

          return (
            <div
              key={absoluteDay}
              className={`flex aspect-square flex-col items-center justify-center rounded-sm text-xs transition-colors ${STATUS_STYLES[status]}`}
              title={
                status === "planted"
                  ? `Dia ${dayInSeason} — plantio`
                  : status === "harvest"
                    ? `Dia ${dayInSeason} — colheita`
                    : `Dia ${dayInSeason}`
              }
            >
              <span className="tabular leading-none">{dayInSeason}</span>
              {status === "harvest" && <span className="mt-0.5 h-1 w-1 rounded-full bg-soil-950" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SeasonCalendar({
  plantedDay,
  harvestDays,
  lastAllowedDay,
  seasonLabels,
}: SeasonCalendarProps) {
  const seasonCount = Math.ceil(lastAllowedDay / 28);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: seasonCount }, (_, i) => (
          <SeasonGrid
            key={i}
            seasonIndex={i}
            label={seasonLabels[i] ?? `Estação ${i + 1}`}
            plantedDay={plantedDay}
            harvestDays={harvestDays}
            lastAllowedDay={lastAllowedDay}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4 font-mono text-xs text-parchment/60">
        <Legend swatch="bg-dusk" label="Plantio" />
        <Legend swatch="bg-sprout-dark/50" label="Crescendo" />
        <Legend swatch="bg-harvest" label="Colheita" />
        <Legend swatch="bg-soil-900" label="Ocioso" />
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm ${swatch}`} />
      {label}
    </span>
  );
}
