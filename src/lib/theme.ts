import { useSyncExternalStore } from "react";

/**
 * Nocturne (dark) is the default. Daylight is the same design on a light
 * background, easier to read in bright sun on site. The choice is kept on
 * the phone. index.html applies it before the page draws, to avoid a flash.
 */
export type Theme = "dark" | "light";

const KEY = "handover-check:theme";
const BAR_COLOURS: Record<Theme, string> = {
  dark: "#0b1020",
  light: "#f4f2ec",
};
const listeners = new Set<() => void>();

function current(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", BAR_COLOURS[theme]);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Not saved; the choice still applies until the page is closed.
  }
  listeners.forEach((listener) => listener());
}

export function useTheme(): [Theme, () => void] {
  const theme = useSyncExternalStore((listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, current);
  return [theme, () => setTheme(theme === "dark" ? "light" : "dark")];
}
