import type { ItineraryItem } from "../types";
import { formatCurrency, formatDate, sortItineraryByDate } from "../utils/format";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";

export function ItineraryPanel({
  currency,
  itinerary,
  onAdd,
  onEdit,
  onDelete,
}: {
  currency: string;
  itinerary: ItineraryItem[];
  onAdd: () => void;
  onEdit: (item: ItineraryItem) => void;
  onDelete: (item: ItineraryItem) => void;
}) {
  const sorted = sortItineraryByDate(itinerary);

  return (
    <Card>
      <div className="section-head">
        <div>
          <span className="eyebrow">Itinerary</span>
          <h3>Build the trip day by day without losing context</h3>
        </div>
        <Button onClick={onAdd}>Add activity</Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No itinerary blocks yet"
          description="Break the trip into flights, check-ins, activity windows, and buffer time so the plan feels grounded."
          action={<Button onClick={onAdd}>Add first block</Button>}
        />
      ) : (
        <div className="timeline">
          {sorted.map((item) => (
            <article className="timeline-card" key={item.id}>
              <div className="timeline-marker" />
              <div className="timeline-content">
                <div className="list-card-header">
                  <div>
                    <h4>{item.title}</h4>
                    <p>
                      {formatDate(item.date)}
                      {item.startTime ? ` · ${item.startTime}` : ""}
                      {item.endTime ? ` - ${item.endTime}` : ""}
                    </p>
                  </div>
                  <span className="mode-pill">{item.priority}</span>
                </div>

                <div className="trip-meta-grid">
                  <div>
                    <span>Type</span>
                    <strong>{item.type}</strong>
                  </div>
                  <div>
                    <span>Location</span>
                    <strong>{item.location}</strong>
                  </div>
                  <div>
                    <span>Estimated cost</span>
                    <strong>{formatCurrency(item.costEstimate, currency)}</strong>
                  </div>
                </div>

                {item.notes ? <p className="muted-copy">{item.notes}</p> : null}

                <div className="card-actions">
                  <Button variant="secondary" onClick={() => onEdit(item)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => onDelete(item)}>
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
