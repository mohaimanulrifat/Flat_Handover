/**
 * Shared PDF drawing for the app's reports: A4 pages, wrapped text,
 * headings, labels, badges and page footers. Text the built-in PDF font
 * cannot show (for example Bangla) is drawn by the browser and added as
 * an image, line by line.
 */
import {
  rgb,
  StandardFonts,
  type PDFDocument,
  type PDFFont,
  type PDFPage,
  type RGB,
} from "pdf-lib";
import { REPORT_FOOTER_TEXT } from "../config.ts";

// A4 in points.
export const PAGE_W = 595.28;
export const PAGE_H = 841.89;
export const MARGIN = 42;
export const FOOTER_H = 26;
export const CONTENT_W = PAGE_W - 2 * MARGIN;
export const LINE = 1.35;

export const BLACK = rgb(0.11, 0.11, 0.1);
export const GREY = rgb(0.38, 0.38, 0.35);
export const LIGHT = rgb(0.85, 0.85, 0.82);

export interface TextStyle {
  size?: number;
  font?: PDFFont;
  color?: RGB;
  indent?: number;
}

/** Keeps track of the current page and position while writing. */
export class Writer {
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

export function canEncode(font: PDFFont, text: string): boolean {
  try {
    font.encodeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Splits text into lines that fit `width`, breaking long words if needed. */
export function wrap(
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

export const RENDER_SCALE = 3;

/** Draws text with the phone's own fonts and returns one PNG per line. */
export async function renderLines(
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

export function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/** A Writer with Helvetica fonts on a new document. */
export async function createWriter(doc: PDFDocument): Promise<Writer> {
  return new Writer(
    doc,
    await doc.embedFont(StandardFonts.Helvetica),
    await doc.embedFont(StandardFonts.HelveticaBold),
  );
}
