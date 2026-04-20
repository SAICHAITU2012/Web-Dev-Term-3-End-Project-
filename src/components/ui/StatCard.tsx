import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  caption,
  accent,
}: {
  label: string;
  value: string;
  caption: string;
  accent: ReactNode;
}) {
  return (
    <article className="stat-card">
      <div className="stat-accent">{accent}</div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-caption">{caption}</span>
    </article>
  );
}
