/**
 * Flat handover checklist content.
 *
 * Source: Flat_Handover_Checklist_Draft1.docx (draft 1, 26 September 2026).
 * Text is copied from the document as written. Edit it here when the
 * reviewed draft comes back.
 *
 * Not included on purpose: the "Your note" column and the "Decisions for
 * you" section, which are review material and not shown to buyers.
 *
 * Severity display names live in src/config.ts so they can be renamed in
 * one place. Note that some "how to check" texts mention a level by name
 * (for example "mark Safety"), so update those too if a level is renamed.
 */

export type SectionId = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface ChecklistItem {
  /** Item code from the document, for example "A1" or "B4". */
  code: string;
  /** The "Check" column. */
  title: string;
  /** The "How to check" column, without the [Confirm] marker. */
  howToCheck: string;
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
  title: string | null;
  items: ChecklistItem[];
}

export interface ChecklistSection {
  id: SectionId;
  title: string;
  /** The line under the section heading in the document. */
  intro: string;
  groups: ItemGroup[];
}

export type SeverityId = "minor" | "major" | "safety";

export interface SeverityLevel {
  id: SeverityId;
  meaning: string;
  examples: string;
}

/** Ordered from least to most serious. Names are in src/config.ts. */
export const severityLevels: SeverityLevel[] = [
  {
    id: "minor",
    meaning: "Looks wrong but does not affect use.",
    examples:
      "Paint stains, small chips, a loose switch plate, uneven grout colour.",
  },
  {
    id: "major",
    meaning: "Affects use, or will get worse with time.",
    examples:
      "Leaks, damp patches, hollow tiles, doors or windows that do not close, water pooling on the floor.",
  },
  {
    id: "safety",
    meaning: "Can hurt someone. Must be fixed before moving in.",
    examples:
      "Exposed wires, sparking or hot sockets, loose railings, gas smell, wide or diagonal cracks in beams, columns or slabs.",
  },
];

/** "Before you go: What to bring". */
export const whatToBring: string[] = [
  "Your charged phone with this app (camera and torch)",
  "A coin, or a small rubber mallet, for tapping tiles and plaster",
  "A phone charger, to test sockets",
  "A marble or small ball, to check floor slope",
  "A bucket for drain tests, or ask the site staff for water",
  "A 5 m measuring tape",
  "Masking tape and a marker, to mark each defect on site before photographing it",
  "Your sale agreement, specification list and floor plan",
];

/** "Before you go: Ground rules". */
export const groundRules: string[] = [
  "Go in daylight, and ask the developer to keep electricity, water and the lift running during your visit.",
  "Take someone with you, ideally an engineer.",
  "Do not open the distribution board (DB) cover or touch bare wires.",
  "Check for gas leaks only with soapy water, never with a flame.",
  "Test railings and grills by pushing with your hands while standing firmly. Never lean your body over them.",
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
  name: string;
  repeatFor?: LayoutCount;
  parts: SectionPart[];
}

/**
 * "How the app will use this list": the room-to-section mapping, in the
 * order the rooms appear in the app.
 */
export const roomTypes: RoomType[] = [
  { kind: "living", name: "Living room", parts: [{ section: "A" }] },
  { kind: "dining", name: "Dining room", parts: [{ section: "A" }] },
  {
    kind: "bedroom",
    name: "Bedroom",
    repeatFor: "bedrooms",
    parts: [{ section: "A" }],
  },
  {
    kind: "bathroom",
    name: "Bathroom",
    repeatFor: "bathrooms",
    parts: [{ section: "A" }, { section: "B" }],
  },
  {
    kind: "kitchen",
    name: "Kitchen",
    parts: [{ section: "A" }, { section: "C" }],
  },
  {
    kind: "balcony",
    name: "Balcony",
    repeatFor: "balconies",
    parts: [
      { section: "D" },
      { section: "A", onlyCodes: ["A1", "A2", "A3", "A4", "A5", "A6"] },
    ],
  },
  { kind: "wholeFlat", name: "Whole flat", parts: [{ section: "E" }] },
  {
    kind: "building",
    name: "Building and common areas",
    parts: [{ section: "F" }],
  },
  { kind: "endOfVisit", name: "End of the visit", parts: [{ section: "G" }] },
];

export const sections: ChecklistSection[] = [
  {
    id: "A",
    title: "Every room",
    intro:
      "Used for the living room, dining room, bedrooms, kitchen and bathrooms. Anything a room does not have (for example no window) is marked Not applicable with one tap.",
    groups: [
      {
        id: "A-walls",
        title: "Walls and ceiling",
        items: [
          {
            code: "A1",
            title: "Wall cracks",
            howToCheck:
              "Scan each wall in side light, especially around door and window corners. Mark Major if a coin edge fits in or the crack runs diagonally.",
          },
          {
            code: "A2",
            title: "Cracks in beams, columns or slab",
            howToCheck:
              "A thin line where a brick wall meets a beam or column is common. A crack across a beam, column or slab: mark Safety and have an engineer see it.",
          },
          {
            code: "A3",
            title: "Damp patches or white salt marks",
            howToCheck:
              "Look for dark stains, bubbling paint, white powdery patches or a musty smell, especially on outside walls and walls shared with bathrooms.",
          },
          {
            code: "A4",
            title: "Hollow plaster",
            howToCheck:
              "Knock on each wall at a few points with a knuckle or the mallet. A hollow or dull sound means the plaster has come away from the wall.",
          },
          {
            code: "A5",
            title: "Rust stains or flaking concrete on the ceiling",
            howToCheck:
              "Brown streaks, bulging or flaking patches can mean the steel inside the slab is rusting. Mark Safety and have an engineer see it.",
          },
          {
            code: "A6",
            title: "Paint and wall finish",
            howToCheck:
              "Check for patches, drips and uneven colour, and look along each wall at a low angle for bulges. Paint type should match the agreement.",
          },
        ],
      },
      {
        id: "A-floor",
        title: "Floor",
        items: [
          {
            code: "A7",
            title: "Hollow tiles",
            howToCheck:
              "Tap tiles across the room, at centres and corners, with a coin or the mallet. A hollow sound means the tile may crack or lift later.",
          },
          {
            code: "A8",
            title: "Cracked or chipped tiles",
            howToCheck:
              "Look closely along tile surfaces and edges, including under doors and along the skirting.",
          },
          {
            code: "A9",
            title: "Uneven edges and grout",
            howToCheck:
              "Slide your palm across the joints: no tile edge should stand higher than its neighbour. Joints should be fully filled, with no gaps or cracks.",
          },
          {
            code: "A10",
            title: "Floor level",
            howToCheck:
              "Place a marble at a few points. If it keeps rolling one way, the floor slopes; note where and in which direction.",
          },
          {
            code: "A11",
            title: "Tile type and shade",
            howToCheck:
              "Size, finish and brand match the agreement, with no obvious colour difference between batches.",
          },
          {
            code: "A12",
            title: "Skirting and thresholds",
            howToCheck:
              "Skirting firmly fixed with no hollow sound or gaps. Steps between rooms low and even, with no sharp edges.",
          },
        ],
      },
      {
        id: "A-doors",
        title: "Doors",
        items: [
          {
            code: "A13",
            title: "Opening and closing",
            howToCheck:
              "Open and close each door fully: no rubbing on the frame or floor, no swinging by itself, and an even gap all round.",
          },
          {
            code: "A14",
            title: "Locks, handles and keys",
            howToCheck:
              "Lock and unlock with every key provided. Handles should be firm. Count the keys against the handover list.",
          },
          {
            code: "A15",
            title: "Hinges and stoppers",
            howToCheck:
              "Hinges tight with every screw in place, and a door stopper wherever the door would hit a wall.",
          },
          {
            code: "A16",
            title: "Door surface",
            howToCheck:
              "Check for cracks, dents, peeling veneer and unfinished edges, including the top and bottom edges of the door.",
          },
        ],
      },
      {
        id: "A-windows",
        title: "Windows",
        items: [
          {
            code: "A17",
            title: "Sliding and locking",
            howToCheck:
              "Slide every shutter fully both ways. It should move smoothly without jamming, and the lock should close firmly.",
          },
          {
            code: "A18",
            title: "Glass and rubber seals",
            howToCheck:
              "No cracks, scratches or rattling glass. Rubber seals present and tight, with no daylight showing when the window is closed.",
          },
          {
            code: "A19",
            title: "Rain leakage",
            howToCheck:
              "Look for stains on the sill and the wall below. If safe, spray water on the outside and watch the inside bottom corners.",
          },
          {
            code: "A20",
            title: "Mosquito net (if included)",
            howToCheck:
              "Net shutters slide smoothly, and the net is tight and untorn.",
          },
          {
            code: "A21",
            title: "Window grill",
            howToCheck:
              "Firmly fixed, rust-free and fully painted, with bars close enough for child safety. Ask whether one grill can open in an emergency.",
            confirm: true,
          },
        ],
      },
      {
        id: "A-electrical",
        title: "Electrical points",
        items: [
          {
            code: "A22",
            title: "Switches",
            howToCheck:
              "Press every switch. Each should click cleanly and control the right light or fan.",
          },
          {
            code: "A23",
            title: "Sockets",
            howToCheck:
              "Plug a phone charger into every socket. No power or a loose fit is Major; sparking, buzzing or heat is Safety.",
          },
          {
            code: "A24",
            title: "Light and fan points",
            howToCheck:
              "Every light point has power. The ceiling fan hook holds firm when pulled, and the fan regulator works.",
          },
          {
            code: "A25",
            title: "Switch boards",
            howToCheck:
              "Boards sit flat and firmly on the wall, with no gaps showing wires.",
          },
          {
            code: "A26",
            title: "AC provision (bedrooms, living)",
            howToCheck:
              "A heavy-duty AC socket, a sleeve through the wall for the pipe, a drain outlet, and a safe spot for the outdoor unit.",
          },
          {
            code: "A27",
            title: "TV, internet and phone points",
            howToCheck:
              "Positions match the agreement, and the conduits have a pull wire inside for future cables.",
          },
          {
            code: "A28",
            title: "Room size and ceiling height",
            howToCheck:
              "Measure length, width and floor-to-ceiling height, and compare with the floor plan.",
          },
        ],
      },
    ],
  },
  {
    id: "B",
    title: "Bathroom",
    intro:
      "Checked in each bathroom, in addition to Section A.",
    groups: [
      {
        id: "B",
        title: null,
        items: [
          {
            code: "B1",
            title: "Floor slope to the drain",
            howToCheck:
              "Pour a bucket of water on the floor. It should all run to the floor drain quickly and leave no pools.",
          },
          {
            code: "B2",
            title: "Floor drain and smell",
            howToCheck:
              "Grating fixed but removable for cleaning. A sewer smell means the drain trap is missing or dry: mark Major.",
          },
          {
            code: "B3",
            title: "Tiles in the wet area",
            howToCheck:
              "Tap wall and floor tiles around the shower for hollow spots. Joints around pipes and taps should be fully sealed.",
          },
          {
            code: "B4",
            title: "Commode",
            howToCheck:
              "Flush several times: it refills, stops running, does not leak at the base, and does not rock when you sit on it.",
          },
          {
            code: "B5",
            title: "Basin",
            howToCheck:
              "Fill and drain it. It should be firmly fixed; check underneath with a torch for drips.",
          },
          {
            code: "B6",
            title: "Taps, shower and hand shower",
            howToCheck:
              "Open each fully: good flow, no drips when closed, and hot and cold marked the right way round.",
          },
          {
            code: "B7",
            title: "Water pressure",
            howToCheck:
              "Run the shower and the basin tap together. The flow should stay steady, not drop to a trickle.",
          },
          {
            code: "B8",
            title: "Geyser provision",
            howToCheck:
              "A geyser power point with its own switch, hot water pipes connected to the taps, and the switch away from shower splashes.",
          },
          {
            code: "B9",
            title: "Exhaust fan and ventilation",
            howToCheck:
              "The exhaust fan runs quietly and pulls air; the ventilation window opens and closes.",
          },
          {
            code: "B10",
            title: "Leaks into other rooms",
            howToCheck:
              "Check the bathroom ceiling for stains from the flat above, and the walls of the rooms next door for damp patches.",
          },
          {
            code: "B11",
            title: "Bathroom door",
            howToCheck:
              "Closes fully; the bottom edge is sealed and not swollen, cracked or peeling.",
          },
          {
            code: "B12",
            title: "Fittings",
            howToCheck:
              "Mirror, towel rail, soap holder and other fittings in the agreement are present and firm.",
          },
          {
            code: "B13",
            title: "Shock protection",
            howToCheck:
              "Sockets well away from water. Ask whether the bathroom circuits have an earth-leakage breaker (RCCB).",
            confirm: true,
          },
        ],
      },
    ],
  },
  {
    id: "C",
    title: "Kitchen",
    intro:
      "Checked in the kitchen, in addition to Section A.",
    groups: [
      {
        id: "C",
        title: null,
        items: [
          {
            code: "C1",
            title: "Sink and drain",
            howToCheck:
              "Fill and drain the sink: no leaks underneath, fast drainage, no gurgling or bad smell.",
          },
          {
            code: "C2",
            title: "Kitchen counter",
            howToCheck:
              "Level, firmly supported and neatly finished at the edges. Tap for hollow spots under the tiles or stone.",
          },
          {
            code: "C3",
            title: "Tiles behind stove and sink",
            howToCheck:
              "Fully grouted with no hollow spots, and no gap where the counter meets the wall.",
          },
          {
            code: "C4",
            title: "Gas line or LPG",
            howToCheck:
              "Ask whether it is piped gas (Titas or another company) or LPG. If gas is connected, brush soapy water on the joints: bubbles mean a leak. Never use a flame.",
          },
          {
            code: "C5",
            title: "Stove position",
            howToCheck:
              "The gas point is where the stove will actually sit, with no socket or switch right beside the flame.",
          },
          {
            code: "C6",
            title: "Kitchen exhaust",
            howToCheck:
              "The exhaust fan or chimney point works, and the duct opening leads outside.",
          },
          {
            code: "C7",
            title: "Appliance sockets",
            howToCheck:
              "Heavy-duty sockets for the fridge, microwave and oven, and no socket directly above the sink or stove.",
          },
          {
            code: "C8",
            title: "Cabinets (if included)",
            howToCheck:
              "Open every door and drawer: hinges firm, doors aligned, shelves not sagging or water-damaged.",
          },
        ],
      },
    ],
  },
  {
    id: "D",
    title: "Balcony",
    intro:
      "Checked on each balcony, together with the wall and ceiling checks A1 to A6.",
    groups: [
      {
        id: "D",
        title: null,
        items: [
          {
            code: "D1",
            title: "Railing strength",
            howToCheck:
              "Push the railing firmly with your hands while standing back. It should not move or rattle.",
          },
          {
            code: "D2",
            title: "Railing height and gaps",
            howToCheck:
              "Height meets the code minimum. Gaps no wider than about 10 cm, so a child cannot slip through.",
            confirm: true,
            confirmNote: "BNBC figure",
          },
          {
            code: "D3",
            title: "Floor slope and drain",
            howToCheck:
              "Pour a bucket of water: it should flow to the balcony drain, never towards the room door.",
          },
          {
            code: "D4",
            title: "Step at the room door",
            howToCheck:
              "The balcony floor sits lower than the room floor, so rain cannot flow inside.",
          },
          {
            code: "D5",
            title: "Leaks into the room",
            howToCheck:
              "Check the room wall and floor next to the balcony door for damp patches or stains.",
          },
          {
            code: "D6",
            title: "Drain pipe",
            howToCheck:
              "The balcony drain is piped away and does not spill onto the wall or the balcony below.",
          },
          {
            code: "D7",
            title: "Fittings",
            howToCheck:
              "Light point, drying rod and any grill or net in the agreement are installed and working.",
          },
        ],
      },
    ],
  },
  {
    id: "E",
    title: "Whole flat",
    intro:
      "Checked once for the whole flat.",
    groups: [
      {
        id: "E-electricity",
        title: "Electricity",
        items: [
          {
            code: "E1",
            title: "Distribution board (DB)",
            howToCheck:
              "Easy to reach, cover on, every breaker labelled, and none trips when switched on. Do not open the cover.",
          },
          {
            code: "E2",
            title: "Electricity meter",
            howToCheck:
              "Switch off your main breaker and ask the staff to confirm your meter stops recording. Note the meter number.",
          },
          {
            code: "E3",
            title: "Earthing",
            howToCheck:
              "Ask how the flat is earthed and for the earth test result. Three-pin sockets must have a working earth.",
            confirm: true,
          },
          {
            code: "E4",
            title: "Generator backup",
            howToCheck:
              "Ask for the generator to be run. Check which lights, fans and sockets get backup, as the agreement promises.",
          },
          {
            code: "E5",
            title: "IPS provision (if promised)",
            howToCheck:
              "A separate IPS wiring point or circuit where agreed.",
          },
        ],
      },
      {
        id: "E-water",
        title: "Water",
        items: [
          {
            code: "E6",
            title: "Water source and quality",
            howToCheck:
              "Ask whether water comes from WASA, a deep tubewell or both. Run the taps and check colour, smell and sediment.",
          },
          {
            code: "E7",
            title: "Hidden leaks",
            howToCheck:
              "Close every tap and listen. Running water sounds, or drips under sinks, mean a hidden leak.",
          },
        ],
      },
      {
        id: "E-entrance",
        title: "Entrance and area",
        items: [
          {
            code: "E8",
            title: "Main entrance door",
            howToCheck:
              "Solid, closes and locks firmly, with the peephole, safety chain and stopper the agreement lists.",
          },
          {
            code: "E9",
            title: "Doorbell and intercom",
            howToCheck:
              "The doorbell rings, and the intercom connects to the reception or guard room both ways.",
          },
          {
            code: "E10",
            title: "Flat area",
            howToCheck:
              "Ask how the sold area was calculated (with or without a share of common space), and compare main room sizes with the plan.",
            confirm: true,
          },
        ],
      },
    ],
  },
  {
    id: "F",
    title: "Building and common areas",
    intro:
      "Checked once. Many of these are shared, so the buyer is checking that what the agreement promised has been delivered.",
    groups: [
      {
        id: "F",
        title: null,
        items: [
          {
            code: "F1",
            title: "Lift ride",
            howToCheck:
              "Ride to every floor: smooth start and stop, floor level with the landing, and a working alarm button, light and fan.",
          },
          {
            code: "F2",
            title: "Lift papers and rescue device",
            howToCheck:
              "Ask for the installation certificate and service contract, and whether it has an automatic rescue device (ARD) for power cuts.",
          },
          {
            code: "F3",
            title: "Stairs",
            howToCheck:
              "Handrails firm along the whole stair, steps even, and normal and emergency lights working.",
          },
          {
            code: "F4",
            title: "Fire exit and fire safety",
            howToCheck:
              "Exit route clear and not locked, fire extinguishers in place and within date, and the fire alarm working if installed.",
          },
          {
            code: "F5",
            title: "Parking",
            howToCheck:
              "Your space is marked with your flat number as in the agreement, and your car fits the ramp and headroom.",
          },
          {
            code: "F6",
            title: "Roof",
            howToCheck:
              "Roof drains clear, water tank lids locked, parapet safe. Top-floor flats: check your ceiling for damp patches.",
          },
          {
            code: "F7",
            title: "Water tanks and pump",
            howToCheck:
              "Overhead tank and underground reservoir clean and covered; the pump starts and stops on its own.",
          },
          {
            code: "F8",
            title: "Corridors and lobby",
            howToCheck:
              "Lights work, and floors and walls are finished as the agreement says.",
          },
          {
            code: "F9",
            title: "Security",
            howToCheck:
              "Main gate, guard room and CCTV working as promised.",
          },
          {
            code: "F10",
            title: "Rainwater around the building",
            howToCheck:
              "Rain pipes run down to the drain, and the ground floor and parking do not hold water after rain.",
          },
        ],
      },
    ],
  },
  {
    id: "G",
    title: "Papers and keys",
    intro:
      "Collected at the end of the visit, before signing anything.",
    groups: [
      {
        id: "G",
        title: null,
        items: [
          {
            code: "G1",
            title: "Handover letter",
            howToCheck:
              "Signed and dated, showing the flat number, parking number and the list of keys handed over.",
          },
          {
            code: "G2",
            title: "Keys",
            howToCheck:
              "Keys for every lock (main door, rooms, bathrooms, windows, letter box, meter box), counted against the list.",
          },
          {
            code: "G3",
            title: "Defect repair period",
            howToCheck:
              "In writing: how long the developer will repair defects after handover, and how to report them.",
          },
          {
            code: "G4",
            title: "This report acknowledged",
            howToCheck:
              "Give the developer this report and get it signed or acknowledged, with a repair date.",
          },
          {
            code: "G5",
            title: "Utility papers",
            howToCheck:
              "Electricity meter papers, gas connection papers (if any) and water connection details.",
          },
          {
            code: "G6",
            title: "Warranties",
            howToCheck:
              "Warranty cards for sanitary fittings, geyser, lift, generator and any appliances provided.",
          },
          {
            code: "G7",
            title: "Layout drawings",
            howToCheck:
              "Electrical and plumbing drawings, so future drilling does not hit hidden pipes or wires.",
          },
          {
            code: "G8",
            title: "Approvals",
            howToCheck:
              "A copy of the approved plan from RAJUK (or the local authority), and the status of the occupancy certificate.",
            confirm: true,
          },
          {
            code: "G9",
            title: "Final payment statement",
            howToCheck:
              "All payments and adjustments listed, with nothing outstanding.",
          },
          {
            code: "G10",
            title: "Registration",
            howToCheck:
              "If not done yet, the date by which the flat and its land share will be registered in your name, in writing.",
          },
          {
            code: "G11",
            title: "Owners' association",
            howToCheck:
              "Who runs the flat owners' association, the monthly service charge, and what it covers.",
          },
        ],
      },
    ],
  },
];
