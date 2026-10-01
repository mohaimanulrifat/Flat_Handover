/**
 * Landowner Calculator: what can be built on a plot under the current rules.
 *
 * Pure functions with no UI. All rule values come from src/rules/; this
 * file only holds the arithmetic. Every result carries the steps that led
 * to it (see Step), so the screen can show how each number was reached.
 */
import {
  rules as defaultRules,
  type CoverageRow,
  type DensityBlock,
  type Incentive,
  type ResidentialClass,
  type RoadGroupId,
  type Rules,
  type SetbackRow,
  type Source,
} from "../rules/index.ts";

export type AreaUnit = "katha" | "sqft" | "m2";
export type LengthUnit = "m" | "ft";
/** normal road, dead-end road up to 50 m, or a road that ends at this plot. */
export type RoadKind = "normal" | "deadEndShort" | "privateEnd";

export interface PlotInput {
  plotArea: number;
  plotAreaUnit: AreaUnit;
  roadWidth: number;
  roadWidthUnit: LengthUnit;
  roadGroup: RoadGroupId;
  blockId: string;
  buildingClass?: ResidentialClass;
  roadKind?: RoadKind;
  /** Land given (or to be given) for road widening. */
  roadSurrender?: number;
  roadSurrenderUnit?: AreaUnit;
  /** True if the plot was made by dividing a larger plot. */
  subdivided?: boolean;
  /** Optional plot frontage (road side) and depth, for a setback check. */
  plotWidth?: number;
  plotDepth?: number;
  plotDimUnit?: LengthUnit;
  /** Ids from the incentive table the owner wants to use. */
  incentives?: string[];
}

export interface Step {
  id: StepId;
  values: Record<string, number | string | boolean>;
  source?: Source | Source[];
}

export type StepId =
  | "plotArea"
  | "roadSurrender"
  | "roadWidth"
  | "areaFar"
  | "roadFar"
  | "baseMax"
  | "smallGap"
  | "incentive"
  | "incentiveSkipped"
  | "incentiveTotal"
  | "subdivided"
  | "achievableFar"
  | "floorArea"
  | "coverage"
  | "setbackFootprint"
  | "floors"
  | "setbacks"
  | "units";

export type ErrorId =
  | "plotArea"
  | "roadTooNarrow"
  | "classNotAllowed"
  | "unknownBlock"
  | "noResidential"
  | "surrenderTooLarge"
  | "noRoomAfterSetbacks";

export interface IncentiveUse {
  id: string;
  far: number;
}

export interface PlotResult {
  ok: true;
  rulesVersion: string;
  block: DensityBlock;
  buildingClass: ResidentialClass;
  plot: {
    grossSqft: number;
    surrenderSqft: number;
    netSqft: number;
    netM2: number;
    netKatha: number;
  };
  road: { widthM: number; widthFt: number; interpolated: boolean };
  far: {
    area: number;
    road: number;
    base: number;
    max: number;
    smallGapApplied: boolean;
    incentives: IncentiveUse[];
    incentiveTotal: number;
    incentivesCapped: boolean;
    subdividedReduction: number;
    achievable: number;
  };
  floorArea: {
    fromFarSqft: number;
    roadWideningBonusSqft: number;
    totalSqft: number;
  };
  coverage: {
    row: CoverageRow;
    pct: number;
    maxFootprintSqft: number;
    setbackFootprintSqft: number | null;
    floorPlateSqft: number;
  };
  floors: {
    ratio: number;
    aboveGround: number;
    storeys: number;
    perFloorSqft: number;
  };
  setbacks: {
    row: SetbackRow;
    frontM: number;
    sideM: number;
    rearM: number;
    storeys: number;
  };
  units: {
    densityCap: number | null;
    extraWithApproval: number | null;
    sizeBased: number;
    estimate: number;
    avgUnitSizeSqft: number;
    unitsPerKatha: number;
  };
  steps: Step[];
}

export type CalcResult =
  | PlotResult
  | { ok: false; error: ErrorId; values?: Record<string, number | string> };

// Unit conversion -----------------------------------------------------

export function toSqft(
  value: number,
  unit: AreaUnit,
  r: Rules = defaultRules,
): number {
  if (unit === "sqft") return value;
  if (unit === "katha") return value * r.conversions.sqftPerKatha;
  const ft = r.conversions.metresPerFoot;
  return value / (ft * ft);
}

export function sqftToM2(sqft: number, r: Rules = defaultRules): number {
  const ft = r.conversions.metresPerFoot;
  return sqft * ft * ft;
}

export function sqftToKatha(sqft: number, r: Rules = defaultRules): number {
  return sqft / r.conversions.sqftPerKatha;
}

export function toMetres(
  value: number,
  unit: LengthUnit,
  r: Rules = defaultRules,
): number {
  return unit === "m" ? value : value * r.conversions.metresPerFoot;
}

export function metresToFeet(m: number, r: Rules = defaultRules): number {
  return m / r.conversions.metresPerFoot;
}

/** Rounds away floating-point noise, e.g. 3.3749999999 -> 3.375. */
export function tidy(n: number, decimals = 6): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

// Rule lookups --------------------------------------------------------

export interface RoadFarLookup {
  far: number;
  /** "range": a printed range; "step": an exact column; "interpolated": between two columns. */
  method: "range" | "step" | "interpolated";
  fromM?: number;
  toM?: number;
  fromFar?: number;
  toFar?: number;
}

/**
 * Road FAR for a road width. Returns null if the width is below the table
 * or the building class is not allowed at that width.
 */
export function roadFarFor(
  widthM: number,
  group: RoadGroupId,
  cls: ResidentialClass,
  r: Rules = defaultRules,
): RoadFarLookup | null {
  const row = r.roadFar.groups.find((g) => g.id === group)?.rows[cls];
  if (!row) return null;
  const cols = r.roadFar.widthColumns;

  for (let i = 0; i < cols.length; i++) {
    const col = cols[i];
    if (col.kind === "range" && widthM >= col.fromM! && widthM < col.toM!) {
      return row[i] === null ? null : { far: row[i]!, method: "range" };
    }
  }

  const steps = cols
    .map((col, i) => ({ col, far: row[i] }))
    .filter((s) => s.col.kind === "step");
  const last = steps[steps.length - 1];
  if (widthM >= last.col.atM!) {
    return last.far === null ? null : { far: last.far, method: "step" };
  }
  for (let i = 0; i < steps.length - 1; i++) {
    const lo = steps[i];
    const hi = steps[i + 1];
    if (widthM < lo.col.atM! || widthM >= hi.col.atM!) continue;
    if (lo.far === null) return null;
    if (widthM === lo.col.atM) return { far: lo.far, method: "step" };
    if (hi.far === null) return null;
    // Rule 47(6): rises in proportion to the extra width, up to the next step.
    const share = (widthM - lo.col.atM!) / (hi.col.atM! - lo.col.atM!);
    return {
      far: tidy(lo.far + share * (hi.far - lo.far)),
      method: "interpolated",
      fromM: lo.col.atM,
      toM: hi.col.atM,
      fromFar: lo.far,
      toFar: hi.far,
    };
  }
  return null;
}

/** Table 3 row for a plot size (net of land given for roads). */
export function coverageRowFor(
  netM2: number,
  r: Rules = defaultRules,
): CoverageRow {
  const rows = r.groundCoverage.rows;
  return (
    rows.find(
      (row) =>
        netM2 > row.aboveM2 && (row.upToM2 === null || netM2 <= row.upToM2),
    ) ?? rows[0]
  );
}

/** Table 1 row for a number of storeys. */
export function setbackRowFor(
  storeys: number,
  r: Rules = defaultRules,
): SetbackRow {
  const rows = r.setbacks.byStoreys;
  return (
    rows.find(
      (row) =>
        storeys >= row.fromStoreys &&
        (row.toStoreys === null || storeys <= row.toStoreys),
    ) ?? rows[rows.length - 1]
  );
}

/** Front setback in metres from the plot boundary (Rule 41). */
export function frontSetbackM(
  widthM: number,
  kind: RoadKind = "normal",
  r: Rules = defaultRules,
): number {
  const f = r.setbacks.front;
  if (kind === "deadEndShort") return f.deadEndFrontM;
  if (kind === "privateEnd") return f.privateEndRoadFrontM;
  return tidy(Math.max(f.fromBoundaryM, f.fromRoadCentreM - widthM / 2));
}

export interface IncentiveContext {
  netKatha: number;
  roadWidthFt: number;
  block: DensityBlock;
}

/** FAR an incentive gives, or 0 with a reason if the plot does not qualify. */
export function incentiveFar(
  item: Incentive,
  ctx: IncentiveContext,
): { far: number; reason?: "plotTooSmall" | "notSpontaneous" | "roadNotWide" } {
  if (item.minKatha !== undefined && ctx.netKatha < item.minKatha) {
    return { far: 0, reason: "plotTooSmall" };
  }
  if (item.onlySpontaneousArea && ctx.block.type !== "spontaneous") {
    return { far: 0, reason: "notSpontaneous" };
  }
  switch (item.kind) {
    case "byPlotSize": {
      // A boundary value goes in the higher band (see VERIFY.md).
      const band = [...(item.bands ?? [])]
        .reverse()
        .find((b) => ctx.netKatha >= b.fromKatha);
      return band ? { far: band.far } : { far: 0, reason: "plotTooSmall" };
    }
    case "perFootAbove": {
      const extraFt = ctx.roadWidthFt - (item.aboveFt ?? 0);
      if (extraFt <= 0) return { far: 0, reason: "roadNotWide" };
      return {
        far: tidy(
          Math.min(item.maxFar ?? Infinity, extraFt * (item.farPerFt ?? 0)),
        ),
      };
    }
    case "fixed":
      return { far: item.maxFar ?? 0 };
  }
}

// Floors --------------------------------------------------------------

/**
 * Floors above the ground floor needed to use the total floor area with a
 * given floor plate. As in the 2016 sample: 12,600 / 2,250 = 5.6, so 6
 * floors of 2,100 sq ft each (G+6).
 */
export function floorsFor(totalSqft: number, plateSqft: number) {
  const ratio = totalSqft / plateSqft;
  const aboveGround = Math.max(1, Math.ceil(tidy(ratio, 9)));
  return {
    ratio: tidy(ratio, 4),
    aboveGround,
    perFloorSqft: tidy(totalSqft / aboveGround, 2),
  };
}

/** Area of each floor if the building has a chosen number of floors above ground. */
export function perFloorFor(
  totalSqft: number,
  floorsAboveGround: number,
  plateSqft: number,
): number {
  return tidy(Math.min(totalSqft / floorsAboveGround, plateSqft), 2);
}

// The calculation -----------------------------------------------------

export function calculatePlot(
  input: PlotInput,
  r: Rules = defaultRules,
): CalcResult {
  const steps: Step[] = [];
  const cls = input.buildingClass ?? "A3";
  const conv = r.conversions.sources;

  if (!(input.plotArea > 0)) return { ok: false, error: "plotArea" };
  const grossSqft = toSqft(input.plotArea, input.plotAreaUnit, r);
  steps.push({
    id: "plotArea",
    values: {
      input: input.plotArea,
      unit: input.plotAreaUnit,
      sqft: tidy(grossSqft, 2),
      m2: tidy(sqftToM2(grossSqft, r), 2),
      katha: tidy(sqftToKatha(grossSqft, r), 3),
    },
    source: [conv.sqftPerKatha, conv.metresPerFoot],
  });

  const surrenderSqft =
    input.roadSurrender && input.roadSurrender > 0
      ? toSqft(
          input.roadSurrender,
          input.roadSurrenderUnit ?? input.plotAreaUnit,
          r,
        )
      : 0;
  if (surrenderSqft >= grossSqft)
    return { ok: false, error: "surrenderTooLarge" };
  const netSqft = grossSqft - surrenderSqft;
  const netM2 = sqftToM2(netSqft, r);
  const netKatha = sqftToKatha(netSqft, r);
  if (surrenderSqft > 0) {
    steps.push({
      id: "roadSurrender",
      values: {
        surrenderSqft: tidy(surrenderSqft, 2),
        netSqft: tidy(netSqft, 2),
        netKatha: tidy(netKatha, 3),
      },
      source: r.farDerivation.roadWideningSource,
    });
  }

  const widthM = toMetres(input.roadWidth, input.roadWidthUnit, r);
  const widthFt = metresToFeet(widthM, r);
  steps.push({
    id: "roadWidth",
    values: {
      input: input.roadWidth,
      unit: input.roadWidthUnit,
      m: tidy(widthM, 3),
      ft: tidy(widthFt, 2),
    },
  });

  const block = r.densityBlocks.find((b) => b.id === input.blockId);
  if (!block)
    return {
      ok: false,
      error: "unknownBlock",
      values: { blockId: input.blockId },
    };
  if (block.areaFar <= 0)
    return { ok: false, error: "noResidential", values: { blockId: block.id } };
  steps.push({
    id: "areaFar",
    values: { blockId: block.id, blockName: block.name_bn, far: block.areaFar },
    source: block.source,
  });

  const firstRangeFrom = r.roadFar.widthColumns[0].fromM ?? 0;
  if (widthM < firstRangeFrom) {
    return {
      ok: false,
      error: "roadTooNarrow",
      values: { minM: firstRangeFrom },
    };
  }
  const road = roadFarFor(widthM, input.roadGroup, cls, r);
  if (!road)
    return {
      ok: false,
      error: "classNotAllowed",
      values: { cls, widthM: tidy(widthM, 2) },
    };
  const group = r.roadFar.groups.find((g) => g.id === input.roadGroup)!;
  steps.push({
    id: "roadFar",
    values: {
      group: group.id,
      cls,
      widthM: tidy(widthM, 3),
      far: road.far,
      method: road.method,
      ...(road.method === "interpolated"
        ? {
            fromM: road.fromM!,
            toM: road.toM!,
            fromFar: road.fromFar!,
            toFar: road.toFar!,
          }
        : {}),
    },
    source:
      road.method === "interpolated"
        ? [group.source, r.roadFar.betweenStepsSource]
        : group.source,
  });

  // Base and maximum FAR (Rule 47(3)).
  let base = Math.min(block.areaFar, road.far);
  const max = Math.max(block.areaFar, road.far);
  steps.push({
    id: "baseMax",
    values: { area: block.areaFar, road: road.far, base, max },
    source: r.farDerivation.baseAndMaxSource,
  });
  const smallGapApplied =
    max > base && tidy(max - base) <= r.farDerivation.smallGap;
  if (smallGapApplied) {
    steps.push({
      id: "smallGap",
      values: { base, max, gap: r.farDerivation.smallGap },
      source: r.farDerivation.smallGapSource,
    });
    base = max;
  }

  // Incentives, added to base and capped at max.
  const chosen = new Set(input.incentives ?? []);
  const used: IncentiveUse[] = [];
  const ctx: IncentiveContext = { netKatha, roadWidthFt: widthFt, block };
  for (const item of r.incentives.items) {
    if (!chosen.has(item.id)) continue;
    if (item.exclusiveWith?.some((other) => used.some((u) => u.id === other))) {
      steps.push({
        id: "incentiveSkipped",
        values: { incentiveId: item.id, reason: "exclusive" },
        source: item.source,
      });
      continue;
    }
    const { far, reason } = incentiveFar(item, ctx);
    if (reason || far <= 0) {
      steps.push({
        id: "incentiveSkipped",
        values: { incentiveId: item.id, reason: reason ?? "none" },
        source: item.source,
      });
      continue;
    }
    used.push({ id: item.id, far });
    steps.push({
      id: "incentive",
      values: { incentiveId: item.id, far },
      source: item.source,
    });
  }
  const incentiveTotal = tidy(used.reduce((n, u) => n + u.far, 0));
  const withIncentives = Math.min(tidy(base + incentiveTotal), max);
  const incentivesCapped = tidy(base + incentiveTotal) > max;
  if (used.length || chosen.size) {
    steps.push({
      id: "incentiveTotal",
      values: {
        base,
        total: incentiveTotal,
        sum: tidy(base + incentiveTotal),
        max,
        result: withIncentives,
        capped: incentivesCapped,
      },
      source: r.incentives.source,
    });
  }

  let achievable = withIncentives;
  const subdividedReduction = input.subdivided
    ? r.farDerivation.subdividedReduction
    : 0;
  if (subdividedReduction) {
    achievable = Math.max(0, tidy(achievable - subdividedReduction));
    steps.push({
      id: "subdivided",
      values: {
        before: withIncentives,
        reduction: subdividedReduction,
        after: achievable,
      },
      source: r.farDerivation.subdividedSource,
    });
  }
  steps.push({ id: "achievableFar", values: { far: achievable } });

  // Total floor area.
  const fromFarSqft = tidy(netSqft * achievable, 2);
  const roadWideningBonusSqft = tidy(
    surrenderSqft * r.farDerivation.roadWideningMultiplier,
    2,
  );
  const totalSqft = tidy(fromFarSqft + roadWideningBonusSqft, 2);
  steps.push({
    id: "floorArea",
    values: {
      netSqft: tidy(netSqft, 2),
      far: achievable,
      fromFarSqft,
      bonusSqft: roadWideningBonusSqft,
      multiplier: r.farDerivation.roadWideningMultiplier,
      totalSqft,
    },
    source: roadWideningBonusSqft
      ? r.farDerivation.roadWideningSource
      : undefined,
  });

  // Ground coverage.
  const row = coverageRowFor(netM2, r);
  const maxFootprintSqft = tidy((netSqft * row.maxMgcPct) / 100, 2);
  steps.push({
    id: "coverage",
    values: {
      row: row.row,
      rowLabel: row.label_bn,
      netM2: tidy(netM2, 2),
      pct: row.maxMgcPct,
      netSqft: tidy(netSqft, 2),
      footprintSqft: maxFootprintSqft,
    },
    source: row.source,
  });

  // Floors and setbacks depend on each other when plot sides are known:
  // more storeys need wider setbacks, which can shrink the floor plate.
  const frontM = frontSetbackM(widthM, input.roadKind, r);
  const dimsKnown = (input.plotWidth ?? 0) > 0 && (input.plotDepth ?? 0) > 0;
  let plate = maxFootprintSqft;
  let setbackFootprintSqft: number | null = null;
  let floors = floorsFor(totalSqft, plate);
  let sbRow = setbackRowFor(floors.aboveGround + 1, r);
  for (let i = 0; i < 10 && dimsKnown; i++) {
    const unit = input.plotDimUnit ?? "ft";
    const wM = toMetres(input.plotWidth!, unit, r);
    const dM = toMetres(input.plotDepth!, unit, r);
    const usableW = wM - 2 * sbRow.sideM;
    const usableD = dM - frontM - sbRow.rearM;
    if (usableW <= 0 || usableD <= 0)
      return { ok: false, error: "noRoomAfterSetbacks" };
    setbackFootprintSqft = tidy(toSqft(usableW * usableD, "m2", r), 2);
    const nextPlate = Math.min(maxFootprintSqft, setbackFootprintSqft);
    const nextFloors = floorsFor(totalSqft, nextPlate);
    const nextRow = setbackRowFor(nextFloors.aboveGround + 1, r);
    plate = nextPlate;
    floors = nextFloors;
    if (nextRow.row === sbRow.row) break;
    sbRow = nextRow;
  }
  if (dimsKnown) {
    steps.push({
      id: "setbackFootprint",
      values: {
        widthM: tidy(
          toMetres(input.plotWidth!, input.plotDimUnit ?? "ft", r),
          3,
        ),
        depthM: tidy(
          toMetres(input.plotDepth!, input.plotDimUnit ?? "ft", r),
          3,
        ),
        frontM,
        sideM: sbRow.sideM,
        rearM: sbRow.rearM,
        footprintSqft: setbackFootprintSqft!,
        mgcSqft: maxFootprintSqft,
        plateSqft: tidy(plate, 2),
      },
      source: [r.setbacks.front.source, r.setbacks.byStoreysSource],
    });
  }
  const storeys = floors.aboveGround + 1;
  steps.push({
    id: "floors",
    values: {
      totalSqft,
      plateSqft: tidy(plate, 2),
      ratio: floors.ratio,
      aboveGround: floors.aboveGround,
      perFloorSqft: floors.perFloorSqft,
      storeys,
    },
    source: r.farDerivation.parkingSource,
  });
  steps.push({
    id: "setbacks",
    values: {
      storeys,
      row: sbRow.row,
      rowLabel: sbRow.label_bn,
      frontM,
      sideM: sbRow.sideM,
      rearM: sbRow.rearM,
      roadKind: input.roadKind ?? "normal",
    },
    source: [r.setbacks.front.source, r.setbacks.byStoreysSource],
  });

  // Dwelling units (density applies to A3).
  const densityApplies = cls === r.farDerivation.dwellingUnitsClass;
  const densityCap = densityApplies
    ? Math.floor(tidy(netKatha * block.unitsPerKatha, 6))
    : null;
  const extraWithApproval =
    densityCap === null
      ? null
      : Math.floor((densityCap * r.farDerivation.extraUnitsPct) / 100);
  const sizeBased = Math.floor(tidy(totalSqft / block.avgUnitSizeSqft, 6));
  const estimate =
    densityCap === null ? sizeBased : Math.min(densityCap, sizeBased);
  steps.push({
    id: "units",
    values: {
      netKatha: tidy(netKatha, 3),
      unitsPerKatha: block.unitsPerKatha,
      densityCap: densityCap ?? "-",
      extraPct: r.farDerivation.extraUnitsPct,
      extraWithApproval: extraWithApproval ?? "-",
      totalSqft,
      avgUnitSizeSqft: block.avgUnitSizeSqft,
      sizeBased,
      estimate,
    },
    source: [block.source, ...r.farDerivation.dwellingUnitsSource],
  });

  return {
    ok: true,
    rulesVersion: r.version,
    block,
    buildingClass: cls,
    plot: {
      grossSqft: tidy(grossSqft, 2),
      surrenderSqft: tidy(surrenderSqft, 2),
      netSqft: tidy(netSqft, 2),
      netM2: tidy(netM2, 2),
      netKatha: tidy(netKatha, 3),
    },
    road: {
      widthM: tidy(widthM, 3),
      widthFt: tidy(widthFt, 2),
      interpolated: road.method === "interpolated",
    },
    far: {
      area: block.areaFar,
      road: road.far,
      base,
      max,
      smallGapApplied,
      incentives: used,
      incentiveTotal,
      incentivesCapped,
      subdividedReduction,
      achievable,
    },
    floorArea: { fromFarSqft, roadWideningBonusSqft, totalSqft },
    coverage: {
      row,
      pct: row.maxMgcPct,
      maxFootprintSqft,
      setbackFootprintSqft,
      floorPlateSqft: tidy(plate, 2),
    },
    floors: {
      ratio: floors.ratio,
      aboveGround: floors.aboveGround,
      storeys,
      perFloorSqft: floors.perFloorSqft,
    },
    setbacks: {
      row: sbRow,
      frontM,
      sideM: sbRow.sideM,
      rearM: sbRow.rearM,
      storeys,
    },
    units: {
      densityCap,
      extraWithApproval,
      sizeBased,
      estimate,
      avgUnitSizeSqft: block.avgUnitSizeSqft,
      unitsPerKatha: block.unitsPerKatha,
    },
    steps,
  };
}
