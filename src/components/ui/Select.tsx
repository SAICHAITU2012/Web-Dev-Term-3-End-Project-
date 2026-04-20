import type { ReactNode, SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function Select({
  label,
  hint,
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <select className={`field-input ${className}`} {...props}>
        {children}
      </select>
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
