import { useState, type Dispatch, type FormEvent } from "react";
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
import { navigate } from "../lib/route.ts";
import {
  DEFAULT_LAYOUT,
  LAYOUT_MAX,
  LAYOUT_MIN,
  type Layout,
} from "../lib/rooms.ts";

interface Props {
  inspection: Inspection;
  dispatch: Dispatch<Action>;
}

const LAYOUT_FIELDS: { key: keyof Layout; label: string }[] = [
  { key: "bedrooms", label: "Bedrooms" },
  { key: "bathrooms", label: "Bathrooms" },
  { key: "balconies", label: "Balconies" },
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
      <h1>{APP_TITLE}</h1>
      <p className="lead">
        A room-by-room checklist for the day you receive your new flat. Mark
        each item OK or Problem, take photos, and make a PDF report to give the
        developer.
      </p>

      {inProgress && (
        <div className="notice">
          <p>You have an inspection in progress. It is saved on this phone.</p>
          <a className="btn btn--primary btn--block" href="#/rooms">
            Continue checking
          </a>
        </div>
      )}

      <section className="card">
        <h2>What to bring</h2>
        <ul>
          {whatToBring.map((thing) => (
            <li key={thing}>{thing}</li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Ground rules</h2>
        <ul>
          {groundRules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>

      <form className="card" onSubmit={submit}>
        <h2>Your flat</h2>
        <p className="muted small">
          Enter the number of rooms and the app makes your checklist. The living
          room, dining room, kitchen, whole flat, building and papers are always
          included.
        </p>
        {LAYOUT_FIELDS.map((f) => (
          <Stepper
            key={f.key}
            label={f.label}
            value={layout[f.key]}
            min={LAYOUT_MIN}
            max={LAYOUT_MAX}
            onChange={(value) => setLayout({ ...layout, [f.key]: value })}
          />
        ))}

        <h3 style={{ marginTop: "1.25rem" }}>For the report (optional)</h3>
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
