import type { ReactNode } from "react";
import { t } from "../lib/i18n.ts";
import { useLang } from "../lib/lang.ts";
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
  const [lang] = useLang();
  return (
    <header className="topbar">
      <div className="topbar__row">
        {back && (
          <a
            className="icon-btn"
            href={back.href}
            aria-label={t(lang, "backTo", { label: back.label })}
          >
            <Icon name="back" />
            <span className="small">{back.label}</span>
          </a>
        )}
        <div className="topbar__title">{title}</div>
        {side && <div className="topbar__side">{side}</div>}
        <LangToggle />
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

/** Switches the whole app between English and Bangla. */
export function LangToggle() {
  const [lang, toggle] = useLang();
  return (
    <button
      type="button"
      className="icon-btn lang-btn"
      onClick={toggle}
      aria-label={t(lang, "switchLangLabel")}
      lang={lang === "en" ? "bn" : "en"}
    >
      {t(lang, "switchLang")}
    </button>
  );
}

/** Switches between Nocturne (dark) and Daylight. */
export function ThemeToggle() {
  const [lang] = useLang();
  const [theme, toggle] = useTheme();
  const toLight = theme === "dark";
  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggle}
      aria-label={t(lang, toLight ? "toDaylight" : "toNight")}
      title={t(lang, toLight ? "daylightMode" : "nightMode")}
    >
      <Icon name={toLight ? "sun" : "moon"} />
    </button>
  );
}
