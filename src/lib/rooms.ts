import {
  roomTypes,
  sections,
  type ChecklistItem,
  type LayoutCount,
  type RoomKind,
} from "../data/checklist.ts";

/** The flat layout the buyer enters on the start screen. */
export type Layout = Record<LayoutCount, number>;

export const LAYOUT_MIN = 0;
export const LAYOUT_MAX = 10;
export const DEFAULT_LAYOUT: Layout = {
  bedrooms: 3,
  bathrooms: 3,
  balconies: 2,
};

export interface RoomGroup {
  /** Group id from the checklist, for example "A-walls". Unique in a room. */
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface Room {
  /** Stable id, for example "kitchen" or "bedroom-2". */
  id: string;
  kind: RoomKind;
  name: string;
  groups: RoomGroup[];
}

/**
 * Turns any input (for example from storage) into a valid layout: whole
 * numbers between LAYOUT_MIN and LAYOUT_MAX. Values that are not numbers
 * fall back to the default.
 */
export function normaliseLayout(input: unknown): Layout {
  const source = (
    typeof input === "object" && input !== null ? input : {}
  ) as Record<string, unknown>;
  const pick = (key: LayoutCount): number => {
    const value = source[key];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return DEFAULT_LAYOUT[key];
    }
    return Math.min(LAYOUT_MAX, Math.max(LAYOUT_MIN, Math.floor(value)));
  };
  return {
    bedrooms: pick("bedrooms"),
    bathrooms: pick("bathrooms"),
    balconies: pick("balconies"),
  };
}

/**
 * Builds the room-by-room checklist for a layout, using the room-to-section
 * mapping in the checklist data.
 */
export function generateRooms(layout: Layout): Room[] {
  const safe = normaliseLayout(layout);
  const rooms: Room[] = [];

  for (const type of roomTypes) {
    const groups = buildGroups(type.parts);
    const count = type.repeatFor ? safe[type.repeatFor] : 1;

    for (let n = 1; n <= count; n++) {
      const repeated = type.repeatFor !== undefined;
      rooms.push({
        id: repeated ? `${type.kind}-${n}` : type.kind,
        kind: type.kind,
        name: repeated && count > 1 ? `${type.name} ${n}` : type.name,
        groups,
      });
    }
  }
  return rooms;
}

function buildGroups(parts: (typeof roomTypes)[number]["parts"]): RoomGroup[] {
  const groups: RoomGroup[] = [];
  for (const part of parts) {
    const section = sections.find((s) => s.id === part.section);
    if (!section) throw new Error(`Unknown checklist section ${part.section}`);

    for (const group of section.groups) {
      const items = part.onlyCodes
        ? group.items.filter((item) => part.onlyCodes!.includes(item.code))
        : group.items;
      if (items.length === 0) continue;
      groups.push({ id: group.id, title: group.title ?? section.title, items });
    }
  }
  return groups;
}

/** Key for one item in one room, used to store the buyer's answer. */
export function itemKey(roomId: string, code: string): string {
  return `${roomId}/${code}`;
}

/** Every item key in the given rooms. */
export function allItemKeys(rooms: Room[]): Set<string> {
  const keys = new Set<string>();
  for (const room of rooms) {
    for (const group of room.groups) {
      for (const item of group.items) keys.add(itemKey(room.id, item.code));
    }
  }
  return keys;
}

export function roomItems(room: Room): ChecklistItem[] {
  return room.groups.flatMap((g) => g.items);
}
