import { describe, expect, it } from "vitest";
import { strings as landownerStrings } from "../landowner/i18n.ts";
import { strings, t } from "./i18n.ts";

const placeholders = (text: string) =>
  [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("app text", () => {
  it("is English or Bangla, with numbers in the language's digits", () => {
    expect(t("en", "itemsChecked", { done: 12, total: 315 })).toBe(
      "12 of 315 items checked",
    );
    expect(t("bn", "itemsChecked", { done: 12, total: 315 })).toBe(
      "৩১৫টির মধ্যে ১২টি দেখা হয়েছে",
    );
  });

  it("uses the singular in English for one", () => {
    expect(t("en", "problemCount", { n: 1 })).toBe("1 problem");
    expect(t("en", "problemCount", { n: 2 })).toBe("2 problems");
    expect(t("bn", "problemCount", { n: 1 })).toBe("১টি সমস্যা");
  });

  it("has the same placeholders in both languages", () => {
    const all: [string, Record<string, string>][] = [
      ...Object.entries(strings),
      ...Object.entries(landownerStrings),
    ];
    for (const [key, entry] of all) {
      for (const text of Object.values(entry)) {
        expect(placeholders(text), key).toEqual(placeholders(entry.en));
      }
    }
  });

  it("leaves unknown placeholders visible", () => {
    expect(t("en", "next", {})).toBe("Next: {name}");
  });
});
