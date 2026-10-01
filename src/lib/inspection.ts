import { severityLevels, type SeverityId } from "../data/checklist.ts";
import {
  allItemKeys,
  generateRooms,
  normaliseLayout,
  type Layout,
} from "./rooms.ts";

export type Status = "ok" | "problem" | "na";

/**
 * The buyer's answer for one item in one room. Problem details are kept if
 * the buyer switches to OK by mistake, but only count while the status is
 * "problem".
 */
export interface Answer {
  status?: Status;
  severity?: SeverityId;
  note?: string;
  /** Ids of photos in the photo store. */
  photos?: string[];
}

/** Optional details printed at the top of the report. */
export interface FlatDetails {
  project: string;
  flat: string;
  buyer: string;
  /** Visit date as YYYY-MM-DD. */
  date: string;
}

export interface Inspection {
  /** Null until the buyer has entered the layout. */
  layout: Layout | null;
  details: FlatDetails;
  /** Keyed by itemKey(roomId, code). */
  answers: Record<string, Answer>;
}

export const NOTE_MAX_LENGTH = 500;

export type Action =
  | { type: "setLayout"; layout: Layout }
  | { type: "setDetails"; details: Partial<FlatDetails> }
  | { type: "setStatus"; key: string; status: Status | undefined }
  | { type: "markUnansweredOk"; keys: string[] }
  | { type: "setSeverity"; key: string; severity: SeverityId | undefined }
  | { type: "setNote"; key: string; note: string }
  | { type: "addPhoto"; key: string; photoId: string }
  | { type: "removePhoto"; key: string; photoId: string }
  | { type: "reset" };

export function todayIso(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function emptyInspection(): Inspection {
  return {
    layout: null,
    details: { project: "", flat: "", buyer: "", date: todayIso() },
    answers: {},
  };
}

export function inspectionReducer(
  state: Inspection,
  action: Action,
): Inspection {
  switch (action.type) {
    case "setLayout": {
      const layout = normaliseLayout(action.layout);
      const keep = allItemKeys(generateRooms(layout));
      const answers = Object.fromEntries(
        Object.entries(state.answers).filter(([key]) => keep.has(key)),
      );
      return { ...state, layout, answers };
    }
    case "setDetails":
      return { ...state, details: { ...state.details, ...action.details } };
    case "setStatus":
      return patchAnswer(state, action.key, { status: action.status });
    case "markUnansweredOk": {
      const answers = { ...state.answers };
      for (const key of action.keys) {
        if (!answers[key]?.status)
          answers[key] = { ...answers[key], status: "ok" };
      }
      return { ...state, answers };
    }
    case "setSeverity":
      return patchAnswer(state, action.key, { severity: action.severity });
    case "setNote":
      return patchAnswer(state, action.key, {
        note: action.note.slice(0, NOTE_MAX_LENGTH),
      });
    case "addPhoto": {
      const photos = state.answers[action.key]?.photos ?? [];
      return patchAnswer(state, action.key, {
        photos: [...photos, action.photoId],
      });
    }
    case "removePhoto": {
      const photos = state.answers[action.key]?.photos ?? [];
      return patchAnswer(state, action.key, {
        photos: photos.filter((id) => id !== action.photoId),
      });
    }
    case "reset":
      return emptyInspection();
  }
}

function patchAnswer(
  state: Inspection,
  key: string,
  patch: Partial<Answer>,
): Inspection {
  return {
    ...state,
    answers: { ...state.answers, [key]: { ...state.answers[key], ...patch } },
  };
}

/** How many answered items a layout change would remove. */
export function answersLostByLayout(state: Inspection, layout: Layout): number {
  const keep = allItemKeys(generateRooms(layout));
  return Object.entries(state.answers).filter(
    ([key, answer]) => answer.status && !keep.has(key),
  ).length;
}

/** All photo ids still referenced by an answer. */
export function referencedPhotos(state: Inspection): Set<string> {
  return new Set(Object.values(state.answers).flatMap((a) => a.photos ?? []));
}

// Saving and loading ----------------------------------------------------

const STORAGE_KEY = "handover-check:inspection:v1";
const STATUSES: Status[] = ["ok", "problem", "na"];
const SEVERITIES = severityLevels.map((l) => l.id);

export function loadInspection(storage: Storage = localStorage): Inspection {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? sanitise(JSON.parse(raw)) : emptyInspection();
  } catch {
    return emptyInspection();
  }
}

/** Returns false if the browser refused to save (for example, storage full). */
export function saveInspection(
  state: Inspection,
  storage: Storage = localStorage,
): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Accepts anything read from storage and keeps only valid fields. */
export function sanitise(data: unknown): Inspection {
  const base = emptyInspection();
  if (typeof data !== "object" || data === null) return base;
  const input = data as Record<string, unknown>;

  const details = { ...base.details };
  if (typeof input.details === "object" && input.details !== null) {
    const d = input.details as Record<string, unknown>;
    for (const field of ["project", "flat", "buyer", "date"] as const) {
      if (typeof d[field] === "string") details[field] = d[field];
    }
  }

  const answers: Record<string, Answer> = {};
  if (typeof input.answers === "object" && input.answers !== null) {
    for (const [key, value] of Object.entries(input.answers)) {
      if (typeof value !== "object" || value === null) continue;
      const a = value as Record<string, unknown>;
      const answer: Answer = {};
      if (STATUSES.includes(a.status as Status))
        answer.status = a.status as Status;
      if (SEVERITIES.includes(a.severity as SeverityId)) {
        answer.severity = a.severity as SeverityId;
      }
      if (typeof a.note === "string")
        answer.note = a.note.slice(0, NOTE_MAX_LENGTH);
      if (Array.isArray(a.photos)) {
        answer.photos = a.photos.filter(
          (p): p is string => typeof p === "string",
        );
      }
      answers[key] = answer;
    }
  }

  return {
    layout: input.layout ? normaliseLayout(input.layout) : null,
    details,
    answers,
  };
}
