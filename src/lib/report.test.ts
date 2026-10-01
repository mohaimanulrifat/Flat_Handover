import { describe, expect, it } from "vitest";
import type { Answer } from "./inspection.ts";
import { buildReport, roomProgress } from "./report.ts";
import { generateRooms } from "./rooms.ts";

const rooms = generateRooms({ bedrooms: 2, bathrooms: 1, balconies: 1 });
const room = (id: string) => rooms.find((r) => r.id === id)!;

const answers: Record<string, Answer> = {
  "living/A1": { status: "problem", severity: "minor", note: " Hairline " },
  "living/A2": { status: "problem", severity: "safety", photos: ["p1"] },
  "living/A3": { status: "problem", severity: "major" },
  "living/A4": { status: "problem" },
  "living/A5": { status: "ok" },
  "living/A6": { status: "na" },
  "kitchen/C4": { status: "problem", severity: "safety" },
  "bedroom-2/A7": { status: "problem", severity: "major" },
  // A room that is no longer in the layout is ignored.
  "bedroom-3/A1": { status: "problem", severity: "safety" },
};

describe("buildReport", () => {
  const report = buildReport(rooms, answers);

  it("lists Safety problems first, room by room", () => {
    expect(
      report.safety.map((r) => [r.room.id, r.problems.map((p) => p.item.code)]),
    ).toEqual([
      ["living", ["A2"]],
      ["kitchen", ["C4"]],
    ]);
  });

  it("lists other problems room by room, most serious first", () => {
    expect(
      report.other.map((r) => [
        r.room.id,
        r.problems.map((p) => `${p.item.code}:${p.severity}`),
      ]),
    ).toEqual([
      ["living", ["A3:major", "A1:minor", "A4:null"]],
      ["bedroom-2", ["A7:major"]],
    ]);
  });

  it("keeps notes and photos", () => {
    const a1 = report.other[0].problems.find((p) => p.item.code === "A1")!;
    expect(a1.note).toBe("Hairline");
    expect(report.safety[0].problems[0].photos).toEqual(["p1"]);
  });

  it("keeps a list of items checked OK", () => {
    expect(
      report.ok.map((r) => [r.room.id, r.items.map((i) => i.code)]),
    ).toEqual([["living", ["A5"]]]);
  });

  it("counts every item in the layout once", () => {
    expect(report.counts).toMatchObject({
      problems: 6,
      safety: 2,
      major: 2,
      minor: 1,
      unrated: 1,
      ok: 1,
      na: 1,
    });
    expect(report.counts.total).toBe(
      report.counts.problems +
        report.counts.ok +
        report.counts.na +
        report.counts.unanswered,
    );
  });
});

describe("roomProgress", () => {
  it("counts answered items and problems in one room", () => {
    expect(roomProgress(room("living"), answers)).toEqual({
      total: 28,
      answered: 6,
      problems: 4,
      safety: 1,
    });
    expect(roomProgress(room("dining"), answers)).toEqual({
      total: 28,
      answered: 0,
      problems: 0,
      safety: 0,
    });
  });
});
