import { describe, expect, it } from "vitest";
import {
  calculatePlot,
  coverageRowFor,
  floorsFor,
  frontSetbackM,
  perFloorFor,
  roadFarFor,
  setbackRowFor,
  sqftToKatha,
  sqftToM2,
  toMetres,
  toSqft,
  type PlotInput,
  type PlotResult,
} from "./calc.ts";

function ok(input: PlotInput): PlotResult {
  const result = calculatePlot(input);
  if (!result.ok)
    throw new Error(`Expected a result, got error ${result.error}`);
  return result;
}

const mirpur5Katha: PlotInput = {
  plotArea: 5,
  plotAreaUnit: "katha",
  roadWidth: 6,
  roadWidthUnit: "m",
  roadGroup: "central",
  blockId: "09",
};

describe("unit conversion", () => {
  it("uses 720 sq ft per katha", () => {
    expect(toSqft(5, "katha")).toBe(3600);
    expect(sqftToKatha(3600)).toBe(5);
  });

  it("converts square metres and feet", () => {
    expect(toSqft(1, "m2")).toBeCloseTo(10.7639, 4);
    expect(sqftToM2(3600)).toBeCloseTo(334.4509, 4);
    expect(toMetres(20, "ft")).toBeCloseTo(6.096, 6);
  });
});

describe("road FAR (Table 5)", () => {
  it("reads a single-width column", () => {
    expect(roadFarFor(6, "central", "A3")).toEqual({
      far: 3.25,
      method: "step",
    });
    expect(roadFarFor(4.88, "central", "A3")).toEqual({
      far: 2.25,
      method: "step",
    });
  });

  it("reads the range columns as one value", () => {
    expect(roadFarFor(2.0, "central", "A3")?.far).toBe(1.25);
    expect(roadFarFor(3.0, "central", "A3")?.far).toBe(1.75);
    expect(roadFarFor(4.0, "central", "A3")?.far).toBe(2.0);
    expect(roadFarFor(4.0, "central", "A3")?.method).toBe("range");
  });

  it("interpolates between single widths (Rule 47(6))", () => {
    expect(roadFarFor(7.5, "central", "A3")).toMatchObject({
      far: 3.375,
      method: "interpolated",
      fromM: 6,
      toM: 9,
    });
    // 40 ft road, other areas: 3.3 + (0.192 / 6) x 0.2
    expect(roadFarFor(12.192, "other", "A3")?.far).toBeCloseTo(3.3064, 6);
  });

  it("uses the last column for 24 m and wider", () => {
    expect(roadFarFor(30, "central", "A3")?.far).toBe(4.75);
  });

  it("returns nothing below 1.8 m or where the table is blank", () => {
    expect(roadFarFor(1.5, "central", "A3")).toBeNull();
    expect(roadFarFor(2.0, "central", "A4")).toBeNull();
    expect(roadFarFor(4.88, "central", "A5")).toBeNull();
    expect(roadFarFor(5.5, "central", "A5")).toBeNull();
    expect(roadFarFor(6, "central", "A5")?.far).toBe(4.0);
  });
});

describe("ground coverage (Table 3)", () => {
  it("picks the row by plot size in square metres", () => {
    expect(coverageRowFor(sqftToM2(3600)).maxMgcPct).toBe(62.5);
    expect(coverageRowFor(134).maxMgcPct).toBe(70);
    expect(coverageRowFor(134.01).maxMgcPct).toBe(67.5);
    expect(coverageRowFor(3000).maxMgcPct).toBe(40);
  });

  it("puts exactly 10 katha in the 402-670 m2 row", () => {
    expect(coverageRowFor(sqftToM2(7200)).maxMgcPct).toBe(60);
  });
});

describe("setbacks", () => {
  it("reads side and rear setbacks by storeys (Table 1)", () => {
    expect(setbackRowFor(7)).toMatchObject({ sideM: 1.0, rearM: 1.25 });
    expect(setbackRowFor(8)).toMatchObject({ sideM: 1.25, rearM: 2.0 });
    expect(setbackRowFor(12)).toMatchObject({ sideM: 3.0, rearM: 3.0 });
    expect(setbackRowFor(45)).toMatchObject({ sideM: 5.0, rearM: 5.0 });
  });

  it("keeps the front 4.5 m from the road centre or 1.5 m from the boundary", () => {
    expect(frontSetbackM(6)).toBe(1.5);
    expect(frontSetbackM(10)).toBe(1.5);
    expect(frontSetbackM(3)).toBe(3.0);
    expect(frontSetbackM(2)).toBe(3.5);
  });

  it("uses 1.5 m for a short dead-end road or a road ending at the plot", () => {
    expect(frontSetbackM(2, "deadEndShort")).toBe(1.5);
    expect(frontSetbackM(2, "privateEnd")).toBe(1.5);
  });
});

describe("floors", () => {
  it("rounds up to whole floors above the ground floor", () => {
    expect(floorsFor(12600, 2250)).toEqual({
      ratio: 5.6,
      aboveGround: 6,
      perFloorSqft: 2100,
    });
    expect(floorsFor(4500, 2250).aboveGround).toBe(2);
  });

  it("never lets a floor exceed the floor plate", () => {
    expect(perFloorFor(12600, 5, 2250)).toBe(2250);
    expect(perFloorFor(12600, 6, 2250)).toBe(2100);
  });
});

describe("calculatePlot", () => {
  it("works through a 5 katha plot on a 6 m road in Mirpur", () => {
    const r = ok(mirpur5Katha);
    expect(r.far).toMatchObject({
      area: 3.4,
      road: 3.25,
      base: 3.25,
      max: 3.4,
      achievable: 3.25,
    });
    expect(r.floorArea.totalSqft).toBe(11700);
    expect(r.coverage).toMatchObject({
      pct: 62.5,
      maxFootprintSqft: 2250,
      floorPlateSqft: 2250,
    });
    expect(r.floors).toEqual({
      ratio: 5.2,
      aboveGround: 6,
      storeys: 7,
      perFloorSqft: 1950,
    });
    expect(r.setbacks).toMatchObject({
      frontM: 1.5,
      sideM: 1.0,
      rearM: 1.25,
      storeys: 7,
    });
    expect(r.units).toMatchObject({
      densityCap: 9,
      extraWithApproval: 0,
      sizeBased: 9,
      estimate: 9,
    });
    expect(r.rulesVersion).toBe("bidhimala-2025 / dap-2025-12");
  });

  it("shows a step for each part of the calculation", () => {
    const ids = ok(mirpur5Katha).steps.map((s) => s.id);
    expect(ids).toEqual([
      "plotArea",
      "roadWidth",
      "areaFar",
      "roadFar",
      "baseMax",
      "achievableFar",
      "floorArea",
      "coverage",
      "floors",
      "setbacks",
      "units",
    ]);
  });

  it("gives the maximum FAR when it is within 0.1 of the base (Rule 47(12))", () => {
    const r = ok({ ...mirpur5Katha, blockId: "29A" }); // area FAR 3.3
    expect(r.far).toMatchObject({
      base: 3.3,
      max: 3.3,
      smallGapApplied: true,
      achievable: 3.3,
    });
  });

  it("adds incentives to the base FAR but never above the maximum", () => {
    const r = ok({ ...mirpur5Katha, incentives: ["plotSize"] });
    expect(r.far.incentives).toEqual([{ id: "plotSize", far: 0.2 }]);
    expect(r.far).toMatchObject({ incentivesCapped: true, achievable: 3.4 });
  });

  it("adds the wide-road incentive per foot above 30 ft", () => {
    const r = ok({
      ...mirpur5Katha,
      roadWidth: 12,
      incentives: ["plotSize", "wideRoad"],
    });
    // road FAR 4.0, area FAR 3.4 -> base 3.4, max 4.0
    const wide = r.far.incentives.find((i) => i.id === "wideRoad")!.far;
    expect(wide).toBeCloseTo((12 / 0.3048 - 30) * 0.02, 6);
    expect(r.far.achievable).toBeCloseTo(3.4 + 0.2 + wide, 6);
    expect(r.far.incentivesCapped).toBe(false);
  });

  it("skips incentives the plot does not qualify for", () => {
    const r = ok({
      ...mirpur5Katha,
      plotArea: 12,
      incentives: ["affordableUnits", "publicSpace"],
    });
    expect(r.far.incentives.map((i) => i.id)).toEqual(["publicSpace"]);
    const skipped = r.steps.find((s) => s.id === "incentiveSkipped");
    expect(skipped?.values).toMatchObject({
      incentiveId: "affordableUnits",
      reason: "notSpontaneous",
    });
  });

  it("allows only one of the two affordable-housing incentives", () => {
    const r = ok({
      ...mirpur5Katha,
      blockId: "15", // spontaneous
      plotArea: 20,
      incentives: ["affordableUnits", "affordableFloor"],
    });
    expect(r.far.incentives.map((i) => i.id)).toEqual(["affordableUnits"]);
  });

  it("takes 0.25 off for a subdivided plot (Rule 51(10))", () => {
    const r = ok({ ...mirpur5Katha, subdivided: true });
    expect(r.far.achievable).toBe(3.0);
  });

  it("uses the reduced plot and adds 3x the land given for road widening", () => {
    const r = ok({
      ...mirpur5Katha,
      roadSurrender: 0.5,
      roadSurrenderUnit: "katha",
    });
    expect(r.plot).toMatchObject({
      surrenderSqft: 360,
      netSqft: 3240,
      netKatha: 4.5,
    });
    expect(r.floorArea).toEqual({
      fromFarSqft: 10530,
      roadWideningBonusSqft: 1080,
      totalSqft: 11610,
    });
    expect(r.units.densityCap).toBe(8); // 4.5 x 1.9 = 8.55
  });

  it("limits the floor plate to the space left inside the setbacks", () => {
    // 30 ft x 60 ft plot (2.5 katha) on a 3 m road
    const r = ok({
      ...mirpur5Katha,
      plotArea: 1800,
      plotAreaUnit: "sqft",
      roadWidth: 3,
      plotWidth: 30,
      plotDepth: 60,
      plotDimUnit: "ft",
    });
    expect(r.setbacks).toMatchObject({ frontM: 3.0, sideM: 1.0, rearM: 1.25 });
    const usableM2 = (30 * 0.3048 - 2) * (60 * 0.3048 - 3 - 1.25);
    expect(r.coverage.setbackFootprintSqft).toBeCloseTo(
      usableM2 / 0.3048 ** 2,
      1,
    );
    expect(r.coverage.maxFootprintSqft).toBe(1215);
    expect(r.coverage.floorPlateSqft).toBeCloseTo(usableM2 / 0.3048 ** 2, 1);
    expect(r.floors.aboveGround).toBe(3); // 3150 / ~1079.5
  });

  it("explains why it cannot calculate", () => {
    expect(calculatePlot({ ...mirpur5Katha, plotArea: 0 })).toMatchObject({
      ok: false,
      error: "plotArea",
    });
    expect(calculatePlot({ ...mirpur5Katha, roadWidth: 1.5 })).toMatchObject({
      ok: false,
      error: "roadTooNarrow",
    });
    expect(calculatePlot({ ...mirpur5Katha, blockId: "01" })).toMatchObject({
      ok: false,
      error: "noResidential",
    });
    expect(calculatePlot({ ...mirpur5Katha, blockId: "99" })).toMatchObject({
      ok: false,
      error: "unknownBlock",
    });
    expect(calculatePlot({ ...mirpur5Katha, roadSurrender: 6 })).toMatchObject({
      ok: false,
      error: "surrenderTooLarge",
    });
    expect(
      calculatePlot({ ...mirpur5Katha, roadWidth: 3, buildingClass: "A5" }),
    ).toMatchObject({
      ok: false,
      error: "classNotAllowed",
    });
  });
});
