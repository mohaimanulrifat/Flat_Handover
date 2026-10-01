import { useMemo } from "react";
import { Icon, ROOM_ICONS } from "../components/Icon.tsx";
import { PdfExport } from "../components/PdfExport.tsx";
import { PhotoThumb } from "../components/PhotoThumb.tsx";
import { SeverityBadge, severityStyle } from "../components/SeverityBadge.tsx";
import { TopBar } from "../components/TopBar.tsx";
import { SEVERITY_NAMES } from "../config.ts";
import type { SeverityId } from "../data/checklist.ts";
import type { Inspection } from "../lib/inspection.ts";
import { buildReport, type RoomProblems } from "../lib/report.ts";
import { routeHref } from "../lib/route.ts";
import type { Room } from "../lib/rooms.ts";

interface Props {
  inspection: Inspection;
  rooms: Room[];
}

export function ReportScreen({ inspection, rooms }: Props) {
  const report = useMemo(
    () => buildReport(rooms, inspection.answers),
    [rooms, inspection.answers],
  );
  const { counts } = report;
  const unrated = report.other.flatMap((r) =>
    r.problems.filter((p) => !p.severity).map((p) => ({ room: r.room, p })),
  );
  const { project, flat, buyer, date } = inspection.details;
  const details = [project, flat && `Flat ${flat}`, buyer, date].filter(
    Boolean,
  );

  const stats: { label: string; value: number; severity?: SeverityId }[] = [
    { label: SEVERITY_NAMES.safety, value: counts.safety, severity: "safety" },
    { label: SEVERITY_NAMES.major, value: counts.major, severity: "major" },
    { label: SEVERITY_NAMES.minor, value: counts.minor, severity: "minor" },
    { label: "OK", value: counts.ok },
    { label: "Not applicable", value: counts.na },
    { label: "Not checked", value: counts.unanswered },
  ];

  return (
    <>
      <TopBar title="Report" back={{ href: "#/rooms", label: "Rooms" }} />
      <main className="page">
        <p className="eyebrow">Handover inspection report</p>
        <h1>Your report</h1>
        <p className="muted">
          {details.length ? details.join(" · ") : "No flat details yet."}{" "}
          <a href="#/">Edit</a>
        </p>

        <div className="stats">
          {stats.map((s) => (
            <div
              className={`stat${s.severity ? " stat--sev" : ""}`}
              key={s.label}
              style={s.severity ? severityStyle(s.severity) : undefined}
            >
              <span className="stat__value">{s.value}</span>
              <span className="stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        {counts.unanswered > 0 && (
          <div className="notice">
            <Icon name="alert" />
            <div className="notice__body">
              <p>
                <strong>
                  {counts.unanswered}{" "}
                  {counts.unanswered === 1 ? "item is" : "items are"} not
                  checked yet.
                </strong>{" "}
                You can still make the report; it will show how many were not
                checked.
              </p>
              <ul>
                {report.unanswered.map((r) => (
                  <li key={r.room.id}>
                    <a href={routeHref({ name: "room", roomId: r.room.id })}>
                      {r.room.name}
                    </a>
                    : {r.items.length} left
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {unrated.length > 0 && (
          <div className="notice">
            <Icon name="alert" />
            <div className="notice__body">
              <p>
                <strong>
                  {unrated.length}{" "}
                  {unrated.length === 1 ? "problem has" : "problems have"} no
                  severity.
                </strong>{" "}
                Pick one so the developer knows how serious it is.
              </p>
              <ul>
                {unrated.map(({ room, p }) => (
                  <li key={p.key}>
                    <a href={routeHref({ name: "room", roomId: room.id })}>
                      {room.name}
                    </a>
                    : {p.item.code} {p.item.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <PdfExport inspection={inspection} report={report} />

        <div className="section-title">
          <h2>{SEVERITY_NAMES.safety} problems</h2>
        </div>
        {report.safety.length ? (
          <ProblemList rooms={report.safety} />
        ) : (
          <p className="empty">
            <Icon name="check" size={18} />
            None found.
          </p>
        )}

        <div className="section-title">
          <h2>Other problems</h2>
        </div>
        {report.other.length ? (
          <ProblemList rooms={report.other} />
        ) : (
          <p className="empty">
            <Icon name="check" size={18} />
            None found.
          </p>
        )}

        <details className="plain">
          <summary>
            <Icon name="next" size={18} />
            Checked OK ({counts.ok})
          </summary>
          {report.ok.map((r) => (
            <p key={r.room.id} className="small muted">
              <strong>{r.room.name}:</strong>{" "}
              {r.items.map((i) => `${i.code} ${i.title}`).join("; ")}
            </p>
          ))}
        </details>
      </main>
    </>
  );
}

function ProblemList({ rooms }: { rooms: RoomProblems[] }) {
  return rooms.map(({ room, problems }) => (
    <section key={room.id}>
      <h3 className="report-room">
        <Icon name={ROOM_ICONS[room.kind]} size={18} />
        <a href={routeHref({ name: "room", roomId: room.id })}>{room.name}</a>
      </h3>
      {problems.map((p) => (
        <div className="report-problem" key={p.key}>
          <SeverityBadge severity={p.severity} />{" "}
          <strong>
            {p.item.code} {p.item.title}
          </strong>
          {p.note && <p>{p.note}</p>}
          {p.photos.length > 0 && (
            <div className="photos">
              {p.photos.map((id) => (
                <PhotoThumb key={id} photoId={id} />
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  ));
}
