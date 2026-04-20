export type PlannerUser = {
  id: string;
  email: string;
  fullName: string;
  authMode: "supabase" | "demo";
};

export type TripStatus = "Planning" | "Booked" | "In Progress" | "Completed";
export type ExpenseCategory =
  | "Flights"
  | "Hotels"
  | "Transport"
  | "Food"
  | "Activities"
  | "Shopping"
  | "Emergency";
export type DocumentType =
  | "Passport"
  | "Visa"
  | "Insurance"
  | "Flight Ticket"
  | "Hotel Booking"
  | "Other";
export type ItineraryType =
  | "Transit"
  | "Stay"
  | "Activity"
  | "Food"
  | "Work"
  | "Buffer";

export type Trip = {
  id: string;
  userId: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budgetTotal: number;
  currency: string;
  status: TripStatus;
  summary: string;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseItem = {
  id: string;
  tripId: string;
  category: ExpenseCategory;
  label: string;
  plannedAmount: number;
  actualAmount: number;
  dueDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ItineraryItem = {
  id: string;
  tripId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  type: ItineraryType;
  priority: "Low" | "Medium" | "High";
  costEstimate: number;
  createdAt: string;
  updatedAt: string;
};

export type DocumentItem = {
  id: string;
  tripId: string;
  type: DocumentType;
  title: string;
  referenceNumber: string;
  issuer: string;
  validUntil: string;
  status: "Pending" | "Ready" | "Expired";
  fileUrl: string;
  filePath: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type TripBundle = {
  trip: Trip;
  expenses: ExpenseItem[];
  itinerary: ItineraryItem[];
  documents: DocumentItem[];
};

export type DashboardSummary = {
  totalTrips: number;
  totalBudget: number;
  totalPlannedSpend: number;
  totalActualSpend: number;
  readyDocuments: number;
  pendingDocuments: number;
  upcomingActivities: number;
};

export type TripDraft = Omit<
  Trip,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export type ExpenseDraft = Omit<
  ExpenseItem,
  "id" | "createdAt" | "updatedAt"
>;

export type ItineraryDraft = Omit<
  ItineraryItem,
  "id" | "createdAt" | "updatedAt"
>;

export type DocumentDraft = Omit<
  DocumentItem,
  "id" | "createdAt" | "updatedAt" | "filePath"
>;
