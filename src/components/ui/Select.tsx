import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?:       string;
  error?:       string;
  placeholder?: string;
  options:      { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, placeholder, options, ...props }, ref) => (
    <div className="field">
      {label && <label className="field__label">{label}</label>}
      <div style={{ position: "relative" }}>
        <select ref={ref} className="field__select" {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={16} color="var(--gray)" style={{
          position: "absolute", right: 12,
          top: "50%", transform: "translateY(-50%)",
          pointerEvents: "none",
        }} />
      </div>
      {error && <p className="field__error">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";