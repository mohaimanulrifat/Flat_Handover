import type { ReactNode } from "react";

interface Props {
  title: string;
  back?: { href: string; label: string };
  side?: ReactNode;
}

export function TopBar({ title, back, side }: Props) {
  return (
    <header className="topbar">
      {back && (
        <a href={back.href} aria-label={`Back to ${back.label}`}>
          ‹ {back.label}
        </a>
      )}
      <div className="topbar__title">{title}</div>
      {side && <div className="topbar__side">{side}</div>}
    </header>
  );
}
