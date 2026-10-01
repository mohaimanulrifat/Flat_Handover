interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function Stepper({ label, value, min, max, onChange }: Props) {
  return (
    <div className="stepper">
      <span className="stepper__label" id={`stepper-${label}`}>
        {label}
      </span>
      <div
        className="stepper__controls"
        role="group"
        aria-labelledby={`stepper-${label}`}
      >
        <button
          type="button"
          className="stepper__btn"
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          −
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
          +
        </button>
      </div>
    </div>
  );
}
