/**
 * Flat handover checklist content, in English and Bangla.
 *
 * Source: Flat_Handover_Checklist_Draft1.docx (draft 1, 26 September 2026).
 * The English text is copied from the document as written; the Bangla is a
 * translation of it. Edit both here when the reviewed draft comes back.
 *
 * Not included on purpose: the "Your note" column and the "Decisions for
 * you" section, which are review material and not shown to buyers.
 *
 * Severity display names live in src/config.ts so they can be renamed in
 * one place. Note that some "how to check" texts mention a level by name
 * (for example "mark Safety", "‘ঝুঁকিপূর্ণ’ দিন"), so update those too, in
 * both languages, if a level is renamed.
 */
import type { LangText } from "../lib/lang.ts";

export type SectionId = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface ChecklistItem {
  /** Item code from the document, for example "A1" or "B4". */
  code: string;
  /** The "Check" column. */
  title: LangText;
  /** The "How to check" column, without the [Confirm] marker. */
  howToCheck: LangText;
  /**
   * True for items marked [Confirm] in the draft: they still need a
   * professional check (a code figure or local practice).
   */
  confirm?: boolean;
  /** Text that was inside the marker, for example "BNBC figure". */
  confirmNote?: string;
}

export interface ItemGroup {
  id: string;
  /** Sub-heading inside the section, or null when the section has none. */
  title: LangText | null;
  items: ChecklistItem[];
}

export interface ChecklistSection {
  id: SectionId;
  title: LangText;
  /** The line under the section heading in the document. */
  intro: LangText;
  groups: ItemGroup[];
}

export type SeverityId = "minor" | "major" | "safety";

export interface SeverityLevel {
  id: SeverityId;
  meaning: LangText;
  examples: LangText;
}

/** Ordered from least to most serious. Names are in src/config.ts. */
export const severityLevels: SeverityLevel[] = [
  {
    id: "minor",
    meaning: {
      en: "Looks wrong but does not affect use.",
      bn: "দেখতে খারাপ, কিন্তু ব্যবহারে অসুবিধা হয় না।",
    },
    examples: {
      en: "Paint stains, small chips, a loose switch plate, uneven grout colour.",
      bn: "রঙের দাগ, ছোট চলটা ওঠা, ঢিলা সুইচ প্লেট, টাইলসের জোড়ার রং অসমান।",
    },
  },
  {
    id: "major",
    meaning: {
      en: "Affects use, or will get worse with time.",
      bn: "ব্যবহারে অসুবিধা হয়, বা সময়ের সাথে আরও খারাপ হবে।",
    },
    examples: {
      en: "Leaks, damp patches, hollow tiles, doors or windows that do not close, water pooling on the floor.",
      bn: "পানি চুঁইয়ে পড়া, স্যাঁতসেঁতে দাগ, ফাঁপা টাইলস, যে দরজা বা জানালা বন্ধ হয় না, মেঝেতে পানি জমে থাকা।",
    },
  },
  {
    id: "safety",
    meaning: {
      en: "Can hurt someone. Must be fixed before moving in.",
      bn: "কেউ আঘাত পেতে পারে। ওঠার আগেই ঠিক করাতে হবে।",
    },
    examples: {
      en: "Exposed wires, sparking or hot sockets, loose railings, gas smell, wide or diagonal cracks in beams, columns or slabs.",
      bn: "খোলা তার, স্পার্ক করা বা গরম হয়ে যাওয়া সকেট, ঢিলা রেলিং, গ্যাসের গন্ধ, বিম, কলাম বা ছাদের ঢালাইয়ে চওড়া বা কোনাকুনি ফাটল।",
    },
  },
];

/** "Before you go: What to bring". */
export const whatToBring: LangText[] = [
  {
    en: "Your charged phone with this app (camera and torch)",
    bn: "চার্জ দেওয়া ফোন, এই অ্যাপসহ (ক্যামেরা ও টর্চ)",
  },
  {
    en: "A coin, or a small rubber mallet, for tapping tiles and plaster",
    bn: "টাইলস ও প্লাস্টারে টোকা দেওয়ার জন্য একটি কয়েন বা ছোট রাবারের হাতুড়ি",
  },
  {
    en: "A phone charger, to test sockets",
    bn: "সকেট পরীক্ষার জন্য একটি ফোন চার্জার",
  },
  {
    en: "A marble or small ball, to check floor slope",
    bn: "মেঝের ঢাল দেখার জন্য একটি মার্বেল বা ছোট বল",
  },
  {
    en: "A bucket for drain tests, or ask the site staff for water",
    bn: "ড্রেন পরীক্ষার জন্য একটি বালতি, অথবা সাইটের কর্মীদের কাছে পানি চেয়ে নিন",
  },
  { en: "A 5 m measuring tape", bn: "৫ মিটারের একটি মাপার ফিতা" },
  {
    en: "Masking tape and a marker, to mark each defect on site before photographing it",
    bn: "মাস্কিং টেপ ও মার্কার, ছবি তোলার আগে প্রতিটি ত্রুটি জায়গাতেই চিহ্নিত করার জন্য",
  },
  {
    en: "Your sale agreement, specification list and floor plan",
    bn: "আপনার বিক্রয় চুক্তি, স্পেসিফিকেশনের তালিকা ও ফ্লোর প্ল্যান",
  },
];

/** "Before you go: Ground rules". */
export const groundRules: LangText[] = [
  {
    en: "Go in daylight, and ask the developer to keep electricity, water and the lift running during your visit.",
    bn: "দিনের আলোতে যান, এবং আপনি থাকার সময় বিদ্যুৎ, পানি ও লিফট চালু রাখতে ডেভেলপারকে বলুন।",
  },
  {
    en: "Take someone with you, ideally an engineer.",
    bn: "সাথে কাউকে নিয়ে যান, সম্ভব হলে একজন প্রকৌশলী।",
  },
  {
    en: "Do not open the distribution board (DB) cover or touch bare wires.",
    bn: "ডিস্ট্রিবিউশন বোর্ডের (DB) কভার খুলবেন না, খোলা তারেও হাত দেবেন না।",
  },
  {
    en: "Check for gas leaks only with soapy water, never with a flame.",
    bn: "গ্যাস লিক শুধু সাবান-পানি দিয়ে পরীক্ষা করুন, কখনো আগুন দিয়ে নয়।",
  },
  {
    en: "Test railings and grills by pushing with your hands while standing firmly. Never lean your body over them.",
    bn: "শক্ত হয়ে দাঁড়িয়ে হাত দিয়ে ঠেলে রেলিং ও গ্রিল পরীক্ষা করুন। কখনো এগুলোর ওপর দিয়ে শরীর ঝুঁকাবেন না।",
  },
];

export type RoomKind =
  | "living"
  | "dining"
  | "bedroom"
  | "bathroom"
  | "kitchen"
  | "balcony"
  | "wholeFlat"
  | "building"
  | "endOfVisit";

/** Which layout number a room repeats for. Rooms without one appear once. */
export type LayoutCount = "bedrooms" | "bathrooms" | "balconies";

export interface SectionPart {
  section: SectionId;
  /** Use only these item codes from the section. Omit to use all of it. */
  onlyCodes?: string[];
}

export interface RoomType {
  kind: RoomKind;
  name: LangText;
  repeatFor?: LayoutCount;
  parts: SectionPart[];
}

/**
 * "How the app will use this list": the room-to-section mapping, in the
 * order the rooms appear in the app.
 */
export const roomTypes: RoomType[] = [
  {
    kind: "living",
    name: { en: "Living room", bn: "বসার ঘর" },
    parts: [{ section: "A" }],
  },
  {
    kind: "dining",
    name: { en: "Dining room", bn: "খাবার ঘর" },
    parts: [{ section: "A" }],
  },
  {
    kind: "bedroom",
    name: { en: "Bedroom", bn: "শোবার ঘর" },
    repeatFor: "bedrooms",
    parts: [{ section: "A" }],
  },
  {
    kind: "bathroom",
    name: { en: "Bathroom", bn: "বাথরুম" },
    repeatFor: "bathrooms",
    parts: [{ section: "A" }, { section: "B" }],
  },
  {
    kind: "kitchen",
    name: { en: "Kitchen", bn: "রান্নাঘর" },
    parts: [{ section: "A" }, { section: "C" }],
  },
  {
    kind: "balcony",
    name: { en: "Balcony", bn: "বারান্দা" },
    repeatFor: "balconies",
    parts: [
      { section: "D" },
      { section: "A", onlyCodes: ["A1", "A2", "A3", "A4", "A5", "A6"] },
    ],
  },
  {
    kind: "wholeFlat",
    name: { en: "Whole flat", bn: "পুরো ফ্ল্যাট" },
    parts: [{ section: "E" }],
  },
  {
    kind: "building",
    name: { en: "Building and common areas", bn: "ভবন ও কমন এলাকা" },
    parts: [{ section: "F" }],
  },
  {
    kind: "endOfVisit",
    name: { en: "End of the visit", bn: "পরিদর্শনের শেষে" },
    parts: [{ section: "G" }],
  },
];

export const sections: ChecklistSection[] = [
  {
    id: "A",
    title: { en: "Every room", bn: "প্রতিটি ঘর" },
    intro: {
      en: "Used for the living room, dining room, bedrooms, kitchen and bathrooms. Anything a room does not have (for example no window) is marked Not applicable with one tap.",
      bn: "বসার ঘর, খাবার ঘর, শোবার ঘর, রান্নাঘর ও বাথরুমে ব্যবহার হয়। কোনো ঘরে যা নেই (যেমন জানালা নেই), তাতে এক ট্যাপে ‘প্রযোজ্য নয়’ দেওয়া যায়।",
    },
    groups: [
      {
        id: "A-walls",
        title: { en: "Walls and ceiling", bn: "দেয়াল ও সিলিং" },
        items: [
          {
            code: "A1",
            title: { en: "Wall cracks", bn: "দেয়ালে ফাটল" },
            howToCheck: {
              en: "Scan each wall in side light, especially around door and window corners. Mark Major if a coin edge fits in or the crack runs diagonally.",
              bn: "পাশ থেকে আলো ফেলে প্রতিটি দেয়াল ভালো করে দেখুন, বিশেষ করে দরজা ও জানালার কোনায়। ফাটলে কয়েনের কিনারা ঢুকে গেলে বা ফাটল কোনাকুনি গেলে ‘গুরুতর’ দিন।",
            },
          },
          {
            code: "A2",
            title: {
              en: "Cracks in beams, columns or slab",
              bn: "বিম, কলাম বা ছাদের ঢালাইয়ে ফাটল",
            },
            howToCheck: {
              en: "A thin line where a brick wall meets a beam or column is common. A crack across a beam, column or slab: mark Safety and have an engineer see it.",
              bn: "ইটের দেয়াল যেখানে বিম বা কলামের সাথে মিশেছে সেখানে সরু দাগ থাকা সাধারণ। বিম, কলাম বা ছাদের ঢালাইয়ের আড়াআড়ি ফাটল থাকলে ‘ঝুঁকিপূর্ণ’ দিন এবং একজন প্রকৌশলীকে দেখান।",
            },
          },
          {
            code: "A3",
            title: {
              en: "Damp patches or white salt marks",
              bn: "স্যাঁতসেঁতে দাগ বা সাদা নোনা দাগ",
            },
            howToCheck: {
              en: "Look for dark stains, bubbling paint, white powdery patches or a musty smell, especially on outside walls and walls shared with bathrooms.",
              bn: "কালচে দাগ, ফুলে ওঠা রং, সাদা গুঁড়ার মতো দাগ বা ভ্যাপসা গন্ধ খুঁজুন, বিশেষ করে বাইরের দেয়ালে ও বাথরুমের পাশের দেয়ালে।",
            },
          },
          {
            code: "A4",
            title: { en: "Hollow plaster", bn: "ফাঁপা প্লাস্টার" },
            howToCheck: {
              en: "Knock on each wall at a few points with a knuckle or the mallet. A hollow or dull sound means the plaster has come away from the wall.",
              bn: "প্রতিটি দেয়ালের কয়েক জায়গায় আঙুলের গাঁট বা হাতুড়ি দিয়ে টোকা দিন। ফাঁপা বা ভোঁতা শব্দ মানে প্লাস্টার দেয়াল থেকে আলগা হয়ে গেছে।",
            },
          },
          {
            code: "A5",
            title: {
              en: "Rust stains or flaking concrete on the ceiling",
              bn: "সিলিংয়ে মরিচার দাগ বা খসে পড়া কংক্রিট",
            },
            howToCheck: {
              en: "Brown streaks, bulging or flaking patches can mean the steel inside the slab is rusting. Mark Safety and have an engineer see it.",
              bn: "বাদামি দাগ, ফুলে ওঠা বা খসে পড়া অংশ মানে ছাদের ঢালাইয়ের ভেতরের রডে মরিচা ধরছে হতে পারে। ‘ঝুঁকিপূর্ণ’ দিন এবং একজন প্রকৌশলীকে দেখান।",
            },
          },
          {
            code: "A6",
            title: { en: "Paint and wall finish", bn: "রং ও দেয়ালের ফিনিশিং" },
            howToCheck: {
              en: "Check for patches, drips and uneven colour, and look along each wall at a low angle for bulges. Paint type should match the agreement.",
              bn: "ছোপ, রং গড়িয়ে পড়ার দাগ ও অসমান রং আছে কি না দেখুন, এবং প্রতিটি দেয়ালের পাশ থেকে নিচু কোণে তাকিয়ে উঁচু-নিচু অংশ খুঁজুন। রঙের ধরন চুক্তির সাথে মিলতে হবে।",
            },
          },
        ],
      },
      {
        id: "A-floor",
        title: { en: "Floor", bn: "মেঝে" },
        items: [
          {
            code: "A7",
            title: { en: "Hollow tiles", bn: "ফাঁপা টাইলস" },
            howToCheck: {
              en: "Tap tiles across the room, at centres and corners, with a coin or the mallet. A hollow sound means the tile may crack or lift later.",
              bn: "পুরো ঘরের টাইলসের মাঝখানে ও কোনায় কয়েন বা হাতুড়ি দিয়ে টোকা দিন। ফাঁপা শব্দ মানে টাইলস পরে ফেটে যেতে বা উঠে আসতে পারে।",
            },
          },
          {
            code: "A8",
            title: { en: "Cracked or chipped tiles", bn: "ফাটা বা ভাঙা টাইলস" },
            howToCheck: {
              en: "Look closely along tile surfaces and edges, including under doors and along the skirting.",
              bn: "টাইলসের ওপর ও কিনারা কাছ থেকে দেখুন, দরজার নিচে ও স্কার্টিংয়ের পাশেও।",
            },
          },
          {
            code: "A9",
            title: { en: "Uneven edges and grout", bn: "অসমান কিনারা ও জোড়া" },
            howToCheck: {
              en: "Slide your palm across the joints: no tile edge should stand higher than its neighbour. Joints should be fully filled, with no gaps or cracks.",
              bn: "জোড়ার ওপর দিয়ে হাতের তালু বুলিয়ে দেখুন: কোনো টাইলসের কিনারা পাশেরটার চেয়ে উঁচু থাকা চলবে না। জোড়াগুলো পুরো ভরা থাকতে হবে, কোনো ফাঁক বা ফাটল ছাড়া।",
            },
          },
          {
            code: "A10",
            title: { en: "Floor level", bn: "মেঝে সমান কি না" },
            howToCheck: {
              en: "Place a marble at a few points. If it keeps rolling one way, the floor slopes; note where and in which direction.",
              bn: "কয়েক জায়গায় একটি মার্বেল রাখুন। এটি একদিকে গড়াতে থাকলে মেঝে ঢালু; কোথায় ও কোন দিকে, তা লিখে রাখুন।",
            },
          },
          {
            code: "A11",
            title: { en: "Tile type and shade", bn: "টাইলসের ধরন ও রং" },
            howToCheck: {
              en: "Size, finish and brand match the agreement, with no obvious colour difference between batches.",
              bn: "মাপ, ফিনিশ ও ব্র্যান্ড চুক্তির সাথে মেলে, এবং বিভিন্ন লটের টাইলসের রঙে চোখে পড়ার মতো পার্থক্য নেই।",
            },
          },
          {
            code: "A12",
            title: { en: "Skirting and thresholds", bn: "স্কার্টিং ও চৌকাঠ" },
            howToCheck: {
              en: "Skirting firmly fixed with no hollow sound or gaps. Steps between rooms low and even, with no sharp edges.",
              bn: "স্কার্টিং শক্তভাবে লাগানো, ফাঁপা শব্দ বা ফাঁক নেই। দুই ঘরের মাঝের ধাপ নিচু ও সমান, কোনো ধারালো কিনারা নেই।",
            },
          },
        ],
      },
      {
        id: "A-doors",
        title: { en: "Doors", bn: "দরজা" },
        items: [
          {
            code: "A13",
            title: { en: "Opening and closing", bn: "খোলা ও বন্ধ করা" },
            howToCheck: {
              en: "Open and close each door fully: no rubbing on the frame or floor, no swinging by itself, and an even gap all round.",
              bn: "প্রতিটি দরজা পুরোপুরি খুলুন ও বন্ধ করুন: চৌকাঠ বা মেঝেতে ঘষা লাগে না, নিজে নিজে নড়ে না, এবং চারপাশের ফাঁক সমান।",
            },
          },
          {
            code: "A14",
            title: { en: "Locks, handles and keys", bn: "তালা, হাতল ও চাবি" },
            howToCheck: {
              en: "Lock and unlock with every key provided. Handles should be firm. Count the keys against the handover list.",
              bn: "দেওয়া প্রতিটি চাবি দিয়ে তালা লাগিয়ে ও খুলে দেখুন। হাতল শক্ত থাকতে হবে। হস্তান্তরের তালিকার সাথে চাবি গুনে মিলিয়ে নিন।",
            },
          },
          {
            code: "A15",
            title: { en: "Hinges and stoppers", bn: "কবজা ও স্টপার" },
            howToCheck: {
              en: "Hinges tight with every screw in place, and a door stopper wherever the door would hit a wall.",
              bn: "কবজা শক্ত, প্রতিটি স্ক্রু জায়গামতো আছে, এবং যেখানে দরজা দেয়ালে লাগবে সেখানে ডোর স্টপার আছে।",
            },
          },
          {
            code: "A16",
            title: { en: "Door surface", bn: "দরজার উপরিতল" },
            howToCheck: {
              en: "Check for cracks, dents, peeling veneer and unfinished edges, including the top and bottom edges of the door.",
              bn: "ফাটল, টোল খাওয়া, উঠে যাওয়া ভিনিয়ার ও অসমাপ্ত কিনারা আছে কি না দেখুন, দরজার ওপর ও নিচের কিনারাসহ।",
            },
          },
        ],
      },
      {
        id: "A-windows",
        title: { en: "Windows", bn: "জানালা" },
        items: [
          {
            code: "A17",
            title: { en: "Sliding and locking", bn: "টেনে খোলা ও লক করা" },
            howToCheck: {
              en: "Slide every shutter fully both ways. It should move smoothly without jamming, and the lock should close firmly.",
              bn: "প্রতিটি পাল্লা দুই দিকে পুরোপুরি টেনে দেখুন। আটকে না গিয়ে মসৃণভাবে চলতে হবে, এবং লক শক্তভাবে বন্ধ হতে হবে।",
            },
          },
          {
            code: "A18",
            title: { en: "Glass and rubber seals", bn: "কাচ ও রাবার সিল" },
            howToCheck: {
              en: "No cracks, scratches or rattling glass. Rubber seals present and tight, with no daylight showing when the window is closed.",
              bn: "কাচে ফাটল বা দাগ নেই, কাচ নড়বড়ে নয়। রাবার সিল আছে ও টাইট, জানালা বন্ধ থাকলে ফাঁক দিয়ে আলো দেখা যায় না।",
            },
          },
          {
            code: "A19",
            title: { en: "Rain leakage", bn: "বৃষ্টির পানি ঢোকা" },
            howToCheck: {
              en: "Look for stains on the sill and the wall below. If safe, spray water on the outside and watch the inside bottom corners.",
              bn: "জানালার নিচের তাক ও তার নিচের দেয়ালে দাগ খুঁজুন। নিরাপদ হলে বাইরে থেকে পানি ছিটিয়ে ভেতরের নিচের কোনাগুলো লক্ষ করুন।",
            },
          },
          {
            code: "A20",
            title: {
              en: "Mosquito net (if included)",
              bn: "মশার নেট (চুক্তিতে থাকলে)",
            },
            howToCheck: {
              en: "Net shutters slide smoothly, and the net is tight and untorn.",
              bn: "নেটের পাল্লা মসৃণভাবে চলে, এবং নেট টানটান ও ছেঁড়া নয়।",
            },
          },
          {
            code: "A21",
            title: { en: "Window grill", bn: "জানালার গ্রিল" },
            howToCheck: {
              en: "Firmly fixed, rust-free and fully painted, with bars close enough for child safety. Ask whether one grill can open in an emergency.",
              bn: "শক্তভাবে লাগানো, মরিচা নেই ও পুরো রং করা, এবং শিশুর নিরাপত্তার জন্য শিকগুলো যথেষ্ট কাছাকাছি। জরুরি অবস্থায় খোলা যায় এমন একটি গ্রিল আছে কি না জিজ্ঞেস করুন।",
            },
            confirm: true,
          },
        ],
      },
      {
        id: "A-electrical",
        title: { en: "Electrical points", bn: "বৈদ্যুতিক পয়েন্ট" },
        items: [
          {
            code: "A22",
            title: { en: "Switches", bn: "সুইচ" },
            howToCheck: {
              en: "Press every switch. Each should click cleanly and control the right light or fan.",
              bn: "প্রতিটি সুইচ টিপে দেখুন। প্রতিটি ঠিকমতো ক্লিক করবে এবং সঠিক বাতি বা ফ্যান চালাবে।",
            },
          },
          {
            code: "A23",
            title: { en: "Sockets", bn: "সকেট" },
            howToCheck: {
              en: "Plug a phone charger into every socket. No power or a loose fit is Major; sparking, buzzing or heat is Safety.",
              bn: "প্রতিটি সকেটে ফোন চার্জার লাগিয়ে দেখুন। বিদ্যুৎ না থাকলে বা ঢিলা হলে ‘গুরুতর’; স্পার্ক, গুনগুন শব্দ বা গরম হলে ‘ঝুঁকিপূর্ণ’।",
            },
          },
          {
            code: "A24",
            title: { en: "Light and fan points", bn: "বাতি ও ফ্যানের পয়েন্ট" },
            howToCheck: {
              en: "Every light point has power. The ceiling fan hook holds firm when pulled, and the fan regulator works.",
              bn: "প্রতিটি বাতির পয়েন্টে বিদ্যুৎ আছে। টান দিলেও সিলিং ফ্যানের হুক শক্ত থাকে, এবং ফ্যানের রেগুলেটর কাজ করে।",
            },
          },
          {
            code: "A25",
            title: { en: "Switch boards", bn: "সুইচ বোর্ড" },
            howToCheck: {
              en: "Boards sit flat and firmly on the wall, with no gaps showing wires.",
              bn: "বোর্ডগুলো দেয়ালে সমান ও শক্তভাবে বসানো, ফাঁক দিয়ে তার দেখা যায় না।",
            },
          },
          {
            code: "A26",
            title: {
              en: "AC provision (bedrooms, living)",
              bn: "এসির ব্যবস্থা (শোবার ঘর, বসার ঘর)",
            },
            howToCheck: {
              en: "A heavy-duty AC socket, a sleeve through the wall for the pipe, a drain outlet, and a safe spot for the outdoor unit.",
              bn: "এসির জন্য হেভি-ডিউটি সকেট, পাইপের জন্য দেয়ালের ভেতর দিয়ে স্লিভ, পানি বের হওয়ার পথ, এবং আউটডোর ইউনিট বসানোর নিরাপদ জায়গা।",
            },
          },
          {
            code: "A27",
            title: {
              en: "TV, internet and phone points",
              bn: "টিভি, ইন্টারনেট ও ফোনের পয়েন্ট",
            },
            howToCheck: {
              en: "Positions match the agreement, and the conduits have a pull wire inside for future cables.",
              bn: "অবস্থান চুক্তির সাথে মেলে, এবং পরে কেবল টানার জন্য কন্ডুইটের ভেতরে টানার তার আছে।",
            },
          },
          {
            code: "A28",
            title: {
              en: "Room size and ceiling height",
              bn: "ঘরের মাপ ও সিলিংয়ের উচ্চতা",
            },
            howToCheck: {
              en: "Measure length, width and floor-to-ceiling height, and compare with the floor plan.",
              bn: "দৈর্ঘ্য, প্রস্থ ও মেঝে থেকে সিলিং পর্যন্ত উচ্চতা মেপে ফ্লোর প্ল্যানের সাথে মিলিয়ে দেখুন।",
            },
          },
        ],
      },
    ],
  },
  {
    id: "B",
    title: { en: "Bathroom", bn: "বাথরুম" },
    intro: {
      en: "Checked in each bathroom, in addition to Section A.",
      bn: "প্রতিটি বাথরুমে, অংশ A এর পাশাপাশি দেখা হয়।",
    },
    groups: [
      {
        id: "B",
        title: null,
        items: [
          {
            code: "B1",
            title: {
              en: "Floor slope to the drain",
              bn: "ড্রেনের দিকে মেঝের ঢাল",
            },
            howToCheck: {
              en: "Pour a bucket of water on the floor. It should all run to the floor drain quickly and leave no pools.",
              bn: "মেঝেতে এক বালতি পানি ঢালুন। সব পানি দ্রুত ফ্লোর ড্রেনে চলে যাবে, কোথাও জমে থাকবে না।",
            },
          },
          {
            code: "B2",
            title: { en: "Floor drain and smell", bn: "ফ্লোর ড্রেন ও গন্ধ" },
            howToCheck: {
              en: "Grating fixed but removable for cleaning. A sewer smell means the drain trap is missing or dry: mark Major.",
              bn: "ঝাঁঝরি লাগানো, তবে পরিষ্কারের জন্য খোলা যায়। নর্দমার গন্ধ মানে ড্রেনের ট্র্যাপ নেই বা শুকনো: ‘গুরুতর’ দিন।",
            },
          },
          {
            code: "B3",
            title: { en: "Tiles in the wet area", bn: "ভেজা জায়গার টাইলস" },
            howToCheck: {
              en: "Tap wall and floor tiles around the shower for hollow spots. Joints around pipes and taps should be fully sealed.",
              bn: "শাওয়ারের চারপাশে দেয়াল ও মেঝের টাইলসে টোকা দিয়ে ফাঁপা জায়গা খুঁজুন। পাইপ ও কলের চারপাশের জোড়া পুরো সিল করা থাকতে হবে।",
            },
          },
          {
            code: "B4",
            title: { en: "Commode", bn: "কমোড" },
            howToCheck: {
              en: "Flush several times: it refills, stops running, does not leak at the base, and does not rock when you sit on it.",
              bn: "কয়েকবার ফ্লাশ করুন: আবার পানি ভরে, পানি পড়া থামে, গোড়া দিয়ে পানি বের হয় না, এবং বসলে নড়ে না।",
            },
          },
          {
            code: "B5",
            title: { en: "Basin", bn: "বেসিন" },
            howToCheck: {
              en: "Fill and drain it. It should be firmly fixed; check underneath with a torch for drips.",
              bn: "পানি ভরে আবার ছেড়ে দিন। বেসিন শক্তভাবে লাগানো থাকতে হবে; টর্চ দিয়ে নিচে দেখুন পানি চুঁইয়ে পড়ে কি না।",
            },
          },
          {
            code: "B6",
            title: {
              en: "Taps, shower and hand shower",
              bn: "কল, শাওয়ার ও হ্যান্ড শাওয়ার",
            },
            howToCheck: {
              en: "Open each fully: good flow, no drips when closed, and hot and cold marked the right way round.",
              bn: "প্রতিটি পুরো খুলুন: পানির ভালো প্রবাহ, বন্ধ করলে ফোঁটা পড়ে না, এবং গরম ও ঠান্ডার চিহ্ন সঠিক দিকে।",
            },
          },
          {
            code: "B7",
            title: { en: "Water pressure", bn: "পানির চাপ" },
            howToCheck: {
              en: "Run the shower and the basin tap together. The flow should stay steady, not drop to a trickle.",
              bn: "শাওয়ার ও বেসিনের কল একসাথে চালান। প্রবাহ স্থির থাকতে হবে, সরু ধারায় নেমে আসবে না।",
            },
          },
          {
            code: "B8",
            title: { en: "Geyser provision", bn: "গিজারের ব্যবস্থা" },
            howToCheck: {
              en: "A geyser power point with its own switch, hot water pipes connected to the taps, and the switch away from shower splashes.",
              bn: "আলাদা সুইচসহ গিজারের পাওয়ার পয়েন্ট, কলের সাথে গরম পানির পাইপ যুক্ত, এবং সুইচটি শাওয়ারের পানির ছিটা থেকে দূরে।",
            },
          },
          {
            code: "B9",
            title: {
              en: "Exhaust fan and ventilation",
              bn: "এক্সজস্ট ফ্যান ও বাতাস চলাচল",
            },
            howToCheck: {
              en: "The exhaust fan runs quietly and pulls air; the ventilation window opens and closes.",
              bn: "এক্সজস্ট ফ্যান শব্দ ছাড়া চলে ও বাতাস টানে; ভেন্টিলেশনের জানালা খোলে ও বন্ধ হয়।",
            },
          },
          {
            code: "B10",
            title: {
              en: "Leaks into other rooms",
              bn: "অন্য ঘরে পানি চুঁইয়ে যাওয়া",
            },
            howToCheck: {
              en: "Check the bathroom ceiling for stains from the flat above, and the walls of the rooms next door for damp patches.",
              bn: "বাথরুমের সিলিংয়ে ওপরের ফ্ল্যাট থেকে আসা দাগ, এবং পাশের ঘরের দেয়ালে স্যাঁতসেঁতে দাগ আছে কি না দেখুন।",
            },
          },
          {
            code: "B11",
            title: { en: "Bathroom door", bn: "বাথরুমের দরজা" },
            howToCheck: {
              en: "Closes fully; the bottom edge is sealed and not swollen, cracked or peeling.",
              bn: "পুরোপুরি বন্ধ হয়; নিচের কিনারা সিল করা, ফুলে যায়নি, ফাটেনি বা উঠে যায়নি।",
            },
          },
          {
            code: "B12",
            title: { en: "Fittings", bn: "ফিটিংস" },
            howToCheck: {
              en: "Mirror, towel rail, soap holder and other fittings in the agreement are present and firm.",
              bn: "আয়না, তোয়ালে রাখার রড, সাবানদানি ও চুক্তিতে থাকা অন্যান্য ফিটিংস আছে এবং শক্তভাবে লাগানো।",
            },
          },
          {
            code: "B13",
            title: { en: "Shock protection", bn: "বৈদ্যুতিক শক থেকে সুরক্ষা" },
            howToCheck: {
              en: "Sockets well away from water. Ask whether the bathroom circuits have an earth-leakage breaker (RCCB).",
              bn: "সকেট পানি থেকে বেশ দূরে। বাথরুমের সার্কিটে আর্থ-লিকেজ ব্রেকার (RCCB) আছে কি না জিজ্ঞেস করুন।",
            },
            confirm: true,
          },
        ],
      },
    ],
  },
  {
    id: "C",
    title: { en: "Kitchen", bn: "রান্নাঘর" },
    intro: {
      en: "Checked in the kitchen, in addition to Section A.",
      bn: "রান্নাঘরে, অংশ A এর পাশাপাশি দেখা হয়।",
    },
    groups: [
      {
        id: "C",
        title: null,
        items: [
          {
            code: "C1",
            title: { en: "Sink and drain", bn: "সিংক ও ড্রেন" },
            howToCheck: {
              en: "Fill and drain the sink: no leaks underneath, fast drainage, no gurgling or bad smell.",
              bn: "সিংকে পানি ভরে ছেড়ে দিন: নিচে পানি চুঁইয়ে পড়ে না, পানি দ্রুত নেমে যায়, গড়গড় শব্দ বা দুর্গন্ধ নেই।",
            },
          },
          {
            code: "C2",
            title: { en: "Kitchen counter", bn: "রান্নাঘরের কাউন্টার" },
            howToCheck: {
              en: "Level, firmly supported and neatly finished at the edges. Tap for hollow spots under the tiles or stone.",
              bn: "সমান, শক্তভাবে বসানো এবং কিনারা পরিষ্কারভাবে ফিনিশ করা। টোকা দিয়ে টাইলস বা পাথরের নিচে ফাঁপা জায়গা খুঁজুন।",
            },
          },
          {
            code: "C3",
            title: {
              en: "Tiles behind stove and sink",
              bn: "চুলা ও সিংকের পেছনের টাইলস",
            },
            howToCheck: {
              en: "Fully grouted with no hollow spots, and no gap where the counter meets the wall.",
              bn: "জোড়া পুরো ভরা, ফাঁপা জায়গা নেই, এবং কাউন্টার যেখানে দেয়ালে মিশেছে সেখানে ফাঁক নেই।",
            },
          },
          {
            code: "C4",
            title: { en: "Gas line or LPG", bn: "গ্যাস লাইন বা এলপিজি" },
            howToCheck: {
              en: "Ask whether it is piped gas (Titas or another company) or LPG. If gas is connected, brush soapy water on the joints: bubbles mean a leak. Never use a flame.",
              bn: "জিজ্ঞেস করুন এটি পাইপলাইনের গ্যাস (তিতাস বা অন্য কোম্পানি) নাকি এলপিজি। গ্যাস সংযোগ থাকলে জোড়াগুলোতে সাবান-পানি লাগান: বুদবুদ উঠলে লিক আছে। কখনো আগুন ব্যবহার করবেন না।",
            },
          },
          {
            code: "C5",
            title: { en: "Stove position", bn: "চুলার জায়গা" },
            howToCheck: {
              en: "The gas point is where the stove will actually sit, with no socket or switch right beside the flame.",
              bn: "চুলা আসলে যেখানে বসবে গ্যাস পয়েন্ট সেখানেই, এবং আগুনের ঠিক পাশে কোনো সকেট বা সুইচ নেই।",
            },
          },
          {
            code: "C6",
            title: { en: "Kitchen exhaust", bn: "রান্নাঘরের এক্সজস্ট" },
            howToCheck: {
              en: "The exhaust fan or chimney point works, and the duct opening leads outside.",
              bn: "এক্সজস্ট ফ্যান বা চিমনির পয়েন্ট কাজ করে, এবং ডাক্টের মুখ বাইরে গেছে।",
            },
          },
          {
            code: "C7",
            title: { en: "Appliance sockets", bn: "যন্ত্রপাতির সকেট" },
            howToCheck: {
              en: "Heavy-duty sockets for the fridge, microwave and oven, and no socket directly above the sink or stove.",
              bn: "ফ্রিজ, মাইক্রোওয়েভ ও ওভেনের জন্য হেভি-ডিউটি সকেট, এবং সিংক বা চুলার ঠিক ওপরে কোনো সকেট নেই।",
            },
          },
          {
            code: "C8",
            title: {
              en: "Cabinets (if included)",
              bn: "কেবিনেট (চুক্তিতে থাকলে)",
            },
            howToCheck: {
              en: "Open every door and drawer: hinges firm, doors aligned, shelves not sagging or water-damaged.",
              bn: "প্রতিটি দরজা ও ড্রয়ার খুলে দেখুন: কবজা শক্ত, দরজা সোজা, তাক ঝুলে পড়েনি বা পানিতে নষ্ট হয়নি।",
            },
          },
        ],
      },
    ],
  },
  {
    id: "D",
    title: { en: "Balcony", bn: "বারান্দা" },
    intro: {
      en: "Checked on each balcony, together with the wall and ceiling checks A1 to A6.",
      bn: "প্রতিটি বারান্দায়, দেয়াল ও সিলিংয়ের A1 থেকে A6 পর্যন্ত পরীক্ষার সাথে দেখা হয়।",
    },
    groups: [
      {
        id: "D",
        title: null,
        items: [
          {
            code: "D1",
            title: { en: "Railing strength", bn: "রেলিং কতটা শক্ত" },
            howToCheck: {
              en: "Push the railing firmly with your hands while standing back. It should not move or rattle.",
              bn: "একটু পেছনে দাঁড়িয়ে হাত দিয়ে রেলিং জোরে ঠেলুন। এটি নড়বে না বা ঝনঝন করবে না।",
            },
          },
          {
            code: "D2",
            title: {
              en: "Railing height and gaps",
              bn: "রেলিংয়ের উচ্চতা ও ফাঁক",
            },
            howToCheck: {
              en: "Height meets the code minimum. Gaps no wider than about 10 cm, so a child cannot slip through.",
              bn: "উচ্চতা বিল্ডিং কোডের ন্যূনতম মান পূরণ করে। ফাঁক প্রায় ১০ সেমির বেশি চওড়া নয়, যাতে শিশু গলে পড়ে যেতে না পারে।",
            },
            confirm: true,
            confirmNote: "BNBC figure",
          },
          {
            code: "D3",
            title: { en: "Floor slope and drain", bn: "মেঝের ঢাল ও ড্রেন" },
            howToCheck: {
              en: "Pour a bucket of water: it should flow to the balcony drain, never towards the room door.",
              bn: "এক বালতি পানি ঢালুন: পানি বারান্দার ড্রেনের দিকে যাবে, কখনো ঘরের দরজার দিকে নয়।",
            },
          },
          {
            code: "D4",
            title: { en: "Step at the room door", bn: "ঘরের দরজায় ধাপ" },
            howToCheck: {
              en: "The balcony floor sits lower than the room floor, so rain cannot flow inside.",
              bn: "বারান্দার মেঝে ঘরের মেঝের চেয়ে নিচু, যাতে বৃষ্টির পানি ভেতরে ঢুকতে না পারে।",
            },
          },
          {
            code: "D5",
            title: { en: "Leaks into the room", bn: "ঘরে পানি চুঁইয়ে আসা" },
            howToCheck: {
              en: "Check the room wall and floor next to the balcony door for damp patches or stains.",
              bn: "বারান্দার দরজার পাশে ঘরের দেয়াল ও মেঝেতে স্যাঁতসেঁতে দাগ বা অন্য দাগ আছে কি না দেখুন।",
            },
          },
          {
            code: "D6",
            title: { en: "Drain pipe", bn: "ড্রেনের পাইপ" },
            howToCheck: {
              en: "The balcony drain is piped away and does not spill onto the wall or the balcony below.",
              bn: "বারান্দার ড্রেনের পানি পাইপ দিয়ে সরে যায়, দেয়ালে বা নিচের বারান্দায় পড়ে না।",
            },
          },
          {
            code: "D7",
            title: { en: "Fittings", bn: "ফিটিংস" },
            howToCheck: {
              en: "Light point, drying rod and any grill or net in the agreement are installed and working.",
              bn: "বাতির পয়েন্ট, কাপড় শুকানোর রড এবং চুক্তিতে থাকা গ্রিল বা নেট লাগানো আছে ও ঠিকমতো কাজ করে।",
            },
          },
        ],
      },
    ],
  },
  {
    id: "E",
    title: { en: "Whole flat", bn: "পুরো ফ্ল্যাট" },
    intro: {
      en: "Checked once for the whole flat.",
      bn: "পুরো ফ্ল্যাটের জন্য একবার দেখা হয়।",
    },
    groups: [
      {
        id: "E-electricity",
        title: { en: "Electricity", bn: "বিদ্যুৎ" },
        items: [
          {
            code: "E1",
            title: {
              en: "Distribution board (DB)",
              bn: "ডিস্ট্রিবিউশন বোর্ড (DB)",
            },
            howToCheck: {
              en: "Easy to reach, cover on, every breaker labelled, and none trips when switched on. Do not open the cover.",
              bn: "সহজে হাত পৌঁছায়, কভার লাগানো, প্রতিটি ব্রেকারে লেবেল আছে, এবং চালু করলে কোনোটি ট্রিপ করে না। কভার খুলবেন না।",
            },
          },
          {
            code: "E2",
            title: { en: "Electricity meter", bn: "বিদ্যুতের মিটার" },
            howToCheck: {
              en: "Switch off your main breaker and ask the staff to confirm your meter stops recording. Note the meter number.",
              bn: "আপনার মেইন ব্রেকার বন্ধ করুন এবং কর্মীদের কাছ থেকে নিশ্চিত হোন যে আপনার মিটার চলা থেমে গেছে। মিটার নম্বর লিখে রাখুন।",
            },
          },
          {
            code: "E3",
            title: { en: "Earthing", bn: "আর্থিং" },
            howToCheck: {
              en: "Ask how the flat is earthed and for the earth test result. Three-pin sockets must have a working earth.",
              bn: "ফ্ল্যাটে আর্থিং কীভাবে করা হয়েছে এবং আর্থ টেস্টের ফলাফল জিজ্ঞেস করুন। থ্রি-পিন সকেটে কার্যকর আর্থ থাকতেই হবে।",
            },
            confirm: true,
          },
          {
            code: "E4",
            title: { en: "Generator backup", bn: "জেনারেটর ব্যাকআপ" },
            howToCheck: {
              en: "Ask for the generator to be run. Check which lights, fans and sockets get backup, as the agreement promises.",
              bn: "জেনারেটর চালিয়ে দেখাতে বলুন। চুক্তি অনুযায়ী কোন বাতি, ফ্যান ও সকেট ব্যাকআপ পায় তা দেখুন।",
            },
          },
          {
            code: "E5",
            title: {
              en: "IPS provision (if promised)",
              bn: "আইপিএসের ব্যবস্থা (প্রতিশ্রুতি থাকলে)",
            },
            howToCheck: {
              en: "A separate IPS wiring point or circuit where agreed.",
              bn: "যেখানে কথা হয়েছে সেখানে আইপিএসের আলাদা ওয়্যারিং পয়েন্ট বা সার্কিট।",
            },
          },
        ],
      },
      {
        id: "E-water",
        title: { en: "Water", bn: "পানি" },
        items: [
          {
            code: "E6",
            title: { en: "Water source and quality", bn: "পানির উৎস ও মান" },
            howToCheck: {
              en: "Ask whether water comes from WASA, a deep tubewell or both. Run the taps and check colour, smell and sediment.",
              bn: "জিজ্ঞেস করুন পানি ওয়াসা, গভীর নলকূপ নাকি দুটো থেকেই আসে। কল ছেড়ে পানির রং, গন্ধ ও তলানি দেখুন।",
            },
          },
          {
            code: "E7",
            title: { en: "Hidden leaks", bn: "লুকানো লিক" },
            howToCheck: {
              en: "Close every tap and listen. Running water sounds, or drips under sinks, mean a hidden leak.",
              bn: "সব কল বন্ধ করে কান পাতুন। পানি চলার শব্দ, বা সিংকের নিচে ফোঁটা পড়া মানে কোথাও লুকানো লিক আছে।",
            },
          },
        ],
      },
      {
        id: "E-entrance",
        title: { en: "Entrance and area", bn: "প্রবেশপথ ও আয়তন" },
        items: [
          {
            code: "E8",
            title: { en: "Main entrance door", bn: "মূল প্রবেশ দরজা" },
            howToCheck: {
              en: "Solid, closes and locks firmly, with the peephole, safety chain and stopper the agreement lists.",
              bn: "মজবুত, শক্তভাবে বন্ধ ও লক হয়, এবং চুক্তিতে থাকা পিপহোল, সেফটি চেইন ও স্টপার আছে।",
            },
          },
          {
            code: "E9",
            title: { en: "Doorbell and intercom", bn: "কলিং বেল ও ইন্টারকম" },
            howToCheck: {
              en: "The doorbell rings, and the intercom connects to the reception or guard room both ways.",
              bn: "কলিং বেল বাজে, এবং ইন্টারকমে রিসেপশন বা গার্ড রুমের সাথে দুই দিক থেকেই কথা বলা যায়।",
            },
          },
          {
            code: "E10",
            title: { en: "Flat area", bn: "ফ্ল্যাটের আয়তন" },
            howToCheck: {
              en: "Ask how the sold area was calculated (with or without a share of common space), and compare main room sizes with the plan.",
              bn: "বিক্রি করা আয়তন কীভাবে হিসাব হয়েছে (কমন স্পেসের ভাগসহ নাকি ছাড়া) জিজ্ঞেস করুন, এবং মূল ঘরগুলোর মাপ নকশার সাথে মিলিয়ে দেখুন।",
            },
            confirm: true,
          },
        ],
      },
    ],
  },
  {
    id: "F",
    title: { en: "Building and common areas", bn: "ভবন ও কমন এলাকা" },
    intro: {
      en: "Checked once. Many of these are shared, so the buyer is checking that what the agreement promised has been delivered.",
      bn: "একবার দেখা হয়। এগুলোর অনেকগুলোই সবার ব্যবহারের, তাই ক্রেতা দেখছেন চুক্তিতে যা প্রতিশ্রুতি ছিল তা দেওয়া হয়েছে কি না।",
    },
    groups: [
      {
        id: "F",
        title: null,
        items: [
          {
            code: "F1",
            title: { en: "Lift ride", bn: "লিফটে চড়ে দেখা" },
            howToCheck: {
              en: "Ride to every floor: smooth start and stop, floor level with the landing, and a working alarm button, light and fan.",
              bn: "প্রতিটি তলায় যান: মসৃণভাবে চলা ও থামা, লিফটের মেঝে ল্যান্ডিংয়ের সমান, এবং অ্যালার্ম বোতাম, বাতি ও ফ্যান কাজ করে।",
            },
          },
          {
            code: "F2",
            title: {
              en: "Lift papers and rescue device",
              bn: "লিফটের কাগজপত্র ও রেসকিউ ডিভাইস",
            },
            howToCheck: {
              en: "Ask for the installation certificate and service contract, and whether it has an automatic rescue device (ARD) for power cuts.",
              bn: "ইনস্টলেশন সার্টিফিকেট ও সার্ভিস চুক্তি দেখতে চান, এবং বিদ্যুৎ চলে গেলে কাজ করে এমন অটোমেটিক রেসকিউ ডিভাইস (ARD) আছে কি না জিজ্ঞেস করুন।",
            },
          },
          {
            code: "F3",
            title: { en: "Stairs", bn: "সিঁড়ি" },
            howToCheck: {
              en: "Handrails firm along the whole stair, steps even, and normal and emergency lights working.",
              bn: "পুরো সিঁড়িজুড়ে হাতল শক্ত, ধাপগুলো সমান, এবং সাধারণ ও জরুরি বাতি কাজ করে।",
            },
          },
          {
            code: "F4",
            title: {
              en: "Fire exit and fire safety",
              bn: "ফায়ার এক্সিট ও অগ্নি নিরাপত্তা",
            },
            howToCheck: {
              en: "Exit route clear and not locked, fire extinguishers in place and within date, and the fire alarm working if installed.",
              bn: "বের হওয়ার পথ খোলা ও তালা দেওয়া নয়, অগ্নিনির্বাপক যন্ত্র জায়গামতো আছে ও মেয়াদ পার হয়নি, এবং ফায়ার অ্যালার্ম থাকলে তা কাজ করে।",
            },
          },
          {
            code: "F5",
            title: { en: "Parking", bn: "পার্কিং" },
            howToCheck: {
              en: "Your space is marked with your flat number as in the agreement, and your car fits the ramp and headroom.",
              bn: "চুক্তি অনুযায়ী আপনার জায়গায় আপনার ফ্ল্যাট নম্বর লেখা, এবং আপনার গাড়ি র‍্যাম্প দিয়ে ও ছাদের উচ্চতার মধ্যে আঁটে।",
            },
          },
          {
            code: "F6",
            title: { en: "Roof", bn: "ছাদ" },
            howToCheck: {
              en: "Roof drains clear, water tank lids locked, parapet safe. Top-floor flats: check your ceiling for damp patches.",
              bn: "ছাদের ড্রেন পরিষ্কার, পানির ট্যাংকের ঢাকনা তালা দেওয়া, প্যারাপেট নিরাপদ। সবচেয়ে ওপরের তলার ফ্ল্যাট হলে নিজের সিলিংয়ে স্যাঁতসেঁতে দাগ আছে কি না দেখুন।",
            },
          },
          {
            code: "F7",
            title: { en: "Water tanks and pump", bn: "পানির ট্যাংক ও পাম্প" },
            howToCheck: {
              en: "Overhead tank and underground reservoir clean and covered; the pump starts and stops on its own.",
              bn: "ছাদের ট্যাংক ও মাটির নিচের রিজার্ভার পরিষ্কার ও ঢাকা; পাম্প নিজে নিজে চালু ও বন্ধ হয়।",
            },
          },
          {
            code: "F8",
            title: { en: "Corridors and lobby", bn: "করিডোর ও লবি" },
            howToCheck: {
              en: "Lights work, and floors and walls are finished as the agreement says.",
              bn: "বাতি কাজ করে, এবং মেঝে ও দেয়াল চুক্তি অনুযায়ী ফিনিশ করা।",
            },
          },
          {
            code: "F9",
            title: { en: "Security", bn: "নিরাপত্তা ব্যবস্থা" },
            howToCheck: {
              en: "Main gate, guard room and CCTV working as promised.",
              bn: "প্রতিশ্রুতি অনুযায়ী মূল গেট, গার্ড রুম ও সিসিটিভি কাজ করে।",
            },
          },
          {
            code: "F10",
            title: {
              en: "Rainwater around the building",
              bn: "ভবনের চারপাশে বৃষ্টির পানি",
            },
            howToCheck: {
              en: "Rain pipes run down to the drain, and the ground floor and parking do not hold water after rain.",
              bn: "বৃষ্টির পানির পাইপ নেমে ড্রেনে গেছে, এবং বৃষ্টির পরে নিচতলা ও পার্কিংয়ে পানি জমে না।",
            },
          },
        ],
      },
    ],
  },
  {
    id: "G",
    title: { en: "Papers and keys", bn: "কাগজপত্র ও চাবি" },
    intro: {
      en: "Collected at the end of the visit, before signing anything.",
      bn: "পরিদর্শনের শেষে, কোনো কিছুতে সই করার আগে সংগ্রহ করা হয়।",
    },
    groups: [
      {
        id: "G",
        title: null,
        items: [
          {
            code: "G1",
            title: { en: "Handover letter", bn: "হস্তান্তরপত্র" },
            howToCheck: {
              en: "Signed and dated, showing the flat number, parking number and the list of keys handed over.",
              bn: "সই ও তারিখসহ, যাতে ফ্ল্যাট নম্বর, পার্কিং নম্বর ও বুঝিয়ে দেওয়া চাবির তালিকা আছে।",
            },
          },
          {
            code: "G2",
            title: { en: "Keys", bn: "চাবি" },
            howToCheck: {
              en: "Keys for every lock (main door, rooms, bathrooms, windows, letter box, meter box), counted against the list.",
              bn: "প্রতিটি তালার চাবি (মূল দরজা, ঘর, বাথরুম, জানালা, চিঠির বাক্স, মিটার বাক্স), তালিকার সাথে গুনে মেলানো।",
            },
          },
          {
            code: "G3",
            title: { en: "Defect repair period", bn: "ত্রুটি মেরামতের মেয়াদ" },
            howToCheck: {
              en: "In writing: how long the developer will repair defects after handover, and how to report them.",
              bn: "লিখিতভাবে: হস্তান্তরের পর কত দিন পর্যন্ত ডেভেলপার ত্রুটি মেরামত করবে, এবং কীভাবে তা জানাতে হবে।",
            },
          },
          {
            code: "G4",
            title: {
              en: "This report acknowledged",
              bn: "এই রিপোর্টের প্রাপ্তি স্বীকার",
            },
            howToCheck: {
              en: "Give the developer this report and get it signed or acknowledged, with a repair date.",
              bn: "ডেভেলপারকে এই রিপোর্ট দিন এবং মেরামতের তারিখসহ সই বা প্রাপ্তি স্বীকার করিয়ে নিন।",
            },
          },
          {
            code: "G5",
            title: { en: "Utility papers", bn: "বিদ্যুৎ, গ্যাস ও পানির কাগজ" },
            howToCheck: {
              en: "Electricity meter papers, gas connection papers (if any) and water connection details.",
              bn: "বিদ্যুতের মিটারের কাগজ, গ্যাস সংযোগের কাগজ (থাকলে) ও পানির সংযোগের তথ্য।",
            },
          },
          {
            code: "G6",
            title: { en: "Warranties", bn: "ওয়ারেন্টি" },
            howToCheck: {
              en: "Warranty cards for sanitary fittings, geyser, lift, generator and any appliances provided.",
              bn: "স্যানিটারি ফিটিংস, গিজার, লিফট, জেনারেটর ও দেওয়া যেকোনো যন্ত্রপাতির ওয়ারেন্টি কার্ড।",
            },
          },
          {
            code: "G7",
            title: { en: "Layout drawings", bn: "লেআউট নকশা" },
            howToCheck: {
              en: "Electrical and plumbing drawings, so future drilling does not hit hidden pipes or wires.",
              bn: "বৈদ্যুতিক ও প্লাম্বিং নকশা, যাতে পরে ড্রিল করার সময় দেয়ালের ভেতরের পাইপ বা তারে না লাগে।",
            },
          },
          {
            code: "G8",
            title: { en: "Approvals", bn: "অনুমোদন" },
            howToCheck: {
              en: "A copy of the approved plan from RAJUK (or the local authority), and the status of the occupancy certificate.",
              bn: "রাজউক (বা স্থানীয় কর্তৃপক্ষ) অনুমোদিত নকশার কপি, এবং অকুপেন্সি সার্টিফিকেটের অবস্থা।",
            },
            confirm: true,
          },
          {
            code: "G9",
            title: {
              en: "Final payment statement",
              bn: "চূড়ান্ত পেমেন্টের হিসাব",
            },
            howToCheck: {
              en: "All payments and adjustments listed, with nothing outstanding.",
              bn: "সব পেমেন্ট ও সমন্বয় তালিকায় আছে, কিছু বাকি নেই।",
            },
          },
          {
            code: "G10",
            title: { en: "Registration", bn: "রেজিস্ট্রেশন" },
            howToCheck: {
              en: "If not done yet, the date by which the flat and its land share will be registered in your name, in writing.",
              bn: "এখনো না হয়ে থাকলে, কোন তারিখের মধ্যে ফ্ল্যাট ও জমির অংশ আপনার নামে রেজিস্ট্রি হবে, তা লিখিতভাবে।",
            },
          },
          {
            code: "G11",
            title: { en: "Owners' association", bn: "ফ্ল্যাট মালিক সমিতি" },
            howToCheck: {
              en: "Who runs the flat owners' association, the monthly service charge, and what it covers.",
              bn: "ফ্ল্যাট মালিক সমিতি কে চালায়, মাসিক সার্ভিস চার্জ কত, এবং তাতে কী কী অন্তর্ভুক্ত।",
            },
          },
        ],
      },
    ],
  },
];
