import { describe, expect, it } from "vitest";
import {
  calculateCrop,
  computeHarvestSchedule,
  computeProfit,
  resolvePlantCount,
} from "../lib/calculator";
import dataset from "../lib/data/crops.json";
import type { Crop } from "../lib/types";

const crops = (dataset as { crops: Crop[] }).crops;

function findCrop(id: string): Crop {
  const crop = crops.find((c) => c.id === id);
  if (!crop) throw new Error(`fixture crop not found: ${id}`);
  return crop;
}

describe("computeHarvestSchedule", () => {
  it("parsnip planted day 1: single harvest on day 5 (4-day crop)", () => {
    const parsnip = findCrop("parsnip");
    const { harvestDays, neverMatures } = computeHarvestSchedule(parsnip, {
      plantedDay: 1,
    });
    expect(neverMatures).toBe(false);
    expect(harvestDays).toEqual([5]);
  });

  it("blueberry planted day 1 of summer: 4 harvests every 4 days after day 13", () => {
    const blueberry = findCrop("blueberry");
    const { harvestDays } = computeHarvestSchedule(blueberry, { plantedDay: 1 });
    // matures day 1 + 13 = 14, then +4 regrowth: 18, 22, 26 (30 would exceed day 28)
    expect(harvestDays).toEqual([14, 18, 22, 26]);
  });

  it("cranberries planted day 1 of fall: 5 harvests matches wiki example", () => {
    const cranberries = findCrop("cranberries");
    const { harvestDays } = computeHarvestSchedule(cranberries, { plantedDay: 1 });
    // 1 + 7 = 8, then every 5 days: 13, 18, 23, 28
    expect(harvestDays).toEqual([8, 13, 18, 23, 28]);
    expect(harvestDays.length).toBe(5);
  });

  it("a crop planted too late in the season never matures", () => {
    const cauliflower = findCrop("cauliflower"); // 12 days to grow
    const { neverMatures, harvestDays } = computeHarvestSchedule(cauliflower, {
      plantedDay: 20,
    });
    expect(neverMatures).toBe(true);
    expect(harvestDays).toEqual([]);
  });

  it("multi-season crop can span into a second season window", () => {
    const corn = findCrop("corn");
    const { harvestDays } = computeHarvestSchedule(corn, {
      plantedDay: 20,
      lastAllowedDay: 56, // planted late summer (day 20), carries through fall (day 56)
    });
    expect(harvestDays[0]).toBe(20 + 14);
    expect(harvestDays.length).toBeGreaterThan(1);
  });
});

describe("resolvePlantCount", () => {
  it("derives plant counts from sprinkler quantities and types", () => {
    expect(resolvePlantCount("sprinklers", 1, 3, "normal")).toBe(12);
    expect(resolvePlantCount("sprinklers", 2, 4, "quality")).toBe(32);
    expect(resolvePlantCount("sprinklers", 1, 2, "iridium")).toBe(48);
  });
});

describe("computeProfit", () => {
  it("cranberries: matches the wiki's worked example (~18.89g/day)", () => {
    const cranberries = findCrop("cranberries");
    const { schedule, profit } = calculateCrop(
      cranberries,
      { plantedDay: 1 },
      { quality: "normal", unitsPerHarvest: 2 }
    );
    expect(schedule.harvestDays.length).toBe(5);
    // 5 harvests x 2 berries x 75g - 240g seed = 510g profit over 27 growing days
    expect(profit.revenue).toBe(750);
    expect(profit.seedCost).toBe(240);
    expect(profit.profit).toBe(510);
    expect(profit.profitPerDay).toBeCloseTo(18.89, 1);
  });

  it("parsnip: matches the dataset's precomputed profitPerDay", () => {
    const parsnip = findCrop("parsnip");
    const { profit } = calculateCrop(
      parsnip,
      { plantedDay: 1 },
      { quality: "normal" }
    );
    expect(profit.profitPerDay).toBeCloseTo(parsnip.calculator.profitPerDay, 1);
  });

  it("scales linearly with plantCount", () => {
    const parsnip = findCrop("parsnip");
    const one = calculateCrop(parsnip, { plantedDay: 1 }, { quality: "normal", plantCount: 1 });
    const ten = calculateCrop(parsnip, { plantedDay: 1 }, { quality: "normal", plantCount: 10 });
    expect(ten.profit.revenue).toBe(one.profit.revenue * 10);
    expect(ten.profit.seedCost).toBe(one.profit.seedCost * 10);
  });

  it("higher quality yields more revenue than normal", () => {
    const blueberry = findCrop("blueberry");
    const normal = calculateCrop(blueberry, { plantedDay: 1 }, { quality: "normal" });
    const gold = calculateCrop(blueberry, { plantedDay: 1 }, { quality: "gold" });
    expect(gold.profit.revenue).toBeGreaterThan(normal.profit.revenue);
  });
});
