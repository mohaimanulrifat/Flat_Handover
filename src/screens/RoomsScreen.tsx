import { TopBar } from "../components/TopBar.tsx";
import { APP_TITLE } from "../config.ts";
import type { RoomKind } from "../data/checklist.ts";
import type { Inspection } from "../lib/inspection.ts";
import { roomProgress } from "../lib/report.ts";
import { routeHref } from "../lib/route.ts";
import type { Room } from "../lib/rooms.ts";

interface Props {
  inspection: Inspection;
  rooms: Room[];
}

const ONCE_KINDS: RoomKind[] = ["wholeFlat", "building"];

export function RoomsScreen({ inspection, rooms }: Props) {
  const progress = rooms.map((room) => ({
    room,
    ...roomProgress(room, inspection.answers),
  }));
  const total = progress.reduce((n, p) => n + p.total, 0);
  const answered = progress.reduce((n, p) => n + p.answered, 0);
  const problems = progress.reduce((n, p) => n + p.problems, 0);

  const groups = [
    {
      title: "Rooms",
      items: progress.filter(
        (p) =>
          !ONCE_KINDS.includes(p.room.kind) && p.room.kind !== "endOfVisit",
      ),
    },
    {
      title: "Once for the flat",
      items: progress.filter((p) => ONCE_KINDS.includes(p.room.kind)),
    },
    {
      title: "Before you sign",
      items: progress.filter((p) => p.room.kind === "endOfVisit"),
    },
  ];

  const { project, flat } = inspection.details;
  const flatLabel = [project, flat && `Flat ${flat}`]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <TopBar
        title={APP_TITLE}
        back={{ href: "#/", label: "Start" }}
        side={<a href="#/report">Report ›</a>}
      />
      <main className="page">
        <h1>Your checklist</h1>
        {flatLabel && <p className="muted">{flatLabel}</p>}
        <div className="card">
          <div>
            <strong>{answered}</strong> of {total} items checked
            {problems > 0 && (
              <>
                {" · "}
                <strong>{problems}</strong>{" "}
                {problems === 1 ? "problem" : "problems"}
              </>
            )}
          </div>
          <div className="progress" aria-hidden="true">
            <div
              className="progress__bar"
              style={{ width: `${total ? (answered / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {groups.map(
          (group) =>
            group.items.length > 0 && (
              <section key={group.title}>
                <h2>{group.title}</h2>
                <ul className="room-list">
                  {group.items.map((p) => (
                    <li key={p.room.id}>
                      <a
                        className="room-link"
                        href={routeHref({ name: "room", roomId: p.room.id })}
                      >
                        <span className="room-link__main">
                          <span className="room-link__name">{p.room.name}</span>
                          <br />
                          <span className="room-link__meta">
                            {p.answered === p.total ? (
                              <span className="room-link__done">✓ Done</span>
                            ) : (
                              `${p.answered} of ${p.total} checked`
                            )}
                          </span>
                        </span>
                        {p.safety > 0 && (
                          <span className="pill">{p.safety} safety</span>
                        )}
                        {p.problems - p.safety > 0 && (
                          <span className="pill pill--muted">
                            {p.problems - p.safety}{" "}
                            {p.problems - p.safety === 1
                              ? "problem"
                              : "problems"}
                          </span>
                        )}
                        <span className="room-link__arrow" aria-hidden="true">
                          ›
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ),
        )}

        <a className="btn btn--primary btn--block" href="#/report">
          See the report
        </a>
        <div className="btn-row">
          <a className="btn" href="#/">
            Change rooms or flat details
          </a>
        </div>
      </main>
    </>
  );
}
