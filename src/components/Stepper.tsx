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
  const id = `stepper-${label}`;
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
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          <Icon name="minus" size={18} />
        </button>
        <output className="stepper__value" aria-live="polite">
          {value}
        </output>
        <button
          type="button"
          className="stepper__btn"
          aria-label={`More ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          <Icon name="plus" size={18} />
        </button>
      </div>
    </div>
  );
}
