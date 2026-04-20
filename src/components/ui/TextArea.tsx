// src/components/ui/TextArea.tsx
/*import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-xs font-semibold tracking-widest text-smac-gray uppercase">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={4}
          className={[
            "w-full bg-smac-grayLight rounded-xl px-4 py-3 text-smac-dark",
            "text-sm placeholder:text-gray-400 outline-none resize-none",
            "border border-transparent transition-all",
            "focus:border-smac-red focus:bg-white focus:ring-2 focus:ring-smac-redLight",
            error ? "border-red-400 bg-red-50" : "",
            className,
          ].join(" ")}
          {...props}
        />
        {error && (
          <p className="text-xs text-smac-red font-medium">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";*/
import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, ...props }, ref) => (
    <div className="field">
      {label && <label className="field__label">{label}</label>}
      <textarea ref={ref} rows={4} className="field__textarea" {...props} />
      {error && <p className="field__error">{error}</p>}
    </div>
  )
);
TextArea.displayName = "TextArea";