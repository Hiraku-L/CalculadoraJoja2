import type { Crop, GrowthFertilizer, Quality } from "./types";

/**
 * Applies a Speed-Gro-family fertilizer bonus to a crop's base growth time.
 *
 * Simplification note: the game actually shaves days off individual growth
 * *phases* (from the last phase backward, one day at a time, never touching
 * the very first phase) rather than the total. For single-harvest crops the
 * end result is the same total day count either way. For regrowing crops,
 * only the *first* harvest is sped up - the regrowth cadence afterwards is
 * unaffected - which this function already respects by only being applied
 * to `crop.growth.days`, never to `crop.growth.regrowth`.
 */
export function getEffectiveDaysToMaturity(
  crop: Crop,
  fertilizer: GrowthFertilizer
): number {
  const reduction = Math.floor(crop.growth.days * fertilizer.speedBonus);
  return Math.max(1, crop.growth.days - reduction);
}

export interface HarvestScheduleOptions {
  /** Day the seed is planted, 1-indexed within the season it's planted in. */
  plantedDay: number;
  /**
   * The last day (on the same 1-28-per-season absolute scale as
   * `plantedDay`) the crop is allowed to keep growing before it withers.
   * Defaults to 28 (the planted season's last day). Pass 56/84 for crops
   * planted in a multi-season window (e.g. Corn planted in Summer that
   * carries into Fall keeps growing through day 56).
   *
   * Note this is an absolute day, NOT a duration relative to plantedDay -
   * a crop planted on day 20 of a single season still withers at day 28,
   * not day 47.
   */
  lastAllowedDay?: number;
  fertilizer?: GrowthFertilizer;
}

export interface HarvestSchedule {
  /** Absolute day-offsets (relative to plantedDay = day 0) each harvest lands on. */
  harvestDays: number[];
  /** True if the crop won't even reach its first harvest in the given window. */
  neverMatures: boolean;
  effectiveDaysToMaturity: number;
}

const NO_FERTILIZER: GrowthFertilizer = {
  id: "none",
  label: "Nenhum",
  speedBonus: 0,
};

/**
 * Computes which days (relative to planting) a crop will be ready to
 * harvest, given the game's "days shown exclude the planting day" convention:
 * a crop planted on day 1 with a 4-day growth time is ready on day 5, i.e.
 * harvestDays[0] = plantedDay + daysToMaturity.
 */
export function computeHarvestSchedule(
  crop: Crop,
  options: HarvestScheduleOptions
): HarvestSchedule {
  const { plantedDay, lastAllowedDay = 28, fertilizer = NO_FERTILIZER } = options;
  const effectiveDaysToMaturity = getEffectiveDaysToMaturity(crop, fertilizer);

  const firstHarvest = plantedDay + effectiveDaysToMaturity;
  if (firstHarvest > lastAllowedDay) {
    return { harvestDays: [], neverMatures: true, effectiveDaysToMaturity };
  }

  const harvestDays: number[] = [firstHarvest];

  if (crop.growth.multiHarvest && crop.growth.regrowth) {
    let next = firstHarvest + crop.growth.regrowth;
    while (next <= lastAllowedDay) {
      harvestDays.push(next);
      next += crop.growth.regrowth;
    }
  }

  return { harvestDays, neverMatures: false, effectiveDaysToMaturity };
}

export type PlantCountMode = "direct" | "sprinklers";
export type SprinklerType = "normal" | "quality" | "iridium";

export function resolvePlantCount(
  mode: PlantCountMode,
  directPlantCount: number,
  sprinklerCount: number,
  sprinklerType: SprinklerType
): number {
  if (mode === "sprinklers") {
    const multiplier = sprinklerType === "normal" ? 4 : sprinklerType === "quality" ? 8 : 24;
    return Math.max(1, sprinklerCount * multiplier);
  }

  return Math.max(1, directPlantCount);
}

export interface ProfitOptions {
  quality: Quality;
  /** Units harvested per plant per harvest event (default 1). */
  unitsPerHarvest?: number;
  /** How many plants/seeds were bought - scales both cost and revenue. */
  plantCount?: number;
}

export interface ProfitBreakdown {
  harvestCount: number;
  totalUnitsHarvested: number;
  revenue: number;
  seedCost: number;
  profit: number;
  /** Profit divided by the number of days the land was occupied. Null if the crop never matured. */
  profitPerDay: number | null;
  /** Return on seed investment, e.g. 2.5 = 250% return. Null if seed price is unknown. */
  roi: number | null;
  growingDays: number;
}

/**
 * Turns a harvest schedule into money. Mirrors the wiki's "Gold per Day"
 * formula: (harvests x sell price - seed price) / growing days, generalized
 * to arbitrary plant counts, quality, and units-per-harvest.
 */
export function computeProfit(
  crop: Crop,
  plantedDay: number,
  schedule: HarvestSchedule,
  { quality, unitsPerHarvest = 1, plantCount = 1 }: ProfitOptions
): ProfitBreakdown {
  const harvestCount = schedule.harvestDays.length;
  const totalUnitsHarvested = harvestCount * unitsPerHarvest * plantCount;
  const unitPrice = crop.crop.price[quality];
  const revenue = totalUnitsHarvested * unitPrice;
  const seedCost = (crop.seed.price ?? 0) * plantCount;
  const profit = revenue - seedCost;

  const lastHarvestDay = schedule.harvestDays.at(-1);
  const growingDays = lastHarvestDay ? lastHarvestDay - plantedDay : 0;

  return {
    harvestCount,
    totalUnitsHarvested,
    revenue,
    seedCost,
    profit,
    profitPerDay: growingDays > 0 ? profit / growingDays : null,
    roi: crop.seed.price ? profit / seedCost : null,
    growingDays,
  };
}

/** Convenience wrapper: schedule + profit in one call. */
export function calculateCrop(
  crop: Crop,
  scheduleOptions: HarvestScheduleOptions,
  profitOptions: ProfitOptions
) {
  const schedule = computeHarvestSchedule(crop, scheduleOptions);
  const profit = computeProfit(crop, scheduleOptions.plantedDay, schedule, profitOptions);
  return { schedule, profit };
}
