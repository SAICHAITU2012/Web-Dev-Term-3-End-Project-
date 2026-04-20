import { Link } from "react-router-dom";
import type { TripBundle } from "../types";
import { formatCurrency, formatDateRange, getTripLength } from "../utils/format";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { ProgressBar } from "./ui/ProgressBar";

export function TripCard({
  bundle,
  onEdit,
  onDelete,
}: {
  bundle: TripBundle;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const plannedSpend = bundle.expenses.reduce(
    (sum, item) => sum + item.plannedAmount,
    0,
  );
  const readyDocuments = bundle.documents.filter(
    (item) => item.status === "Ready",
  ).length;

  return (
    <Card className="trip-card">
      <div className="trip-card-header">
        <div>
          <span className="eyebrow">{bundle.trip.status}</span>
          <h3>{bundle.trip.name}</h3>
          <p>{bundle.trip.destination}</p>
        </div>
        <span className="mode-pill">{bundle.trip.currency}</span>
      </div>

      <p className="trip-summary">{bundle.trip.summary}</p>

      <div className="trip-metrics">
        <div>
          <span>Travel window</span>
          <strong>{formatDateRange(bundle.trip.startDate, bundle.trip.endDate)}</strong>
        </div>
        <div>
          <span>Trip length</span>
          <strong>{getTripLength(bundle.trip.startDate, bundle.trip.endDate)} days</strong>
        </div>
        <div>
          <span>Travelers</span>
          <strong>{bundle.trip.travelers}</strong>
        </div>
      </div>

      <ProgressBar
        label="Planned budget usage"
        value={plannedSpend}
        max={bundle.trip.budgetTotal}
      />

      <div className="trip-meta-grid">
        <div>
          <span>Budget</span>
          <strong>{formatCurrency(bundle.trip.budgetTotal, bundle.trip.currency)}</strong>
        </div>
        <div>
          <span>Planned spend</span>
          <strong>{formatCurrency(plannedSpend, bundle.trip.currency)}</strong>
        </div>
        <div>
          <span>Activities</span>
          <strong>{bundle.itinerary.length}</strong>
        </div>
        <div>
          <span>Docs ready</span>
          <strong>
            {readyDocuments}/{bundle.documents.length || 0}
          </strong>
        </div>
      </div>

      <div className="card-actions">
        <Link className="button button-primary" to={`/app/trips/${bundle.trip.id}`}>
          Open workspace
        </Link>
        <Button variant="secondary" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </Card>
  );
}
