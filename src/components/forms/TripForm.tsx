import { useEffect, useState } from "react";
import type { Trip, TripDraft, TripStatus } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";

const tripStatuses: TripStatus[] = [
  "Planning",
  "Booked",
  "In Progress",
  "Completed",
];

const defaultDraft: TripDraft = {
  name: "",
  destination: "",
  startDate: "",
  endDate: "",
  travelers: 1,
  budgetTotal: 1000,
  currency: "USD",
  status: "Planning",
  summary: "",
};

function toDraft(trip?: Trip | null): TripDraft {
  if (!trip) {
    return defaultDraft;
  }

  return {
    name: trip.name,
    destination: trip.destination,
    startDate: trip.startDate,
    endDate: trip.endDate,
    travelers: trip.travelers,
    budgetTotal: trip.budgetTotal,
    currency: trip.currency,
    status: trip.status,
    summary: trip.summary,
  };
}

export function TripForm({
  open,
  onClose,
  initialTrip,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  initialTrip?: Trip | null;
  onSubmit: (draft: TripDraft) => Promise<void>;
  submitting: boolean;
}) {
  const [form, setForm] = useState<TripDraft>(toDraft(initialTrip));

  useEffect(() => {
    setForm(toDraft(initialTrip));
  }, [initialTrip, open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <Modal
      title={initialTrip ? "Update trip plan" : "Create a new trip"}
      open={open}
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="grid-two">
          <Input
            label="Trip name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Summer in Seoul"
            required
          />
          <Input
            label="Destination"
            value={form.destination}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                destination: event.target.value,
              }))
            }
            placeholder="Seoul, South Korea"
            required
          />
          <Input
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={(event) =>
              setForm((current) => ({ ...current, startDate: event.target.value }))
            }
            required
          />
          <Input
            label="End date"
            type="date"
            value={form.endDate}
            onChange={(event) =>
              setForm((current) => ({ ...current, endDate: event.target.value }))
            }
            required
          />
          <Input
            label="Travelers"
            type="number"
            min="1"
            value={form.travelers}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                travelers: Number(event.target.value),
              }))
            }
            required
          />
          <Input
            label="Total budget"
            type="number"
            min="0"
            step="1"
            value={form.budgetTotal}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                budgetTotal: Number(event.target.value),
              }))
            }
            required
          />
          <Input
            label="Currency"
            value={form.currency}
            onChange={(event) =>
              setForm((current) => ({ ...current, currency: event.target.value }))
            }
            placeholder="USD"
            required
          />
          <Select
            label="Trip status"
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as TripStatus,
              }))
            }
          >
            {tripStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>

        <Textarea
          label="Trip summary"
          value={form.summary}
          onChange={(event) =>
            setForm((current) => ({ ...current, summary: event.target.value }))
          }
          rows={4}
          placeholder="What matters most on this trip? Budget goals, logistics, constraints, vibe."
          required
        />

        <div className="modal-actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : initialTrip ? "Save changes" : "Create trip"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
