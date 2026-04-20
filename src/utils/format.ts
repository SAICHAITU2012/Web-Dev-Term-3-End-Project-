import type { DashboardSummary, TripBundle } from "../types";

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatDate(value: string) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateRange(startDate: string, endDate: string) {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function getTripLength(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const difference =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return Math.max(difference, 1);
}

export function getDaysUntil(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const future = new Date(date);
  future.setHours(0, 0, 0, 0);

  return Math.ceil((future.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function createDashboardSummary(trips: TripBundle[]): DashboardSummary {
  const allExpenses = trips.flatMap((bundle) => bundle.expenses);
  const allDocuments = trips.flatMap((bundle) => bundle.documents);
  const allActivities = trips.flatMap((bundle) => bundle.itinerary);

  return {
    totalTrips: trips.length,
    totalBudget: trips.reduce((sum, bundle) => sum + bundle.trip.budgetTotal, 0),
    totalPlannedSpend: allExpenses.reduce(
      (sum, item) => sum + item.plannedAmount,
      0,
    ),
    totalActualSpend: allExpenses.reduce(
      (sum, item) => sum + item.actualAmount,
      0,
    ),
    readyDocuments: allDocuments.filter((item) => item.status === "Ready").length,
    pendingDocuments: allDocuments.filter((item) => item.status !== "Ready").length,
    upcomingActivities: allActivities.filter(
      (item) =>
        new Date(`${item.date}T${item.startTime || "00:00"}`).getTime() >=
        Date.now(),
    ).length,
  };
}

export function sortByDate<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  );
}

export function sortTripsByStartDate(trips: TripBundle[]) {
  return [...trips].sort(
    (first, second) =>
      new Date(first.trip.startDate).getTime() -
      new Date(second.trip.startDate).getTime(),
  );
}

export function sortItineraryByDate<T extends { date: string; startTime: string }>(
  items: T[],
) {
  return [...items].sort((first, second) => {
    const firstValue = new Date(
      `${first.date}T${first.startTime || "00:00"}`,
    ).getTime();
    const secondValue = new Date(
      `${second.date}T${second.startTime || "00:00"}`,
    ).getTime();

    return firstValue - secondValue;
  });
}
