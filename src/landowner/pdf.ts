/**
 * PDF of a Landowner Calculator result, in the language on screen.
 * Loaded only when the owner asks for a PDF.
 */
import { PDFDocument } from "pdf-lib";
import { APP_TITLE } from "../config.ts";
import { createWriter, GREY, hexToRgb } from "../lib/pdfWriter.ts";
import { RULES_VERSION } from "../rules/index.ts";
import type { LandownerOutcome } from "../screens/LandownerResultScreen.tsx";
import { metresToFeet, sqftToKatha } from "./calc.ts";
import {
  assumptions,
  blockLabel,
  fmt,
  groupLabel,
  incentiveTitle,
  sourceText,
  stepText,
  t,
  type Lang,
} from "./i18n.ts";

const BRAND = hexToRgb("#26327a");

export async function createLandownerPdf(
  lang: Lang,
  outcome: LandownerOutcome,
): Promise<Uint8Array> {
  const { plot: r, share: s } = outcome;
  const doc = await PDFDocument.create();
  doc.setTitle(t(lang, "pdfHeading"));
  doc.setCreator(APP_TITLE);
  doc.setProducer(APP_TITLE);
  const w = await createWriter(doc);

  const n = (v: number, d = 2) => fmt(lang, v, d);
  const sqft = (v: number) => t(lang, "sqftValue", { n: n(v, 0) });
  const m = (v: number) =>
    t(lang, "metresFeet", { m: n(v), ft: n(metresToFeet(v), 1) });
  const group = String(
    r.steps.find((st) => st.id === "roadFar")?.values.group ?? "",
  );

  await w.paragraph(APP_TITLE, { size: 10, font: w.bold, color: BRAND });
  await w.paragraph(t(lang, "pdfHeading"), { size: 19, font: w.bold });
  await w.paragraph(
    new Date().toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB"),
    { size: 9, color: GREY },
  );
  w.space(10);

  // Inputs
  await w.heading(t(lang, "inputsTitle"), 13);
  await w.labelled(
    t(lang, "plotArea"),
    `${sqft(r.plot.grossSqft)} (${n(sqftToKatha(r.plot.grossSqft), 3)} ${t(lang, "unit_katha")})`,
  );
  if (r.plot.surrenderSqft > 0)
    await w.labelled(t(lang, "roadSurrender"), sqft(r.plot.surrenderSqft));
  await w.labelled(t(lang, "roadWidth"), m(r.road.widthM));
  await w.labelled(t(lang, "roadGroup"), groupLabel(lang, group));
  await w.labelled(t(lang, "block"), blockLabel(lang, r.block.id));
  await w.labelled(
    t(lang, "incentivesSection"),
    r.far.incentives.length
      ? r.far.incentives.map((i) => incentiveTitle(lang, i.id)).join(", ")
      : t(lang, "noIncentives"),
  );
  if (r.far.subdividedReduction > 0)
    await w.labelled(t(lang, "subdivided"), t(lang, "yes"));
  w.space(8);

  // Results
  await w.heading(t(lang, "resultTitle"), 13);
  await w.labelled(
    t(lang, "yourShare"),
    `${sqft(s.ownerSqft)}, ${t(lang, "aboutFlats", { n: n(s.ownerFlats, 0), size: n(s.input.unitSizeSqft, 0) })}`,
  );
  await w.labelled(
    t(lang, "building"),
    `G+${n(r.floors.aboveGround, 0)} (${t(lang, "gPlusN", { n: n(r.floors.aboveGround, 0) })})`,
  );
  w.space(6);

  await w.heading(t(lang, "farCard"), 11.5);
  await w.labelled(t(lang, "areaFar"), n(r.far.area, 3));
  await w.labelled(t(lang, "roadFar"), n(r.far.road, 3));
  await w.labelled(t(lang, "baseFar"), n(r.far.base, 3));
  await w.labelled(t(lang, "maxFar"), n(r.far.max, 3));
  for (const i of r.far.incentives)
    await w.labelled(`+ ${incentiveTitle(lang, i.id)}`, `+${n(i.far, 3)}`);
  if (r.far.subdividedReduction > 0)
    await w.labelled(
      t(lang, "subdividedLess"),
      `-${n(r.far.subdividedReduction)}`,
    );
  await w.labelled(t(lang, "farUsed"), n(r.far.achievable, 3));
  w.space(6);

  await w.heading(t(lang, "sizeCard"), 11.5);
  await w.labelled(t(lang, "totalFloor"), sqft(r.floorArea.totalSqft));
  if (r.floorArea.roadWideningBonusSqft > 0)
    await w.labelled(
      t(lang, "roadBonus"),
      sqft(r.floorArea.roadWideningBonusSqft),
    );
  await w.labelled(
    `${t(lang, "coverage")} (${n(r.coverage.pct)}%)`,
    sqft(r.coverage.maxFootprintSqft),
  );
  await w.labelled(t(lang, "floorPlate"), sqft(r.coverage.floorPlateSqft));
  await w.labelled(t(lang, "perFloor"), sqft(r.floors.perFloorSqft));
  w.space(6);

  await w.heading(t(lang, "setbackCard"), 11.5);
  await w.labelled(t(lang, "front"), m(r.setbacks.frontM));
  await w.labelled(t(lang, "side"), m(r.setbacks.sideM));
  await w.labelled(t(lang, "rear"), m(r.setbacks.rearM));
  await w.paragraph(
    t(lang, "setbackRowNote", { storeys: n(r.setbacks.storeys, 0) }),
    { size: 9, color: GREY },
  );
  w.space(6);

  await w.heading(t(lang, "unitsCard"), 11.5);
  if (r.units.densityCap !== null)
    await w.labelled(t(lang, "densityCap"), n(r.units.densityCap, 0));
  await w.labelled(
    t(lang, "sizeBasedUnits", { size: n(r.units.avgUnitSizeSqft, 0) }),
    n(r.units.sizeBased, 0),
  );
  await w.labelled(t(lang, "estimateUnits"), n(r.units.estimate, 0));
  w.space(6);

  await w.heading(t(lang, "shareCard"), 11.5);
  await w.labelled(
    t(lang, "saleableArea", { pct: n(s.input.saleablePct) }),
    sqft(s.saleableSqft),
  );
  await w.labelled(
    t(lang, "ownerArea", { pct: n(s.input.ownerPct) }),
    sqft(s.ownerSqft),
  );
  await w.labelled(t(lang, "developerArea"), sqft(s.developerSqft));
  await w.labelled(
    t(lang, "ownerFlats", { size: n(s.input.unitSizeSqft, 0) }),
    n(s.ownerFlats, 0),
  );
  await w.labelled(t(lang, "leftover"), sqft(s.ownerLeftoverSqft));
  if (s.cashTaka > 0)
    await w.labelled(
      t(lang, "cashLine"),
      t(lang, "takaValue", { n: n(s.cashTaka, 0) }),
    );
  if (s.overDensity) {
    await w.paragraph(
      t(lang, "overDensity", {
        total: n(s.totalFlats, 0),
        cap: n(r.units.densityCap ?? 0, 0),
      }),
      { size: 9.5 },
    );
  }
  await w.paragraph(t(lang, "negotiationNote"), { size: 10, font: w.bold });
  w.space(8);

  await w.heading(t(lang, "stepsTitle"), 11.5);
  for (const [i, step] of r.steps.entries()) {
    w.ensure(30);
    await w.paragraph(`${n(i + 1, 0)}. ${stepText(lang, step)}`, { size: 9 });
    if (step.source) {
      await w.paragraph(
        `${t(lang, "sourceLabel")}: ${sourceText(lang, step.source)}`,
        { size: 7.5, color: GREY, indent: 10 },
      );
    }
    w.space(2);
  }
  w.space(6);

  await w.heading(t(lang, "assumptionsTitle"), 11.5);
  const list = assumptions(lang, {
    interpolated: r.road.interpolated,
    incentivesUsed: r.far.incentives.length > 0,
    groupId: group,
    saleablePct: s.input.saleablePct,
    unitSizeSqft: s.input.unitSizeSqft,
    unitSizeFromBlock: outcome.unitSizeFromBlock,
  });
  for (const a of list) await w.paragraph(`- ${a}`, { size: 9 });
  w.space(8);

  w.ensure(60);
  await w.heading(t(lang, "disclaimerTitle"), 11.5);
  await w.paragraph(t(lang, "disclaimer"), { size: 10, font: w.bold });
  await w.paragraph(`${t(lang, "rulesVersion")}: ${RULES_VERSION}`, {
    size: 9,
    color: GREY,
  });

  await w.footers(t(lang, "landTitle"));
  return doc.save();
}

export function landownerFileName(outcome: LandownerOutcome): string {
  const katha = Math.round(sqftToKatha(outcome.plot.plot.grossSqft) * 10) / 10;
  return `landowner-estimate-block-${outcome.plot.block.id.toLowerCase()}-${katha}-katha.pdf`;
}
