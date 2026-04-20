import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { TripCard } from "../components/TripCard";
import { TripForm } from "../components/forms/TripForm";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Spinner } from "../components/ui/Spinner";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { travelApi } from "../services/travelApi";
import type { Trip, TripBundle, TripStatus } from "../types";
import { sortTripsByStartDate } from "../utils/format";

type StatusFilter = "All" | TripStatus;

export default function TripsPage() {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const { isRunning, run } = useAsyncAction();
  const [bundles, setBundles] = useState<TripBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const refresh = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await travelApi.listTripBundles(user.id);
      startTransition(() => {
        setBundles(sortTripsByStartDate(result));
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load trips right now.",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredTrips = useMemo(() => {
    return bundles.filter((bundle) => {
      const matchesQuery = [bundle.trip.name, bundle.trip.destination, bundle.trip.summary]
        .join(" ")
        .toLowerCase()
        .includes(deferredQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || bundle.trip.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [bundles, deferredQuery, statusFilter]);

  async function handleSubmitTrip(draft: Parameters<typeof travelApi.createTrip>[1]) {
    if (!user) {
      return;
    }

    await run(async () => {
      try {
        if (editingTrip) {
          await travelApi.updateTrip(user.id, editingTrip.id, draft);
          pushToast({
            title: "Trip updated",
            description: "Your travel plan has been saved.",
            tone: "success",
          });
        } else {
          await travelApi.createTrip(user.id, draft);
          pushToast({
            title: "Trip created",
            description: "A new travel workspace is now ready.",
            tone: "success",
          });
        }

        setFormOpen(false);
        setEditingTrip(null);
        await refresh();
      } catch (saveError) {
        pushToast({
          title: "Could not save trip",
          description:
            saveError instanceof Error ? saveError.message : "Please try again.",
          tone: "error",
        });
      }
    });
  }

  async function handleDeleteTrip(bundle: TripBundle) {
    if (!user) {
      return;
    }

    const approved = window.confirm(
      `Delete "${bundle.trip.name}" and every expense, itinerary block, and document inside it?`,
    );

    if (!approved) {
      return;
    }

    await run(async () => {
      try {
        await travelApi.deleteTrip(user.id, bundle.trip.id);
        pushToast({
          title: "Trip deleted",
          description: "The workspace has been removed.",
          tone: "info",
        });
        await refresh();
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
    return <Spinner label="Loading trip workspaces..." />;
  }

  return (
    <div className="page-stack">
      <section className="hero-banner">
        <div>
          <span className="eyebrow">Trip workspaces</span>
          <h2>Create and manage every trip from one dashboard</h2>
          <p>
            Search by destination, filter by status, and jump into a workspace
            where budget, itinerary, and document planning stay together.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTrip(null);
            setFormOpen(true);
          }}
        >
          New trip
        </Button>
      </section>

      <Card>
        <div className="filter-bar">
          <Input
            label="Search trips"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search destination, title, or summary"
          />
          <Select
            label="Status filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            <option value="All">All statuses</option>
            <option value="Planning">Planning</option>
            <option value="Booked">Booked</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </Select>
        </div>
      </Card>

      {error ? (
        <Card>
          <h3>Unable to load trips</h3>
          <p>{error}</p>
        </Card>
      ) : filteredTrips.length === 0 ? (
        <EmptyState
          title={bundles.length === 0 ? "No trips created yet" : "No trips match your filters"}
          description={
            bundles.length === 0
              ? "Create the first trip to start building a travel workspace."
              : "Try a different search term or clear the status filter."
          }
          action={
            <Button
              onClick={() => {
                setEditingTrip(null);
                setFormOpen(true);
              }}
            >
              Create a trip
            </Button>
          }
        />
      ) : (
        <section className="feature-grid">
          {filteredTrips.map((bundle) => (
            <TripCard
              key={bundle.trip.id}
              bundle={bundle}
              onEdit={() => {
                setEditingTrip(bundle.trip);
                setFormOpen(true);
              }}
              onDelete={() => void handleDeleteTrip(bundle)}
            />
          ))}
        </section>
      )}

      <TripForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTrip(null);
        }}
        initialTrip={editingTrip}
        onSubmit={handleSubmitTrip}
        submitting={isRunning}
      />
    </div>
  );
}
