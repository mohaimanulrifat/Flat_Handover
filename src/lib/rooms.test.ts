import { describe, expect, it } from "vitest";
import { sections } from "../data/checklist.ts";
import {
  allItemKeys,
  DEFAULT_LAYOUT,
  generateRooms,
  itemKey,
  LAYOUT_MAX,
  normaliseLayout,
  roomItems,
  type Room,
} from "./rooms.ts";

const codes = (room: Room) => roomItems(room).map((i) => i.code);
const range = (prefix: string, from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => `${prefix}${from + i}`);
const sectionCodes = (id: string) =>
  sections
    .find((s) => s.id === id)!
    .groups.flatMap((g) => g.items.map((i) => i.code));

describe("generateRooms", () => {
  const rooms = generateRooms({ bedrooms: 3, bathrooms: 2, balconies: 2 });
  const byId = (id: string) => rooms.find((r) => r.id === id)!;

  it("lists rooms in the document's order", () => {
    expect(rooms.map((r) => r.name)).toEqual([
      "Living room",
      "Dining room",
      "Bedroom 1",
      "Bedroom 2",
      "Bedroom 3",
      "Bathroom 1",
      "Bathroom 2",
      "Kitchen",
      "Balcony 1",
      "Balcony 2",
      "Whole flat",
      "Building and common areas",
      "End of the visit",
    ]);
  });

  it("gives every room a unique id", () => {
    const ids = rooms.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses section A for the living room, dining room and bedrooms", () => {
    for (const id of [
      "living",
      "dining",
      "bedroom-1",
      "bedroom-2",
      "bedroom-3",
    ]) {
      expect(codes(byId(id))).toEqual(range("A", 1, 28));
    }
  });

  it("uses sections A and B for each bathroom", () => {
    for (const id of ["bathroom-1", "bathroom-2"]) {
      expect(codes(byId(id))).toEqual([
        ...range("A", 1, 28),
        ...range("B", 1, 13),
      ]);
    }
  });

  it("uses sections A and C for the kitchen", () => {
    expect(codes(byId("kitchen"))).toEqual([
      ...range("A", 1, 28),
      ...range("C", 1, 8),
    ]);
  });

  it("uses section D plus A1 to A6 for each balcony", () => {
    for (const id of ["balcony-1", "balcony-2"]) {
      const balcony = byId(id);
      expect(codes(balcony)).toEqual([
        ...range("D", 1, 7),
        ...range("A", 1, 6),
      ]);
      expect(balcony.groups.map((g) => g.title)).toEqual([
        "Balcony",
        "Walls and ceiling",
      ]);
    }
  });

  it("adds the whole flat, building and end of visit once each", () => {
    expect(rooms.filter((r) => r.kind === "wholeFlat")).toHaveLength(1);
    expect(rooms.filter((r) => r.kind === "building")).toHaveLength(1);
    expect(rooms.filter((r) => r.kind === "endOfVisit")).toHaveLength(1);
    expect(codes(byId("wholeFlat"))).toEqual(sectionCodes("E"));
    expect(codes(byId("building"))).toEqual(sectionCodes("F"));
    expect(codes(byId("endOfVisit"))).toEqual(sectionCodes("G"));
  });

  it("keeps the section's sub-groups so each can have an All OK button", () => {
    expect(byId("living").groups.map((g) => g.title)).toEqual([
      "Walls and ceiling",
      "Floor",
      "Doors",
      "Windows",
      "Electrical points",
    ]);
    expect(
      byId("bathroom-1")
        .groups.map((g) => g.title)
        .at(-1),
    ).toBe("Bathroom");
    expect(byId("wholeFlat").groups.map((g) => g.title)).toEqual([
      "Electricity",
      "Water",
      "Entrance and area",
    ]);
  });

  it("uses every checklist item somewhere", () => {
    const used = new Set(rooms.flatMap(codes));
    for (const section of sections) {
      for (const code of sectionCodes(section.id))
        expect(used.has(code)).toBe(true);
    }
  });

  it("gives every item in the flat its own answer key", () => {
    // 5 rooms x 28 + 2 x (28 + 13) + (28 + 8) + 2 x (7 + 6) + 10 + 10 + 11
    expect(allItemKeys(rooms).size).toBe(315);
  });

  it("leaves out rooms the flat does not have", () => {
    const small = generateRooms({ bedrooms: 0, bathrooms: 1, balconies: 0 });
    expect(small.map((r) => r.id)).toEqual([
      "living",
      "dining",
      "bathroom-1",
      "kitchen",
      "wholeFlat",
      "building",
      "endOfVisit",
    ]);
  });

  it("does not number a room type that appears only once", () => {
    const one = generateRooms({ bedrooms: 1, bathrooms: 1, balconies: 1 });
    expect(one.find((r) => r.kind === "bedroom")).toMatchObject({
      id: "bedroom-1",
      name: "Bedroom",
    });
    expect(one.find((r) => r.kind === "balcony")!.name).toBe("Balcony");
  });

  it("keeps room ids stable when the layout grows", () => {
    const before = generateRooms({ bedrooms: 2, bathrooms: 1, balconies: 1 });
    const after = generateRooms({ bedrooms: 3, bathrooms: 2, balconies: 1 });
    const afterIds = new Set(after.map((r) => r.id));
    for (const room of before) expect(afterIds.has(room.id)).toBe(true);
  });

  it("builds the same keys as itemKey", () => {
    expect(allItemKeys(rooms).has(itemKey("bathroom-2", "B13"))).toBe(true);
    expect(allItemKeys(rooms).has(itemKey("bathroom-3", "B1"))).toBe(false);
  });
});

describe("normaliseLayout", () => {
  it("keeps valid whole numbers", () => {
    expect(
      normaliseLayout({ bedrooms: 4, bathrooms: 3, balconies: 0 }),
    ).toEqual({
      bedrooms: 4,
      bathrooms: 3,
      balconies: 0,
    });
  });

  it("rounds down and clamps out-of-range numbers", () => {
    expect(
      normaliseLayout({ bedrooms: 2.7, bathrooms: -1, balconies: 99 }),
    ).toEqual({
      bedrooms: 2,
      bathrooms: 0,
      balconies: LAYOUT_MAX,
    });
  });

  it("falls back to the default for missing or invalid values", () => {
    expect(normaliseLayout(null)).toEqual(DEFAULT_LAYOUT);
    expect(
      normaliseLayout({ bedrooms: "3", bathrooms: NaN, balconies: Infinity }),
    ).toEqual(DEFAULT_LAYOUT);
  });

  it("is applied by generateRooms", () => {
    const rooms = generateRooms({ bedrooms: -2, bathrooms: 1.9, balconies: 0 });
    expect(rooms.filter((r) => r.kind === "bedroom")).toHaveLength(0);
    expect(rooms.filter((r) => r.kind === "bathroom")).toHaveLength(1);
  });
});
