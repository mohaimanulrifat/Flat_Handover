import type { ChecklistItem, SeverityId } from "../data/checklist.ts";
import type { Answer } from "./inspection.ts";
import { itemKey, roomItems, type Room } from "./rooms.ts";

export interface ProblemEntry {
  key: string;
  item: ChecklistItem;
  /** Null if the buyer has not picked a severity yet. */
  severity: SeverityId | null;
  note: string;
  photos: string[];
}

export interface RoomProblems {
  room: Room;
  problems: ProblemEntry[];
}

export interface RoomItems {
  room: Room;
  items: ChecklistItem[];
}

export interface ReportCounts {
  total: number;
  ok: number;
  na: number;
  unanswered: number;
  problems: number;
  safety: number;
  major: number;
  minor: number;
  /** Problems without a severity. */
  unrated: number;
}

export interface Report {
  /** Safety problems, room by room. Listed first in the report. */
  safety: RoomProblems[];
  /** All other problems, room by room, most serious first in each room. */
  other: RoomProblems[];
  /** Items checked OK, room by room, kept as a record. */
  ok: RoomItems[];
  /** Items with no answer yet, room by room. */
  unanswered: RoomItems[];
  counts: ReportCounts;
}

const RANK: Record<SeverityId, number> = { safety: 0, major: 1, minor: 2 };
const rank = (p: ProblemEntry) => (p.severity ? RANK[p.severity] : 3);

export function buildReport(
  rooms: Room[],
  answers: Record<string, Answer>,
): Report {
  const report: Report = {
    safety: [],
    other: [],
    ok: [],
    unanswered: [],
    counts: {
      total: 0,
      ok: 0,
      na: 0,
      unanswered: 0,
      problems: 0,
      safety: 0,
      major: 0,
      minor: 0,
      unrated: 0,
    },
  };
  const { counts } = report;

  for (const room of rooms) {
    const safety: ProblemEntry[] = [];
    const other: ProblemEntry[] = [];
    const ok: ChecklistItem[] = [];
    const unanswered: ChecklistItem[] = [];

    for (const item of roomItems(room)) {
      counts.total++;
      const key = itemKey(room.id, item.code);
      const answer = answers[key];
      switch (answer?.status) {
        case "ok":
          counts.ok++;
          ok.push(item);
          break;
        case "na":
          counts.na++;
          break;
        case "problem": {
          const entry: ProblemEntry = {
            key,
            item,
            severity: answer.severity ?? null,
            note: answer.note?.trim() ?? "",
            photos: answer.photos ?? [],
          };
          counts.problems++;
          counts[entry.severity ?? "unrated"]++;
          (entry.severity === "safety" ? safety : other).push(entry);
          break;
        }
        default:
          counts.unanswered++;
          unanswered.push(item);
      }
    }

    // sort() is stable, so items keep checklist order within a severity.
    other.sort((a, b) => rank(a) - rank(b));
    if (safety.length) report.safety.push({ room, problems: safety });
    if (other.length) report.other.push({ room, problems: other });
    if (ok.length) report.ok.push({ room, items: ok });
    if (unanswered.length) report.unanswered.push({ room, items: unanswered });
  }
  return report;
}

export interface RoomProgress {
  total: number;
  answered: number;
  problems: number;
  safety: number;
}

export function roomProgress(
  room: Room,
  answers: Record<string, Answer>,
): RoomProgress {
  const progress: RoomProgress = {
    total: 0,
    answered: 0,
    problems: 0,
    safety: 0,
  };
  for (const item of roomItems(room)) {
    const answer = answers[itemKey(room.id, item.code)];
    progress.total++;
    if (answer?.status) progress.answered++;
    if (answer?.status === "problem") {
      progress.problems++;
      if (answer.severity === "safety") progress.safety++;
    }
  }
  return progress;
}
