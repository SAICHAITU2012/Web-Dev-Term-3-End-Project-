import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ label, hint, className = "", ...props }: InputProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input className={`field-input ${className}`} {...props} />
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
