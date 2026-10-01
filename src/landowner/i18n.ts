/**
 * Bangla and English text for the Landowner Calculator. Bangla is the
 * default. Every string has both languages; t() fills in {placeholders}.
 */
import { rules, type Source } from "../rules/index.ts";
import type { ErrorId, Step } from "./calc.ts";
import type { ShareError } from "./share.ts";

export type Lang = "bn" | "en";

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/** Formats a number with Bangla digits in Bangla, grouped the local way. */
export function fmt(lang: Lang, n: number, maxDecimals = 2): string {
  return new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-IN", {
    maximumFractionDigits: maxDecimals,
  }).format(n);
}

/** Reads a number typed with Bangla or English digits. NaN if not a number. */
export function parseNumber(text: string): number {
  const ascii = text
    .trim()
    .replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)))
    .replace(/[,\s]/g, "");
  return ascii === "" || !/^\d*\.?\d+$|^\d+\.$/.test(ascii)
    ? NaN
    : Number(ascii);
}

const strings = {
  // Home
  homeTitle: { bn: "আপনি কী করতে চান?", en: "What would you like to do?" },
  homeChecklist: {
    bn: "ফ্ল্যাট বুঝে নেওয়ার চেকলিস্ট",
    en: "Flat handover checklist",
  },
  homeChecklistText: {
    bn: "হস্তান্তরের দিন ঘর ঘর দেখে নিন এবং ত্রুটির PDF রিপোর্ট তৈরি করুন। চেকলিস্টটি ইংরেজিতে।",
    en: "Check your new flat room by room on handover day and make a PDF defect report.",
  },
  homeLand: { bn: "জমির মালিকের হিসাব", en: "Landowner calculator" },
  homeLandText: {
    bn: "আপনার প্লটে কত বড় ভবন হতে পারে, আর ডেভেলপারের সাথে যৌথ চুক্তিতে আপনি কয়টি ফ্ল্যাট পেতে পারেন, তার আনুমানিক হিসাব।",
    en: "Estimate how big a building your plot allows, and how many flats you might get in a joint-venture deal with a developer.",
  },
  switchLang: { bn: "English", en: "বাংলা" },
  switchLangLabel: { bn: "Switch to English", en: "বাংলায় দেখুন" },

  // Form
  landTitle: { bn: "জমির মালিকের হিসাব", en: "Landowner calculator" },
  landIntro: {
    bn: "ডেভেলপারের সাথে যৌথ চুক্তির আগে নিজের জমির সম্ভাবনা বুঝে নিন। তথ্যগুলো দিন, ফলাফল আনুমানিক।",
    en: "Understand what your land allows before a joint-venture deal. Fill in the details; the result is an estimate.",
  },
  plotSection: { bn: "আপনার জমি", en: "Your plot" },
  plotArea: { bn: "জমির পরিমাণ", en: "Plot size" },
  unit_katha: { bn: "কাঠা", en: "katha" },
  unit_sqft: { bn: "বর্গফুট", en: "sq ft" },
  unit_m2: { bn: "বর্গমিটার", en: "m²" },
  unit_m: { bn: "মিটার", en: "m" },
  unit_ft: { bn: "ফুট", en: "ft" },
  roadSection: { bn: "সামনের রাস্তা", en: "Road next to the plot" },
  roadWidth: { bn: "রাস্তা কত চওড়া", en: "Road width" },
  roadWidthHint: {
    bn: "প্লটের পাশের বর্তমান রাস্তা। একাধিক রাস্তা থাকলে সবচেয়ে চওড়াটি দিন।",
    en: "The existing road next to the plot. If there are several, enter the widest.",
  },
  roadKind: { bn: "রাস্তার ধরন", en: "Type of road" },
  roadKind_normal: { bn: "সাধারণ রাস্তা", en: "Ordinary road" },
  roadKind_deadEndShort: {
    bn: "কানা গলি, প্লটসহ শেষ মাথা পর্যন্ত ৫০ মিটারের মধ্যে",
    en: "Dead-end lane, 50 m or less to its end",
  },
  roadKind_privateEnd: {
    bn: "রাস্তাটি আপনার প্লটেই শেষ, অন্য কেউ ব্যবহার করে না",
    en: "Road ends at your plot and nobody else uses it",
  },
  areaSection: { bn: "এলাকা", en: "Area" },
  roadGroup: { bn: "এলাকার ধরন", en: "Type of area" },
  roadGroupHint: {
    bn: "রাস্তাভিত্তিক FAR এর টেবিলের জন্য। গেজেটে কোন ব্লক কোন ধরনের তা বলা নেই, তাই নিজে বেছে নিন; নিশ্চিত না হলে স্থপতিকে জিজ্ঞেস করুন।",
    en: "Used for the road FAR table. The gazette does not say which block is which type, so choose one; ask an architect if unsure.",
  },
  block: { bn: "জনঘনত্ব ব্লক (DAP)", en: "Density block (DAP)" },
  blockHint: {
    bn: "DAP এর ম্যাপে আপনার জমি যে ব্লকে পড়ে।",
    en: "The block your plot is in on the DAP map.",
  },
  chooseBlock: { bn: "ব্লক বেছে নিন", en: "Choose a block" },
  moreSection: { bn: "আরও তথ্য (ঐচ্ছিক)", en: "More details (optional)" },
  plotWidth: {
    bn: "প্লটের প্রস্থ (রাস্তার দিকে)",
    en: "Plot width (road side)",
  },
  plotDepth: { bn: "প্লটের গভীরতা", en: "Plot depth" },
  plotDimsHint: {
    bn: "দিলে সেটব্যাক বাদ দিয়ে প্রতি তলা কত বড় হতে পারে তাও হিসাব হবে।",
    en: "If given, the floor size is also checked against the setbacks.",
  },
  roadSurrender: {
    bn: "রাস্তা চওড়া করতে যে জমি ছাড়বেন",
    en: "Land given for road widening",
  },
  roadSurrenderHint: {
    bn: "এই জমি প্লট থেকে বাদ যায়, কিন্তু এর {multiplier} গুণ মেঝে বাড়তি পাওয়া যায়।",
    en: "This land is taken off the plot, but you get {multiplier} times its area as extra floor area.",
  },
  subdivided: {
    bn: "জমিটি একটি বড় প্লট ভাগ করে তৈরি",
    en: "The plot was made by dividing a larger plot",
  },
  incentivesSection: {
    bn: "প্রণোদনা FAR (ঐচ্ছিক)",
    en: "Incentive FAR (optional)",
  },
  incentivesHint: {
    bn: "যে শর্তগুলো আপনি বা ডেভেলপার পূরণ করবেন সেগুলো বেছে নিন। প্রতিটির সর্বোচ্চ মান ধরা হবে; মোট FAR সর্বোচ্চ FAR ছাড়াবে না।",
    en: "Tick the conditions you or the developer will meet. The maximum of each is used; the total never goes above the maximum FAR.",
  },
  incentivePlotSizeNote: {
    bn: "জমির আকার অনুযায়ী মান",
    en: "value depends on plot size",
  },
  incentiveWideRoadNote: {
    bn: "৩০ ফুটের বেশি প্রতি ফুটে ০.০২, সর্বোচ্চ ১",
    en: "0.02 per foot above 30 ft, up to 1",
  },
  dealSection: { bn: "ডেভেলপারের সাথে চুক্তি", en: "Deal with the developer" },
  ownerPct: { bn: "আপনার ভাগ (%)", en: "Your share (%)" },
  ownerPctHint: { bn: "৫০ মানে ৫০:৫০ চুক্তি।", en: "50 means a 50:50 deal." },
  saleablePct: { bn: "বিক্রয়যোগ্য অংশ (%)", en: "Saleable area (%)" },
  saleablePctHint: {
    bn: "মোট মেঝের যে অংশ ফ্ল্যাট হবে; বাকিটা সিঁড়ি, লিফট, দেয়াল ইত্যাদি। এটি আইন নয়, নিজের মতো বদলান।",
    en: "The part of the total floor area that becomes flats; the rest is stairs, lift, walls and so on. This is not a rule; change it as you like.",
  },
  unitSize: {
    bn: "প্রতিটি ফ্ল্যাটের আকার (বর্গফুট)",
    en: "Size of each flat (sq ft)",
  },
  unitSizeHint: {
    bn: "খালি রাখলে এই ব্লকের গড় আকার {size} বর্গফুট ধরা হবে।",
    en: "Leave empty to use this block's average, {size} sq ft.",
  },
  unitSizeHintNoBlock: {
    bn: "খালি রাখলে ব্লকের গড় আকার ধরা হবে।",
    en: "Leave empty to use the block's average size.",
  },
  cash: {
    bn: "নগদ টাকা (সাইনিং মানি ইত্যাদি, ঐচ্ছিক)",
    en: "Cash payment (signing money etc., optional)",
  },
  calculate: { bn: "হিসাব দেখুন", en: "See the estimate" },
  required: { bn: "এটি দিতে হবে", en: "Required" },
  notNumber: { bn: "সংখ্যা লিখুন", en: "Enter a number" },

  // Result
  resultTitle: { bn: "আনুমানিক ফলাফল", en: "Estimate" },
  editInputs: { bn: "তথ্য বদলান", en: "Change details" },
  yourShare: { bn: "আপনার ভাগ", en: "Your share" },
  sqftValue: { bn: "{n} বর্গফুট", en: "{n} sq ft" },
  aboutFlats: {
    bn: "প্রায় {n}টি ফ্ল্যাট ({size} বর্গফুট করে)",
    en: "about {n} flats of {size} sq ft",
  },
  building: { bn: "ভবন", en: "Building" },
  gPlusN: { bn: "নিচতলা + {n} তলা", en: "Ground + {n} floors" },
  farUsed: { bn: "এই হিসাবের FAR", en: "FAR used" },
  farCard: {
    bn: "FAR (মেঝের ক্ষেত্রফলের অনুপাত)",
    en: "FAR (floor area ratio)",
  },
  areaFar: { bn: "এলাকাভিত্তিক FAR", en: "Area FAR" },
  roadFar: { bn: "রাস্তাভিত্তিক FAR", en: "Road FAR" },
  baseFar: {
    bn: "ভিত্তি FAR (শর্ত ছাড়াই পাবেন)",
    en: "Base FAR (no conditions)",
  },
  maxFar: {
    bn: "সর্বোচ্চ FAR (প্রণোদনাসহ)",
    en: "Maximum FAR (with incentives)",
  },
  incentiveAdded: { bn: "প্রণোদনা যোগ", en: "Incentives added" },
  subdividedLess: {
    bn: "ভাগ করা প্লটের জন্য কম",
    en: "Less for a subdivided plot",
  },
  sizeCard: { bn: "ভবনের আকার", en: "Building size" },
  totalFloor: { bn: "মোট মেঝের ক্ষেত্রফল", en: "Total floor area" },
  roadBonus: {
    bn: "রাস্তার জন্য জমি ছাড়ার বাড়তি মেঝে",
    en: "Extra floor area for road land",
  },
  coverage: { bn: "সর্বোচ্চ ভূমি আচ্ছাদন", en: "Maximum ground coverage" },
  floorPlate: { bn: "প্রতি তলার সর্বোচ্চ আয়তন", en: "Largest floor size" },
  floorsLine: { bn: "তলা", en: "Floors" },
  perFloor: { bn: "প্রতি তলায়", en: "Each floor" },
  setbackCard: {
    bn: "সেটব্যাক (সীমানা থেকে খালি জায়গা)",
    en: "Setbacks (open space from the boundary)",
  },
  front: { bn: "সামনে", en: "Front" },
  side: { bn: "দুই পাশে", en: "Each side" },
  rear: { bn: "পেছনে", en: "Rear" },
  metresFeet: { bn: "{m} মিটার ({ft} ফুট)", en: "{m} m ({ft} ft)" },
  setbackRowNote: {
    bn: "{storeys} তলা ভবনের জন্য",
    en: "for a {storeys}-storey building",
  },
  unitsCard: { bn: "ভবনে ফ্ল্যাটের সংখ্যা", en: "Flats in the building" },
  densityCap: {
    bn: "জনঘনত্ব অনুযায়ী সর্বোচ্চ",
    en: "Most allowed by density",
  },
  extraUnits: {
    bn: "অনুমোদন সাপেক্ষে আরও {pct}% পর্যন্ত: {n}টি",
    en: "up to {pct}% more with approval: {n}",
  },
  sizeBasedUnits: {
    bn: "গড় আকার ({size} বর্গফুট) ধরে",
    en: "At the average size ({size} sq ft)",
  },
  estimateUnits: { bn: "আনুমানিক মোট ফ্ল্যাট", en: "Estimated flats" },
  shareCard: { bn: "চুক্তির হিসাব", en: "The deal" },
  saleableArea: {
    bn: "বিক্রয়যোগ্য মেঝে ({pct}%)",
    en: "Saleable floor area ({pct}%)",
  },
  ownerArea: { bn: "আপনার ভাগ ({pct}%)", en: "Your share ({pct}%)" },
  developerArea: { bn: "ডেভেলপারের ভাগ", en: "Developer's share" },
  ownerFlats: {
    bn: "আপনার ফ্ল্যাট ({size} বর্গফুট করে)",
    en: "Your flats ({size} sq ft each)",
  },
  leftover: { bn: "পূর্ণ ফ্ল্যাটের পর বাকি", en: "Left after whole flats" },
  cashLine: { bn: "নগদ টাকা", en: "Cash payment" },
  takaValue: { bn: "{n} টাকা", en: "Tk {n}" },
  overDensity: {
    bn: "এই আকারে {total}টি ফ্ল্যাট হয়, কিন্তু জনঘনত্ব অনুযায়ী {cap}টির বেশি অনুমোদন নাও পেতে পারে। ফ্ল্যাট বড় করলে সংখ্যা কমবে।",
    en: "This size gives {total} flats, but density may allow no more than {cap}. Bigger flats mean fewer of them.",
  },
  negotiationNote: {
    bn: "এটি দর-কষাকষির জন্য একটি আনুমানিক হিসাব, চুক্তি নয়।",
    en: "This is a negotiation estimate, not a contract.",
  },
  stepsTitle: { bn: "কীভাবে হিসাব হলো", en: "How each number was worked out" },
  assumptionsTitle: { bn: "যা ধরে নেওয়া হয়েছে", en: "Assumptions used" },
  rulesVersion: { bn: "নিয়মের সংস্করণ", en: "Rules version" },
  disclaimerTitle: { bn: "জরুরি কথা", en: "Important" },
  disclaimer: {
    bn: "এটি একটি আনুমানিক হিসাব। চূড়ান্ত অনুমোদনযোগ্য মান রাজউক নির্ধারণ করবে, এবং নকশা অবশ্যই একজন নিবন্ধিত স্থপতি প্রস্তুত করে দাখিল করবেন।",
    en: "This is an approximate estimate. Final permissible values are decided by RAJUK, and the plan must be prepared and submitted by a registered architect.",
  },
  pdfTitle: { bn: "PDF রিপোর্ট", en: "PDF report" },
  pdfText: {
    bn: "এই ফলাফল PDF হিসেবে রাখুন বা শেয়ার করুন।",
    en: "Save or share this result as a PDF.",
  },
  makePdf: { bn: "PDF তৈরি করুন", en: "Make PDF" },
  makingPdf: { bn: "PDF তৈরি হচ্ছে…", en: "Making the PDF…" },
  pdfReady: { bn: "PDF তৈরি:", en: "PDF ready:" },
  sharePdf: { bn: "শেয়ার করুন", en: "Share" },
  savePdf: { bn: "সংরক্ষণ করুন", en: "Save" },
  pdfFailed: {
    bn: "PDF তৈরি করা যায়নি। আবার চেষ্টা করুন।",
    en: "The PDF could not be made. Please try again.",
  },
  pdfHeading: { bn: "জমির মালিকের আনুমানিক হিসাব", en: "Landowner estimate" },
  inputsTitle: { bn: "দেওয়া তথ্য", en: "Details entered" },
  noIncentives: { bn: "কোনোটি নয়", en: "None" },
  yes: { bn: "হ্যাঁ", en: "Yes" },
  sourceLabel: { bn: "সূত্র", en: "Source" },
  page: { bn: "পৃষ্ঠা", en: "page" },

  // Errors
  err_plotArea: {
    bn: "জমির পরিমাণ শূন্যের বেশি হতে হবে।",
    en: "The plot size must be more than zero.",
  },
  err_roadTooNarrow: {
    bn: "রাস্তা {minM} মিটারের কম চওড়া। টেবিলে এর জন্য কোনো FAR নেই।",
    en: "The road is narrower than {minM} m. The table has no FAR for it.",
  },
  err_classNotAllowed: {
    bn: "এই প্রস্থের রাস্তায় এই ধরনের ভবনের অনুমতি টেবিলে নেই।",
    en: "The table does not allow this type of building on a road this wide.",
  },
  err_unknownBlock: {
    bn: "এই ব্লকটি তালিকায় নেই।",
    en: "This block is not in the list.",
  },
  err_noResidential: {
    bn: "DAP অনুযায়ী এই ব্লকে আবাসিক ভবনের FAR শূন্য, অর্থাৎ আবাসিক নির্মাণ হয় না।",
    en: "Under the DAP, this block's residential FAR is zero, so no housing can be built.",
  },
  err_surrenderTooLarge: {
    bn: "রাস্তার জন্য ছাড়া জমি পুরো প্লটের সমান বা বেশি হতে পারে না।",
    en: "Land given for the road cannot be the whole plot or more.",
  },
  err_noRoomAfterSetbacks: {
    bn: "সেটব্যাক বাদ দিলে এই মাপের প্লটে ভবনের জায়গা থাকে না। প্রস্থ ও গভীরতা দেখে নিন।",
    en: "After setbacks there is no room for a building on a plot of this size. Check the width and depth.",
  },
  err_saleablePct: {
    bn: "বিক্রয়যোগ্য অংশ ১ থেকে ১০০ এর মধ্যে দিন।",
    en: "Saleable area must be between 1 and 100.",
  },
  err_ownerPct: {
    bn: "আপনার ভাগ ০ থেকে ১০০ এর মধ্যে দিন।",
    en: "Your share must be between 0 and 100.",
  },
  err_unitSize: {
    bn: "ফ্ল্যাটের আকার শূন্যের বেশি দিন।",
    en: "Flat size must be more than zero.",
  },
  err_totalFloor: { bn: "মোট মেঝে শূন্য।", en: "Total floor area is zero." },
  backToForm: { bn: "তথ্য ঠিক করুন", en: "Fix the details" },
} satisfies Record<string, Record<Lang, string>>;

export type StringKey = keyof typeof strings;

export function t(
  lang: Lang,
  key: StringKey,
  vars: Record<string, string | number> = {},
): string {
  return strings[key][lang].replace(/\{(\w+)\}/g, (_, name: string) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  );
}

export function errorText(
  lang: Lang,
  error: ErrorId | ShareError,
  values: Record<string, number | string> = {},
): string {
  const vars = Object.fromEntries(
    Object.entries(values).map(([k, v]) => [
      k,
      typeof v === "number" ? fmt(lang, v) : v,
    ]),
  );
  return t(lang, `err_${error}` as StringKey, vars);
}

// Names and sources --------------------------------------------------

export function groupLabel(lang: Lang, id: string): string {
  const g = rules.roadFar.groups.find((x) => x.id === id);
  return g ? (lang === "bn" ? g.label_bn : g.label_en) : id;
}

export function incentiveTitle(lang: Lang, id: string): string {
  const item = rules.incentives.items.find((x) => x.id === id);
  return item ? (lang === "bn" ? item.title_bn : item.title_en) : id;
}

export function blockLabel(lang: Lang, id: string): string {
  const b = rules.densityBlocks.find((x) => x.id === id);
  if (!b) return id;
  const no = lang === "bn" ? toBnDigits(b.id) : b.id;
  return `${lang === "bn" ? "ব্লক" : "Block"} ${no}: ${b.name_bn}`;
}

export function toBnDigits(text: string): string {
  return text.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

const DOC_NAMES: Record<string, Record<Lang, string>> = {
  "bidhimala-2025": {
    bn: "ঢাকা মহানগর ইমারত বিধিমালা ২০২৫",
    en: "Dhaka Imarat Bidhimala 2025",
  },
  "dap-2025-12": {
    bn: "DAP ২০২২-২০৩৫ (ডিসেম্বর ২০২৫ সংশোধনী)",
    en: "DAP 2022-2035 (Dec 2025 revision)",
  },
  "worked-examples-2016": {
    bn: "RAJUK উদাহরণ (২০১৬)",
    en: "RAJUK worked example (2016)",
  },
  "international definition": {
    bn: "আন্তর্জাতিক সংজ্ঞা",
    en: "International definition",
  },
};

export function sourceText(
  lang: Lang,
  source: Source | Source[] | undefined,
): string {
  if (!source) return "";
  const list = Array.isArray(source) ? source : [source];
  return list
    .map((s) => {
      const doc = DOC_NAMES[s.doc]?.[lang] ?? s.doc;
      const page =
        s.page && s.page !== "-" ? `, ${t(lang, "page")} ${s.page}` : "";
      return `${doc}: ${s.table}${page}`;
    })
    .join("; ");
}

// Calculation steps --------------------------------------------------

const SKIP_REASONS: Record<string, Record<Lang, string>> = {
  plotTooSmall: {
    bn: "জমি শর্তের চেয়ে ছোট",
    en: "the plot is smaller than required",
  },
  notSpontaneous: {
    bn: "শুধু অপরিকল্পিত (স্বতঃস্ফূর্ত) এলাকার জন্য",
    en: "only for unplanned (spontaneous) areas",
  },
  roadNotWide: {
    bn: "রাস্তা ৩০ ফুটের বেশি চওড়া নয়",
    en: "the road is not wider than 30 ft",
  },
  exclusive: {
    bn: "সাশ্রয়ী আবাসনের দুটির মধ্যে একটিই পাওয়া যায়",
    en: "only one of the two affordable-housing incentives applies",
  },
  none: { bn: "এই জমিতে প্রযোজ্য নয়", en: "does not apply to this plot" },
};

/** One line describing a calculation step, in plain words with the numbers. */
export function stepText(lang: Lang, step: Step): string {
  const v = step.values;
  const n = (key: string, d = 2) => fmt(lang, Number(v[key]), d);
  const bn = lang === "bn";
  const unitName = (u: unknown) => t(lang, `unit_${String(u)}` as StringKey);
  switch (step.id) {
    case "plotArea":
      return bn
        ? `জমি ${n("input", 3)} ${unitName(v.unit)} = ${n("sqft")} বর্গফুট = ${n("m2")} বর্গমিটার = ${n("katha", 3)} কাঠা (১ কাঠা = ৭২০ বর্গফুট)।`
        : `Plot ${n("input", 3)} ${unitName(v.unit)} = ${n("sqft")} sq ft = ${n("m2")} m² = ${n("katha", 3)} katha (1 katha = 720 sq ft).`;
    case "roadSurrender":
      return bn
        ? `রাস্তার জন্য ${n("surrenderSqft")} বর্গফুট বাদ দিয়ে হিসাবের জমি ${n("netSqft")} বর্গফুট (${n("netKatha", 3)} কাঠা)।`
        : `Taking ${n("surrenderSqft")} sq ft off for the road leaves ${n("netSqft")} sq ft (${n("netKatha", 3)} katha) for the calculation.`;
    case "roadWidth":
      return bn
        ? `রাস্তা ${n("input", 3)} ${unitName(v.unit)} = ${n("m", 3)} মিটার = ${n("ft")} ফুট।`
        : `Road ${n("input", 3)} ${unitName(v.unit)} = ${n("m", 3)} m = ${n("ft")} ft.`;
    case "areaFar":
      return bn
        ? `${blockLabel(lang, String(v.blockId))} এর এলাকাভিত্তিক FAR = ${n("far")}।`
        : `Area FAR for ${blockLabel(lang, String(v.blockId))} = ${n("far")}.`;
    case "roadFar": {
      const where = groupLabel(lang, String(v.group));
      if (v.method === "interpolated") {
        return bn
          ? `${n("widthM", 3)} মিটার রাস্তা ${n("fromM")} ও ${n("toM")} মিটারের মাঝে; FAR ${n("fromFar")} থেকে ${n("toFar")} এর মধ্যে আনুপাতিক হারে = ${n("far", 4)} (${where}, ${v.cls})।`
          : `A ${n("widthM", 3)} m road is between ${n("fromM")} m and ${n("toM")} m; FAR is taken in proportion between ${n("fromFar")} and ${n("toFar")} = ${n("far", 4)} (${where}, ${v.cls}).`;
      }
      return bn
        ? `${n("widthM", 3)} মিটার রাস্তার জন্য রাস্তাভিত্তিক FAR = ${n("far")} (${where}, ${v.cls})।`
        : `Road FAR for a ${n("widthM", 3)} m road = ${n("far")} (${where}, ${v.cls}).`;
    }
    case "baseMax":
      return bn
        ? `এলাকাভিত্তিক ${n("area")} ও রাস্তাভিত্তিক ${n("road", 4)} এর মধ্যে ছোটটি ভিত্তি FAR = ${n("base", 4)}, বড়টি সর্বোচ্চ FAR = ${n("max", 4)}।`
        : `Of area FAR ${n("area")} and road FAR ${n("road", 4)}, the smaller is the base FAR = ${n("base", 4)} and the larger is the maximum FAR = ${n("max", 4)}.`;
    case "smallGap":
      return bn
        ? `ভিত্তি ও সর্বোচ্চ FAR এর পার্থক্য ${n("gap")} বা কম, তাই শর্ত ছাড়াই সর্বোচ্চ FAR ${n("max", 4)} পাওয়া যায়।`
        : `Base and maximum FAR differ by ${n("gap")} or less, so the maximum FAR ${n("max", 4)} applies without conditions.`;
    case "incentive":
      return bn
        ? `প্রণোদনা: ${incentiveTitle(lang, String(v.incentiveId))} = +${n("far", 4)}।`
        : `Incentive: ${incentiveTitle(lang, String(v.incentiveId))} = +${n("far", 4)}.`;
    case "incentiveSkipped":
      return bn
        ? `প্রণোদনা বাদ: ${incentiveTitle(lang, String(v.incentiveId))}, কারণ ${SKIP_REASONS[String(v.reason)]?.bn ?? ""}।`
        : `Incentive not used: ${incentiveTitle(lang, String(v.incentiveId))}, because ${SKIP_REASONS[String(v.reason)]?.en ?? ""}.`;
    case "incentiveTotal":
      return v.capped
        ? bn
          ? `ভিত্তি ${n("base", 4)} + প্রণোদনা ${n("total", 4)} = ${n("sum", 4)}, কিন্তু সর্বোচ্চ FAR ${n("max", 4)} এর বেশি হয় না, তাই FAR = ${n("result", 4)}।`
          : `Base ${n("base", 4)} + incentives ${n("total", 4)} = ${n("sum", 4)}, but FAR cannot exceed the maximum ${n("max", 4)}, so FAR = ${n("result", 4)}.`
        : bn
          ? `ভিত্তি ${n("base", 4)} + প্রণোদনা ${n("total", 4)} = ${n("result", 4)}।`
          : `Base ${n("base", 4)} + incentives ${n("total", 4)} = ${n("result", 4)}.`;
    case "subdivided":
      return bn
        ? `ভাগ করা প্লট: ${n("before", 4)} − ${n("reduction")} = ${n("after", 4)}।`
        : `Subdivided plot: ${n("before", 4)} − ${n("reduction")} = ${n("after", 4)}.`;
    case "achievableFar":
      return bn
        ? `এই হিসাবে ব্যবহৃত FAR = ${n("far", 4)}।`
        : `FAR used in this estimate = ${n("far", 4)}.`;
    case "floorArea":
      return Number(v.bonusSqft) > 0
        ? bn
          ? `মোট মেঝে = ${n("netSqft")} × ${n("far", 4)} = ${n("fromFarSqft")} বর্গফুট, সাথে রাস্তার জমির ${n("multiplier")} গুণ ${n("bonusSqft")} বর্গফুট = ${n("totalSqft")} বর্গফুট।`
          : `Total floor area = ${n("netSqft")} × ${n("far", 4)} = ${n("fromFarSqft")} sq ft, plus ${n("multiplier")} × road land = ${n("bonusSqft")} sq ft, total ${n("totalSqft")} sq ft.`
        : bn
          ? `মোট মেঝে = ${n("netSqft")} বর্গফুট × ${n("far", 4)} = ${n("totalSqft")} বর্গফুট।`
          : `Total floor area = ${n("netSqft")} sq ft × ${n("far", 4)} = ${n("totalSqft")} sq ft.`;
    case "coverage":
      return bn
        ? `${n("netM2")} বর্গমিটার জমিতে সর্বোচ্চ ভূমি আচ্ছাদন ${n("pct")}%: ${n("netSqft")} × ${n("pct")}% = ${n("footprintSqft")} বর্গফুট।`
        : `For ${n("netM2")} m² of land the maximum ground coverage is ${n("pct")}%: ${n("netSqft")} × ${n("pct")}% = ${n("footprintSqft")} sq ft.`;
    case "setbackFootprint":
      return bn
        ? `সেটব্যাক বাদে জায়গা: (${n("widthM", 2)} − ২ × ${n("sideM")}) × (${n("depthM", 2)} − ${n("frontM")} − ${n("rearM")}) মিটার = ${n("footprintSqft")} বর্গফুট। প্রতি তলা = ${n("mgcSqft")} ও ${n("footprintSqft")} এর ছোটটি = ${n("plateSqft")} বর্গফুট।`
        : `Space inside setbacks: (${n("widthM", 2)} − 2 × ${n("sideM")}) × (${n("depthM", 2)} − ${n("frontM")} − ${n("rearM")}) m = ${n("footprintSqft")} sq ft. Floor size = smaller of ${n("mgcSqft")} and ${n("footprintSqft")} = ${n("plateSqft")} sq ft.`;
    case "floors":
      return bn
        ? `${n("totalSqft")} ÷ ${n("plateSqft")} = ${n("ratio", 2)}, তাই নিচতলার উপরে ${n("aboveGround", 0)} তলা, প্রতি তলা ${n("perFloorSqft")} বর্গফুট (নিচতলা পার্কিং; মোট ${n("storeys", 0)} তলা)।`
        : `${n("totalSqft")} ÷ ${n("plateSqft")} = ${n("ratio", 2)}, so ${n("aboveGround", 0)} floors above the ground floor, ${n("perFloorSqft")} sq ft each (ground floor parking; ${n("storeys", 0)} storeys in all).`;
    case "setbacks":
      return bn
        ? `${n("storeys", 0)} তলা ভবন (${String(v.rowLabel)}): পাশে ${n("sideM")} মিটার, পেছনে ${n("rearM")} মিটার; সামনে ${n("frontM")} মিটার।`
        : `${n("storeys", 0)}-storey building (${String(v.rowLabel)}): sides ${n("sideM")} m, rear ${n("rearM")} m; front ${n("frontM")} m.`;
    case "units":
      return v.densityCap === "-"
        ? bn
          ? `গড় আকার ধরে: ${n("totalSqft")} ÷ ${n("avgUnitSizeSqft")} = ${n("sizeBased", 0)}টি ফ্ল্যাট।`
          : `At the average size: ${n("totalSqft")} ÷ ${n("avgUnitSizeSqft")} = ${n("sizeBased", 0)} flats.`
        : bn
          ? `জনঘনত্ব: ${n("netKatha", 3)} কাঠা × ${n("unitsPerKatha")} = ${n("densityCap", 0)}টি (নিচের পূর্ণ সংখ্যা)। গড় আকারে: ${n("totalSqft")} ÷ ${n("avgUnitSizeSqft")} = ${n("sizeBased", 0)}টি। আনুমানিক = ছোটটি ${n("estimate", 0)}টি।`
          : `Density: ${n("netKatha", 3)} katha × ${n("unitsPerKatha")} = ${n("densityCap", 0)} (rounded down). At the average size: ${n("totalSqft")} ÷ ${n("avgUnitSizeSqft")} = ${n("sizeBased", 0)}. Estimate = the smaller, ${n("estimate", 0)}.`;
  }
}

// Assumptions --------------------------------------------------------

export interface AssumptionContext {
  interpolated: boolean;
  incentivesUsed: boolean;
  groupId: string;
  saleablePct: number;
  unitSizeSqft: number;
  unitSizeFromBlock: boolean;
}

export function assumptions(lang: Lang, ctx: AssumptionContext): string[] {
  const bn = lang === "bn";
  const list = [
    bn
      ? "ভবনটি ফ্ল্যাট বা অ্যাপার্টমেন্ট বাড়ি (শ্রেণি A3) ধরা হয়েছে।"
      : "The building is taken to be flats or apartments (class A3).",
    bn ? "১ কাঠা = ৭২০ বর্গফুট।" : "1 katha = 720 sq ft.",
    bn
      ? `রাস্তাভিত্তিক FAR এর জন্য এলাকার ধরন আপনি বেছে দিয়েছেন: ${groupLabel(lang, ctx.groupId)}।`
      : `You chose the area type for the road FAR: ${groupLabel(lang, ctx.groupId)}.`,
    bn
      ? "নিচতলা গাড়ি পার্কিং, FAR এর হিসাবে ধরা হয়নি (নিচতলা + N তলা)। পার্কিং কতটা বাদ যাবে তা প্রয়োজনীয় পার্কিংয়ের উপর নির্ভর করে।"
      : "The ground floor is parking and not counted in FAR (ground + N floors). How much parking is left out depends on the parking required.",
    bn
      ? "সেটব্যাকের জন্য নিচতলাকেও একটি তলা গোনা হয়েছে।"
      : "The ground floor is counted as a storey for setbacks.",
    bn
      ? "সামনের সেটব্যাক: রাস্তার মাঝখান থেকে ৪.৫ মিটার বা সীমানা থেকে ১.৫ মিটার, যেটি বেশি; রাস্তার মাঝখান সীমানা থেকে রাস্তার অর্ধেক প্রস্থ দূরে ধরা হয়েছে।"
      : "Front setback: 4.5 m from the road centre or 1.5 m from the boundary, whichever is more; the road centre is taken as half the road width from the boundary.",
    bn
      ? "ফ্ল্যাটের সংখ্যা নিচের পূর্ণ সংখ্যায় নেওয়া হয়েছে।"
      : "Numbers of flats are rounded down.",
    bn
      ? `বিক্রয়যোগ্য অংশ ${fmt(lang, ctx.saleablePct)}% ধরা হয়েছে; এটি আইন নয়।`
      : `Saleable area is taken as ${fmt(lang, ctx.saleablePct)}%; this is not a rule.`,
    ctx.unitSizeFromBlock
      ? bn
        ? `প্রতিটি ফ্ল্যাট ${fmt(lang, ctx.unitSizeSqft)} বর্গফুট, এই ব্লকের গড় আকার (DAP পরিশিষ্ট ৩.৬)।`
        : `Each flat is ${fmt(lang, ctx.unitSizeSqft)} sq ft, this block's average size (DAP Appendix 3.6).`
      : bn
        ? `প্রতিটি ফ্ল্যাট ${fmt(lang, ctx.unitSizeSqft)} বর্গফুট (আপনার দেওয়া)।`
        : `Each flat is ${fmt(lang, ctx.unitSizeSqft)} sq ft (as you entered).`,
  ];
  if (ctx.interpolated) {
    list.push(
      bn
        ? "রাস্তার প্রস্থ টেবিলের দুই ধাপের মাঝে, তাই FAR আনুপাতিক হারে নেওয়া হয়েছে (বিধি ৪৭(৬))।"
        : "The road width is between two table steps, so FAR is taken in proportion (Rule 47(6)).",
    );
  }
  if (ctx.incentivesUsed) {
    list.push(
      bn
        ? "প্রতিটি প্রণোদনার সর্বোচ্চ মান ধরা হয়েছে; রাজউক কম দিতে পারে।"
        : "The maximum of each incentive is used; RAJUK may give less.",
    );
  }
  list.push(
    bn
      ? "কিছু নিয়ম গেজেটে পরিষ্কার নয়; এই হিসাবে সেগুলোর একটি সাধারণ ব্যাখ্যা নেওয়া হয়েছে এবং যাচাইয়ের তালিকায় রাখা হয়েছে।"
      : "Some rules are unclear in the gazettes; this estimate uses a plain reading of them, listed for checking.",
  );
  return list;
}
