export function ProgressBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const percent = max <= 0 ? 0 : Math.min((value / max) * 100, 100);

  return (
    <div className="progress-group">
      <div className="progress-label">
        <span>{label}</span>
        <strong>{Math.round(percent)}%</strong>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
