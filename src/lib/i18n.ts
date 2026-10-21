/**
 * English and Bangla text for the home screen, the parts shared by both
 * services, and the flat handover checklist screens and PDF. The checklist
 * items themselves are in src/data/checklist.ts, and the Landowner
 * Calculator's text is in src/landowner/i18n.ts.
 */
import { fmt, type Lang } from "./lang.ts";

interface Entry {
  en: string;
  bn: string;
  /** English when {n} is 1, for example "1 problem" instead of "1 problems". */
  enOne?: string;
}

export const strings = {
  // App
  saveFailed: {
    en: "Your answers cannot be saved on this phone. Do not close this page, or turn off private browsing and try again.",
    bn: "আপনার উত্তর এই ফোনে সংরক্ষণ করা যাচ্ছে না। পেজটি বন্ধ করবেন না, অথবা প্রাইভেট ব্রাউজিং বন্ধ করে আবার চেষ্টা করুন।",
  },
  updateReady: {
    en: "A new version of the app is ready.",
    bn: "অ্যাপের নতুন সংস্করণ তৈরি।",
  },
  updateNow: { en: "Update now", bn: "এখনই আপডেট করুন" },
  backTo: { en: "Back to {label}", bn: "ফিরে যান: {label}" },
  backHome: { en: "Back to home", bn: "হোমে ফিরে যান" },
  home: { en: "Home", bn: "হোম" },
  toDaylight: { en: "Switch to Daylight mode", bn: "দিনের মোডে যান" },
  toNight: { en: "Switch to Night mode", bn: "রাতের মোডে যান" },
  daylightMode: { en: "Daylight mode", bn: "দিনের মোড" },
  nightMode: { en: "Night mode", bn: "রাতের মোড" },
  // The language button shows the language it switches to.
  switchLang: { en: "বাংলা", bn: "English" },
  switchLangLabel: { en: "বাংলায় দেখুন", bn: "Switch to English" },

  // Home
  homeTitle: { en: "What would you like to do?", bn: "আপনি কী করতে চান?" },
  homeChecklist: {
    en: "Flat handover checklist",
    bn: "ফ্ল্যাট বুঝে নেওয়ার চেকলিস্ট",
  },
  homeChecklistText: {
    en: "Check your new flat room by room on handover day and make a PDF defect report.",
    bn: "হস্তান্তরের দিন ঘর ধরে ধরে নতুন ফ্ল্যাট দেখে নিন এবং ত্রুটির PDF রিপোর্ট তৈরি করুন।",
  },
  homeLand: { en: "Landowner calculator", bn: "জমির মালিকের হিসাব" },
  homeLandText: {
    en: "Estimate how big a building your plot allows, and how many flats you might get in a joint-venture deal with a developer.",
    bn: "আপনার প্লটে কত বড় ভবন হতে পারে, আর ডেভেলপারের সাথে যৌথ চুক্তিতে আপনি কয়টি ফ্ল্যাট পেতে পারেন, তার আনুমানিক হিসাব।",
  },

  // Start screen
  heroEyebrow: {
    en: "Flat handover inspection",
    bn: "ফ্ল্যাট হস্তান্তরের পরিদর্শন",
  },
  heroTitle: { en: "Check your new flat", bn: "নতুন ফ্ল্যাট দেখে নিন," },
  heroTitleEm: { en: "before you sign.", bn: "সই করার আগেই।" },
  heroLead: {
    en: "A room-by-room checklist for the day you receive your flat. Mark each item OK or Problem, take photos, and make a PDF report to give the developer.",
    bn: "ফ্ল্যাট বুঝে নেওয়ার দিনের জন্য ঘর ধরে ধরে চেকলিস্ট। প্রতিটি বিষয়ে ‘ঠিক আছে’ বা ‘সমস্যা’ দিন, ছবি তুলুন, এবং ডেভেলপারকে দেওয়ার জন্য PDF রিপোর্ট তৈরি করুন।",
  },
  heroStep1: { en: "Enter your flat layout", bn: "ফ্ল্যাটের লেআউট দিন" },
  heroStep2: { en: "Check room by room", bn: "ঘর ধরে ধরে দেখুন" },
  heroStep3: { en: "Share the PDF report", bn: "PDF রিপোর্ট শেয়ার করুন" },
  inProgress: { en: "Inspection in progress", bn: "পরিদর্শন চলছে" },
  itemsChecked: {
    en: "{done} of {total} items checked",
    bn: "{total}টির মধ্যে {done}টি দেখা হয়েছে",
  },
  savedOnPhone: { en: "saved on this phone", bn: "এই ফোনে সংরক্ষিত" },
  continue: { en: "Continue", bn: "চালিয়ে যান" },
  beforeYouGo: { en: "Before you go", bn: "যাওয়ার আগে" },
  whatToBring: { en: "What to bring", bn: "সাথে যা নেবেন" },
  groundRules: { en: "Ground rules", bn: "যা মেনে চলবেন" },
  yourFlat: { en: "Your flat", bn: "আপনার ফ্ল্যাট" },
  layoutIntro: {
    en: "Enter the number of rooms and the app makes your checklist. The living room, dining room, kitchen, whole flat, building and papers are always included.",
    bn: "ঘরের সংখ্যা দিন, অ্যাপ আপনার চেকলিস্ট বানিয়ে দেবে। বসার ঘর, খাবার ঘর, রান্নাঘর, পুরো ফ্ল্যাট, ভবন ও কাগজপত্র সব সময় থাকে।",
  },
  bedrooms: { en: "Bedrooms", bn: "শোবার ঘর" },
  bathrooms: { en: "Bathrooms", bn: "বাথরুম" },
  balconies: { en: "Balconies", bn: "বারান্দা" },
  fewer: { en: "Fewer {label}", bn: "{label} কমান" },
  more: { en: "More {label}", bn: "{label} বাড়ান" },
  forTheReport: { en: "For the report", bn: "রিপোর্টের জন্য" },
  optional: { en: "(optional)", bn: "(ঐচ্ছিক)" },
  projectName: { en: "Project or building name", bn: "প্রকল্প বা ভবনের নাম" },
  flatNumber: { en: "Flat number", bn: "ফ্ল্যাট নম্বর" },
  yourName: { en: "Your name", bn: "আপনার নাম" },
  visitDate: { en: "Date of visit", bn: "পরিদর্শনের তারিখ" },
  startChecking: { en: "Start checking", bn: "দেখা শুরু করুন" },
  updateRooms: { en: "Update my rooms", bn: "ঘরের তালিকা হালনাগাদ করুন" },
  continueChecking: { en: "Continue checking", bn: "দেখা চালিয়ে যান" },
  startOver: { en: "Start a new inspection", bn: "নতুন পরিদর্শন শুরু করুন" },
  confirmFewerRooms: {
    en: "Your new layout has fewer rooms. Your answers for {n} items in the removed rooms will be deleted. Continue?",
    enOne:
      "Your new layout has fewer rooms. Your answer for {n} item in the removed rooms will be deleted. Continue?",
    bn: "নতুন লেআউটে ঘর কম। বাদ পড়া ঘরগুলোর {n}টি বিষয়ের উত্তর মুছে যাবে। এগিয়ে যাবেন?",
  },
  confirmStartOver: {
    en: "Start a new inspection? All answers, notes and photos on this phone will be deleted.",
    bn: "নতুন পরিদর্শন শুরু করবেন? এই ফোনের সব উত্তর, নোট ও ছবি মুছে যাবে।",
  },

  // Rooms screen
  start: { en: "Start", bn: "শুরু" },
  rooms: { en: "Rooms", bn: "ঘর" },
  allRooms: { en: "All rooms", bn: "সব ঘর" },
  onceForFlat: { en: "Once for the flat", bn: "পুরো ফ্ল্যাটের জন্য একবার" },
  beforeYouSign: { en: "Before you sign", bn: "সই করার আগে" },
  flatNo: { en: "Flat {flat}", bn: "ফ্ল্যাট {flat}" },
  yourChecklist: { en: "Your checklist", bn: "আপনার চেকলিস্ট" },
  noProblemsYet: { en: "No problems yet", bn: "এখনো কোনো সমস্যা নেই" },
  severityCount: { en: "{n} {name}", bn: "{n}টি {name}" },
  problemCount: {
    en: "{n} problems",
    enOne: "{n} problem",
    bn: "{n}টি সমস্যা",
  },
  otherProblemCount: {
    en: "{n} other problems",
    enOne: "{n} other problem",
    bn: "আরও {n}টি সমস্যা",
  },
  done: { en: "Done", bn: "শেষ" },
  pctChecked: { en: "{pct}% checked", bn: "{pct}% দেখা হয়েছে" },
  changeRooms: {
    en: "Change rooms or flat details",
    bn: "ঘর বা ফ্ল্যাটের তথ্য বদলান",
  },
  seeReport: { en: "See the report", bn: "রিপোর্ট দেখুন" },

  // Room screen
  showTips: {
    en: 'Show "how to check" under every item',
    bn: "প্রতিটি বিষয়ের নিচে ‘কীভাবে দেখবেন’ দেখান",
  },
  allAnswered: { en: "All answered", bn: "সব উত্তর দেওয়া হয়েছে" },
  left: { en: "{n} left", bn: "{n}টি বাকি" },
  allOk: { en: "All OK", bn: "সব ঠিক আছে" },
  allOkLabel: {
    en: "All OK: mark the {n} unanswered items in {group} as OK",
    enOne: "All OK: mark the {n} unanswered item in {group} as OK",
    bn: "সব ঠিক আছে: {group} এর উত্তর না দেওয়া {n}টি বিষয়ে ‘ঠিক আছে’ দিন",
  },
  next: { en: "Next: {name}", bn: "এরপর: {name}" },

  // Item card and problem editor
  howToCheck: { en: "How to check", bn: "কীভাবে দেখবেন" },
  statusOk: { en: "OK", bn: "ঠিক আছে" },
  statusProblem: { en: "Problem", bn: "সমস্যা" },
  statusNa: { en: "Not applicable", bn: "প্রযোজ্য নয়" },
  howSerious: { en: "How serious is it?", bn: "সমস্যাটি কতটা গুরুতর?" },
  showExamples: { en: "Show examples", bn: "উদাহরণ দেখুন" },
  hideExamples: { en: "Hide examples", bn: "উদাহরণ লুকান" },
  shortNote: { en: "Short note", bn: "ছোট নোট" },
  notePlaceholder: {
    en: "What is wrong, and exactly where?",
    bn: "কী সমস্যা, আর ঠিক কোথায়?",
  },
  photos: { en: "Photos", bn: "ছবি" },
  takePhoto: { en: "Take photo", bn: "ছবি তুলুন" },
  chooseFromGallery: { en: "Choose from gallery", bn: "গ্যালারি থেকে নিন" },
  savingPhoto: { en: "Saving photo…", bn: "ছবি সংরক্ষণ হচ্ছে…" },
  photoSaveFailed: {
    en: "This photo could not be saved. Try again, or check that your phone has free space.",
    bn: "ছবিটি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন, অথবা ফোনে খালি জায়গা আছে কি না দেখুন।",
  },
  showPhoto: { en: "Show photo full screen", bn: "ছবি পুরো স্ক্রিনে দেখুন" },
  closePhoto: { en: "Close photo", bn: "ছবি বন্ধ করুন" },
  deletePhoto: { en: "Delete photo", bn: "ছবি মুছুন" },
  confirmDeletePhoto: { en: "Delete this photo?", bn: "ছবিটি মুছে ফেলবেন?" },
  photoMissing: { en: "Photo missing", bn: "ছবি পাওয়া যায়নি" },
  noSeverity: { en: "No severity", bn: "মাত্রা দেওয়া হয়নি" },

  // Report screen
  report: { en: "Report", bn: "রিপোর্ট" },
  reportTitle: {
    en: "Handover inspection report",
    bn: "হস্তান্তর পরিদর্শনের রিপোর্ট",
  },
  yourReport: { en: "Your report", bn: "আপনার রিপোর্ট" },
  noDetails: {
    en: "No flat details yet.",
    bn: "এখনো ফ্ল্যাটের তথ্য দেওয়া হয়নি।",
  },
  edit: { en: "Edit", bn: "বদলান" },
  notChecked: { en: "Not checked", bn: "দেখা হয়নি" },
  notCheckedYet: {
    en: "{n} items are not checked yet.",
    enOne: "{n} item is not checked yet.",
    bn: "{n}টি বিষয় এখনো দেখা হয়নি।",
  },
  notCheckedYetText: {
    en: "You can still make the report; it will show how many were not checked.",
    bn: "তবুও রিপোর্ট তৈরি করা যাবে; কয়টি দেখা হয়নি তা রিপোর্টে থাকবে।",
  },
  noSeverityYet: {
    en: "{n} problems have no severity.",
    enOne: "{n} problem has no severity.",
    bn: "{n}টি সমস্যার মাত্রা দেওয়া হয়নি।",
  },
  noSeverityYetText: {
    en: "Pick one so the developer knows how serious it is.",
    bn: "মাত্রা বেছে নিন, যাতে ডেভেলপার বোঝেন সমস্যাটি কতটা গুরুতর।",
  },
  severityProblems: { en: "{name} problems", bn: "{name} সমস্যা" },
  otherProblems: { en: "Other problems", bn: "অন্যান্য সমস্যা" },
  noneFound: { en: "None found.", bn: "কিছু পাওয়া যায়নি।" },
  checkedOkCount: { en: "Checked OK ({n})", bn: "ঠিক আছে ({n})" },

  // PDF export
  pdfReport: { en: "PDF report", bn: "PDF রিপোর্ট" },
  pdfReportText: {
    en: "Lists problems room by room with {name} items first, then the items checked OK. Give it to the developer and ask them to sign it with a repair date.",
    bn: "ঘর ধরে ধরে সমস্যার তালিকা, প্রথমে {name} বিষয়গুলো, তারপর যেগুলো ঠিক আছে। এটি ডেভেলপারকে দিন এবং মেরামতের তারিখসহ সই করে দিতে বলুন।",
  },
  makingPdf: { en: "Making your PDF…", bn: "আপনার PDF তৈরি হচ্ছে…" },
  addingPhotos: {
    en: "Adding photos ({n} of {total})…",
    bn: "ছবি যোগ হচ্ছে ({total}টির মধ্যে {n})…",
  },
  finishing: { en: "Finishing…", bn: "শেষ হচ্ছে…" },
  pdfReady: { en: "Your PDF is ready:", bn: "আপনার PDF তৈরি:" },
  sharePdf: { en: "Share PDF", bn: "PDF শেয়ার করুন" },
  savePdf: { en: "Save PDF", bn: "PDF সংরক্ষণ করুন" },
  makePdf: { en: "Make PDF report", bn: "PDF রিপোর্ট তৈরি করুন" },
  pdfFailed: {
    en: "The PDF could not be made. Please try again. If it keeps failing, try removing very large photos.",
    bn: "PDF তৈরি করা যায়নি। আবার চেষ্টা করুন। বারবার না হলে খুব বড় ছবিগুলো সরিয়ে দেখুন।",
  },

  // PDF report
  pdfNoSeverityProblems: {
    en: "No {name} problems were found.",
    bn: "কোনো {name} সমস্যা পাওয়া যায়নি।",
  },
  pdfOtherProblems: {
    en: "Other problems, room by room",
    bn: "অন্যান্য সমস্যা, ঘর ধরে ধরে",
  },
  pdfNoOtherProblems: {
    en: "No other problems were found.",
    bn: "অন্য কোনো সমস্যা পাওয়া যায়নি।",
  },
  pdfCheckedOk: { en: "Checked and OK", bn: "দেখা হয়েছে, ঠিক আছে" },
  pdfCheckedOkText: {
    en: "Items checked and found OK during the visit.",
    bn: "পরিদর্শনের সময় যে বিষয়গুলো দেখে ঠিক পাওয়া গেছে।",
  },
  pdfNone: { en: "None.", bn: "কিছু নেই।" },
  pdfProject: { en: "Project or building", bn: "প্রকল্প বা ভবন" },
  pdfFlat: { en: "Flat", bn: "ফ্ল্যাট" },
  pdfBuyer: { en: "Buyer", bn: "ক্রেতা" },
  pdfLayout: { en: "Layout", bn: "লেআউট" },
  pdfBedrooms: {
    en: "{n} bedrooms",
    enOne: "{n} bedroom",
    bn: "{n}টি শোবার ঘর",
  },
  pdfBathrooms: {
    en: "{n} bathrooms",
    enOne: "{n} bathroom",
    bn: "{n}টি বাথরুম",
  },
  pdfBalconies: {
    en: "{n} balconies",
    enOne: "{n} balcony",
    bn: "{n}টি বারান্দা",
  },
  pdfSummary: { en: "Summary", bn: "সারসংক্ষেপ" },
  pdfNoSeverityGiven: {
    en: "no severity given {n}",
    bn: "মাত্রা দেওয়া হয়নি {n}",
  },
  pdfProblemsFound: { en: "Problems found", bn: "পাওয়া সমস্যা" },
  pdfTotalItems: { en: "Total items", bn: "মোট বিষয়" },
  pdfSeverityLevels: { en: "Severity levels", bn: "সমস্যার মাত্রা" },
  pdfPhotosMissing: {
    en: "{n} photo(s) could not be added.",
    bn: "{n}টি ছবি যোগ করা যায়নি।",
  },
  pdfAcknowledgement: { en: "Acknowledgement", bn: "প্রাপ্তি স্বীকার" },
  pdfAcknowledgementText: {
    en: "Received by the developer, with the agreed date for repairs.",
    bn: "ডেভেলপার গ্রহণ করেছেন, মেরামতের সম্মত তারিখসহ।",
  },
  pdfName: { en: "Name", bn: "নাম" },
  pdfSignature: { en: "Signature", bn: "স্বাক্ষর" },
  pdfDate: { en: "Date", bn: "তারিখ" },
  pdfRepairDate: { en: "Repair date", bn: "মেরামতের তারিখ" },
  pdfPage: { en: "Page {n} of {total}", bn: "পৃষ্ঠা {n} / {total}" },
} satisfies Record<string, Entry>;

export type TextKey = keyof typeof strings;

/**
 * The text for `key` in `lang`, with {placeholders} filled in. Numbers are
 * written with Bangla digits in Bangla.
 */
export function t(
  lang: Lang,
  key: TextKey,
  vars: Record<string, string | number> = {},
): string {
  const entry: Entry = strings[key];
  const text =
    lang === "en" && vars.n === 1 && entry.enOne ? entry.enOne : entry[lang];
  return text.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = vars[name];
    if (value === undefined) return `{${name}}`;
    return typeof value === "number" ? fmt(lang, value) : value;
  });
}
