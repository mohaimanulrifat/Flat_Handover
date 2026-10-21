import { describe, expect, it } from "vitest";
import { calculatePlot } from "./calc.ts";
import {
  assumptions,
  blockArea,
  blockLabel,
  fmt,
  parseNumber,
  stepText,
  t,
} from "./i18n.ts";

const BANGLA = /[\u0980-\u09FF]/;

describe("numbers", () => {
  it("reads Bangla and English digits", () => {
    expect(parseNumber("৫")).toBe(5);
    expect(parseNumber("৩.৫")).toBe(3.5);
    expect(parseNumber("1,200")).toBe(1200);
    expect(parseNumber(" 6 ")).toBe(6);
  });

  it("rejects text that is not a number", () => {
    expect(parseNumber("")).toBeNaN();
    expect(parseNumber("abc")).toBeNaN();
    expect(parseNumber("1.2.3")).toBeNaN();
  });

  it("writes Bangla digits in Bangla", () => {
    expect(fmt("bn", 12600)).toBe("১২,৬০০");
    expect(fmt("en", 12600)).toBe("12,600");
  });
});

describe("text", () => {
  it("fills placeholders", () => {
    expect(t("en", "gPlusN", { n: 6 })).toBe("Ground + 6 floors");
  });

  it("describes every step of a calculation in both languages", () => {
    const r = calculatePlot({
      plotArea: 5,
      plotAreaUnit: "katha",
      roadWidth: 7.5,
      roadWidthUnit: "m",
      roadGroup: "central",
      blockId: "09",
      roadSurrender: 0.25,
      subdivided: true,
      plotWidth: 40,
      plotDepth: 90,
      incentives: ["plotSize", "affordableUnits"],
    });
    if (!r.ok) throw new Error(r.error);
    for (const step of r.steps) {
      for (const lang of ["bn", "en"] as const) {
        const text = stepText(lang, step);
        expect(text.length, `${step.id} ${lang}`).toBeGreaterThan(10);
        expect(text, `${step.id} ${lang}`).not.toMatch(/NaN|undefined|\{\w+\}/);
      }
      expect(stepText("en", step), step.id).not.toMatch(BANGLA);
    }
    const used = assumptions("en", {
      interpolated: true,
      incentivesUsed: true,
      groupId: "central",
      saleablePct: 70,
      unitSizeSqft: 1000,
      unitSizeFromBlock: true,
    });
    for (const line of used) expect(line).not.toMatch(BANGLA);
  });

  it("names blocks in the chosen language", () => {
    expect(blockLabel("en", "09")).toBe("Block 09: Mirpur");
    expect(blockLabel("bn", "09")).toBe("ব্লক ০৯: মিরপুর");
    expect(blockArea("en", "17")).toBe("DNCC-19 (part)");
  });
});
