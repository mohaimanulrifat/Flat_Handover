/**
 * Names and text that are likely to change. Edit them here.
 */

/** Working title. Placeholder until a final app name is chosen. */
export const APP_TITLE = "Handover Check";

/** Display names for the severity levels in src/data/checklist.ts. */
export const SEVERITY_NAMES = {
  minor: "Minor",
  major: "Major",
  safety: "Safety",
};

/** Colours used for severity labels in the app and the PDF report. */
export const SEVERITY_COLOURS = {
  minor: "#7a6a00",
  major: "#b45309",
  safety: "#b91c1c",
};

/** Printed at the bottom of every page of the PDF report. */
export const REPORT_FOOTER_TEXT = `Made with ${APP_TITLE}`;
