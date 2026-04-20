import type { ConformiteValue } from "../../types";

interface ToggleGroupProps {
  label:    string;
  value:    ConformiteValue;
  onChange: (value: ConformiteValue) => void;
}

const OPTIONS: { value: ConformiteValue; label: string }[] = [
  { value: "conforme",     label: "Conforme"     },
  { value: "non-conforme", label: "Non Conforme" },
  { value: "SO",           label: "SO"           },
];

export const ToggleGroup = ({ label, value, onChange }: ToggleGroupProps) => (
  <div className="toggle-row">
    <span className="toggle-row__label">{label}</span>
    <div className="toggle-group">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            "toggle-btn",
            value === opt.value ? "toggle-btn--active" : "",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);