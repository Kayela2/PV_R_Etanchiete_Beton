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
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <span className="toggle-row__label">{label}</span>
    <div className="toggle-group" style={{ alignSelf: "stretch" }}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            "toggle-btn",
            value === opt.value ? "toggle-btn--active" : "",
          ].join(" ")}
          style={{ flex: 1 }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);