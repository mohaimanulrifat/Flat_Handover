import type { CSSProperties } from "react";
import { SEVERITY_COLOURS, SEVERITY_NAMES } from "../config.ts";
import type { SeverityId } from "../data/checklist.ts";
import { t } from "../lib/i18n.ts";
import { useLang } from "../lib/lang.ts";

export function severityStyle(id: SeverityId): CSSProperties {
  return { "--sev": SEVERITY_COLOURS[id] } as CSSProperties;
}

export function SeverityBadge({ severity }: { severity: SeverityId | null }) {
  const [lang] = useLang();
  if (!severity) return <span className="badge">{t(lang, "noSeverity")}</span>;
  return (
    <span className="badge" style={severityStyle(severity)}>
      {SEVERITY_NAMES[severity][lang]}
    </span>
  );
}
