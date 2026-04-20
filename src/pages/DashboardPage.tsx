import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { StatCard } from "../components/ui/StatCard";
import { useAuth } from "../hooks/useAuth";
import { travelApi } from "../services/travelApi";
import type { TripBundle } from "../types";
import {
  createDashboardSummary,
  formatCurrency,
  formatDate,
  sortItineraryByDate,
  sortTripsByStartDate,
} from "../utils/format";

export default function DashboardPage() {
  const { user } = useAuth();
  const [bundles, setBundles] = useState<TripBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const refreshDashboard = useCallback(async () => {
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
          : "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshDashboard();
  }, [refreshDashboard]);

  const summary = useMemo(() => createDashboardSummary(bundles), [bundles]);

  const upcomingActivities = useMemo(() => {
    return sortItineraryByDate(
      bundles.flatMap((bundle) =>
        bundle.itinerary.map((item) => ({
          ...item,
          tripName: bundle.trip.name,
        })),
      ),
    )
      .filter(
        (item) =>
          new Date(`${item.date}T${item.startTime || "00:00"}`).getTime() >=
          Date.now(),
      )
      .slice(0, 5);
  }, [bundles]);

  if (loading) {
    return <Spinner label="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <Card>
        <h3>Unable to load dashboard</h3>
        <p>{error}</p>
      </Card>
    );
  }

  return (
    <div className="page-stack">
      <section className="hero-banner">
        <div>
          <span className="eyebrow">Main dashboard</span>
          <h2>Welcome back, {user?.fullName.split(" ")[0]}</h2>
          <p>
            Monitor every open trip, stay inside budget, and spot any missing
            documents before departure day.
          </p>
        </div>
        <Link className="button button-primary" to="/app/trips">
          Manage trips
        </Link>
      </section>

      {bundles.length === 0 ? (
        <EmptyState
          title="No trips yet"
          description="Create your first trip to unlock budget planning, itinerary scheduling, and document tracking."
          action={
            <Link className="button button-primary" to="/app/trips">
              Create your first trip
            </Link>
          }
        />
      ) : (
        <>
          <section className="stats-grid">
            <StatCard
              label="Trips in workspace"
              value={String(summary.totalTrips)}
              caption="Active and archived trip plans combined."
              accent="01"
            />
            <StatCard
              label="Total trip budget"
              value={formatCurrency(summary.totalBudget, bundles[0]?.trip.currency)}
              caption="Combined maximum planned spend across all trips."
              accent="02"
            />
            <StatCard
              label="Actual spend logged"
              value={formatCurrency(
                summary.totalActualSpend,
                bundles[0]?.trip.currency,
              )}
              caption="Real money already committed across trips."
              accent="03"
            />
            <StatCard
              label="Documents ready"
              value={`${summary.readyDocuments}/${summary.readyDocuments + summary.pendingDocuments}`}
              caption="Travel documents marked ready in the vault."
              accent="04"
            />
          </section>

          <section className="dashboard-grid">
            <Card>
              <div className="section-head">
                <div>
                  <span className="eyebrow">Recent trips</span>
                  <h3>Most recent trip workspaces</h3>
                </div>
                <Link className="button button-secondary" to="/app/trips">
                  View all
                </Link>
              </div>
              <div className="list-stack">
                {bundles.slice(0, 3).map((bundle) => (
                  <article className="list-card" key={bundle.trip.id}>
                    <div className="list-card-header">
                      <div>
                        <h4>{bundle.trip.name}</h4>
                        <p>{bundle.trip.destination}</p>
                      </div>
                      <span className="mode-pill">{bundle.trip.status}</span>
                    </div>
                    <div className="trip-meta-grid">
                      <div>
                        <span>Budget</span>
                        <strong>
                          {formatCurrency(
                            bundle.trip.budgetTotal,
                            bundle.trip.currency,
                          )}
                        </strong>
                      </div>
                      <div>
                        <span>Dates</span>
                        <strong>
                          {formatDate(bundle.trip.startDate)} -{" "}
                          {formatDate(bundle.trip.endDate)}
                        </strong>
                      </div>
                    </div>
                    <Link
                      className="button button-ghost"
                      to={`/app/trips/${bundle.trip.id}`}
                    >
                      Open workspace
                    </Link>
                  </article>
                ))}
              </div>
            </Card>

            <Card>
              <div className="section-head">
                <div>
                  <span className="eyebrow">Upcoming itinerary</span>
                  <h3>What is coming up next</h3>
                </div>
              </div>

              {upcomingActivities.length === 0 ? (
                <EmptyState
                  title="No future activities yet"
                  description="Start shaping a trip itinerary to see the next activities here."
                />
              ) : (
                <div className="list-stack">
                  {upcomingActivities.map((item) => (
                    <article className="list-card" key={item.id}>
                      <div className="list-card-header">
                        <div>
                          <h4>{item.title}</h4>
                          <p>{item.tripName}</p>
                        </div>
                        <span className="mode-pill">{item.priority}</span>
                      </div>
                      <div className="trip-meta-grid">
                        <div>
                          <span>Date</span>
                          <strong>{formatDate(item.date)}</strong>
                        </div>
                        <div>
                          <span>Time</span>
                          <strong>
                            {item.startTime || "Flexible"}
                            {item.endTime ? ` - ${item.endTime}` : ""}
                          </strong>
                        </div>
                        <div>
                          <span>Location</span>
                          <strong>{item.location}</strong>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
