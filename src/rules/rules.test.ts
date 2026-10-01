import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { rules, type ResidentialClass } from "./index.ts";

const RULES_DIR = join(__dirname, "bidhimala-2025_dap-2025-12");
const CLASSES: ResidentialClass[] = ["A1", "A2", "A3", "A4", "A5", "A6"];

function readJson(name: string): unknown {
  return JSON.parse(readFileSync(join(RULES_DIR, name), "utf8"));
}

/** Every "path" in a JSON value whose object has needs_verification: true. */
function flaggedPaths(value: unknown, path: string, out: string[]): string[] {
  if (Array.isArray(value)) {
    value.forEach((v, i) => {
      const id =
        typeof v === "object" && v !== null && "id" in v
          ? `[${String((v as { id: unknown }).id)}]`
          : `[${i}]`;
      flaggedPaths(v, path + id, out);
    });
  } else if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    if (obj.needs_verification === true) out.push(path);
    if (typeof obj.needs_verification_columns === "object") {
      for (const key of Object.keys(obj.needs_verification_columns as object)) {
        out.push(`${path}.${key}`);
      }
    }
    for (const [key, v] of Object.entries(obj))
      flaggedPaths(v, `${path}.${key}`, out);
  }
  return out;
}

describe("rules data", () => {
  it("has one rules version across all files", () => {
    for (const file of readdirSync(RULES_DIR)) {
      const data = readJson(file) as { rulesVersion?: string };
      expect(data.rulesVersion, file).toBe("bidhimala-2025 / dap-2025-12");
    }
  });

  it("gives every table entry a source with a page", () => {
    const sources = [
      rules.roadFar.source,
      ...rules.roadFar.groups.map((g) => g.source),
      ...rules.densityBlocks.map((b) => b.source),
      ...rules.groundCoverage.rows.map((r) => r.source),
      rules.setbacks.byStoreysSource,
      rules.setbacks.front.source,
      ...rules.incentives.items.map((i) => i.source),
    ];
    for (const s of sources) {
      expect(s.doc).toBeTruthy();
      expect(s.table).toBeTruthy();
      expect(s.page).toBeTruthy();
    }
  });

  it("has a road FAR value or a blank for every class and width", () => {
    expect(rules.roadFar.widthColumns).toHaveLength(9);
    expect(rules.roadFar.groups.map((g) => g.id)).toEqual([
      "central",
      "outer",
      "other",
    ]);
    for (const group of rules.roadFar.groups) {
      for (const cls of CLASSES)
        expect(group.rows[cls], `${group.id} ${cls}`).toHaveLength(9);
    }
  });

  it("matches spot checks against the gazette pages", () => {
    const central = rules.roadFar.groups[0].rows.A3;
    expect(central).toEqual([
      1.25, 1.75, 2.0, 2.25, 3.25, 3.5, 4.0, 4.25, 4.75,
    ]);
    const other = rules.roadFar.groups[2].rows.A3;
    expect(other).toEqual([1.0, 1.25, 1.5, 1.75, 2.3, 2.8, 3.3, 3.5, 4.0]);

    const block = (id: string) => rules.densityBlocks.find((b) => b.id === id)!;
    expect(block("09")).toMatchObject({
      grossPPA: 250,
      avgUnitSizeSqft: 1300,
      unitsPerKatha: 1.9,
      areaFar: 3.4,
    });
    expect(block("17")).toMatchObject({ avgUnitSizeSqft: 2100, areaFar: 5.5 });
    expect(block("19")).toMatchObject({ unitsPerKatha: 1.4, areaFar: 2.0 });
  });

  it("lists all 70 density blocks once", () => {
    const ids = rules.densityBlocks.map((b) => b.id);
    expect(ids).toHaveLength(70);
    expect(new Set(ids).size).toBe(70);
    expect(ids).toContain("29A");
    expect(ids).toContain("42B");
  });

  it("has ground coverage rows that join without gaps", () => {
    const rows = rules.groundCoverage.rows;
    expect(rows[0].aboveM2).toBe(0);
    for (let i = 1; i < rows.length; i++)
      expect(rows[i].aboveM2).toBe(rows[i - 1].upToM2);
    expect(rows.at(-1)!.upToM2).toBeNull();
  });

  it("has setback rows that join without gaps", () => {
    const rows = rules.setbacks.byStoreys;
    expect(rows[0].fromStoreys).toBe(1);
    for (let i = 1; i < rows.length; i++)
      expect(rows[i].fromStoreys).toBe(rows[i - 1].toStoreys! + 1);
    expect(rows.at(-1)!.toStoreys).toBeNull();
  });

  it("lists every needs_verification value in VERIFY.md", () => {
    const verify = readFileSync(join(__dirname, "../../VERIFY.md"), "utf8");
    const flagged = readdirSync(RULES_DIR).flatMap((file) =>
      flaggedPaths(readJson(file), file, []),
    );
    expect(flagged.length).toBeGreaterThan(0);
    for (const path of flagged)
      expect(verify, `VERIFY.md is missing ${path}`).toContain(path);
  });
});
