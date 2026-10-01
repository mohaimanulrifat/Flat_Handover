import { useEffect, useMemo, useState } from "react";
import { Icon } from "../components/Icon.tsx";
import { TopBar } from "../components/TopBar.tsx";
import {
  calculatePlot,
  metresToFeet,
  type PlotResult,
} from "../landowner/calc.ts";
import { parseForm, useLandownerForm, useLang } from "../landowner/form.ts";
import {
  assumptions,
  errorText,
  fmt,
  incentiveTitle,
  sourceText,
  stepText,
  t,
  type Lang,
} from "../landowner/i18n.ts";
import { calculateShare, type ShareResult } from "../landowner/share.ts";
import { RULES_VERSION } from "../rules/index.ts";
import { LangToggle } from "./HomeScreen.tsx";

export interface LandownerOutcome {
  plot: PlotResult;
  share: ShareResult;
  unitSizeFromBlock: boolean;
}

export function LandownerResultScreen() {
  const [lang] = useLang();
  const [form] = useLandownerForm();

  const outcome = useMemo(() => {
    const parsed = parseForm(form);
    if (!parsed.ok) return { kind: "form" as const };
    const plot = calculatePlot(parsed.value.plot);
    if (!plot.ok)
      return { kind: "error" as const, error: plot.error, values: plot.values };
    const unitSizeFromBlock = parsed.value.share.unitSizeSqft === null;
    const share = calculateShare({
      ...parsed.value.share,
      unitSizeSqft:
        parsed.value.share.unitSizeSqft ?? plot.block.avgUnitSizeSqft,
      totalFloorSqft: plot.floorArea.totalSqft,
      densityCap: plot.units.densityCap,
    });
    if (!share.ok)
      return { kind: "error" as const, error: share.error, values: {} };
    return { kind: "ok" as const, plot, share, unitSizeFromBlock };
  }, [form]);

  return (
    <>
      <TopBar
        title={t(lang, "resultTitle")}
        back={{ href: "#/land", label: t(lang, "editInputs") }}
        side={<LangToggle />}
      />
      <main className="page" lang={lang}>
        {outcome.kind === "ok" ? (
          <Result lang={lang} outcome={outcome} />
        ) : (
          <div className="notice">
            <Icon name="alert" />
            <div className="notice__body">
              <p>
                {outcome.kind === "error"
                  ? errorText(lang, outcome.error, outcome.values)
                  : t(lang, "required")}
              </p>
              <a className="btn btn--small" href="#/land">
                {t(lang, "backToForm")}
              </a>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function Result({ lang, outcome }: { lang: Lang; outcome: LandownerOutcome }) {
  const { plot: r, share: s } = outcome;
  const n = (v: number, d = 2) => fmt(lang, v, d);
  const sqft = (v: number) => t(lang, "sqftValue", { n: n(v, 0) });
  const mft = (m: number) =>
    t(lang, "metresFeet", { m: n(m), ft: n(metresToFeet(m), 1) });

  return (
    <>
      <div className="result-hero">
        <div className="card card--accent">
          <p className="eyebrow">{t(lang, "yourShare")}</p>
          <span className="big-number">{sqft(s.ownerSqft)}</span>
          <p className="muted" style={{ margin: "0.3rem 0 0" }}>
            {t(lang, "aboutFlats", {
              n: n(s.ownerFlats, 0),
              size: n(s.input.unitSizeSqft, 0),
            })}
          </p>
        </div>
        <div className="card">
          <p className="eyebrow">{t(lang, "building")}</p>
          <span className="big-number big-number--sm">
            G+{n(r.floors.aboveGround, 0)}
          </span>
          <span className="small muted">
            {t(lang, "gPlusN", { n: n(r.floors.aboveGround, 0) })}
          </span>
        </div>
        <div className="card">
          <p className="eyebrow">{t(lang, "farUsed")}</p>
          <span className="big-number big-number--sm">
            {n(r.far.achievable, 3)}
          </span>
          <span className="small muted">{sqft(r.floorArea.totalSqft)}</span>
        </div>
      </div>

      <section className="card">
        <h2>{t(lang, "farCard")}</h2>
        <dl className="kv">
          <dt>{t(lang, "areaFar")}</dt>
          <dd>{n(r.far.area, 3)}</dd>
          <dt>{t(lang, "roadFar")}</dt>
          <dd>{n(r.far.road, 3)}</dd>
          <dt>{t(lang, "baseFar")}</dt>
          <dd>{n(r.far.base, 3)}</dd>
          <dt>{t(lang, "maxFar")}</dt>
          <dd>{n(r.far.max, 3)}</dd>
          {r.far.incentives.map((i) => (
            <FragmentRow
              key={i.id}
              label={`+ ${incentiveTitle(lang, i.id)}`}
              value={`+${n(i.far, 3)}`}
            />
          ))}
          {r.far.subdividedReduction > 0 && (
            <FragmentRow
              label={t(lang, "subdividedLess")}
              value={`−${n(r.far.subdividedReduction)}`}
            />
          )}
          <dt className="kv__total">{t(lang, "farUsed")}</dt>
          <dd className="kv__total">{n(r.far.achievable, 3)}</dd>
        </dl>
      </section>

      <section className="card">
        <h2>{t(lang, "sizeCard")}</h2>
        <dl className="kv">
          <dt>{t(lang, "totalFloor")}</dt>
          <dd>{sqft(r.floorArea.totalSqft)}</dd>
          {r.floorArea.roadWideningBonusSqft > 0 && (
            <FragmentRow
              label={t(lang, "roadBonus")}
              value={sqft(r.floorArea.roadWideningBonusSqft)}
            />
          )}
          <dt>
            {t(lang, "coverage")} ({n(r.coverage.pct)}%)
          </dt>
          <dd>{sqft(r.coverage.maxFootprintSqft)}</dd>
          <dt>{t(lang, "floorPlate")}</dt>
          <dd>{sqft(r.coverage.floorPlateSqft)}</dd>
          <dt>{t(lang, "floorsLine")}</dt>
          <dd>G+{n(r.floors.aboveGround, 0)}</dd>
          <dt>{t(lang, "perFloor")}</dt>
          <dd>{sqft(r.floors.perFloorSqft)}</dd>
        </dl>
      </section>

      <section className="card">
        <h2>{t(lang, "setbackCard")}</h2>
        <div className="setback-grid">
          <div>
            <span className="small muted">{t(lang, "front")}</span>
            <strong>{n(r.setbacks.frontM)}</strong>
            <span className="small muted">
              {mft(r.setbacks.frontM).replace(/^[^(]*/, "")}
            </span>
          </div>
          <div>
            <span className="small muted">{t(lang, "side")}</span>
            <strong>{n(r.setbacks.sideM)}</strong>
            <span className="small muted">
              {mft(r.setbacks.sideM).replace(/^[^(]*/, "")}
            </span>
          </div>
          <div>
            <span className="small muted">{t(lang, "rear")}</span>
            <strong>{n(r.setbacks.rearM)}</strong>
            <span className="small muted">
              {mft(r.setbacks.rearM).replace(/^[^(]*/, "")}
            </span>
          </div>
        </div>
        <p className="small muted" style={{ margin: "0.6rem 0 0" }}>
          {lang === "bn" ? "মিটারে; " : "In metres; "}
          {t(lang, "setbackRowNote", { storeys: n(r.setbacks.storeys, 0) })}
        </p>
      </section>

      <section className="card">
        <h2>{t(lang, "unitsCard")}</h2>
        <dl className="kv">
          {r.units.densityCap !== null && (
            <>
              <dt>{t(lang, "densityCap")}</dt>
              <dd>{n(r.units.densityCap, 0)}</dd>
            </>
          )}
          <dt>
            {t(lang, "sizeBasedUnits", { size: n(r.units.avgUnitSizeSqft, 0) })}
          </dt>
          <dd>{n(r.units.sizeBased, 0)}</dd>
          <dt className="kv__total">{t(lang, "estimateUnits")}</dt>
          <dd className="kv__total">{n(r.units.estimate, 0)}</dd>
        </dl>
        {r.units.extraWithApproval !== null &&
          r.units.extraWithApproval > 0 && (
            <p className="small muted" style={{ margin: "0.6rem 0 0" }}>
              {t(lang, "extraUnits", {
                pct: n(10, 0),
                n: n(r.units.extraWithApproval, 0),
              })}
            </p>
          )}
      </section>

      <section className="card">
        <h2>{t(lang, "shareCard")}</h2>
        <dl className="kv">
          <dt>{t(lang, "saleableArea", { pct: n(s.input.saleablePct) })}</dt>
          <dd>{sqft(s.saleableSqft)}</dd>
          <dt>{t(lang, "ownerArea", { pct: n(s.input.ownerPct) })}</dt>
          <dd>{sqft(s.ownerSqft)}</dd>
          <dt>{t(lang, "developerArea")}</dt>
          <dd>{sqft(s.developerSqft)}</dd>
          <dt>{t(lang, "ownerFlats", { size: n(s.input.unitSizeSqft, 0) })}</dt>
          <dd>{n(s.ownerFlats, 0)}</dd>
          <dt>{t(lang, "leftover")}</dt>
          <dd>{sqft(s.ownerLeftoverSqft)}</dd>
          {s.cashTaka > 0 && (
            <FragmentRow
              label={t(lang, "cashLine")}
              value={t(lang, "takaValue", { n: n(s.cashTaka, 0) })}
            />
          )}
        </dl>
        {s.overDensity && (
          <div className="notice" style={{ margin: "0.9rem 0 0" }}>
            <Icon name="alert" />
            <p className="notice__body small">
              {t(lang, "overDensity", {
                total: n(s.totalFlats, 0),
                cap: n(r.units.densityCap ?? 0, 0),
              })}
            </p>
          </div>
        )}
        <p className="small" style={{ margin: "0.9rem 0 0", fontWeight: 700 }}>
          {t(lang, "negotiationNote")}
        </p>
      </section>

      <details className="card plain">
        <summary>
          <Icon name="next" size={18} />
          {t(lang, "stepsTitle")}
        </summary>
        <ol className="step-list">
          {r.steps.map((step, i) => (
            <li key={i}>
              {stepText(lang, step)}
              {step.source && (
                <span className="source">
                  {t(lang, "sourceLabel")}: {sourceText(lang, step.source)}
                </span>
              )}
            </li>
          ))}
        </ol>
      </details>

      <section className="card">
        <h2>{t(lang, "assumptionsTitle")}</h2>
        <ul>
          {assumptions(lang, {
            interpolated: r.road.interpolated,
            incentivesUsed: r.far.incentives.length > 0,
            groupId: r.steps.find((st) => st.id === "roadFar")?.values
              .group as string,
            saleablePct: s.input.saleablePct,
            unitSizeSqft: s.input.unitSizeSqft,
            unitSizeFromBlock: outcome.unitSizeFromBlock,
          }).map((a) => (
            <li key={a} className="small">
              {a}
            </li>
          ))}
        </ul>
      </section>

      <section className="card disclaimer">
        <h2>{t(lang, "disclaimerTitle")}</h2>
        <p>{t(lang, "disclaimer")}</p>
        <p className="small muted" style={{ margin: 0 }}>
          {t(lang, "rulesVersion")}: {RULES_VERSION}
        </p>
      </section>

      <LandownerPdf lang={lang} outcome={outcome} />
    </>
  );
}

function FragmentRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

type PdfState =
  | { step: "idle" }
  | { step: "working" }
  | { step: "ready"; file: File; url: string }
  | { step: "error" };

function LandownerPdf({
  lang,
  outcome,
}: {
  lang: Lang;
  outcome: LandownerOutcome;
}) {
  const [state, setState] = useState<PdfState>({ step: "idle" });

  // A changed result or language makes an earlier PDF out of date.
  useEffect(() => setState({ step: "idle" }), [outcome, lang]);
  useEffect(() => {
    if (state.step !== "ready") return;
    return () => URL.revokeObjectURL(state.url);
  }, [state]);

  async function create() {
    setState({ step: "working" });
    try {
      const { createLandownerPdf, landownerFileName } =
        await import("../landowner/pdf.ts");
      const bytes = await createLandownerPdf(lang, outcome);
      const file = new File(
        [new Uint8Array(bytes)],
        landownerFileName(outcome),
        { type: "application/pdf" },
      );
      setState({ step: "ready", file, url: URL.createObjectURL(file) });
    } catch (error) {
      console.error(error);
      setState({ step: "error" });
    }
  }

  const canShare =
    state.step === "ready" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [state.file] });

  return (
    <section className="card">
      <div className="card__head">
        <span className="icon-tile">
          <Icon name="report" size={22} />
        </span>
        <h2>{t(lang, "pdfTitle")}</h2>
      </div>
      <p className="small muted">{t(lang, "pdfText")}</p>
      {state.step === "ready" ? (
        <>
          <p>
            <strong>{t(lang, "pdfReady")}</strong> {state.file.name}
          </p>
          <div className="btn-row">
            {canShare && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() =>
                  navigator
                    .share({
                      files: [state.file],
                      title: t(lang, "pdfHeading"),
                    })
                    .catch(() => {})
                }
              >
                <Icon name="share" size={18} />
                {t(lang, "sharePdf")}
              </button>
            )}
            <a
              className={`btn ${canShare ? "" : "btn--primary"}`}
              href={state.url}
              download={state.file.name}
            >
              <Icon name="download" size={18} />
              {t(lang, "savePdf")}
            </a>
          </div>
        </>
      ) : (
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={state.step === "working"}
          onClick={create}
        >
          {state.step === "working" ? t(lang, "makingPdf") : t(lang, "makePdf")}
        </button>
      )}
      {state.step === "error" && (
        <p className="small error-text" role="alert">
          {t(lang, "pdfFailed")}
        </p>
      )}
    </section>
  );
}
