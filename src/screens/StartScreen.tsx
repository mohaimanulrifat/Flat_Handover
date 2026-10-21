import { useMemo, useState, type Dispatch, type FormEvent } from "react";
import { Icon, type IconName } from "../components/Icon.tsx";
import { LangToggle, ThemeToggle } from "../components/TopBar.tsx";
import { Stepper } from "../components/Stepper.tsx";
import { APP_TITLE } from "../config.ts";
import { groundRules, whatToBring } from "../data/checklist.ts";
import { t, type TextKey } from "../lib/i18n.ts";
import {
  answersLostByLayout,
  type Action,
  type FlatDetails,
  type Inspection,
} from "../lib/inspection.ts";
import { fmt, useLang } from "../lib/lang.ts";
import { requestPersistentStorage } from "../lib/photos.ts";
import { buildReport } from "../lib/report.ts";
import { navigate } from "../lib/route.ts";
import {
  DEFAULT_LAYOUT,
  generateRooms,
  LAYOUT_MAX,
  LAYOUT_MIN,
  type Layout,
} from "../lib/rooms.ts";

interface Props {
  inspection: Inspection;
  dispatch: Dispatch<Action>;
}

const LAYOUT_FIELDS: { key: keyof Layout; label: TextKey; icon: IconName }[] = [
  { key: "bedrooms", label: "bedrooms", icon: "bed" },
  { key: "bathrooms", label: "bathrooms", icon: "bath" },
  { key: "balconies", label: "balconies", icon: "balcony" },
];

const DETAIL_FIELDS: {
  key: keyof FlatDetails;
  label: TextKey;
  type: string;
}[] = [
  { key: "project", label: "projectName", type: "text" },
  { key: "flat", label: "flatNumber", type: "text" },
  { key: "buyer", label: "yourName", type: "text" },
  { key: "date", label: "visitDate", type: "date" },
];

export function StartScreen({ inspection, dispatch }: Props) {
  const [lang] = useLang();
  const inProgress = inspection.layout !== null;
  const [layout, setLayout] = useState<Layout>(
    inspection.layout ?? DEFAULT_LAYOUT,
  );
  const layoutChanged =
    inProgress &&
    LAYOUT_FIELDS.some((f) => layout[f.key] !== inspection.layout![f.key]);

  const counts = useMemo(
    () =>
      inspection.layout
        ? buildReport(generateRooms(inspection.layout), inspection.answers)
            .counts
        : null,
    [inspection.layout, inspection.answers],
  );

  function submit(event: FormEvent) {
    event.preventDefault();
    if (inProgress) {
      const lost = answersLostByLayout(inspection, layout);
      if (lost > 0 && !confirm(t(lang, "confirmFewerRooms", { n: lost }))) {
        return;
      }
    }
    dispatch({ type: "setLayout", layout });
    requestPersistentStorage();
    navigate({ name: "rooms" });
  }

  function startOver() {
    if (confirm(t(lang, "confirmStartOver"))) {
      dispatch({ type: "reset" });
      setLayout(DEFAULT_LAYOUT);
    }
  }

  return (
    <main className="page" lang={lang}>
      <div className="brand">
        <a className="icon-btn" href="#/" aria-label={t(lang, "backHome")}>
          <Icon name="back" />
        </a>
        <span className="brand__mark">
          <Icon name="home" size={26} />
        </span>
        <span className="brand__name">{APP_TITLE}</span>
        <LangToggle />
        <ThemeToggle />
      </div>

      <section className="hero">
        <p className="eyebrow">{t(lang, "heroEyebrow")}</p>
        <h1>
          {t(lang, "heroTitle")} <em>{t(lang, "heroTitleEm")}</em>
        </h1>
        <p className="lead">{t(lang, "heroLead")}</p>
        <ol className="steps">
          {(["heroStep1", "heroStep2", "heroStep3"] as const).map((key, i) => (
            <li key={key}>
              <b>{fmt(lang, i + 1)}</b>
              {t(lang, key)}
            </li>
          ))}
        </ol>
      </section>

      {inProgress && counts && (
        <div className="card resume" style={{ marginTop: "1.25rem" }}>
          <span className="icon-tile">
            <Icon name="papers" size={22} />
          </span>
          <div className="resume__text">
            <strong>{t(lang, "inProgress")}</strong>
            <div className="small muted">
              {t(lang, "itemsChecked", {
                done: counts.total - counts.unanswered,
                total: counts.total,
              })}{" "}
              · {t(lang, "savedOnPhone")}
            </div>
          </div>
          <a className="btn btn--primary btn--small" href="#/rooms">
            {t(lang, "continue")}
          </a>
        </div>
      )}

      <div className="split">
        <div>
          <div className="section-title">
            <h2>{t(lang, "beforeYouGo")}</h2>
          </div>

          <section className="card">
            <div className="card__head">
              <span className="icon-tile">
                <Icon name="bag" size={22} />
              </span>
              <h3>{t(lang, "whatToBring")}</h3>
            </div>
            <ol className="numbered">
              {whatToBring.map((thing) => (
                <li key={thing.en}>{thing[lang]}</li>
              ))}
            </ol>
          </section>

          <section className="card">
            <div className="card__head">
              <span className="icon-tile">
                <Icon name="shield" size={22} />
              </span>
              <h3>{t(lang, "groundRules")}</h3>
            </div>
            <ol className="numbered">
              {groundRules.map((rule) => (
                <li key={rule.en}>{rule[lang]}</li>
              ))}
            </ol>
          </section>
        </div>

        <div>
          <div className="section-title">
            <h2>{t(lang, "yourFlat")}</h2>
          </div>

          <form className="card" onSubmit={submit}>
            <p className="muted small">{t(lang, "layoutIntro")}</p>
            {LAYOUT_FIELDS.map((f) => (
              <Stepper
                key={f.key}
                label={t(lang, f.label)}
                icon={f.icon}
                value={layout[f.key]}
                min={LAYOUT_MIN}
                max={LAYOUT_MAX}
                onChange={(value) => setLayout({ ...layout, [f.key]: value })}
              />
            ))}

            <h3 style={{ margin: "1.5rem 0 0.9rem" }}>
              {t(lang, "forTheReport")}{" "}
              <span className="muted small">{t(lang, "optional")}</span>
            </h3>
            {DETAIL_FIELDS.map((f) => (
              <label className="field" key={f.key}>
                <span className="field__label">{t(lang, f.label)}</span>
                <input
                  type={f.type}
                  value={inspection.details[f.key]}
                  onChange={(e) =>
                    dispatch({
                      type: "setDetails",
                      details: { [f.key]: e.target.value },
                    })
                  }
                />
              </label>
            ))}

            <button type="submit" className="btn btn--primary btn--block">
              {t(
                lang,
                !inProgress
                  ? "startChecking"
                  : layoutChanged
                    ? "updateRooms"
                    : "continueChecking",
              )}
              <Icon name="next" size={18} />
            </button>
          </form>

          {inProgress && (
            <button
              type="button"
              className="btn btn--danger btn--block"
              onClick={startOver}
            >
              {t(lang, "startOver")}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
