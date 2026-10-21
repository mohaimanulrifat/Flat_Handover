import { PDFDocument, type PDFImage } from "pdf-lib";
import { APP_TITLE, SEVERITY_COLOURS, SEVERITY_NAMES } from "../config.ts";
import { severityLevels } from "../data/checklist.ts";
import { t } from "./i18n.ts";
import { resizeImage } from "./image.ts";
import type { FlatDetails, Inspection } from "./inspection.ts";
import { fmt, type Lang } from "./lang.ts";
import {
  BLACK,
  CONTENT_W,
  createWriter,
  GREY,
  hexToRgb,
  LINE,
  MARGIN,
  type Writer,
} from "./pdfWriter.ts";
import type { ProblemEntry, Report, RoomProblems } from "./report.ts";

// Photos in the PDF are re-shrunk so a report with many photos stays small
// enough to send on WhatsApp or by email.
const PDF_PHOTO_EDGE = 1000;
const PDF_PHOTO_QUALITY = 0.7;
const PHOTOS_PER_ROW = 3;
const PHOTO_GAP = 8;
const PHOTO_MAX_H = 150;

const BRAND = hexToRgb("#26327a"); // Nocturne night indigo, on paper

interface Options {
  lang: Lang;
  inspection: Inspection;
  report: Report;
  loadPhoto: (id: string) => Promise<Blob | null>;
  onProgress?: (message: string) => void;
}

export async function createReportPdf({
  lang,
  inspection,
  report,
  loadPhoto,
  onProgress,
}: Options): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(
    `${t(lang, "reportTitle")}${flatLabel(lang, inspection.details, " - ")}`,
  );
  doc.setCreator(APP_TITLE);
  doc.setProducer(APP_TITLE);

  const w = await createWriter(doc);

  await writeCover(w, lang, inspection, report);

  const photoTotal = [...report.safety, ...report.other]
    .flatMap((r) => r.problems)
    .reduce((n, p) => n + p.photos.length, 0);
  let photoCount = 0;
  const addPhoto = async (id: string) => {
    onProgress?.(
      t(lang, "addingPhotos", { n: ++photoCount, total: photoTotal }),
    );
    const blob = await loadPhoto(id).catch(() => null);
    if (!blob) return null;
    const jpeg = await resizeImage(blob, PDF_PHOTO_EDGE, PDF_PHOTO_QUALITY);
    return doc.embedJpg(await jpeg.arrayBuffer());
  };

  const safetyName = SEVERITY_NAMES.safety[lang];
  await w.heading(t(lang, "severityProblems", { name: safetyName }), 15);
  if (report.safety.length === 0) {
    await w.paragraph(
      t(lang, "pdfNoSeverityProblems", {
        name: lang === "en" ? safetyName.toLowerCase() : safetyName,
      }),
      { color: GREY },
    );
  }
  for (const room of report.safety) await writeRoom(w, lang, room, addPhoto);

  w.space(10);
  await w.heading(t(lang, "pdfOtherProblems"), 15);
  if (report.other.length === 0) {
    await w.paragraph(t(lang, "pdfNoOtherProblems"), { color: GREY });
  }
  for (const room of report.other) await writeRoom(w, lang, room, addPhoto);

  w.space(10);
  await w.heading(t(lang, "pdfCheckedOk"), 15);
  await w.paragraph(t(lang, "pdfCheckedOkText"), { color: GREY, size: 9 });
  if (report.ok.length === 0) {
    await w.paragraph(t(lang, "pdfNone"), { color: GREY, size: 9 });
  }
  for (const { room, items } of report.ok) {
    w.ensure(30);
    await w.paragraph(room.name[lang], { font: w.bold, size: 9 });
    await w.paragraph(
      items.map((i) => `${i.code} ${i.title[lang]}`).join("; "),
      { size: 8.5 },
    );
    w.space(4);
  }

  await writeAcknowledgement(w, lang);

  onProgress?.(t(lang, "finishing"));
  await w.footers(flatLabel(lang, inspection.details, ""), lang);
  return doc.save();
}

/** File name for the PDF, for example "handover-report-5b-2026-10-01.pdf". */
export function reportFileName(details: FlatDetails): string {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  return ["handover-report", slug(details.flat), slug(details.date)]
    .filter(Boolean)
    .join("-")
    .concat(".pdf");
}

function flatLabel(lang: Lang, details: FlatDetails, prefix: string): string {
  const label = [
    details.project,
    details.flat && t(lang, "flatNo", { flat: details.flat }),
  ]
    .filter((s) => s.trim())
    .join(", ");
  return label ? prefix + label : "";
}

async function writeCover(
  w: Writer,
  lang: Lang,
  inspection: Inspection,
  report: Report,
) {
  const { details, layout } = inspection;
  const { counts } = report;
  const n = (value: number) => fmt(lang, value);

  await w.paragraph(APP_TITLE, { size: 10, font: w.bold, color: BRAND });
  await w.paragraph(t(lang, "reportTitle"), { size: 20, font: w.bold });
  w.space(6);

  const rows: [string, string][] = [
    [t(lang, "pdfProject"), details.project],
    [t(lang, "pdfFlat"), details.flat],
    [t(lang, "pdfBuyer"), details.buyer],
    [t(lang, "visitDate"), details.date],
    [
      t(lang, "pdfLayout"),
      layout
        ? [
            t(lang, "pdfBedrooms", { n: layout.bedrooms }),
            t(lang, "pdfBathrooms", { n: layout.bathrooms }),
            t(lang, "pdfBalconies", { n: layout.balconies }),
          ].join(", ")
        : "",
    ],
  ];
  for (const [label, value] of rows) {
    if (value.trim()) await w.labelled(label, value);
  }

  w.space(8);
  await w.heading(t(lang, "pdfSummary"), 12);
  const bySeverity = [
    `${SEVERITY_NAMES.safety[lang]} ${n(counts.safety)}`,
    `${SEVERITY_NAMES.major[lang]} ${n(counts.major)}`,
    `${SEVERITY_NAMES.minor[lang]} ${n(counts.minor)}`,
    ...(counts.unrated
      ? [t(lang, "pdfNoSeverityGiven", { n: counts.unrated })]
      : []),
  ].join(", ");
  await w.labelled(
    t(lang, "pdfProblemsFound"),
    `${n(counts.problems)} (${bySeverity})`,
  );
  await w.labelled(t(lang, "statusOk"), n(counts.ok));
  await w.labelled(t(lang, "statusNa"), n(counts.na));
  await w.labelled(t(lang, "notChecked"), n(counts.unanswered));
  await w.labelled(t(lang, "pdfTotalItems"), n(counts.total));

  w.space(8);
  await w.heading(t(lang, "pdfSeverityLevels"), 12);
  for (const level of [...severityLevels].reverse()) {
    await w.labelled(
      SEVERITY_NAMES[level.id][lang],
      level.meaning[lang],
      hexToRgb(SEVERITY_COLOURS[level.id]),
    );
  }
  w.space(6);
  w.rule();
  w.space(14);
}

async function writeRoom(
  w: Writer,
  lang: Lang,
  { room, problems }: RoomProblems,
  addPhoto: PhotoLoader,
) {
  const prepared: PreparedProblem[] = [];
  for (const p of problems) prepared.push(await prepareProblem(p, addPhoto));

  // Keep the room name on the same page as its first problem.
  w.ensure(24 + prepared[0].firstBlockH);
  w.space(4);
  await w.paragraph(room.name[lang], {
    font: w.bold,
    size: 12.5,
    color: BRAND,
  });
  w.space(2);
  for (const problem of prepared) await writeProblem(w, lang, problem);
}

type PhotoLoader = (id: string) => Promise<PDFImage | null>;
type PhotoRow = { img: PDFImage; width: number; height: number }[];

interface PreparedProblem {
  entry: ProblemEntry;
  rows: PhotoRow[];
  missingPhotos: number;
  /** Height of the title, note and first row of photos. */
  firstBlockH: number;
}

const CELL_W = (CONTENT_W - PHOTO_GAP * (PHOTOS_PER_ROW - 1)) / PHOTOS_PER_ROW;
const rowHeight = (row: PhotoRow) => Math.max(...row.map((r) => r.height));

/** Loads a problem's photos and works out how much space it needs. */
async function prepareProblem(
  entry: ProblemEntry,
  addPhoto: PhotoLoader,
): Promise<PreparedProblem> {
  const images: PDFImage[] = [];
  for (const id of entry.photos) {
    const image = await addPhoto(id);
    if (image) images.push(image);
  }
  const rows: PhotoRow[] = [];
  for (let i = 0; i < images.length; i += PHOTOS_PER_ROW) {
    rows.push(
      images.slice(i, i + PHOTOS_PER_ROW).map((img) => {
        const scale = Math.min(CELL_W / img.width, PHOTO_MAX_H / img.height);
        return { img, width: img.width * scale, height: img.height * scale };
      }),
    );
  }
  // A rough estimate is enough to avoid splitting a problem across pages.
  const noteH = Math.ceil(entry.note.length / 90) * 10 * LINE;
  return {
    entry,
    rows,
    missingPhotos: entry.photos.length - images.length,
    firstBlockH: 20 + noteH + (rows.length ? rowHeight(rows[0]) + 4 : 0),
  };
}

async function writeProblem(w: Writer, lang: Lang, prepared: PreparedProblem) {
  const { entry: p, rows, missingPhotos } = prepared;
  w.ensure(prepared.firstBlockH);

  const label = (
    p.severity ? SEVERITY_NAMES[p.severity][lang] : t(lang, "noSeverity")
  ).toUpperCase();
  const colour = p.severity ? hexToRgb(SEVERITY_COLOURS[p.severity]) : GREY;
  const badgeW = await w.badge(label, colour);
  await w.paragraph(`${p.item.code}  ${p.item.title[lang]}`, {
    font: w.bold,
    size: 10.5,
    indent: badgeW + 6,
  });
  if (p.note) await w.paragraph(p.note, { size: 10 });
  if (missingPhotos > 0) {
    await w.paragraph(t(lang, "pdfPhotosMissing", { n: missingPhotos }), {
      size: 8.5,
      color: GREY,
    });
  }

  for (const row of rows) {
    const rowH = rowHeight(row);
    w.space(4);
    w.ensure(rowH);
    row.forEach((r, n) => {
      w.page.drawImage(r.img, {
        x: MARGIN + n * (CELL_W + PHOTO_GAP),
        y: w.y - r.height,
        width: r.width,
        height: r.height,
      });
    });
    w.space(rowH);
  }

  w.space(8);
  w.rule();
  w.space(10);
}

async function writeAcknowledgement(w: Writer, lang: Lang) {
  w.space(10);
  w.ensure(150);
  await w.heading(t(lang, "pdfAcknowledgement"), 15);
  await w.paragraph(t(lang, "pdfAcknowledgementText"), {
    color: GREY,
    size: 9,
  });
  // Bangla labels are wider, so their signature lines start further right.
  const lineX = MARGIN + (lang === "bn" ? 100 : 80);
  for (const key of [
    "pdfName",
    "pdfSignature",
    "pdfDate",
    "pdfRepairDate",
  ] as const) {
    w.space(16);
    await w.drawSingleLine(
      w.page,
      `${t(lang, key)}:`,
      MARGIN,
      w.y - 10,
      10,
      BLACK,
    );
    w.page.drawLine({
      start: { x: lineX, y: w.y - 12 },
      end: { x: lineX + 240, y: w.y - 12 },
      thickness: 0.6,
      color: GREY,
    });
    w.space(12);
  }
}
