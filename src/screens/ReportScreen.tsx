import { useMemo } from "react";
import { Icon, ROOM_ICONS } from "../components/Icon.tsx";
import { PdfExport } from "../components/PdfExport.tsx";
import { PhotoThumb } from "../components/PhotoThumb.tsx";
import { SeverityBadge, severityStyle } from "../components/SeverityBadge.tsx";
import { TopBar } from "../components/TopBar.tsx";
import { SEVERITY_NAMES } from "../config.ts";
import type { SeverityId } from "../data/checklist.ts";
import { t } from "../lib/i18n.ts";
import type { Inspection } from "../lib/inspection.ts";
import { fmt, useLang } from "../lib/lang.ts";
import { buildReport, type RoomProblems } from "../lib/report.ts";
import { routeHref } from "../lib/route.ts";
import type { Room } from "../lib/rooms.ts";

interface Props {
  inspection: Inspection;
  rooms: Room[];
}

export function ReportScreen({ inspection, rooms }: Props) {
  const [lang] = useLang();
  const report = useMemo(
    () => buildReport(rooms, inspection.answers),
    [rooms, inspection.answers],
  );
  const { counts } = report;
  const unrated = report.other.flatMap((r) =>
    r.problems.filter((p) => !p.severity).map((p) => ({ room: r.room, p })),
  );
  const { project, flat, buyer, date } = inspection.details;
  const details = [
    project,
    flat && t(lang, "flatNo", { flat }),
    buyer,
    date,
  ].filter(Boolean);
  const safetyName = SEVERITY_NAMES.safety[lang];

  const stats: { label: string; value: number; severity?: SeverityId }[] = [
    { label: safetyName, value: counts.safety, severity: "safety" },
    {
      label: SEVERITY_NAMES.major[lang],
      value: counts.major,
      severity: "major",
    },
    {
      label: SEVERITY_NAMES.minor[lang],
      value: counts.minor,
      severity: "minor",
    },
    { label: t(lang, "statusOk"), value: counts.ok },
    { label: t(lang, "statusNa"), value: counts.na },
    { label: t(lang, "notChecked"), value: counts.unanswered },
  ];

  return (
    <>
      <TopBar
        title={t(lang, "report")}
        back={{ href: "#/rooms", label: t(lang, "rooms") }}
      />
      <main className="page" lang={lang}>
        <p className="eyebrow">{t(lang, "reportTitle")}</p>
        <h1>{t(lang, "yourReport")}</h1>
        <p className="muted">
          {details.length ? details.join(" · ") : t(lang, "noDetails")}{" "}
          <a href="#/checklist">{t(lang, "edit")}</a>
        </p>

        <div className="stats">
          {stats.map((s) => (
            <div
              className={`stat${s.severity ? " stat--sev" : ""}`}
              key={s.label}
              style={s.severity ? severityStyle(s.severity) : undefined}
            >
              <span className="stat__value">{fmt(lang, s.value)}</span>
              <span className="stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="split split--side">
          <div className="split__side">
            {counts.unanswered > 0 && (
              <div className="notice">
                <Icon name="alert" />
                <div className="notice__body">
                  <p>
                    <strong>
                      {t(lang, "notCheckedYet", { n: counts.unanswered })}
                    </strong>{" "}
                    {t(lang, "notCheckedYetText")}
                  </p>
                  <ul>
                    {report.unanswered.map((r) => (
                      <li key={r.room.id}>
                        <a
                          href={routeHref({ name: "room", roomId: r.room.id })}
                        >
                          {r.room.name[lang]}
                        </a>
                        : {t(lang, "left", { n: r.items.length })}
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
                      {t(lang, "noSeverityYet", { n: unrated.length })}
                    </strong>{" "}
                    {t(lang, "noSeverityYetText")}
                  </p>
                  <ul>
                    {unrated.map(({ room, p }) => (
                      <li key={p.key}>
                        <a href={routeHref({ name: "room", roomId: room.id })}>
                          {room.name[lang]}
                        </a>
                        : {p.item.code} {p.item.title[lang]}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <PdfExport inspection={inspection} report={report} />
          </div>

          <div className="split__main">
            <div className="section-title">
              <h2>{t(lang, "severityProblems", { name: safetyName })}</h2>
            </div>
            {report.safety.length ? (
              <ProblemList rooms={report.safety} />
            ) : (
              <p className="empty">
                <Icon name="check" size={18} />
                {t(lang, "noneFound")}
              </p>
            )}

            <div className="section-title">
              <h2>{t(lang, "otherProblems")}</h2>
            </div>
            {report.other.length ? (
              <ProblemList rooms={report.other} />
            ) : (
              <p className="empty">
                <Icon name="check" size={18} />
                {t(lang, "noneFound")}
              </p>
            )}

            <details className="plain">
              <summary>
                <Icon name="next" size={18} />
                {t(lang, "checkedOkCount", { n: counts.ok })}
              </summary>
              {report.ok.map((r) => (
                <p key={r.room.id} className="small muted">
                  <strong>{r.room.name[lang]}:</strong>{" "}
                  {r.items.map((i) => `${i.code} ${i.title[lang]}`).join("; ")}
                </p>
              ))}
            </details>
          </div>
        </div>
      </main>
    </>
  );
}

function ProblemList({ rooms }: { rooms: RoomProblems[] }) {
  const [lang] = useLang();
  return rooms.map(({ room, problems }) => (
    <section key={room.id}>
      <h3 className="report-room">
        <Icon name={ROOM_ICONS[room.kind]} size={18} />
        <a href={routeHref({ name: "room", roomId: room.id })}>
          {room.name[lang]}
        </a>
      </h3>
      {problems.map((p) => (
        <div className="report-problem" key={p.key}>
          <SeverityBadge severity={p.severity} />{" "}
          <strong>
            {p.item.code} {p.item.title[lang]}
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
