/**
 * Cases from "worked-examples (answers from a architect).pdf".
 *
 * That file is a RAJUK slide deck dated 18 May 2016, based on the 2008
 * Bidhimala, which the 2025 Bidhimala repealed (Rule 75). Where its
 * numbers come from the old tables they cannot match the 2025 data.
 * Those cases are kept as expected failures (it.fails) instead of
 * changing the rules data to force a pass; see VERIFY.md. If the data
 * ever starts matching them, the test turns red so someone looks again.
 */
import { describe, expect, it } from "vitest";
import { rules } from "../rules/index.ts";
import {
  calculatePlot,
  coverageRowFor,
  floorsFor,
  frontSetbackM,
  perFloorFor,
  setbackRowFor,
  sqftToM2,
  toSqft,
} from "./calc.ts";

// Slide 6, "Sample Calculation of FAR, No. of Stories and Floor Area":
// plot 5 katha (3600 sft), residential, road width 6 m, FAR 3.5, MGC 62.5%.
const PLOT_KATHA = 5;
const ROAD_M = 6;
const SAMPLE_FAR = 3.5;
const SAMPLE_MGC_PCT = 62.5;

describe("worked example (slide 6): arithmetic", () => {
  const plotSqft = toSqft(PLOT_KATHA, "katha");
  const totalSqft = plotSqft * SAMPLE_FAR;
  const coverageSqft = (plotSqft * SAMPLE_MGC_PCT) / 100;

  it("5 katha = 3600 sft", () => {
    expect(plotSqft).toBe(3600);
  });

  it("total floor area = 3600 x 3.5 = 12,600 sft", () => {
    expect(totalSqft).toBe(12600);
  });

  it("allowable ground coverage = 2250 sft", () => {
    expect(coverageSqft).toBe(2250);
  });

  it("no. of stories = 12600 / 2250 = 5.6, total with ground floor = 6.6", () => {
    const floors = floorsFor(totalSqft, coverageSqft);
    expect(floors.ratio).toBe(5.6);
    expect(floors.ratio + 1).toBeCloseTo(6.6, 10);
  });

  it("7 storied: area per floor = 12600 / 6 = 2100 sft", () => {
    expect(perFloorFor(totalSqft, 6, coverageSqft)).toBe(2100);
    expect(floorsFor(totalSqft, coverageSqft)).toMatchObject({
      aboveGround: 6,
      perFloorSqft: 2100,
    });
  });

  it("6 storied: 12600 / 5 = 2520, but max ground coverage is 2250", () => {
    expect(totalSqft / 5).toBe(2520);
    expect(perFloorFor(totalSqft, 5, coverageSqft)).toBe(2250);
  });
});

describe("worked example (slide 6): values looked up from the rules", () => {
  it("MGC 62.5% for a 5 katha plot (2025 Table 3 gives the same)", () => {
    expect(
      coverageRowFor(sqftToM2(toSqft(PLOT_KATHA, "katha"))).maxMgcPct,
    ).toBe(SAMPLE_MGC_PCT);
  });

  // KNOWN MISMATCH: 2008 rules gave FAR 3.5 here. Under 2025 rules the road
  // FAR at 6 m is at most 3.25, and base FAR = min(area FAR, road FAR).
  it.fails("FAR 3.5 for a 5 katha plot on a 6 m road", () => {
    const baseFars = new Set<number>();
    for (const group of rules.roadFar.groups) {
      for (const block of rules.densityBlocks) {
        const r = calculatePlot({
          plotArea: PLOT_KATHA,
          plotAreaUnit: "katha",
          roadWidth: ROAD_M,
          roadWidthUnit: "m",
          roadGroup: group.id,
          blockId: block.id,
        });
        if (r.ok) baseFars.add(r.far.base);
      }
    }
    expect([...baseFars]).toContain(SAMPLE_FAR);
  });
});

// Slide 3 setback table, row "From 4 kht to 5 kht": front 1.50, rear 2.00,
// sides 1.25. The 2025 rules set setbacks by storeys; the sample building is
// G+6 = 7 storeys.
describe("worked example (slide 3): setbacks for the sample plot", () => {
  it("front 1.50 m", () => {
    expect(frontSetbackM(ROAD_M)).toBe(1.5);
  });

  // KNOWN MISMATCH: 2025 Table 1 gives rear 1.25 m for up to 7 storeys.
  it.fails("rear 2.00 m", () => {
    expect(setbackRowFor(7).rearM).toBe(2.0);
  });

  // KNOWN MISMATCH: 2025 Table 1 gives sides 1.00 m for up to 7 storeys.
  it.fails("sides 1.25 m", () => {
    expect(setbackRowFor(7).sideM).toBe(1.25);
  });
});
