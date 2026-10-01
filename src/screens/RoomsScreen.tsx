import { Icon, ROOM_ICONS } from "../components/Icon.tsx";
import { TopBar } from "../components/TopBar.tsx";
import { APP_TITLE, SEVERITY_NAMES } from "../config.ts";
import type { RoomKind } from "../data/checklist.ts";
import type { Inspection } from "../lib/inspection.ts";
import { buildReport, roomProgress } from "../lib/report.ts";
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
  const { counts } = buildReport(rooms, inspection.answers);
  const answered = counts.total - counts.unanswered;
  const share = counts.total ? answered / counts.total : 0;

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
    .join(" · ");

  return (
    <>
      <TopBar
        title={APP_TITLE}
        back={{ href: "#/checklist", label: "Start" }}
      />
      <main className="page">
        {flatLabel && <p className="eyebrow">{flatLabel}</p>}
        <h1>Your checklist</h1>

        <div className="card summary">
          <ProgressRing value={share} />
          <div className="summary__text">
            <div className="summary__count">
              {answered} of {counts.total} items checked
            </div>
            <div className="chips">
              {counts.problems === 0 ? (
                <span className="pill pill--ok">No problems yet</span>
              ) : (
                <>
                  {counts.safety > 0 && (
                    <span className="pill">
                      {counts.safety} {SEVERITY_NAMES.safety}
                    </span>
                  )}
                  <span className="pill pill--muted">
                    {counts.problems}{" "}
                    {counts.problems === 1 ? "problem" : "problems"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {groups.map(
          (group) =>
            group.items.length > 0 && (
              <section key={group.title}>
                <div className="section-title">
                  <h2>{group.title}</h2>
                </div>
                <ul className="room-list">
                  {group.items.map((p) => {
                    const done = p.answered === p.total;
                    const others = p.problems - p.safety;
                    return (
                      <li key={p.room.id}>
                        <a
                          className={`room-link${done ? " room-link--done" : ""}`}
                          href={routeHref({ name: "room", roomId: p.room.id })}
                        >
                          <span className="icon-tile">
                            <Icon
                              name={done ? "check" : ROOM_ICONS[p.room.kind]}
                              size={22}
                            />
                          </span>
                          <span className="room-link__main">
                            <span className="room-link__name">
                              {p.room.name}
                            </span>
                            <span className="room-link__meta">
                              <span className="mini-bar" aria-hidden="true">
                                <div
                                  style={{
                                    width: `${(p.answered / p.total) * 100}%`,
                                  }}
                                />
                              </span>
                              {done ? "Done" : `${p.answered}/${p.total}`}
                            </span>
                          </span>
                          {p.safety > 0 && (
                            <span className="pill">{p.safety}</span>
                          )}
                          {others > 0 && (
                            <span
                              className="pill pill--muted"
                              aria-label={`${others} other problems`}
                            >
                              {others}
                            </span>
                          )}
                          <Icon
                            name="next"
                            size={18}
                            className="room-link__arrow"
                          />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ),
        )}

        <a className="btn btn--ghost btn--block" href="#/checklist">
          Change rooms or flat details
        </a>
      </main>

      <div className="dock">
        <div className="dock__inner">
          <a className="btn btn--primary" href="#/report">
            <Icon name="report" size={18} />
            See the report
          </a>
        </div>
      </div>
    </>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="ring"
      role="img"
      aria-label={`${Math.round(value * 100)}% checked`}
    >
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle
          className="ring__track"
          cx="42"
          cy="42"
          r={r}
          fill="none"
          strokeWidth="7"
        />
        <circle
          className="ring__bar"
          cx="42"
          cy="42"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value)}
        />
      </svg>
      <span className="ring__label">{Math.round(value * 100)}%</span>
    </div>
  );
}
