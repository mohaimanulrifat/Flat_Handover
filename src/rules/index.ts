/**
 * Building rules for the Landowner Calculator, kept as data.
 *
 * Each folder under src/rules/ holds one version of the rules, named after
 * the gazettes it comes from. To move to a new gazette, copy the folder,
 * edit the JSON files, and point the imports below at the new folder.
 * The calculation code in src/landowner/ reads only what is exported here.
 */
import conversions from "./bidhimala-2025_dap-2025-12/conversions.json";
import densityBlocks from "./bidhimala-2025_dap-2025-12/density-blocks.json";
import farDerivation from "./bidhimala-2025_dap-2025-12/far-derivation.json";
import groundCoverage from "./bidhimala-2025_dap-2025-12/ground-coverage.json";
import incentives from "./bidhimala-2025_dap-2025-12/incentives.json";
import meta from "./bidhimala-2025_dap-2025-12/meta.json";
import roadFar from "./bidhimala-2025_dap-2025-12/road-far.json";
import setbacks from "./bidhimala-2025_dap-2025-12/setbacks.json";

export interface Source {
  doc: string;
  table: string;
  page: string;
}

export type ResidentialClass = "A1" | "A2" | "A3" | "A4" | "A5" | "A6";
export type RoadGroupId = "central" | "outer" | "other";

export interface WidthColumn {
  id: string;
  kind: "range" | "step";
  fromM?: number;
  toM?: number;
  atM?: number;
  orMore?: boolean;
  label: string;
}

export interface RoadGroup {
  id: RoadGroupId;
  label_bn: string;
  label_en: string;
  source: Source;
  rows: Record<ResidentialClass, (number | null)[]>;
}

export interface DensityBlock {
  id: string;
  name_bn: string;
  area_bn: string;
  type: "spontaneous" | "planned" | null;
  grossPPA: number;
  avgUnitSizeSqft: number;
  unitsPerKatha: number;
  areaFar: number;
  source: Source;
}

export interface CoverageRow {
  row: number;
  aboveM2: number;
  upToM2: number | null;
  label_bn: string;
  minMgcPct: number | null;
  maxMgcPct: number;
  openSpacePct: number;
  extraCoveragePct: number;
  rainwaterPct: number;
  source: Source;
}

export interface SetbackRow {
  row: number;
  fromStoreys: number;
  toStoreys: number | null;
  label_bn: string;
  betweenBuildingsM: number;
  sideM: number;
  rearM: number;
}

export interface IncentiveBand {
  fromKatha: number;
  toKatha: number | null;
  far: number;
}

export interface Incentive {
  id: string;
  no: number;
  title_bn: string;
  title_en: string;
  kind: "byPlotSize" | "perFootAbove" | "fixed";
  bands?: IncentiveBand[];
  aboveFt?: number;
  farPerFt?: number;
  maxFar?: number;
  minKatha?: number;
  onlySpontaneousArea?: boolean;
  exclusiveWith?: string[];
  source: Source;
  needs_verification?: boolean;
  verifyNote?: string;
}

export const RULES_VERSION: string = meta.rulesVersion;

export const rules = {
  version: RULES_VERSION,
  documents: meta.documents,
  conversions: {
    sqftPerKatha: conversions.sqftPerKatha.value,
    metresPerFoot: conversions.metresPerFoot.value,
    sources: {
      sqftPerKatha: conversions.sqftPerKatha.source as Source,
      metresPerFoot: conversions.metresPerFoot.source as Source,
    },
  },
  roadFar: {
    source: roadFar.source as Source,
    widthColumns: roadFar.widthColumns as WidthColumn[],
    betweenStepsSource: roadFar.betweenSteps.source as Source,
    groups: roadFar.groups as RoadGroup[],
  },
  densityBlocks: densityBlocks.blocks as DensityBlock[],
  farDerivation: {
    baseAndMaxSource: farDerivation.baseAndMax.source as Source[],
    smallGap: farDerivation.smallGapRule.maxDifference,
    smallGapSource: farDerivation.smallGapRule.source as Source,
    subdividedReduction: farDerivation.subdividedPlot.farReduction,
    subdividedSource: farDerivation.subdividedPlot.source as Source,
    roadWideningMultiplier: farDerivation.roadWidening.floorAreaMultiplier,
    roadWideningSource: farDerivation.roadWidening.source as Source[],
    dwellingUnitsClass: farDerivation.dwellingUnits
      .appliesTo as ResidentialClass,
    extraUnitsPct: farDerivation.dwellingUnits.extraUnitsPct,
    dwellingUnitsSource: farDerivation.dwellingUnits.source as Source[],
    parkingSource: farDerivation.parkingNotInFar.source as Source,
  },
  groundCoverage: {
    source: groundCoverage.source as Source,
    rows: groundCoverage.rows as CoverageRow[],
  },
  setbacks: {
    front: {
      fromRoadCentreM: setbacks.front.fromRoadCentreM,
      fromBoundaryM: setbacks.front.fromBoundaryM,
      source: setbacks.front.source as Source,
      deadEndMaxLengthM: setbacks.front.deadEnd.maxLengthM,
      deadEndFrontM: setbacks.front.deadEnd.frontM,
      deadEndSource: setbacks.front.deadEnd.source as Source,
      privateEndRoadFrontM: setbacks.front.privateEndRoad.frontM,
      privateEndRoadSource: setbacks.front.privateEndRoad.source as Source,
    },
    byStoreysSource: setbacks.byStoreys.source as Source,
    byStoreys: setbacks.byStoreys.rows as SetbackRow[],
  },
  incentives: {
    source: incentives.source as Source,
    items: incentives.items as Incentive[],
  },
};

export type Rules = typeof rules;
