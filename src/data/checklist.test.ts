import { describe, expect, it } from "vitest";
import { SEVERITY_NAMES } from "../config.ts";
import {
  groundRules,
  roomTypes,
  sections,
  severityLevels,
  whatToBring,
} from "./checklist.ts";

const allItems = sections.flatMap((s) => s.groups.flatMap((g) => g.items));

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
      expect(item.title).not.toMatch(/\[|\]/);
      expect(item.howToCheck).not.toMatch(/\[|\]/);
    }
  });

  it("gives every item a title and how-to-check text", () => {
    for (const item of allItems) {
      expect(item.title.trim()).not.toBe("");
      expect(item.howToCheck.trim()).not.toBe("");
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
