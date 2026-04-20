import type {
  DocumentItem,
  ExpenseDraft,
  ExpenseItem,
  ItineraryDraft,
  ItineraryItem,
  PlannerUser,
  Trip,
  TripBundle,
  TripDraft,
} from "../types";

type DemoAccount = {
  id: string;
  email: string;
  fullName: string;
  password: string;
};

type DemoSession = Omit<PlannerUser, "authMode">;

type DemoData = {
  trips: Trip[];
  expenses: ExpenseItem[];
  itinerary: ItineraryItem[];
  documents: DocumentItem[];
};

const DEMO_ACCOUNTS_KEY = "stp-demo-accounts";
const DEMO_SESSION_KEY = "stp-demo-session";

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function getStorageKey(userId: string) {
  return `stp-demo-data-${userId}`;
}

function addDays(baseDate: Date, days: number) {
  const next = new Date(baseDate);
  next.setDate(next.getDate() + days);
  return next.toISOString().split("T")[0];
}

function seedTripBundle(userId: string): DemoData {
  const createdAt = nowIso();
  const startDate = addDays(new Date(), 14);
  const endDate = addDays(new Date(), 18);
  const tripId = createId("trip");

  return {
    trips: [
      {
        id: tripId,
        userId,
        name: "Bali Workation",
        destination: "Bali, Indonesia",
        startDate,
        endDate,
        travelers: 2,
        budgetTotal: 1600,
        currency: "USD",
        status: "Planning",
        summary:
          "Combine beachside downtime with coworking slots, food exploration, and all mandatory travel documents in one plan.",
        createdAt,
        updatedAt: createdAt,
      },
    ],
    expenses: [
      {
        id: createId("expense"),
        tripId,
        category: "Flights",
        label: "Round-trip flights",
        plannedAmount: 620,
        actualAmount: 0,
        dueDate: addDays(new Date(), 4),
        notes: "Compare flexible fares before locking the itinerary.",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: createId("expense"),
        tripId,
        category: "Hotels",
        label: "Ubud stay",
        plannedAmount: 380,
        actualAmount: 0,
        dueDate: addDays(new Date(), 7),
        notes: "Choose a place near reliable coworking spots.",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: createId("expense"),
        tripId,
        category: "Activities",
        label: "Temple and waterfall day",
        plannedAmount: 120,
        actualAmount: 0,
        dueDate: addDays(new Date(), 12),
        notes: "Bundle transport and tickets together.",
        createdAt,
        updatedAt: createdAt,
      },
    ],
    itinerary: [
      {
        id: createId("plan"),
        tripId,
        title: "Flight to Denpasar",
        date: startDate,
        startTime: "07:00",
        endTime: "15:30",
        location: "Kempegowda Airport -> Ngurah Rai Airport",
        notes: "Reach airport 3 hours early and carry printed visa docs.",
        type: "Transit",
        priority: "High",
        costEstimate: 620,
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: createId("plan"),
        tripId,
        title: "Coworking deep work block",
        date: addDays(new Date(startDate), 1),
        startTime: "10:00",
        endTime: "13:00",
        location: "Outpost Ubud",
        notes: "Reserve a quiet desk and stable Wi-Fi.",
        type: "Work",
        priority: "Medium",
        costEstimate: 18,
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: createId("plan"),
        tripId,
        title: "Rice terrace and cafe trail",
        date: addDays(new Date(startDate), 2),
        startTime: "09:30",
        endTime: "16:00",
        location: "Tegallalang",
        notes: "Pack rain layer, refillable bottle, and camera batteries.",
        type: "Activity",
        priority: "Medium",
        costEstimate: 45,
        createdAt,
        updatedAt: createdAt,
      },
    ],
    documents: [
      {
        id: createId("doc"),
        tripId,
        type: "Passport",
        title: "Primary passport",
        referenceNumber: "N7821134",
        issuer: "Government of India",
        validUntil: addDays(new Date(), 430),
        status: "Ready",
        fileUrl: "",
        filePath: "",
        notes: "Carry one print copy and one PDF backup.",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: createId("doc"),
        tripId,
        type: "Insurance",
        title: "Travel insurance policy",
        referenceNumber: "TRV-2026-1183",
        issuer: "SafeGlobe",
        validUntil: endDate,
        status: "Pending",
        fileUrl: "",
        filePath: "",
        notes: "Finalize after hotel booking is confirmed.",
        createdAt,
        updatedAt: createdAt,
      },
    ],
  };
}

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getAccounts() {
  const existing = readJson<DemoAccount[]>(DEMO_ACCOUNTS_KEY, []);

  if (existing.length > 0) {
    return existing;
  }

  const seeded = [
    {
      id: createId("user"),
      email: "demo@smarttravelplanner.app",
      fullName: "Demo Traveler",
      password: "demo12345",
    },
  ] satisfies DemoAccount[];

  writeJson(DEMO_ACCOUNTS_KEY, seeded);
  return seeded;
}

function persistAccounts(accounts: DemoAccount[]) {
  writeJson(DEMO_ACCOUNTS_KEY, accounts);
}

export function getDemoSession(): PlannerUser | null {
  const session = readJson<DemoSession | null>(DEMO_SESSION_KEY, null);

  if (!session) {
    return null;
  }

  return {
    ...session,
    authMode: "demo",
  };
}

export function saveDemoSession(account: DemoAccount) {
  writeJson(DEMO_SESSION_KEY, {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
  } satisfies DemoSession);
}

export function clearDemoSession() {
  localStorage.removeItem(DEMO_SESSION_KEY);
}

export function signupDemoAccount(input: {
  email: string;
  password: string;
  fullName: string;
}) {
  const accounts = getAccounts();
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = accounts.find((account) => account.email === normalizedEmail);

  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const account: DemoAccount = {
    id: createId("user"),
    email: normalizedEmail,
    fullName: input.fullName.trim(),
    password: input.password,
  };

  persistAccounts([...accounts, account]);
  saveDemoSession(account);

  return {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
    authMode: "demo" as const,
  };
}

export function loginDemoAccount(input: { email: string; password: string }) {
  const accounts = getAccounts();
  const normalizedEmail = input.email.trim().toLowerCase();
  const account = accounts.find(
    (item) =>
      item.email === normalizedEmail && item.password === input.password,
  );

  if (!account) {
    throw new Error("Invalid email or password.");
  }

  saveDemoSession(account);

  return {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
    authMode: "demo" as const,
  };
}

export function createDemoSession() {
  const [demoAccount] = getAccounts();
  saveDemoSession(demoAccount);

  return {
    id: demoAccount.id,
    email: demoAccount.email,
    fullName: demoAccount.fullName,
    authMode: "demo" as const,
  };
}

function ensureDemoData(userId: string) {
  const storageKey = getStorageKey(userId);
  const existing = readJson<DemoData | null>(storageKey, null);

  if (existing) {
    return existing;
  }

  const seeded = seedTripBundle(userId);
  writeJson(storageKey, seeded);
  return seeded;
}

function saveDemoData(userId: string, data: DemoData) {
  writeJson(getStorageKey(userId), data);
}

function groupTripBundle(data: DemoData): TripBundle[] {
  return data.trips.map((trip) => ({
    trip,
    expenses: data.expenses.filter((item) => item.tripId === trip.id),
    itinerary: data.itinerary.filter((item) => item.tripId === trip.id),
    documents: data.documents.filter((item) => item.tripId === trip.id),
  }));
}

export const localTravelStore = {
  listTripBundles(userId: string) {
    return groupTripBundle(ensureDemoData(userId));
  },

  getTripBundle(userId: string, tripId: string) {
    return groupTripBundle(ensureDemoData(userId)).find(
      (bundle) => bundle.trip.id === tripId,
    ) ?? null;
  },

  createTrip(userId: string, draft: TripDraft) {
    const data = ensureDemoData(userId);
    const timestamp = nowIso();
    const trip: Trip = {
      ...draft,
      id: createId("trip"),
      userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    saveDemoData(userId, {
      ...data,
      trips: [...data.trips, trip],
    });

    return trip;
  },

  updateTrip(userId: string, tripId: string, draft: TripDraft) {
    const data = ensureDemoData(userId);
    const updatedTrip = {
      ...draft,
      id: tripId,
      userId,
      createdAt:
        data.trips.find((trip) => trip.id === tripId)?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    } satisfies Trip;

    saveDemoData(userId, {
      ...data,
      trips: data.trips.map((trip) => (trip.id === tripId ? updatedTrip : trip)),
    });

    return updatedTrip;
  },

  deleteTrip(userId: string, tripId: string) {
    const data = ensureDemoData(userId);

    saveDemoData(userId, {
      trips: data.trips.filter((trip) => trip.id !== tripId),
      expenses: data.expenses.filter((item) => item.tripId !== tripId),
      itinerary: data.itinerary.filter((item) => item.tripId !== tripId),
      documents: data.documents.filter((item) => item.tripId !== tripId),
    });
  },

  createExpense(userId: string, draft: ExpenseDraft) {
    const data = ensureDemoData(userId);
    const timestamp = nowIso();
    const expense: ExpenseItem = {
      ...draft,
      id: createId("expense"),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    saveDemoData(userId, {
      ...data,
      expenses: [...data.expenses, expense],
    });

    return expense;
  },

  updateExpense(userId: string, expenseId: string, draft: ExpenseDraft) {
    const data = ensureDemoData(userId);
    const previous = data.expenses.find((item) => item.id === expenseId);
    const expense: ExpenseItem = {
      ...draft,
      id: expenseId,
      createdAt: previous?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    };

    saveDemoData(userId, {
      ...data,
      expenses: data.expenses.map((item) => (item.id === expenseId ? expense : item)),
    });

    return expense;
  },

  deleteExpense(userId: string, expenseId: string) {
    const data = ensureDemoData(userId);

    saveDemoData(userId, {
      ...data,
      expenses: data.expenses.filter((item) => item.id !== expenseId),
    });
  },

  createItineraryItem(userId: string, draft: ItineraryDraft) {
    const data = ensureDemoData(userId);
    const timestamp = nowIso();
    const item: ItineraryItem = {
      ...draft,
      id: createId("plan"),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    saveDemoData(userId, {
      ...data,
      itinerary: [...data.itinerary, item],
    });

    return item;
  },

  updateItineraryItem(userId: string, itemId: string, draft: ItineraryDraft) {
    const data = ensureDemoData(userId);
    const previous = data.itinerary.find((item) => item.id === itemId);
    const item: ItineraryItem = {
      ...draft,
      id: itemId,
      createdAt: previous?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    };

    saveDemoData(userId, {
      ...data,
      itinerary: data.itinerary.map((entry) => (entry.id === itemId ? item : entry)),
    });

    return item;
  },

  deleteItineraryItem(userId: string, itemId: string) {
    const data = ensureDemoData(userId);

    saveDemoData(userId, {
      ...data,
      itinerary: data.itinerary.filter((item) => item.id !== itemId),
    });
  },

  createDocument(userId: string, draft: Omit<DocumentItem, "id" | "createdAt" | "updatedAt">) {
    const data = ensureDemoData(userId);
    const timestamp = nowIso();
    const document: DocumentItem = {
      ...draft,
      id: createId("doc"),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    saveDemoData(userId, {
      ...data,
      documents: [...data.documents, document],
    });

    return document;
  },

  updateDocument(
    userId: string,
    documentId: string,
    draft: Omit<DocumentItem, "id" | "createdAt" | "updatedAt">,
  ) {
    const data = ensureDemoData(userId);
    const previous = data.documents.find((item) => item.id === documentId);
    const document: DocumentItem = {
      ...draft,
      id: documentId,
      createdAt: previous?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    };

    saveDemoData(userId, {
      ...data,
      documents: data.documents.map((item) =>
        item.id === documentId ? document : item,
      ),
    });

    return document;
  },

  deleteDocument(userId: string, documentId: string) {
    const data = ensureDemoData(userId);

    saveDemoData(userId, {
      ...data,
      documents: data.documents.filter((item) => item.id !== documentId),
    });
  },
};
