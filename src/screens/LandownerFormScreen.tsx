import { useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "../components/Icon.tsx";
import { TopBar } from "../components/TopBar.tsx";
import type { AreaUnit, LengthUnit, RoadKind } from "../landowner/calc.ts";
import {
  parseForm,
  useLandownerForm,
  useLang,
  type FieldError,
  type LandownerForm,
} from "../landowner/form.ts";
import {
  blockLabel,
  fmt,
  groupLabel,
  t,
  type Lang,
  type StringKey,
} from "../landowner/i18n.ts";
import { navigate } from "../lib/route.ts";
import { rules } from "../rules/index.ts";
import { LangToggle } from "./HomeScreen.tsx";

const AREA_UNITS: AreaUnit[] = ["katha", "sqft", "m2"];
const LENGTH_UNITS: LengthUnit[] = ["ft", "m"];
const ROAD_KINDS: RoadKind[] = ["normal", "deadEndShort", "privateEnd"];

export function LandownerFormScreen() {
  const [lang] = useLang();
  const [form, update] = useLandownerForm();
  const [errors, setErrors] = useState<
    Partial<Record<keyof LandownerForm, FieldError>>
  >({});
  const block = rules.densityBlocks.find((b) => b.id === form.blockId);

  function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = parseForm(form);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      const first = Object.keys(parsed.errors)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setErrors({});
    navigate({ name: "landResult" });
  }

  const err = (key: keyof LandownerForm) =>
    errors[key] ? (
      <span className="field__error">
        {t(lang, errors[key] === "required" ? "required" : "notNumber")}
      </span>
    ) : null;

  const toggleIncentive = (id: string, on: boolean) => {
    const others =
      rules.incentives.items.find((i) => i.id === id)?.exclusiveWith ?? [];
    const next = form.incentives.filter(
      (x) => x !== id && !(on && others.includes(x)),
    );
    update({ incentives: on ? [...next, id] : next });
  };

  return (
    <>
      <TopBar
        title={t(lang, "landTitle")}
        back={{ href: "#/", label: lang === "bn" ? "হোম" : "Home" }}
        side={<LangToggle />}
      />
      <main className="page" lang={lang}>
        <p className="eyebrow">
          {lang === "bn" ? "যৌথ উদ্যোগ (জয়েন্ট ভেঞ্চার)" : "Joint venture"}
        </p>
        <h1>{t(lang, "landTitle")}</h1>
        <p className="lead">{t(lang, "landIntro")}</p>

        <form onSubmit={submit} noValidate>
          <Section icon="ruler" title={t(lang, "plotSection")}>
            <NumberWithUnit
              id="plotArea"
              label={t(lang, "plotArea")}
              value={form.plotArea}
              onValue={(v) => update({ plotArea: v })}
              unit={form.plotAreaUnit}
              units={AREA_UNITS}
              onUnit={(u) => update({ plotAreaUnit: u as AreaUnit })}
              lang={lang}
              error={err("plotArea")}
            />
          </Section>

          <Section icon="layers" title={t(lang, "roadSection")}>
            <NumberWithUnit
              id="roadWidth"
              label={t(lang, "roadWidth")}
              hint={t(lang, "roadWidthHint")}
              value={form.roadWidth}
              onValue={(v) => update({ roadWidth: v })}
              unit={form.roadWidthUnit}
              units={LENGTH_UNITS}
              onUnit={(u) => update({ roadWidthUnit: u as LengthUnit })}
              lang={lang}
              error={err("roadWidth")}
            />
            <fieldset className="choice-list">
              <legend>{t(lang, "roadKind")}</legend>
              {ROAD_KINDS.map((kind) => (
                <label className="choice" key={kind}>
                  <input
                    type="radio"
                    name="roadKind"
                    checked={form.roadKind === kind}
                    onChange={() => update({ roadKind: kind })}
                  />
                  <span className="choice__text">
                    {t(lang, `roadKind_${kind}` as StringKey)}
                  </span>
                </label>
              ))}
            </fieldset>
          </Section>

          <Section icon="globe" title={t(lang, "areaSection")}>
            <fieldset className="choice-list" id="f-roadGroup" tabIndex={-1}>
              <legend>{t(lang, "roadGroup")}</legend>
              {rules.roadFar.groups.map((g) => (
                <label className="choice" key={g.id}>
                  <input
                    type="radio"
                    name="roadGroup"
                    checked={form.roadGroup === g.id}
                    onChange={() => update({ roadGroup: g.id })}
                  />
                  <span className="choice__text">{groupLabel(lang, g.id)}</span>
                </label>
              ))}
              <span className="field__hint">{t(lang, "roadGroupHint")}</span>
              {err("roadGroup")}
            </fieldset>

            <label className="field">
              <span className="field__label">{t(lang, "block")}</span>
              <select
                id="f-blockId"
                className="select--full"
                value={form.blockId}
                onChange={(e) => update({ blockId: e.target.value })}
                aria-invalid={errors.blockId ? true : undefined}
              >
                <option value="">{t(lang, "chooseBlock")}</option>
                {rules.densityBlocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {blockLabel(lang, b.id)}
                  </option>
                ))}
              </select>
              <span className="field__hint">
                {block ? block.area_bn : t(lang, "blockHint")}
              </span>
              {err("blockId")}
            </label>
          </Section>

          <Section icon="next" title={t(lang, "moreSection")} collapsible>
            <div className="input-row">
              <label className="field" style={{ flex: 1 }}>
                <span className="field__label">{t(lang, "plotWidth")}</span>
                <input
                  id="f-plotWidth"
                  type="text"
                  inputMode="decimal"
                  value={form.plotWidth}
                  onChange={(e) => update({ plotWidth: e.target.value })}
                  aria-invalid={errors.plotWidth ? true : undefined}
                />
                {err("plotWidth")}
              </label>
              <label className="field" style={{ flex: 1 }}>
                <span className="field__label">{t(lang, "plotDepth")}</span>
                <input
                  id="f-plotDepth"
                  type="text"
                  inputMode="decimal"
                  value={form.plotDepth}
                  onChange={(e) => update({ plotDepth: e.target.value })}
                  aria-invalid={errors.plotDepth ? true : undefined}
                />
                {err("plotDepth")}
              </label>
              <label className="field">
                <span className="field__label">&nbsp;</span>
                <select
                  value={form.plotDimUnit}
                  onChange={(e) =>
                    update({ plotDimUnit: e.target.value as LengthUnit })
                  }
                  aria-label={t(lang, "plotWidth")}
                >
                  {LENGTH_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {t(lang, `unit_${u}` as StringKey)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <span
              className="field__hint"
              style={{ marginTop: "-0.5rem", marginBottom: "0.9rem" }}
            >
              {t(lang, "plotDimsHint")}
            </span>
            <NumberWithUnit
              id="roadSurrender"
              label={t(lang, "roadSurrender")}
              hint={t(lang, "roadSurrenderHint", {
                multiplier: fmt(
                  lang,
                  rules.farDerivation.roadWideningMultiplier,
                ),
              })}
              value={form.roadSurrender}
              onValue={(v) => update({ roadSurrender: v })}
              unit={form.roadSurrenderUnit}
              units={AREA_UNITS}
              onUnit={(u) => update({ roadSurrenderUnit: u as AreaUnit })}
              lang={lang}
              error={err("roadSurrender")}
            />
            <label className="choice">
              <input
                type="checkbox"
                checked={form.subdivided}
                onChange={(e) => update({ subdivided: e.target.checked })}
              />
              <span className="choice__text">
                {t(lang, "subdivided")}
                <span className="choice__note">
                  FAR −{fmt(lang, rules.farDerivation.subdividedReduction)}
                </span>
              </span>
            </label>
          </Section>

          <Section icon="bulb" title={t(lang, "incentivesSection")} collapsible>
            <p className="small muted">{t(lang, "incentivesHint")}</p>
            <div className="choice-list">
              {rules.incentives.items.map((item) => (
                <label className="choice" key={item.id}>
                  <input
                    type="checkbox"
                    checked={form.incentives.includes(item.id)}
                    onChange={(e) => toggleIncentive(item.id, e.target.checked)}
                  />
                  <span className="choice__text">
                    {lang === "bn" ? item.title_bn : item.title_en}
                    <span className="choice__note">
                      {incentiveNote(lang, item.id)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </Section>

          <Section icon="papers" title={t(lang, "dealSection")}>
            <div className="input-row">
              <TextField
                id="ownerPct"
                label={t(lang, "ownerPct")}
                hint={t(lang, "ownerPctHint")}
                value={form.ownerPct}
                onValue={(v) => update({ ownerPct: v })}
                error={err("ownerPct")}
              />
              <TextField
                id="saleablePct"
                label={t(lang, "saleablePct")}
                value={form.saleablePct}
                onValue={(v) => update({ saleablePct: v })}
                error={err("saleablePct")}
              />
            </div>
            <span
              className="field__hint"
              style={{ marginTop: "-0.5rem", marginBottom: "0.9rem" }}
            >
              {t(lang, "saleablePctHint")}
            </span>
            <TextField
              id="unitSize"
              label={t(lang, "unitSize")}
              hint={
                block
                  ? t(lang, "unitSizeHint", {
                      size: fmt(lang, block.avgUnitSizeSqft),
                    })
                  : t(lang, "unitSizeHintNoBlock")
              }
              value={form.unitSize}
              onValue={(v) => update({ unitSize: v })}
              error={err("unitSize")}
            />
            <TextField
              id="cash"
              label={t(lang, "cash")}
              value={form.cash}
              onValue={(v) => update({ cash: v })}
              error={err("cash")}
            />
          </Section>

          <button type="submit" className="btn btn--primary btn--block">
            {t(lang, "calculate")}
            <Icon name="next" size={18} />
          </button>
        </form>
      </main>
    </>
  );
}

function incentiveNote(lang: Lang, id: string): string {
  const item = rules.incentives.items.find((i) => i.id === id)!;
  if (item.kind === "byPlotSize") return t(lang, "incentivePlotSizeNote");
  if (item.kind === "perFootAbove") return t(lang, "incentiveWideRoadNote");
  const parts = [
    `${lang === "bn" ? "সর্বোচ্চ" : "up to"} +${fmt(lang, item.maxFar ?? 0)} FAR`,
  ];
  if (item.minKatha)
    parts.push(
      lang === "bn"
        ? `${fmt(lang, item.minKatha)} কাঠা বা বেশি`
        : `${item.minKatha} katha or more`,
    );
  if (item.onlySpontaneousArea)
    parts.push(
      lang === "bn" ? "শুধু অপরিকল্পিত এলাকা" : "unplanned areas only",
    );
  return parts.join(" · ");
}

function Section({
  icon,
  title,
  children,
  collapsible,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  title: string;
  children: ReactNode;
  collapsible?: boolean;
}) {
  const head = (
    <div
      className="card__head"
      style={collapsible ? { marginBottom: 0 } : undefined}
    >
      <span className="icon-tile">
        <Icon name={icon} size={22} />
      </span>
      <h2>{title}</h2>
    </div>
  );
  if (collapsible) {
    return (
      <details className="card plain">
        <summary style={{ color: "inherit" }}>{head}</summary>
        <div style={{ marginTop: "0.9rem" }}>{children}</div>
      </details>
    );
  }
  return (
    <section className="card">
      {head}
      {children}
    </section>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onValue: (v: string) => void;
  error: ReactNode;
}

function TextField({ id, label, hint, value, onValue, error }: TextFieldProps) {
  return (
    <label className="field" style={{ flex: 1 }}>
      <span className="field__label">{label}</span>
      <input
        id={`f-${id}`}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onValue(e.target.value)}
        aria-invalid={error ? true : undefined}
      />
      {hint && <span className="field__hint">{hint}</span>}
      {error}
    </label>
  );
}

interface NumberWithUnitProps extends TextFieldProps {
  unit: string;
  units: string[];
  onUnit: (u: string) => void;
  lang: Lang;
}

function NumberWithUnit({
  id,
  label,
  hint,
  value,
  onValue,
  unit,
  units,
  onUnit,
  lang,
  error,
}: NumberWithUnitProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={`f-${id}`}>
        {label}
      </label>
      <div className="input-row">
        <input
          id={`f-${id}`}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onValue(e.target.value)}
          aria-invalid={error ? true : undefined}
        />
        <select
          value={unit}
          onChange={(e) => onUnit(e.target.value)}
          aria-label={`${label}: ${lang === "bn" ? "একক" : "unit"}`}
        >
          {units.map((u) => (
            <option key={u} value={u}>
              {t(lang, `unit_${u}` as StringKey)}
            </option>
          ))}
        </select>
      </div>
      {hint && <span className="field__hint">{hint}</span>}
      {error}
    </div>
  );
}
