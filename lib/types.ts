export type Season = "Spring" | "Summer" | "Fall" | "Winter" | "Greenhouse";

export type Quality = "normal" | "silver" | "gold" | "iridium";

export interface PriceByQuality {
  normal: number;
  silver: number;
  gold: number;
  iridium: number;
}

export interface Crop {
  id: string;
  name: string;
  englishName: string;
  season: Season[];
  seed: {
    id: number | null;
    price: number | null;
    icon: string;
  };
  crop: {
    id: number | null;
    price: PriceByQuality;
    category: string;
    description: string;
    energy: number;
    health: number;
  };
  growth: {
    days: number;
    phases: number[];
    regrowth: number | null;
    multiHarvest: boolean;
  };
  special: {
    trellis: boolean;
    giantCrop: boolean;
    seedMaker: boolean;
  };
  calculator: {
    maxHarvests: number;
    profitPerDay: number;
    roi: number | null;
  };
}

export interface FruitTree {
  id: string;
  name: string;
  englishName: string;
  season: Season[];
  sapling: {
    price: number | null;
    icon: string;
  };
  fruit: {
    price: PriceByQuality;
    category: string;
    description: string;
    energy: number;
    health: number;
  };
  growth: {
    daysToMature: number;
    requiresEmptyTiles: number;
    note: string;
  };
  special: {
    giantSize: boolean;
    yearsToMature: number;
  };
}

export interface CropsDataset {
  version: string;
  crops: Crop[];
  fruitTrees: FruitTree[];
}

/** Fertilizers that affect growth speed (Speed-Gro family). */
export interface GrowthFertilizer {
  id: "none" | "speed-gro" | "deluxe-speed-gro" | "hyper-speed-gro";
  label: string;
  /** Fraction shaved off total growth days, rounded down per game rules. */
  speedBonus: number;
}

export const GROWTH_FERTILIZERS: GrowthFertilizer[] = [
  { id: "none", label: "Nenhum", speedBonus: 0 },
  { id: "speed-gro", label: "Speed-Gro", speedBonus: 0.1 },
  { id: "deluxe-speed-gro", label: "Speed-Gro Deluxe", speedBonus: 0.25 },
  { id: "hyper-speed-gro", label: "Speed-Gro Hiper", speedBonus: 0.33 },
];

export const SEASON_LENGTH_DAYS = 28;

export const SEASON_LABELS: Record<Season, string> = {
  Spring: "Primavera",
  Summer: "Verão",
  Fall: "Outono",
  Winter: "Inverno",
  Greenhouse: "Estufa",
};

export const QUALITY_LABELS: Record<Quality, string> = {
  normal: "Normal",
  silver: "Prata",
  gold: "Ouro",
  iridium: "Iridium",
};
