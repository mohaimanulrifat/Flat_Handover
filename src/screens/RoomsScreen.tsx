import { Icon, ROOM_ICONS } from "../components/Icon.tsx";
import { TopBar } from "../components/TopBar.tsx";
import { APP_TITLE, SEVERITY_NAMES } from "../config.ts";
import type { RoomKind } from "../data/checklist.ts";
import { t } from "../lib/i18n.ts";
import type { Inspection } from "../lib/inspection.ts";
import { fmt, useLang } from "../lib/lang.ts";
import { buildReport, roomProgress } from "../lib/report.ts";
import { routeHref } from "../lib/route.ts";
import type { Room } from "../lib/rooms.ts";

interface Props {
  inspection: Inspection;
  rooms: Room[];
}

const ONCE_KINDS: RoomKind[] = ["wholeFlat", "building"];

export function RoomsScreen({ inspection, rooms }: Props) {
  const [lang] = useLang();
  const progress = rooms.map((room) => ({
    room,
    ...roomProgress(room, inspection.answers),
  }));
  const { counts } = buildReport(rooms, inspection.answers);
  const answered = counts.total - counts.unanswered;
  const share = counts.total ? answered / counts.total : 0;

  const groups = [
    {
      title: t(lang, "rooms"),
      items: progress.filter(
        (p) =>
          !ONCE_KINDS.includes(p.room.kind) && p.room.kind !== "endOfVisit",
      ),
    },
    {
      title: t(lang, "onceForFlat"),
      items: progress.filter((p) => ONCE_KINDS.includes(p.room.kind)),
    },
    {
      title: t(lang, "beforeYouSign"),
      items: progress.filter((p) => p.room.kind === "endOfVisit"),
    },
  ];

  const { project, flat } = inspection.details;
  const flatLabel = [project, flat && t(lang, "flatNo", { flat })]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <TopBar
        title={APP_TITLE}
        back={{ href: "#/checklist", label: t(lang, "start") }}
      />
      <main className="page" lang={lang}>
        {flatLabel && <p className="eyebrow">{flatLabel}</p>}
        <h1>{t(lang, "yourChecklist")}</h1>

        <div className="card summary">
          <ProgressRing value={share} />
          <div className="summary__text">
            <div className="summary__count">
              {t(lang, "itemsChecked", { done: answered, total: counts.total })}
            </div>
            <div className="chips">
              {counts.problems === 0 ? (
                <span className="pill pill--ok">
                  {t(lang, "noProblemsYet")}
                </span>
              ) : (
                <>
                  {counts.safety > 0 && (
                    <span className="pill">
                      {t(lang, "severityCount", {
                        n: counts.safety,
                        name: SEVERITY_NAMES.safety[lang],
                      })}
                    </span>
                  )}
                  <span className="pill pill--muted">
                    {t(lang, "problemCount", { n: counts.problems })}
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
                              {p.room.name[lang]}
                            </span>
                            <span className="room-link__meta">
                              <span className="mini-bar" aria-hidden="true">
                                <div
                                  style={{
                                    width: `${(p.answered / p.total) * 100}%`,
                                  }}
                                />
                              </span>
                              {done
                                ? t(lang, "done")
                                : `${fmt(lang, p.answered)}/${fmt(lang, p.total)}`}
                            </span>
                          </span>
                          {p.safety > 0 && (
                            <span className="pill">{fmt(lang, p.safety)}</span>
                          )}
                          {others > 0 && (
                            <span
                              className="pill pill--muted"
                              aria-label={t(lang, "otherProblemCount", {
                                n: others,
                              })}
                            >
                              {fmt(lang, others)}
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

        <a className="btn btn--ghost btn--block btn--end" href="#/checklist">
          {t(lang, "changeRooms")}
        </a>
      </main>

      <div className="dock">
        <div className="dock__inner">
          <a className="btn btn--primary" href="#/report">
            <Icon name="report" size={18} />
            {t(lang, "seeReport")}
          </a>
        </div>
      </div>
    </>
  );
}

function ProgressRing({ value }: { value: number }) {
  const [lang] = useLang();
  const pct = fmt(lang, Math.round(value * 100));
  const r = 36;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="ring"
      role="img"
      aria-label={t(lang, "pctChecked", { pct })}
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
      <span className="ring__label">{pct}%</span>
    </div>
  );
}
