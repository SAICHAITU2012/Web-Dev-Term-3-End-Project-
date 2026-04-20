import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
};

export function Textarea({
  label,
  hint,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <textarea className={`field-input field-textarea ${className}`} {...props} />
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
