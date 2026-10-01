import { useState, type Dispatch } from "react";
import { ItemCard } from "../components/ItemCard.tsx";
import { TopBar } from "../components/TopBar.tsx";
import type { RoomKind } from "../data/checklist.ts";
import type { Action, Inspection } from "../lib/inspection.ts";
import { roomProgress } from "../lib/report.ts";
import { routeHref } from "../lib/route.ts";
import { itemKey, type Room } from "../lib/rooms.ts";

interface Props {
  room: Room;
  next: Room | undefined;
  inspection: Inspection;
  dispatch: Dispatch<Action>;
}

// Short guidance per area, taken from the section notes in the checklist.
const NOT_APPLICABLE_HINT =
  "If this room does not have something (for example no window), tap Not applicable.";
const ROOM_HINTS: Record<RoomKind, string> = {
  living: NOT_APPLICABLE_HINT,
  dining: NOT_APPLICABLE_HINT,
  bedroom: NOT_APPLICABLE_HINT,
  bathroom: NOT_APPLICABLE_HINT,
  kitchen: NOT_APPLICABLE_HINT,
  balcony: NOT_APPLICABLE_HINT,
  wholeFlat: "Check these once for the whole flat.",
  building:
    "Many of these are shared. Check that what the agreement promised has been delivered.",
  endOfVisit: "Collect these at the end of the visit, before signing anything.",
};

const TIPS_KEY = "handover-check:show-tips";

function readShowTips(): boolean {
  try {
    return localStorage.getItem(TIPS_KEY) !== "no";
  } catch {
    return true;
  }
}

export function RoomScreen({ room, next, inspection, dispatch }: Props) {
  const [showTips, setShowTips] = useState(readShowTips);
  const progress = roomProgress(room, inspection.answers);

  function toggleTips() {
    const value = !showTips;
    setShowTips(value);
    try {
      localStorage.setItem(TIPS_KEY, value ? "yes" : "no");
    } catch {
      // Not saved; the setting still applies until the page is closed.
    }
  }

  return (
    <>
      <TopBar
        title={room.name}
        back={{ href: "#/rooms", label: "Rooms" }}
        side={`${progress.answered}/${progress.total}`}
      />
      <main className="page">
        <p className="muted">{ROOM_HINTS[room.kind]}</p>
        <label
          className="small"
          style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
        >
          <input type="checkbox" checked={showTips} onChange={toggleTips} />
          Show "how to check" under every item
        </label>

        {room.groups.map((group) => {
          const keys = group.items.map((item) => itemKey(room.id, item.code));
          const open = keys.filter(
            (key) => !inspection.answers[key]?.status,
          ).length;
          return (
            <section className="group" key={group.id}>
              <div className="group__head">
                <h2>{group.title}</h2>
                <button
                  type="button"
                  className="btn btn--small"
                  disabled={open === 0}
                  onClick={() => dispatch({ type: "markUnansweredOk", keys })}
                  aria-label={`All OK: mark the ${open} unanswered items in ${group.title} as OK`}
                >
                  All OK
                </button>
              </div>
              {group.items.map((item, i) => (
                <ItemCard
                  key={item.code}
                  item={item}
                  itemKey={keys[i]}
                  answer={inspection.answers[keys[i]]}
                  showTips={showTips}
                  dispatch={dispatch}
                />
              ))}
            </section>
          );
        })}

        {next ? (
          <a
            className="btn btn--primary btn--block"
            href={routeHref({ name: "room", roomId: next.id })}
          >
            Next: {next.name} ›
          </a>
        ) : (
          <a className="btn btn--primary btn--block" href="#/report">
            See the report ›
          </a>
        )}
        <div className="btn-row">
          <a className="btn" href="#/rooms">
            All rooms
          </a>
        </div>
      </main>
    </>
  );
}
