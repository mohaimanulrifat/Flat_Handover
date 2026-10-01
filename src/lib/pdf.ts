import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
  type RGB,
} from "pdf-lib";
import {
  APP_TITLE,
  REPORT_FOOTER_TEXT,
  SEVERITY_COLOURS,
  SEVERITY_NAMES,
} from "../config.ts";
import { severityLevels } from "../data/checklist.ts";
import { resizeImage } from "./image.ts";
import type { FlatDetails, Inspection } from "./inspection.ts";
import type { ProblemEntry, Report, RoomProblems } from "./report.ts";

// A4 in points.
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 42;
const FOOTER_H = 26;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const LINE = 1.35;

// Photos in the PDF are re-shrunk so a report with many photos stays small
// enough to send on WhatsApp or by email.
const PDF_PHOTO_EDGE = 1000;
const PDF_PHOTO_QUALITY = 0.7;
const PHOTOS_PER_ROW = 3;
const PHOTO_GAP = 8;
const PHOTO_MAX_H = 150;

const BLACK = rgb(0.11, 0.11, 0.1);
const GREY = rgb(0.38, 0.38, 0.35);
const LIGHT = rgb(0.85, 0.85, 0.82);
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

  const w = new Writer(
    doc,
    await doc.embedFont(StandardFonts.Helvetica),
    await doc.embedFont(StandardFonts.HelveticaBold),
  );

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

interface TextStyle {
  size?: number;
  font?: PDFFont;
  color?: RGB;
  indent?: number;
}

/** Keeps track of the current page and position while writing. */
class Writer {
  page!: PDFPage;
  y = 0;
  private doc: PDFDocument;
  regular: PDFFont;
  bold: PDFFont;

  constructor(doc: PDFDocument, regular: PDFFont, bold: PDFFont) {
    this.doc = doc;
    this.regular = regular;
    this.bold = bold;
    this.newPage();
  }

  newPage() {
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    this.y = PAGE_H - MARGIN;
  }

  /** Starts a new page if less than `height` is left on this one. */
  ensure(height: number) {
    if (this.y - height < MARGIN + FOOTER_H) this.newPage();
  }

  space(height: number) {
    this.y -= height;
  }

  rule() {
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: PAGE_W - MARGIN, y: this.y },
      thickness: 0.5,
      color: LIGHT,
    });
  }

  async heading(text: string, size: number) {
    this.ensure(size * 4);
    await this.paragraph(text, { font: this.bold, size });
    this.space(3);
  }

  /** Draws a coloured label at the current line and returns its width. */
  async badge(text: string, colour: RGB): Promise<number> {
    const size = 7.5;
    const white = rgb(1, 1, 1);
    if (canEncode(this.bold, text)) {
      const width = this.bold.widthOfTextAtSize(text, size) + 8;
      this.page.drawRectangle({
        x: MARGIN,
        y: this.y - 12,
        width,
        height: 12.5,
        color: colour,
      });
      this.page.drawText(text, {
        x: MARGIN + 4,
        y: this.y - 9.2,
        size,
        font: this.bold,
        color: white,
      });
      return width;
    }
    // A severity name the built-in font cannot show (for example Bangla).
    const [line] = await renderLines(text, size, CONTENT_W / 3, true, white);
    const image = line ? await this.doc.embedPng(line) : null;
    const textW = image ? image.width / RENDER_SCALE : 0;
    const width = textW + 8;
    this.page.drawRectangle({
      x: MARGIN,
      y: this.y - 12,
      width,
      height: 12.5,
      color: colour,
    });
    if (image) {
      this.page.drawImage(image, {
        x: MARGIN + 4,
        y: this.y - 12,
        width: textW,
        height: 12.5,
      });
    }
    return width;
  }

  /** "Label: value" on one or more lines, with the label in bold. */
  async labelled(label: string, value: string, labelColour = BLACK) {
    const size = 10;
    const labelText = `${label}: `;
    if (!canEncode(this.bold, labelText)) {
      // For example a severity name in Bangla: draw it all as one line.
      await this.paragraph(labelText + value, { size });
      return;
    }
    const labelW = this.bold.widthOfTextAtSize(labelText, size);
    this.ensure(size * LINE);
    this.page.drawText(labelText, {
      x: MARGIN,
      y: this.y - size,
      size,
      font: this.bold,
      color: labelColour,
    });
    await this.paragraph(value, { size, indent: labelW });
  }

  /** Wrapped text. Lines after the first also start at `indent`. */
  async paragraph(text: string, style: TextStyle = {}) {
    const { size = 10, font = this.regular, color = BLACK, indent = 0 } = style;
    const width = CONTENT_W - indent;
    const lineH = size * LINE;
    const clean = text.replace(/\r\n?/g, "\n").replace(/[\t\v\f]/g, " ");

    for (const para of clean.split("\n")) {
      if (canEncode(font, para)) {
        for (const line of wrap(para, font, size, width)) {
          this.ensure(lineH);
          this.page.drawText(line, {
            x: MARGIN + indent,
            y: this.y - size,
            size,
            font,
            color,
          });
          this.space(lineH);
        }
      } else {
        // Text the PDF's built-in font cannot show (for example Bangla) is
        // drawn by the browser and added as a picture, line by line.
        for (const line of await renderLines(
          para,
          size,
          width,
          font === this.bold,
          color,
        )) {
          const image = await this.doc.embedPng(line);
          this.ensure(lineH);
          this.page.drawImage(image, {
            x: MARGIN + indent,
            y: this.y - lineH,
            width: image.width / RENDER_SCALE,
            height: lineH,
          });
          this.space(lineH);
        }
      }
    }
  }

  /** Adds the footer to every page, now that the page count is known. */
  async footers(label: string) {
    const pages = this.doc.getPages();
    const size = 8;
    for (const [i, page] of pages.entries()) {
      const right = [label, `Page ${i + 1} of ${pages.length}`]
        .filter(Boolean)
        .join("  |  ");
      const y = MARGIN - 18;
      page.drawLine({
        start: { x: MARGIN, y: MARGIN - 6 },
        end: { x: PAGE_W - MARGIN, y: MARGIN - 6 },
        thickness: 0.5,
        color: LIGHT,
      });
      await this.drawSingleLine(page, REPORT_FOOTER_TEXT, MARGIN, y, size);
      const rightW = canEncode(this.regular, right)
        ? this.regular.widthOfTextAtSize(right, size)
        : CONTENT_W / 2;
      await this.drawSingleLine(page, right, PAGE_W - MARGIN - rightW, y, size);
    }
  }

  private async drawSingleLine(
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    size: number,
  ) {
    if (canEncode(this.regular, text)) {
      page.drawText(text, { x, y, size, font: this.regular, color: GREY });
      return;
    }
    const [line] = await renderLines(text, size, CONTENT_W / 2, false, GREY);
    if (!line) return;
    const image = await this.doc.embedPng(line);
    page.drawImage(image, {
      x,
      y: y - size * 0.3,
      width: image.width / RENDER_SCALE,
      height: size * LINE,
    });
  }
}

function canEncode(font: PDFFont, text: string): boolean {
  try {
    font.encodeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Splits text into lines that fit `width`, breaking long words if needed. */
function wrap(
  text: string,
  font: PDFFont,
  size: number,
  width: number,
): string[] {
  const fits = (s: string) => font.widthOfTextAtSize(s, size) <= width;
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/ +/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (fits(candidate)) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    while (!fits(line)) {
      let cut = line.length - 1;
      while (cut > 1 && !fits(line.slice(0, cut))) cut--;
      lines.push(line.slice(0, cut));
      line = line.slice(cut);
    }
  }
  if (line || lines.length === 0) lines.push(line);
  return lines;
}

const RENDER_SCALE = 3;

/** Draws text with the phone's own fonts and returns one PNG per line. */
async function renderLines(
  text: string,
  size: number,
  width: number,
  bold: boolean,
  colour: RGB,
): Promise<ArrayBuffer[]> {
  const font = `${bold ? "bold " : ""}${size * RENDER_SCALE}px system-ui, "Noto Sans Bengali", "Kohinoor Bangla", sans-serif`;
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = font;
  const maxW = width * RENDER_SCALE;

  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/ +/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (measure.measureText(candidate).width <= maxW || !line) line = candidate;
    else {
      lines.push(line);
      line = word;
    }
  }
  lines.push(line);

  const fill = `rgb(${colour.red * 255}, ${colour.green * 255}, ${colour.blue * 255})`;
  const out: ArrayBuffer[] = [];
  for (const text of lines) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(
      1,
      Math.ceil(Math.min(measure.measureText(text).width, maxW)),
    );
    canvas.height = Math.ceil(size * LINE * RENDER_SCALE);
    const ctx = canvas.getContext("2d")!;
    ctx.font = font;
    ctx.fillStyle = fill;
    ctx.textBaseline = "middle";
    ctx.fillText(text, 0, canvas.height / 2, maxW);
    const blob = await new Promise<Blob | null>((r) =>
      canvas.toBlob(r, "image/png"),
    );
    if (blob) out.push(await blob.arrayBuffer());
  }
  return out;
}

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}
