/**
 * The Landowner Calculator form: what the owner typed, saved on the phone,
 * and turned into calculator inputs. Fields are kept as typed text so the
 * owner can enter Bangla digits and half-finished numbers.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import { rules, type RoadGroupId } from "../rules/index.ts";
import type { AreaUnit, LengthUnit, PlotInput, RoadKind } from "./calc.ts";
import { parseNumber, type Lang } from "./i18n.ts";
import { DEFAULT_OWNER_SHARE_PCT, DEFAULT_SALEABLE_PCT } from "./settings.ts";
import type { ShareInput } from "./share.ts";

export interface LandownerForm {
  plotArea: string;
  plotAreaUnit: AreaUnit;
  roadWidth: string;
  roadWidthUnit: LengthUnit;
  roadKind: RoadKind;
  roadGroup: RoadGroupId | "";
  blockId: string;
  plotWidth: string;
  plotDepth: string;
  plotDimUnit: LengthUnit;
  roadSurrender: string;
  roadSurrenderUnit: AreaUnit;
  subdivided: boolean;
  incentives: string[];
  ownerPct: string;
  saleablePct: string;
  unitSize: string;
  cash: string;
}

export const EMPTY_FORM: LandownerForm = {
  plotArea: "",
  plotAreaUnit: "katha",
  roadWidth: "",
  roadWidthUnit: "ft",
  roadKind: "normal",
  roadGroup: "",
  blockId: "",
  plotWidth: "",
  plotDepth: "",
  plotDimUnit: "ft",
  roadSurrender: "",
  roadSurrenderUnit: "sqft",
  subdivided: false,
  incentives: [],
  ownerPct: String(DEFAULT_OWNER_SHARE_PCT),
  saleablePct: String(DEFAULT_SALEABLE_PCT),
  unitSize: "",
  cash: "",
};

export type FieldError = "required" | "notNumber";

export interface ParsedForm {
  plot: PlotInput;
  /** Share inputs without the total floor area, which comes from the plot result. */
  share: Omit<ShareInput, "totalFloorSqft" | "densityCap" | "unitSizeSqft"> & {
    unitSizeSqft: number | null;
  };
}

/** Turns the form into calculator inputs, or lists the fields to fix. */
export function parseForm(
  form: LandownerForm,
):
  | { ok: true; value: ParsedForm }
  | { ok: false; errors: Partial<Record<keyof LandownerForm, FieldError>> } {
  const errors: Partial<Record<keyof LandownerForm, FieldError>> = {};
  const need = (key: keyof LandownerForm): number => {
    const text = String(form[key]);
    if (text.trim() === "") {
      errors[key] = "required";
      return NaN;
    }
    const n = parseNumber(text);
    if (Number.isNaN(n)) errors[key] = "notNumber";
    return n;
  };
  const optional = (key: keyof LandownerForm): number | undefined => {
    const text = String(form[key]);
    if (text.trim() === "") return undefined;
    const n = parseNumber(text);
    if (Number.isNaN(n)) {
      errors[key] = "notNumber";
      return undefined;
    }
    return n;
  };

  const plotArea = need("plotArea");
  const roadWidth = need("roadWidth");
  if (!form.roadGroup) errors.roadGroup = "required";
  if (!form.blockId) errors.blockId = "required";
  const plotWidth = optional("plotWidth");
  const plotDepth = optional("plotDepth");
  const roadSurrender = optional("roadSurrender");
  const ownerPct = need("ownerPct");
  const saleablePct = need("saleablePct");
  const unitSize = optional("unitSize");
  const cash = optional("cash");

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      plot: {
        plotArea,
        plotAreaUnit: form.plotAreaUnit,
        roadWidth,
        roadWidthUnit: form.roadWidthUnit,
        roadKind: form.roadKind,
        roadGroup: form.roadGroup as RoadGroupId,
        blockId: form.blockId,
        plotWidth,
        plotDepth,
        plotDimUnit: form.plotDimUnit,
        roadSurrender,
        roadSurrenderUnit: form.roadSurrenderUnit,
        subdivided: form.subdivided,
        incentives: form.incentives,
      },
      share: {
        ownerPct,
        saleablePct,
        unitSizeSqft: unitSize ?? null,
        cashTaka: cash,
      },
    },
  };
}

// Saving --------------------------------------------------------------

const FORM_KEY = "handover-check:landowner:v1";
const UNITS_AREA: AreaUnit[] = ["katha", "sqft", "m2"];
const UNITS_LENGTH: LengthUnit[] = ["m", "ft"];
const ROAD_KINDS: RoadKind[] = ["normal", "deadEndShort", "privateEnd"];

/** Keeps only valid fields from saved data. */
export function sanitiseForm(data: unknown): LandownerForm {
  const form = { ...EMPTY_FORM };
  if (typeof data !== "object" || data === null) return form;
  const d = data as Record<string, unknown>;
  const text = (key: keyof LandownerForm) => {
    if (typeof d[key] === "string") (form[key] as string) = d[key] as string;
  };
  for (const key of [
    "plotArea",
    "roadWidth",
    "plotWidth",
    "plotDepth",
    "roadSurrender",
    "ownerPct",
    "saleablePct",
    "unitSize",
    "cash",
  ] as const) {
    text(key);
  }
  const pick = <T extends string>(
    key: keyof LandownerForm,
    allowed: readonly T[],
  ) => {
    if (allowed.includes(d[key] as T)) (form[key] as T) = d[key] as T;
  };
  pick("plotAreaUnit", UNITS_AREA);
  pick("roadSurrenderUnit", UNITS_AREA);
  pick("roadWidthUnit", UNITS_LENGTH);
  pick("plotDimUnit", UNITS_LENGTH);
  pick("roadKind", ROAD_KINDS);
  pick(
    "roadGroup",
    rules.roadFar.groups.map((g) => g.id),
  );
  pick(
    "blockId",
    rules.densityBlocks.map((b) => b.id),
  );
  if (typeof d.subdivided === "boolean") form.subdivided = d.subdivided;
  if (Array.isArray(d.incentives)) {
    const known = new Set(rules.incentives.items.map((i) => i.id));
    form.incentives = d.incentives.filter(
      (x): x is string => typeof x === "string" && known.has(x),
    );
  }
  return form;
}

function loadForm(): LandownerForm {
  try {
    const raw = localStorage.getItem(FORM_KEY);
    return raw ? sanitiseForm(JSON.parse(raw)) : EMPTY_FORM;
  } catch {
    return EMPTY_FORM;
  }
}

/** The form, saved to the phone on every change. */
export function useLandownerForm(): [
  LandownerForm,
  (patch: Partial<LandownerForm>) => void,
] {
  const [form, setForm] = useState(loadForm);
  useEffect(() => {
    try {
      localStorage.setItem(FORM_KEY, JSON.stringify(form));
    } catch {
      // Not saved; the form still works until the page is closed.
    }
  }, [form]);
  return [form, (patch) => setForm((f) => ({ ...f, ...patch }))];
}

// Language --------------------------------------------------------------

const LANG_KEY = "handover-check:lang";
const langListeners = new Set<() => void>();

function currentLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === "en" ? "en" : "bn";
  } catch {
    return "bn";
  }
}

let langCache: Lang | null = null;

/** Bangla by default; the choice is kept on the phone. */
export function useLang(): [Lang, () => void] {
  const lang = useSyncExternalStore(
    (listener) => {
      langListeners.add(listener);
      return () => langListeners.delete(listener);
    },
    () => (langCache ??= currentLang()),
  );
  const toggle = () => {
    langCache = lang === "bn" ? "en" : "bn";
    try {
      localStorage.setItem(LANG_KEY, langCache);
    } catch {
      // Not saved; the choice still applies until the page is closed.
    }
    langListeners.forEach((l) => l());
  };
  return [lang, toggle];
}
