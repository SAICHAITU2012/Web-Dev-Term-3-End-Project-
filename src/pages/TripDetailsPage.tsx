import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BudgetPanel } from "../components/BudgetPanel";
import { DocumentVault } from "../components/DocumentVault";
import { ItineraryPanel } from "../components/ItineraryPanel";
import { ExpenseForm } from "../components/forms/ExpenseForm";
import { DocumentForm } from "../components/forms/DocumentForm";
import { ItineraryForm } from "../components/forms/ItineraryForm";
import { TripForm } from "../components/forms/TripForm";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { travelApi } from "../services/travelApi";
import type {
  DocumentItem,
  TripDraft,
  ExpenseItem,
  ItineraryItem,
  TripBundle,
} from "../types";
import {
  formatCurrency,
  formatDateRange,
  getTripLength,
} from "../utils/format";

type DetailTab = "budget" | "itinerary" | "documents";

export default function TripDetailsPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const { isRunning, run } = useAsyncAction();
  const [bundle, setBundle] = useState<TripBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<DetailTab>("budget");
  const [tripFormOpen, setTripFormOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [itineraryFormOpen, setItineraryFormOpen] = useState(false);
  const [documentFormOpen, setDocumentFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [editingItinerary, setEditingItinerary] = useState<ItineraryItem | null>(null);
  const [editingDocument, setEditingDocument] = useState<DocumentItem | null>(null);
  const [, startTransition] = useTransition();

  const refreshBundle = useCallback(async () => {
    if (!user || !tripId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await travelApi.getTripBundle(user.id, tripId);

      startTransition(() => {
        setBundle(result);
      });

      if (!result) {
        setError("Trip not found or you no longer have access to it.");
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load this trip workspace.",
      );
    } finally {
      setLoading(false);
    }
  }, [tripId, user]);

  useEffect(() => {
    void refreshBundle();
  }, [refreshBundle]);

  const financials = useMemo(() => {
    if (!bundle) {
      return {
        planned: 0,
        actual: 0,
        readyDocuments: 0,
      };
    }

    return {
      planned: bundle.expenses.reduce((sum, item) => sum + item.plannedAmount, 0),
      actual: bundle.expenses.reduce((sum, item) => sum + item.actualAmount, 0),
      readyDocuments: bundle.documents.filter((item) => item.status === "Ready")
        .length,
    };
  }, [bundle]);

  async function handleUpdateTrip(draft: TripDraft) {
    if (!user || !bundle) {
      return;
    }

    await run(async () => {
      try {
        await travelApi.updateTrip(user.id, bundle.trip.id, draft);
        pushToast({
          title: "Trip updated",
          description: "Trip details were saved successfully.",
          tone: "success",
        });
        setTripFormOpen(false);
        await refreshBundle();
      } catch (saveError) {
        pushToast({
          title: "Trip update failed",
          description:
            saveError instanceof Error ? saveError.message : "Please try again.",
          tone: "error",
        });
      }
    });
  }

  async function handleExpenseSubmit(draft: Parameters<typeof travelApi.createExpense>[1]) {
    if (!user) {
      return;
    }

    await run(async () => {
      try {
        if (editingExpense) {
          await travelApi.updateExpense(user.id, editingExpense.id, draft);
        } else {
          await travelApi.createExpense(user.id, draft);
        }

        pushToast({
          title: editingExpense ? "Expense updated" : "Expense added",
          description: "The budget planner is now up to date.",
          tone: "success",
        });
        setExpenseFormOpen(false);
        setEditingExpense(null);
        await refreshBundle();
      } catch (saveError) {
        pushToast({
          title: "Budget update failed",
          description:
            saveError instanceof Error ? saveError.message : "Please try again.",
          tone: "error",
        });
      }
    });
  }

  async function handleDeleteExpense(expense: ExpenseItem) {
    if (!user) {
      return;
    }

    const approved = window.confirm(`Delete budget item "${expense.label}"?`);
    if (!approved) {
      return;
    }

    await run(async () => {
      try {
        await travelApi.deleteExpense(user.id, expense.id);
        pushToast({
          title: "Expense removed",
          description: "The budget planner has been updated.",
          tone: "info",
        });
        await refreshBundle();
      } catch (deleteError) {
        pushToast({
          title: "Delete failed",
          description:
            deleteError instanceof Error
              ? deleteError.message
              : "Please try again.",
          tone: "error",
        });
      }
    });
  }

  async function handleItinerarySubmit(draft: Parameters<typeof travelApi.createItineraryItem>[1]) {
    if (!user) {
      return;
    }

    await run(async () => {
      try {
        if (editingItinerary) {
          await travelApi.updateItineraryItem(user.id, editingItinerary.id, draft);
        } else {
          await travelApi.createItineraryItem(user.id, draft);
        }

        pushToast({
          title: editingItinerary ? "Itinerary updated" : "Itinerary block added",
          description: "The trip timeline now reflects your latest plan.",
          tone: "success",
        });
        setItineraryFormOpen(false);
        setEditingItinerary(null);
        await refreshBundle();
      } catch (saveError) {
        pushToast({
          title: "Itinerary update failed",
          description:
            saveError instanceof Error ? saveError.message : "Please try again.",
          tone: "error",
        });
      }
    });
  }

  async function handleDeleteItinerary(item: ItineraryItem) {
    if (!user) {
      return;
    }

    const approved = window.confirm(`Delete itinerary block "${item.title}"?`);
    if (!approved) {
      return;
    }

    await run(async () => {
      try {
        await travelApi.deleteItineraryItem(user.id, item.id);
        pushToast({
          title: "Itinerary block removed",
          description: "The trip timeline has been updated.",
          tone: "info",
        });
        await refreshBundle();
      } catch (deleteError) {
        pushToast({
          title: "Delete failed",
          description:
            deleteError instanceof Error
              ? deleteError.message
              : "Please try again.",
          tone: "error",
        });
      }
    });
  }

  async function handleDocumentSubmit(
    draft: Parameters<typeof travelApi.createDocument>[1],
    options: { file: File | null },
  ) {
    if (!user || !bundle) {
      return;
    }

    await run(async () => {
      try {
        if (editingDocument) {
          await travelApi.updateDocument(user.id, editingDocument.id, draft, {
            file: options.file,
            currentFilePath: editingDocument.filePath,
          });
        } else {
          await travelApi.createDocument(user.id, draft, options);
        }

        pushToast({
          title: editingDocument ? "Document updated" : "Document added",
          description: "The document vault is in sync.",
          tone: "success",
        });
        setDocumentFormOpen(false);
        setEditingDocument(null);
        await refreshBundle();
      } catch (saveError) {
        pushToast({
          title: "Document update failed",
          description:
            saveError instanceof Error ? saveError.message : "Please try again.",
          tone: "error",
        });
      }
    });
  }

  async function handleDeleteDocument(document: DocumentItem) {
    if (!user) {
      return;
    }

    const approved = window.confirm(`Delete document "${document.title}"?`);
    if (!approved) {
      return;
    }

    await run(async () => {
      try {
        await travelApi.deleteDocument(user.id, document.id);
        pushToast({
          title: "Document removed",
          description: "The document vault has been updated.",
          tone: "info",
        });
        await refreshBundle();
      } catch (deleteError) {
        pushToast({
          title: "Delete failed",
          description:
            deleteError instanceof Error
              ? deleteError.message
              : "Please try again.",
          tone: "error",
        });
      }
    });
  }

  if (loading) {
    return <Spinner label="Loading trip workspace..." />;
  }

  if (!bundle) {
    return (
      <Card>
        <h3>Trip not available</h3>
        <p>{error || "This workspace could not be found."}</p>
        <Link className="button button-primary" to="/app/trips">
          Back to trips
        </Link>
      </Card>
    );
  }

  return (
    <div className="page-stack">
      <section className="detail-hero">
        <div>
          <Link className="button button-ghost" to="/app/trips">
            Back to trips
          </Link>
          <span className="eyebrow">{bundle.trip.status}</span>
          <h2>{bundle.trip.name}</h2>
          <p>{bundle.trip.destination}</p>
          <p className="trip-summary">{bundle.trip.summary}</p>
        </div>
        <div className="detail-actions">
          <Button variant="secondary" onClick={() => setTripFormOpen(true)}>
            Edit trip
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              const approved = window.confirm(
                `Delete "${bundle.trip.name}" and return to the trips list?`,
              );

              if (!approved || !user) {
                return;
              }

              void run(async () => {
                try {
                  await travelApi.deleteTrip(user.id, bundle.trip.id);
                  pushToast({
                    title: "Trip deleted",
                    description: "The workspace was removed successfully.",
                    tone: "info",
                  });
                  navigate("/app/trips", { replace: true });
                } catch (deleteError) {
                  pushToast({
                    title: "Delete failed",
                    description:
                      deleteError instanceof Error
                        ? deleteError.message
                        : "Please try again.",
                    tone: "error",
                  });
                }
              });
            }}
          >
            Delete trip
          </Button>
        </div>
      </section>

      <section className="stats-grid">
        <Card className="mini-stat">
          <span>Travel dates</span>
          <strong>{formatDateRange(bundle.trip.startDate, bundle.trip.endDate)}</strong>
        </Card>
        <Card className="mini-stat">
          <span>Trip length</span>
          <strong>{getTripLength(bundle.trip.startDate, bundle.trip.endDate)} days</strong>
        </Card>
        <Card className="mini-stat">
          <span>Budget used</span>
          <strong>
            {formatCurrency(financials.actual, bundle.trip.currency)} /{" "}
            {formatCurrency(bundle.trip.budgetTotal, bundle.trip.currency)}
          </strong>
        </Card>
        <Card className="mini-stat">
          <span>Documents ready</span>
          <strong>
            {financials.readyDocuments}/{bundle.documents.length || 0}
          </strong>
        </Card>
      </section>

      <Card>
        <div className="tab-row">
          <button
            className={`tab-button ${activeTab === "budget" ? "tab-active" : ""}`}
            onClick={() => startTransition(() => setActiveTab("budget"))}
            type="button"
          >
            Budget
          </button>
          <button
            className={`tab-button ${activeTab === "itinerary" ? "tab-active" : ""}`}
            onClick={() => startTransition(() => setActiveTab("itinerary"))}
            type="button"
          >
            Itinerary
          </button>
          <button
            className={`tab-button ${activeTab === "documents" ? "tab-active" : ""}`}
            onClick={() => startTransition(() => setActiveTab("documents"))}
            type="button"
          >
            Documents
          </button>
        </div>
      </Card>

      {activeTab === "budget" ? (
        <BudgetPanel
          budgetTotal={bundle.trip.budgetTotal}
          currency={bundle.trip.currency}
          expenses={bundle.expenses}
          onAdd={() => {
            setEditingExpense(null);
            setExpenseFormOpen(true);
          }}
          onEdit={(expense) => {
            setEditingExpense(expense);
            setExpenseFormOpen(true);
          }}
          onDelete={(expense) => void handleDeleteExpense(expense)}
        />
      ) : null}

      {activeTab === "itinerary" ? (
        <ItineraryPanel
          currency={bundle.trip.currency}
          itinerary={bundle.itinerary}
          onAdd={() => {
            setEditingItinerary(null);
            setItineraryFormOpen(true);
          }}
          onEdit={(item) => {
            setEditingItinerary(item);
            setItineraryFormOpen(true);
          }}
          onDelete={(item) => void handleDeleteItinerary(item)}
        />
      ) : null}

      {activeTab === "documents" ? (
        <DocumentVault
          documents={bundle.documents}
          onAdd={() => {
            setEditingDocument(null);
            setDocumentFormOpen(true);
          }}
          onEdit={(document) => {
            setEditingDocument(document);
            setDocumentFormOpen(true);
          }}
          onDelete={(document) => void handleDeleteDocument(document)}
        />
      ) : null}

      <TripForm
        open={tripFormOpen}
        onClose={() => setTripFormOpen(false)}
        initialTrip={bundle.trip}
        onSubmit={handleUpdateTrip}
        submitting={isRunning}
      />

      <ExpenseForm
        open={expenseFormOpen}
        onClose={() => {
          setExpenseFormOpen(false);
          setEditingExpense(null);
        }}
        initialExpense={editingExpense}
        tripId={bundle.trip.id}
        onSubmit={handleExpenseSubmit}
        submitting={isRunning}
      />

      <ItineraryForm
        open={itineraryFormOpen}
        onClose={() => {
          setItineraryFormOpen(false);
          setEditingItinerary(null);
        }}
        initialItem={editingItinerary}
        tripId={bundle.trip.id}
        onSubmit={handleItinerarySubmit}
        submitting={isRunning}
      />

      <DocumentForm
        open={documentFormOpen}
        onClose={() => {
          setDocumentFormOpen(false);
          setEditingDocument(null);
        }}
        initialDocument={editingDocument}
        tripId={bundle.trip.id}
        supportsUploads={travelApi.supportsUploads}
        onSubmit={handleDocumentSubmit}
        submitting={isRunning}
      />
    </div>
  );
}
