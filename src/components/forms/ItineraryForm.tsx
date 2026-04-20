import { useEffect, useState } from "react";
import type {
  ItineraryDraft,
  ItineraryItem,
  ItineraryType,
} from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";

const itineraryTypes: ItineraryType[] = [
  "Transit",
  "Stay",
  "Activity",
  "Food",
  "Work",
  "Buffer",
];

function defaultDraft(tripId: string): ItineraryDraft {
  return {
    tripId,
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: "",
    type: "Activity",
    priority: "Medium",
    costEstimate: 0,
  };
}

function toDraft(item: ItineraryItem | null | undefined, tripId: string) {
  return item
    ? {
        tripId: item.tripId,
        title: item.title,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        location: item.location,
        notes: item.notes,
        type: item.type,
        priority: item.priority,
        costEstimate: item.costEstimate,
      }
    : defaultDraft(tripId);
}

export function ItineraryForm({
  open,
  onClose,
  initialItem,
  tripId,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  initialItem?: ItineraryItem | null;
  tripId: string;
  onSubmit: (draft: ItineraryDraft) => Promise<void>;
  submitting: boolean;
}) {
  const [form, setForm] = useState<ItineraryDraft>(defaultDraft(tripId));

  useEffect(() => {
    setForm(toDraft(initialItem, tripId));
  }, [initialItem, open, tripId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <Modal
      title={initialItem ? "Update itinerary block" : "Add itinerary block"}
      open={open}
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="grid-two">
          <Input
            label="Title"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Check in at hotel"
            required
          />
          <Select
            label="Type"
            value={form.type}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                type: event.target.value as ItineraryType,
              }))
            }
          >
            {itineraryTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(event) =>
              setForm((current) => ({ ...current, date: event.target.value }))
            }
            required
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(event) =>
              setForm((current) => ({ ...current, location: event.target.value }))
            }
            placeholder="Uluwatu"
            required
          />
          <Input
            label="Start time"
            type="time"
            value={form.startTime}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                startTime: event.target.value,
              }))
            }
          />
          <Input
            label="End time"
            type="time"
            value={form.endTime}
            onChange={(event) =>
              setForm((current) => ({ ...current, endTime: event.target.value }))
            }
          />
          <Select
            label="Priority"
            value={form.priority}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                priority: event.target.value as ItineraryDraft["priority"],
              }))
            }
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Select>
          <Input
            label="Cost estimate"
            type="number"
            min="0"
            value={form.costEstimate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                costEstimate: Number(event.target.value),
              }))
            }
            required
          />
        </div>

        <Textarea
          label="Notes"
          rows={4}
          value={form.notes}
          onChange={(event) =>
            setForm((current) => ({ ...current, notes: event.target.value }))
          }
          placeholder="What should we carry, book, confirm, or avoid here?"
        />

        <div className="modal-actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : initialItem ? "Save changes" : "Add block"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
