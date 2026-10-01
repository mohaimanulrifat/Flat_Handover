import type { ReactNode } from "react";
import { useTheme } from "../lib/theme.ts";
import { Icon } from "./Icon.tsx";

interface Props {
  title: string;
  back?: { href: string; label: string };
  side?: ReactNode;
  /** 0 to 1. Shows a thin progress line under the bar. */
  progress?: number;
}

export function TopBar({ title, back, side, progress }: Props) {
  return (
    <header className="topbar">
      <div className="topbar__row">
        {back && (
          <a
            className="icon-btn"
            href={back.href}
            aria-label={`Back to ${back.label}`}
          >
            <Icon name="back" />
            <span className="small">{back.label}</span>
          </a>
        )}
        <div className="topbar__title">{title}</div>
        {side && <div className="topbar__side">{side}</div>}
        <ThemeToggle />
      </div>
      {progress !== undefined && (
        <div className="topbar__progress" aria-hidden="true">
          <div style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}
    </header>
  );
}

/** Switches between Nocturne (dark) and Daylight. */
export function ThemeToggle() {
  const [theme, toggle] = useTheme();
  const toLight = theme === "dark";
  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggle}
      aria-label={toLight ? "Switch to Daylight mode" : "Switch to Night mode"}
      title={toLight ? "Daylight mode" : "Night mode"}
    >
      <Icon name={toLight ? "sun" : "moon"} />
    </button>
  );
}
