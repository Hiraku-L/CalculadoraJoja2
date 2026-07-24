import type { Crop, FruitTree, Season } from "./types";
import { SEASON_LABELS } from "./types";

export const ALL_SEASONS: Season[] = ["Spring", "Summer", "Fall", "Winter"];

export function seasonLabel(season: Season): string {
  return SEASON_LABELS[season];
}

export function cropsForSeason(crops: Crop[], season: Season): Crop[] {
  return crops.filter((c) => c.season.includes(season));
}

export function treesForSeason(trees: FruitTree[], season: Season): FruitTree[] {
  return trees.filter((t) => t.season.includes(season));
}

/**
 * Weekday label the way the in-game calendar shows it (Mon/Tue/.../Sun,
 * repeating every 7 days regardless of season - day 1 of every season is
 * always the same weekday in Stardew Valley).
 */
const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function weekdayLabel(dayOfSeason: number): string {
  const idx = (dayOfSeason - 1) % 7;
  // idx is always 0-6 by construction, so this index is always in bounds.
  return WEEKDAYS[idx]!;
}
