import { useSyncExternalStore } from "react";

/**
 * The language of the whole app: English by default, or Bangla. The choice
 * is kept on the phone. index.html applies it to <html lang> before the
 * page draws.
 */
export type Lang = "en" | "bn";

/** A text in both languages. */
export type LangText = Record<Lang, string>;

export const DEFAULT_LANG: Lang = "en";

const KEY = "handover-check:lang";
const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const listeners = new Set<() => void>();
let cache: Lang | null = null;

/** The language for a saved value: Bangla only if Bangla was chosen. */
export function langFromSaved(saved: string | null): Lang {
  return saved === "bn" ? "bn" : DEFAULT_LANG;
}

function current(): Lang {
  if (cache) return cache;
  try {
    cache = langFromSaved(localStorage.getItem(KEY));
  } catch {
    cache = DEFAULT_LANG;
  }
  return cache;
}

export function setLang(lang: Lang): void {
  cache = lang;
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // Not saved; the choice still applies until the page is closed.
  }
  listeners.forEach((listener) => listener());
}

/** The current language and a function that switches to the other one. */
export function useLang(): [Lang, () => void] {
  const lang = useSyncExternalStore((listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, current);
  return [lang, () => setLang(lang === "en" ? "bn" : "en")];
}

/** Formats a number with Bangla digits in Bangla, grouped the local way. */
export function fmt(lang: Lang, n: number, maxDecimals = 2): string {
  return new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-IN", {
    maximumFractionDigits: maxDecimals,
  }).format(n);
}

export function toBnDigits(text: string): string {
  return text.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

/** Bangla digits back to 0-9, so typed Bangla numbers can be read. */
export function toAsciiDigits(text: string): string {
  return text.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}
