/**
 * Developer share calculator: how much of the building the landowner gets
 * in a joint-venture deal. Pure functions; a negotiation estimate only.
 */
import { tidy } from "./calc.ts";

export interface ShareInput {
  /** Total floor area allowed on the plot, from calculatePlot(). */
  totalFloorSqft: number;
  /** Share of total floor area that is saleable, in percent. */
  saleablePct: number;
  /** Landowner's share of the saleable area, in percent. */
  ownerPct: number;
  /** Size of one flat, in sq ft. */
  unitSizeSqft: number;
  /** Optional cash the developer pays the owner (signing money etc.), in Taka. */
  cashTaka?: number;
  /** Most flats the density rules allow on the plot, if known. */
  densityCap?: number | null;
}

export type ShareError = "saleablePct" | "ownerPct" | "unitSize" | "totalFloor";

export interface ShareResult {
  ok: true;
  saleableSqft: number;
  ownerSqft: number;
  developerSqft: number;
  ownerFlats: number;
  ownerLeftoverSqft: number;
  developerFlats: number;
  totalFlats: number;
  /** True if this many flats of this size is more than density allows. */
  overDensity: boolean;
  cashTaka: number;
  input: ShareInput;
}

export function calculateShare(
  input: ShareInput,
): ShareResult | { ok: false; error: ShareError } {
  if (!(input.totalFloorSqft > 0)) return { ok: false, error: "totalFloor" };
  if (!(input.saleablePct > 0 && input.saleablePct <= 100))
    return { ok: false, error: "saleablePct" };
  if (!(input.ownerPct >= 0 && input.ownerPct <= 100))
    return { ok: false, error: "ownerPct" };
  if (!(input.unitSizeSqft > 0)) return { ok: false, error: "unitSize" };

  const saleableSqft = tidy(
    (input.totalFloorSqft * input.saleablePct) / 100,
    2,
  );
  const ownerSqft = tidy((saleableSqft * input.ownerPct) / 100, 2);
  const developerSqft = tidy(saleableSqft - ownerSqft, 2);
  const ownerFlats = Math.floor(tidy(ownerSqft / input.unitSizeSqft, 6));
  const developerFlats = Math.floor(
    tidy(developerSqft / input.unitSizeSqft, 6),
  );
  const totalFlats = Math.floor(tidy(saleableSqft / input.unitSizeSqft, 6));

  return {
    ok: true,
    saleableSqft,
    ownerSqft,
    developerSqft,
    ownerFlats,
    ownerLeftoverSqft: tidy(ownerSqft - ownerFlats * input.unitSizeSqft, 2),
    developerFlats,
    totalFlats,
    overDensity: input.densityCap != null && totalFlats > input.densityCap,
    cashTaka: input.cashTaka ?? 0,
    input,
  };
}
