import type { RoomKind } from "../data/checklist.ts";

/** Simple line icons, drawn on a 24 x 24 grid in the current text colour. */
const PATHS = {
  sofa: "M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 12.5a1.5 1.5 0 0 1 3 0V15h12v-2.5a1.5 1.5 0 0 1 3 0V18H3zM5.5 18v2M18.5 18v2",
  table: "M3 9h18M5.5 9v11M18.5 9v11M8 5h8M5.5 14h13",
  bed: "M3 19V6M3 14h18v5M21 14v-1.5A3.5 3.5 0 0 0 17.5 9H11v5M7 11.5h.01",
  bath: "M3 12h18v2.5A5.5 5.5 0 0 1 15.5 20h-7A5.5 5.5 0 0 1 3 14.5zM6 12V6.5a2.5 2.5 0 0 1 5 0M7.5 20l-1 2M16.5 20l1 2",
  pot: "M4 10h16v5.5a4.5 4.5 0 0 1-4.5 4.5h-7A4.5 4.5 0 0 1 4 15.5zM2 10h2M20 10h2M9.5 6.5c0-1.2 1-1.3 1-2.5M13.5 6.5c0-1.2 1-1.3 1-2.5",
  balcony: "M3 10h18M3 20h18M5 10v10M9.5 10v10M14.5 10v10M19 10v10M8 6h8",
  home: "M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5.5h4V20",
  building:
    "M5 21V4h10v17M15 9h4v12M3 21h18M8.5 8h.01M11.5 8h.01M8.5 12h.01M11.5 12h.01M8.5 16h.01M11.5 16h.01",
  papers: "M7 3h7l5 5v13H7zM14 3v5h5M10 14.5l2 2 4-4",
  camera:
    "M4 8h3.5L9.5 5h5l2 3H20v11H4zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7",
  image: "M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15.5 9.5h.01",
  check: "M5 12.5l4.5 4.5L19 7.5",
  x: "M6 6l12 12M18 6L6 18",
  minus: "M5 12h14",
  plus: "M12 5v14M5 12h14",
  alert: "M12 4l9.5 16h-19zM12 10v4M12 17h.01",
  moon: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4",
  back: "M15 5l-7 7 7 7",
  next: "M9 5l7 7-7 7",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 11v5M12 8h.01",
  share: "M12 4v11M7.5 8.5L12 4l4.5 4.5M5 13v7h14v-7",
  download: "M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14",
  bag: "M5 8h14l-1 13H6zM9 8V6.5a3 3 0 0 1 6 0V8",
  shield: "M12 3l8 3v6c0 4.8-3.4 7.9-8 9-4.6-1.1-8-4.2-8-9V6z",
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z",
  report: "M7 3h10v18H7zM10 8h4M10 12h4M10 16h2",
  calculator:
    "M6 3h12v18H6zM9 6.5h6v3H9zM9 13h.01M12 13h.01M15 13h.01M9 16.5h.01M12 16.5h.01M15 16.5h.01",
  layers: "M12 4l9 4.5-9 4.5-9-4.5zM3 13l9 4.5 9-4.5M3 17l9 4.5 9-4.5",
  globe:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9s1.3-6.4 3.8-9",
  ruler: "M4 15L15 4l5 5L9 20zM8 11l2 2M11 8l2 2M14 5l2 2",
} as const;

export type IconName = keyof typeof PATHS;

interface Props {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 20, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export const ROOM_ICONS: Record<RoomKind, IconName> = {
  living: "sofa",
  dining: "table",
  bedroom: "bed",
  bathroom: "bath",
  kitchen: "pot",
  balcony: "balcony",
  wholeFlat: "home",
  building: "building",
  endOfVisit: "papers",
};
