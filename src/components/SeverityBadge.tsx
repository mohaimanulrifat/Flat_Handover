import type { CSSProperties } from "react";
import { SEVERITY_COLOURS, SEVERITY_NAMES } from "../config.ts";
import type { SeverityId } from "../data/checklist.ts";

export function severityStyle(id: SeverityId): CSSProperties {
  return { "--sev": SEVERITY_COLOURS[id] } as CSSProperties;
}

export function SeverityBadge({ severity }: { severity: SeverityId | null }) {
  if (!severity) return <span className="badge">No severity</span>;
  return (
    <span className="badge" style={severityStyle(severity)}>
      {SEVERITY_NAMES[severity]}
    </span>
  );
}
