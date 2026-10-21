/**
 * Names and text that are likely to change. Edit them here.
 */

/**
 * English and Bangla. Spelled out here rather than imported, because the
 * build config (vite.config.ts) reads this file too.
 */
type Bilingual = { en: string; bn: string };

/** Working title. Placeholder until a final app name is chosen. */
export const APP_TITLE = "Handover Check";

/** Display names for the severity levels in src/data/checklist.ts. */
export const SEVERITY_NAMES: Record<"minor" | "major" | "safety", Bilingual> = {
  minor: { en: "Minor", bn: "সামান্য" },
  major: { en: "Major", bn: "গুরুতর" },
  safety: { en: "Safety", bn: "ঝুঁকিপূর্ণ" },
};

/** Colours used for severity labels in the app and the PDF report. */
export const SEVERITY_COLOURS = {
  minor: "#7a6a00",
  major: "#b45309",
  safety: "#b91c1c",
};

/** Printed at the bottom of every page of the PDF reports. */
export const REPORT_FOOTER_TEXT: Bilingual = {
  en: `Made with ${APP_TITLE}`,
  bn: `${APP_TITLE} দিয়ে তৈরি`,
};
