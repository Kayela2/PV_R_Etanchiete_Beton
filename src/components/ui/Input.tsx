import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:    string;
  error?:    string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className = "", ...props }, ref) => (
    <div className="field">
      {label && <label className="field__label">{label}</label>}
      <div style={{ position: "relative" }}>
        {leftIcon && (
          <span style={{
            position: "absolute", left: 12,
            top: "50%", transform: "translateY(-50%)",
            color: "var(--gray)", display: "flex",
          }}>
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={[
            "field__input",
            error ? "field__input--error" : "",
            leftIcon ? "pl-10" : "",
            className,
          ].join(" ")}
          style={leftIcon ? { paddingLeft: 40 } : {}}
          {...props}
        />
      </div>
      {error && <p className="field__error">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";