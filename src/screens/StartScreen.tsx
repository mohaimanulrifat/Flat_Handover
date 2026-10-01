import { useMemo, useState, type Dispatch, type FormEvent } from "react";
import { Icon, type IconName } from "../components/Icon.tsx";
import { ThemeToggle } from "../components/TopBar.tsx";
import { Stepper } from "../components/Stepper.tsx";
import { APP_TITLE } from "../config.ts";
import { groundRules, whatToBring } from "../data/checklist.ts";
import {
  answersLostByLayout,
  type Action,
  type FlatDetails,
  type Inspection,
} from "../lib/inspection.ts";
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

const LAYOUT_FIELDS: { key: keyof Layout; label: string; icon: IconName }[] = [
  { key: "bedrooms", label: "Bedrooms", icon: "bed" },
  { key: "bathrooms", label: "Bathrooms", icon: "bath" },
  { key: "balconies", label: "Balconies", icon: "balcony" },
];

const DETAIL_FIELDS: { key: keyof FlatDetails; label: string; type: string }[] =
  [
    { key: "project", label: "Project or building name", type: "text" },
    { key: "flat", label: "Flat number", type: "text" },
    { key: "buyer", label: "Your name", type: "text" },
    { key: "date", label: "Date of visit", type: "date" },
  ];

export function StartScreen({ inspection, dispatch }: Props) {
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
      if (
        lost > 0 &&
        !confirm(
          `Your new layout has fewer rooms. Your answers for ${lost} items in the removed rooms will be deleted. Continue?`,
        )
      ) {
        return;
      }
    }
    dispatch({ type: "setLayout", layout });
    requestPersistentStorage();
    navigate({ name: "rooms" });
  }

  function startOver() {
    if (
      confirm(
        "Start a new inspection? All answers, notes and photos on this phone will be deleted.",
      )
    ) {
      dispatch({ type: "reset" });
      setLayout(DEFAULT_LAYOUT);
    }
  }

  return (
    <main className="page">
      <div className="brand">
        <span className="brand__mark">
          <Icon name="home" size={26} />
        </span>
        <span className="brand__name">{APP_TITLE}</span>
        <ThemeToggle />
      </div>

      <section className="hero">
        <p className="eyebrow">Flat handover inspection</p>
        <h1>
          Check your new flat <em>before you sign.</em>
        </h1>
        <p className="lead">
          A room-by-room checklist for the day you receive your flat. Mark each
          item OK or Problem, take photos, and make a PDF report to give the
          developer.
        </p>
        <ol className="steps">
          <li>
            <b>1</b>Enter your flat layout
          </li>
          <li>
            <b>2</b>Check room by room
          </li>
          <li>
            <b>3</b>Share the PDF report
          </li>
        </ol>
      </section>

      {inProgress && counts && (
        <div className="card resume" style={{ marginTop: "1.25rem" }}>
          <span className="icon-tile">
            <Icon name="papers" size={22} />
          </span>
          <div className="resume__text">
            <strong>Inspection in progress</strong>
            <div className="small muted">
              {counts.total - counts.unanswered} of {counts.total} items checked
              · saved on this phone
            </div>
          </div>
          <a className="btn btn--primary btn--small" href="#/rooms">
            Continue
          </a>
        </div>
      )}

      <div className="section-title">
        <h2>Before you go</h2>
      </div>

      <section className="card">
        <div className="card__head">
          <span className="icon-tile">
            <Icon name="bag" size={22} />
          </span>
          <h3>What to bring</h3>
        </div>
        <ol className="numbered">
          {whatToBring.map((thing) => (
            <li key={thing}>{thing}</li>
          ))}
        </ol>
      </section>

      <section className="card">
        <div className="card__head">
          <span className="icon-tile">
            <Icon name="shield" size={22} />
          </span>
          <h3>Ground rules</h3>
        </div>
        <ol className="numbered">
          {groundRules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
      </section>

      <div className="section-title">
        <h2>Your flat</h2>
      </div>

      <form className="card" onSubmit={submit}>
        <p className="muted small">
          Enter the number of rooms and the app makes your checklist. The living
          room, dining room, kitchen, whole flat, building and papers are always
          included.
        </p>
        {LAYOUT_FIELDS.map((f) => (
          <Stepper
            key={f.key}
            label={f.label}
            icon={f.icon}
            value={layout[f.key]}
            min={LAYOUT_MIN}
            max={LAYOUT_MAX}
            onChange={(value) => setLayout({ ...layout, [f.key]: value })}
          />
        ))}

        <h3 style={{ margin: "1.5rem 0 0.9rem" }}>
          For the report <span className="muted small">(optional)</span>
        </h3>
        {DETAIL_FIELDS.map((f) => (
          <label className="field" key={f.key}>
            <span className="field__label">{f.label}</span>
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
          {!inProgress
            ? "Start checking"
            : layoutChanged
              ? "Update my rooms"
              : "Continue checking"}
          <Icon name="next" size={18} />
        </button>
      </form>

      {inProgress && (
        <button
          type="button"
          className="btn btn--danger btn--block"
          onClick={startOver}
        >
          Start a new inspection
        </button>
      )}
    </main>
  );
}
