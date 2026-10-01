import { describe, expect, it } from "vitest";
import {
  EMPTY_FORM,
  parseForm,
  sanitiseForm,
  type LandownerForm,
} from "./form.ts";

const filled: LandownerForm = {
  ...EMPTY_FORM,
  plotArea: "৫",
  roadWidth: "20",
  roadGroup: "central",
  blockId: "09",
};

describe("parseForm", () => {
  it("turns typed text, including Bangla digits, into calculator inputs", () => {
    const r = parseForm(filled);
    if (!r.ok) throw new Error(JSON.stringify(r.errors));
    expect(r.value.plot).toMatchObject({
      plotArea: 5,
      roadWidth: 20,
      roadWidthUnit: "ft",
      roadGroup: "central",
      blockId: "09",
    });
    expect(r.value.share).toEqual({
      ownerPct: 50,
      saleablePct: 70,
      unitSizeSqft: null,
      cashTaka: undefined,
    });
  });

  it("lists missing and unreadable fields", () => {
    const r = parseForm({ ...EMPTY_FORM, roadWidth: "wide", unitSize: "big" });
    expect(r).toEqual({
      ok: false,
      errors: {
        plotArea: "required",
        roadWidth: "notNumber",
        roadGroup: "required",
        blockId: "required",
        unitSize: "notNumber",
      },
    });
  });
});

describe("sanitiseForm", () => {
  it("keeps valid saved fields and drops the rest", () => {
    const form = sanitiseForm({
      plotArea: "5",
      plotAreaUnit: "acre",
      roadGroup: "central",
      blockId: "99",
      incentives: ["plotSize", "unknown", 3],
      subdivided: "yes",
    });
    expect(form).toMatchObject({
      plotArea: "5",
      plotAreaUnit: "katha",
      roadGroup: "central",
      blockId: "",
      incentives: ["plotSize"],
      subdivided: false,
    });
  });

  it("starts empty for unreadable data", () => {
    expect(sanitiseForm(null)).toEqual(EMPTY_FORM);
  });
});
