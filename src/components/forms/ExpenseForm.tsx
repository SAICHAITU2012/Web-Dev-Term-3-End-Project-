import { useEffect, useState } from "react";
import type { ExpenseCategory, ExpenseDraft, ExpenseItem } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";

const expenseCategories: ExpenseCategory[] = [
  "Flights",
  "Hotels",
  "Transport",
  "Food",
  "Activities",
  "Shopping",
  "Emergency",
];

function getDefaultDraft(tripId: string): ExpenseDraft {
  return {
    tripId,
    category: "Flights",
    label: "",
    plannedAmount: 0,
    actualAmount: 0,
    dueDate: "",
    notes: "",
  };
}

function toDraft(expense: ExpenseItem | null | undefined, tripId: string) {
  return expense
    ? {
        tripId: expense.tripId,
        category: expense.category,
        label: expense.label,
        plannedAmount: expense.plannedAmount,
        actualAmount: expense.actualAmount,
        dueDate: expense.dueDate,
        notes: expense.notes,
      }
    : getDefaultDraft(tripId);
}

export function ExpenseForm({
  open,
  onClose,
  initialExpense,
  tripId,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  initialExpense?: ExpenseItem | null;
  tripId: string;
  onSubmit: (draft: ExpenseDraft) => Promise<void>;
  submitting: boolean;
}) {
  const [form, setForm] = useState<ExpenseDraft>(getDefaultDraft(tripId));

  useEffect(() => {
    setForm(toDraft(initialExpense, tripId));
  }, [initialExpense, open, tripId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <Modal
      title={initialExpense ? "Update budget line" : "Add budget item"}
      open={open}
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="grid-two">
          <Select
            label="Category"
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value as ExpenseCategory,
              }))
            }
          >
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <Input
            label="Label"
            value={form.label}
            onChange={(event) =>
              setForm((current) => ({ ...current, label: event.target.value }))
            }
            placeholder="Airport transfer"
            required
          />
          <Input
            label="Planned amount"
            type="number"
            min="0"
            value={form.plannedAmount}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                plannedAmount: Number(event.target.value),
              }))
            }
            required
          />
          <Input
            label="Actual amount"
            type="number"
            min="0"
            value={form.actualAmount}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                actualAmount: Number(event.target.value),
              }))
            }
            required
          />
          <Input
            label="Payment deadline"
            type="date"
            value={form.dueDate}
            onChange={(event) =>
              setForm((current) => ({ ...current, dueDate: event.target.value }))
            }
          />
        </div>

        <Textarea
          label="Notes"
          rows={4}
          value={form.notes}
          onChange={(event) =>
            setForm((current) => ({ ...current, notes: event.target.value }))
          }
          placeholder="Refund policy, booking site, reminders, negotiation notes."
        />

        <div className="modal-actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : initialExpense ? "Save changes" : "Add item"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
