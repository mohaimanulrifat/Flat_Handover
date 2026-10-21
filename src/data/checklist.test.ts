import { describe, expect, it } from "vitest";
import { SEVERITY_NAMES } from "../config.ts";
import type { LangText } from "../lib/lang.ts";
import {
  groundRules,
  roomTypes,
  sections,
  severityLevels,
  whatToBring,
} from "./checklist.ts";

const allItems = sections.flatMap((s) => s.groups.flatMap((g) => g.items));
const BANGLA = /[\u0980-\u09FF]/;

/** Every text in the checklist data, with where it is. */
const allTexts: [string, LangText][] = [
  ...severityLevels.flatMap((l): [string, LangText][] => [
    [`${l.id} meaning`, l.meaning],
    [`${l.id} examples`, l.examples],
  ]),
  ...Object.entries(SEVERITY_NAMES).map(([id, name]): [string, LangText] => [
    `${id} name`,
    name,
  ]),
  ...whatToBring.map((x, i): [string, LangText] => [`whatToBring ${i}`, x]),
  ...groundRules.map((x, i): [string, LangText] => [`groundRules ${i}`, x]),
  ...roomTypes.map((r): [string, LangText] => [`room ${r.kind}`, r.name]),
  ...sections.flatMap((s): [string, LangText][] => [
    [`section ${s.id} title`, s.title],
    [`section ${s.id} intro`, s.intro],
    ...s.groups.flatMap((g): [string, LangText][] =>
      g.title ? [[`group ${g.id}`, g.title]] : [],
    ),
  ]),
  ...allItems.flatMap((i): [string, LangText][] => [
    [`${i.code} title`, i.title],
    [`${i.code} howToCheck`, i.howToCheck],
  ]),
];

describe("checklist data", () => {
  it("has sections A to G in order", () => {
    expect(sections.map((s) => s.id)).toEqual([
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
    ]);
  });

  it("numbers each section's items 1, 2, 3... with no gaps", () => {
    for (const section of sections) {
      const codes = section.groups.flatMap((g) => g.items.map((i) => i.code));
      const expected = codes.map((_, i) => `${section.id}${i + 1}`);
      expect(codes).toEqual(expected);
    }
  });

  it("has the item counts from draft 1", () => {
    const counts = Object.fromEntries(
      sections.map((s) => [s.id, s.groups.flatMap((g) => g.items).length]),
    );
    expect(counts).toEqual({ A: 28, B: 13, C: 8, D: 7, E: 10, F: 10, G: 11 });
  });

  it("flags exactly the six [Confirm] items", () => {
    const flagged = allItems.filter((i) => i.confirm).map((i) => i.code);
    expect(flagged).toEqual(["A21", "B13", "D2", "E3", "E10", "G8"]);
  });

  it("keeps review markers out of the text buyers see", () => {
    for (const item of allItems) {
      for (const lang of ["en", "bn"] as const) {
        expect(item.title[lang]).not.toMatch(/\[|\]/);
        expect(item.howToCheck[lang]).not.toMatch(/\[|\]/);
      }
    }
  });

  it("gives every item a title and how-to-check text", () => {
    for (const item of allItems) {
      expect(item.title.en.trim()).not.toBe("");
      expect(item.howToCheck.en.trim()).not.toBe("");
    }
  });

  it("has every text in English and in Bangla", () => {
    for (const [where, text] of allTexts) {
      expect(text.en, where).not.toMatch(BANGLA);
      expect(text.bn, where).toMatch(BANGLA);
    }
  });

  it("names the same severity levels in the English and Bangla tips", () => {
    for (const item of allItems) {
      for (const name of Object.values(SEVERITY_NAMES)) {
        expect(item.howToCheck.bn.includes(name.bn), item.code).toBe(
          item.howToCheck.en.includes(name.en),
        );
      }
    }
  });

  it("has the start screen lists", () => {
    expect(whatToBring).toHaveLength(8);
    expect(groundRules).toHaveLength(5);
  });

  it("has three severity levels, each with a display name", () => {
    expect(severityLevels.map((l) => l.id)).toEqual([
      "minor",
      "major",
      "safety",
    ]);
    expect(Object.keys(SEVERITY_NAMES).sort()).toEqual(
      severityLevels.map((l) => l.id).sort(),
    );
  });

  it("maps rooms only to sections and codes that exist", () => {
    const codes = new Set(allItems.map((i) => i.code));
    for (const room of roomTypes) {
      for (const part of room.parts) {
        expect(sections.some((s) => s.id === part.section)).toBe(true);
        for (const code of part.onlyCodes ?? []) {
          expect(codes.has(code)).toBe(true);
          expect(code.startsWith(part.section)).toBe(true);
        }
      }
    }
  });
});
