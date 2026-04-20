import type { ExpenseItem } from "../types";
import { formatCurrency, formatDate } from "../utils/format";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { ProgressBar } from "./ui/ProgressBar";

export function BudgetPanel({
  budgetTotal,
  currency,
  expenses,
  onAdd,
  onEdit,
  onDelete,
}: {
  budgetTotal: number;
  currency: string;
  expenses: ExpenseItem[];
  onAdd: () => void;
  onEdit: (expense: ExpenseItem) => void;
  onDelete: (expense: ExpenseItem) => void;
}) {
  const planned = expenses.reduce((sum, item) => sum + item.plannedAmount, 0);
  const actual = expenses.reduce((sum, item) => sum + item.actualAmount, 0);

  return (
    <Card>
      <div className="section-head">
        <div>
          <span className="eyebrow">Budget planner</span>
          <h3>Keep every booking aligned with the trip budget</h3>
        </div>
        <Button onClick={onAdd}>Add expense</Button>
      </div>

      <div className="stats-inline">
        <div>
          <span>Total budget</span>
          <strong>{formatCurrency(budgetTotal, currency)}</strong>
        </div>
        <div>
          <span>Planned</span>
          <strong>{formatCurrency(planned, currency)}</strong>
        </div>
        <div>
          <span>Actual</span>
          <strong>{formatCurrency(actual, currency)}</strong>
        </div>
      </div>

      <ProgressBar label="Planned vs total budget" value={planned} max={budgetTotal} />
      <ProgressBar label="Actual vs total budget" value={actual} max={budgetTotal} />

      {expenses.length === 0 ? (
        <EmptyState
          title="No budget items yet"
          description="Add flights, hotels, transport, and activity costs so the trip never surprises you later."
          action={<Button onClick={onAdd}>Add first expense</Button>}
        />
      ) : (
        <div className="list-stack">
          {expenses.map((expense) => (
            <article className="list-card" key={expense.id}>
              <div className="list-card-header">
                <div>
                  <h4>{expense.label}</h4>
                  <p>
                    {expense.category}
                    {expense.dueDate ? ` · due ${formatDate(expense.dueDate)}` : ""}
                  </p>
                </div>
                <span className="mode-pill">{expense.category}</span>
              </div>

              <div className="trip-meta-grid">
                <div>
                  <span>Planned</span>
                  <strong>{formatCurrency(expense.plannedAmount, currency)}</strong>
                </div>
                <div>
                  <span>Actual</span>
                  <strong>{formatCurrency(expense.actualAmount, currency)}</strong>
                </div>
              </div>

              {expense.notes ? <p className="muted-copy">{expense.notes}</p> : null}

              <div className="card-actions">
                <Button variant="secondary" onClick={() => onEdit(expense)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => onDelete(expense)}>
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
