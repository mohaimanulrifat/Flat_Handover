import { describe, expect, it } from "vitest";
import { DEFAULT_OWNER_SHARE_PCT, DEFAULT_SALEABLE_PCT } from "./settings.ts";
import { calculateShare, type ShareResult } from "./share.ts";

const base = {
  totalFloorSqft: 11700,
  saleablePct: DEFAULT_SALEABLE_PCT,
  ownerPct: DEFAULT_OWNER_SHARE_PCT,
  unitSizeSqft: 1300,
};

function ok(input: Parameters<typeof calculateShare>[0]): ShareResult {
  const r = calculateShare(input);
  if (!r.ok) throw new Error(r.error);
  return r;
}

describe("calculateShare", () => {
  it("splits the saleable area 50:50 by default", () => {
    const r = ok(base);
    expect(r.saleableSqft).toBe(8190); // 11,700 x 70%
    expect(r.ownerSqft).toBe(4095);
    expect(r.developerSqft).toBe(4095);
    expect(r.ownerFlats).toBe(3); // 4,095 / 1,300 = 3.15
    expect(r.ownerLeftoverSqft).toBe(195);
    expect(r.totalFlats).toBe(6);
  });

  it("handles any ratio", () => {
    const r = ok({ ...base, ownerPct: 40 });
    expect(r.ownerSqft).toBe(3276);
    expect(r.developerSqft).toBe(4914);
  });

  it("warns when the flats would exceed the density limit", () => {
    expect(ok({ ...base, unitSizeSqft: 800, densityCap: 9 }).overDensity).toBe(
      true,
    ); // 10 flats
    expect(ok({ ...base, densityCap: 9 }).overDensity).toBe(false);
  });

  it("carries the cash adjustment through", () => {
    expect(ok({ ...base, cashTaka: 2_500_000 }).cashTaka).toBe(2_500_000);
    expect(ok(base).cashTaka).toBe(0);
  });

  it("rejects impossible inputs", () => {
    expect(calculateShare({ ...base, saleablePct: 0 })).toEqual({
      ok: false,
      error: "saleablePct",
    });
    expect(calculateShare({ ...base, saleablePct: 120 })).toEqual({
      ok: false,
      error: "saleablePct",
    });
    expect(calculateShare({ ...base, ownerPct: -5 })).toEqual({
      ok: false,
      error: "ownerPct",
    });
    expect(calculateShare({ ...base, unitSizeSqft: 0 })).toEqual({
      ok: false,
      error: "unitSize",
    });
  });
});
