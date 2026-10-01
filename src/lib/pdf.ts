import { PDFDocument, type PDFImage } from "pdf-lib";
import { APP_TITLE, SEVERITY_COLOURS, SEVERITY_NAMES } from "../config.ts";
import { severityLevels } from "../data/checklist.ts";
import { resizeImage } from "./image.ts";
import type { FlatDetails, Inspection } from "./inspection.ts";
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
  inspection: Inspection;
  report: Report;
  loadPhoto: (id: string) => Promise<Blob | null>;
  onProgress?: (message: string) => void;
}

export async function createReportPdf({
  inspection,
  report,
  loadPhoto,
  onProgress,
}: Options): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(
    `Handover inspection report${flatLabel(inspection.details, " - ")}`,
  );
  doc.setCreator(APP_TITLE);
  doc.setProducer(APP_TITLE);

  const w = await createWriter(doc);

  await writeCover(w, inspection, report);

  const photoTotal = [...report.safety, ...report.other]
    .flatMap((r) => r.problems)
    .reduce((n, p) => n + p.photos.length, 0);
  let photoCount = 0;
  const addPhoto = async (id: string) => {
    onProgress?.(`Adding photos (${++photoCount} of ${photoTotal})…`);
    const blob = await loadPhoto(id).catch(() => null);
    if (!blob) return null;
    const jpeg = await resizeImage(blob, PDF_PHOTO_EDGE, PDF_PHOTO_QUALITY);
    return doc.embedJpg(await jpeg.arrayBuffer());
  };

  await w.heading(`${SEVERITY_NAMES.safety} problems`, 15);
  if (report.safety.length === 0) {
    await w.paragraph(
      `No ${SEVERITY_NAMES.safety.toLowerCase()} problems were found.`,
      {
        color: GREY,
      },
    );
  }
  for (const room of report.safety) await writeRoom(w, room, addPhoto);

  w.space(10);
  await w.heading("Other problems, room by room", 15);
  if (report.other.length === 0) {
    await w.paragraph("No other problems were found.", { color: GREY });
  }
  for (const room of report.other) await writeRoom(w, room, addPhoto);

  w.space(10);
  await w.heading("Checked and OK", 15);
  await w.paragraph("Items checked and found OK during the visit.", {
    color: GREY,
    size: 9,
  });
  if (report.ok.length === 0) {
    await w.paragraph("None.", { color: GREY, size: 9 });
  }
  for (const { room, items } of report.ok) {
    w.ensure(30);
    await w.paragraph(room.name, { font: w.bold, size: 9 });
    await w.paragraph(items.map((i) => `${i.code} ${i.title}`).join("; "), {
      size: 8.5,
    });
    w.space(4);
  }

  await writeAcknowledgement(w);

  onProgress?.("Finishing…");
  await w.footers(flatLabel(inspection.details, ""));
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

function flatLabel(details: FlatDetails, prefix: string): string {
  const label = [details.project, details.flat && `Flat ${details.flat}`]
    .filter((s) => s.trim())
    .join(", ");
  return label ? prefix + label : "";
}

async function writeCover(w: Writer, inspection: Inspection, report: Report) {
  const { details, layout } = inspection;
  const { counts } = report;

  await w.paragraph(APP_TITLE, { size: 10, font: w.bold, color: BRAND });
  await w.paragraph("Handover inspection report", { size: 20, font: w.bold });
  w.space(6);

  const count = (n: number, one: string, many: string) =>
    `${n} ${n === 1 ? one : many}`;
  const rows: [string, string][] = [
    ["Project or building", details.project],
    ["Flat", details.flat],
    ["Buyer", details.buyer],
    ["Date of visit", details.date],
    [
      "Layout",
      layout
        ? [
            count(layout.bedrooms, "bedroom", "bedrooms"),
            count(layout.bathrooms, "bathroom", "bathrooms"),
            count(layout.balconies, "balcony", "balconies"),
          ].join(", ")
        : "",
    ],
  ];
  for (const [label, value] of rows) {
    if (value.trim()) await w.labelled(label, value);
  }

  w.space(8);
  await w.heading("Summary", 12);
  const bySeverity = [
    `${SEVERITY_NAMES.safety} ${counts.safety}`,
    `${SEVERITY_NAMES.major} ${counts.major}`,
    `${SEVERITY_NAMES.minor} ${counts.minor}`,
    ...(counts.unrated ? [`no severity given ${counts.unrated}`] : []),
  ].join(", ");
  await w.labelled("Problems found", `${counts.problems} (${bySeverity})`);
  await w.labelled("Checked OK", String(counts.ok));
  await w.labelled("Not applicable", String(counts.na));
  await w.labelled("Not checked", String(counts.unanswered));
  await w.labelled("Total items", String(counts.total));

  w.space(8);
  await w.heading("Severity levels", 12);
  for (const level of [...severityLevels].reverse()) {
    await w.labelled(
      SEVERITY_NAMES[level.id],
      level.meaning,
      hexToRgb(SEVERITY_COLOURS[level.id]),
    );
  }
  w.space(6);
  w.rule();
  w.space(14);
}

async function writeRoom(
  w: Writer,
  { room, problems }: RoomProblems,
  addPhoto: PhotoLoader,
) {
  const prepared: PreparedProblem[] = [];
  for (const p of problems) prepared.push(await prepareProblem(p, addPhoto));

  // Keep the room name on the same page as its first problem.
  w.ensure(24 + prepared[0].firstBlockH);
  w.space(4);
  await w.paragraph(room.name, { font: w.bold, size: 12.5, color: BRAND });
  w.space(2);
  for (const problem of prepared) await writeProblem(w, problem);
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

async function writeProblem(w: Writer, prepared: PreparedProblem) {
  const { entry: p, rows, missingPhotos } = prepared;
  w.ensure(prepared.firstBlockH);

  const label = (
    p.severity ? SEVERITY_NAMES[p.severity] : "No severity"
  ).toUpperCase();
  const colour = p.severity ? hexToRgb(SEVERITY_COLOURS[p.severity]) : GREY;
  const badgeW = await w.badge(label, colour);
  await w.paragraph(`${p.item.code}  ${p.item.title}`, {
    font: w.bold,
    size: 10.5,
    indent: badgeW + 6,
  });
  if (p.note) await w.paragraph(p.note, { size: 10 });
  if (missingPhotos > 0) {
    await w.paragraph(`${missingPhotos} photo(s) could not be added.`, {
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

async function writeAcknowledgement(w: Writer) {
  w.space(10);
  w.ensure(150);
  await w.heading("Acknowledgement", 15);
  await w.paragraph(
    "Received by the developer, with the agreed date for repairs.",
    { color: GREY, size: 9 },
  );
  for (const label of ["Name", "Signature", "Date", "Repair date"]) {
    w.space(16);
    w.page.drawText(`${label}:`, {
      x: MARGIN,
      y: w.y - 10,
      size: 10,
      font: w.regular,
      color: BLACK,
    });
    w.page.drawLine({
      start: { x: MARGIN + 80, y: w.y - 12 },
      end: { x: MARGIN + 320, y: w.y - 12 },
      thickness: 0.6,
      color: GREY,
    });
    w.space(12);
  }
}
