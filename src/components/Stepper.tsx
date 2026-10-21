import { useId } from "react";
import { t } from "../lib/i18n.ts";
import { fmt, useLang } from "../lib/lang.ts";
import { Icon, type IconName } from "./Icon.tsx";

interface Props {
  label: string;
  icon: IconName;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function Stepper({ label, icon, value, min, max, onChange }: Props) {
  const [lang] = useLang();
  const id = useId();
  const name = lang === "en" ? label.toLowerCase() : label;
  return (
    <div className="stepper">
      <Icon name={icon} size={22} className="stepper__icon" />
      <span className="stepper__label" id={id}>
        {label}
      </span>
      <div className="stepper__controls" role="group" aria-labelledby={id}>
        <button
          type="button"
          className="stepper__btn"
          aria-label={t(lang, "fewer", { label: name })}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          <Icon name="minus" size={18} />
        </button>
        <output className="stepper__value" aria-live="polite">
          {fmt(lang, value)}
        </output>
        <button
          type="button"
          className="stepper__btn"
          aria-label={t(lang, "more", { label: name })}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          <Icon name="plus" size={18} />
        </button>
      </div>
    </div>
  );
}
