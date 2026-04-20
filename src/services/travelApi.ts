import type {
  DocumentDraft,
  DocumentItem,
  ExpenseDraft,
  ExpenseItem,
  ItineraryDraft,
  ItineraryItem,
  Trip,
  TripBundle,
  TripDraft,
} from "../types";
import { localTravelStore } from "./localStore";
import {
  documentBucket,
  isStorageConfigured,
  isSupabaseConfigured,
  supabase,
} from "./supabase";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

function mapTrip(row: Record<string, unknown>): Trip {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    destination: String(row.destination),
    startDate: String(row.start_date),
    endDate: String(row.end_date),
    travelers: Number(row.travelers ?? 1),
    budgetTotal: Number(row.budget_total ?? 0),
    currency: String(row.currency ?? "USD"),
    status: String(row.status ?? "Planning") as Trip["status"],
    summary: String(row.summary ?? ""),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapExpense(row: Record<string, unknown>): ExpenseItem {
  return {
    id: String(row.id),
    tripId: String(row.trip_id),
    category: String(row.category) as ExpenseItem["category"],
    label: String(row.label),
    plannedAmount: Number(row.planned_amount ?? 0),
    actualAmount: Number(row.actual_amount ?? 0),
    dueDate: String(row.due_date ?? ""),
    notes: String(row.notes ?? ""),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapItinerary(row: Record<string, unknown>): ItineraryItem {
  return {
    id: String(row.id),
    tripId: String(row.trip_id),
    title: String(row.title),
    date: String(row.date),
    startTime: String(row.start_time ?? ""),
    endTime: String(row.end_time ?? ""),
    location: String(row.location ?? ""),
    notes: String(row.notes ?? ""),
    type: String(row.type ?? "Activity") as ItineraryItem["type"],
    priority: String(row.priority ?? "Medium") as ItineraryItem["priority"],
    costEstimate: Number(row.cost_estimate ?? 0),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapDocument(row: Record<string, unknown>): DocumentItem {
  return {
    id: String(row.id),
    tripId: String(row.trip_id),
    type: String(row.type ?? "Other") as DocumentItem["type"],
    title: String(row.title),
    referenceNumber: String(row.reference_number ?? ""),
    issuer: String(row.issuer ?? ""),
    validUntil: String(row.valid_until ?? ""),
    status: String(row.status ?? "Pending") as DocumentItem["status"],
    fileUrl: String(row.file_url ?? ""),
    filePath: String(row.file_path ?? ""),
    notes: String(row.notes ?? ""),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function normalizeTripBundle(row: Record<string, unknown>): TripBundle {
  return {
    trip: mapTrip(row),
    expenses: Array.isArray(row.expense_items)
      ? row.expense_items.map((item) => mapExpense(item as Record<string, unknown>))
      : [],
    itinerary: Array.isArray(row.itinerary_items)
      ? row.itinerary_items.map((item) =>
          mapItinerary(item as Record<string, unknown>),
        )
      : [],
    documents: Array.isArray(row.document_items)
      ? row.document_items.map((item) =>
          mapDocument(item as Record<string, unknown>),
        )
      : [],
  };
}

async function fetchTripBundlesFromSupabase(userId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("trips")
    .select(
      "*, expense_items(*), itinerary_items(*), document_items(*)",
    )
    .eq("user_id", userId)
    .order("start_date", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    normalizeTripBundle(row as Record<string, unknown>),
  );
}

async function fetchTripBundleFromSupabase(userId: string, tripId: string) {
  const bundles = await fetchTripBundlesFromSupabase(userId);
  return bundles.find((bundle) => bundle.trip.id === tripId) ?? null;
}

function tripDraftToRow(userId: string, draft: TripDraft) {
  return {
    user_id: userId,
    name: draft.name,
    destination: draft.destination,
    start_date: draft.startDate,
    end_date: draft.endDate,
    travelers: draft.travelers,
    budget_total: draft.budgetTotal,
    currency: draft.currency,
    status: draft.status,
    summary: draft.summary,
  };
}

function expenseDraftToRow(draft: ExpenseDraft) {
  return {
    trip_id: draft.tripId,
    category: draft.category,
    label: draft.label,
    planned_amount: draft.plannedAmount,
    actual_amount: draft.actualAmount,
    due_date: draft.dueDate,
    notes: draft.notes,
  };
}

function itineraryDraftToRow(draft: ItineraryDraft) {
  return {
    trip_id: draft.tripId,
    title: draft.title,
    date: draft.date,
    start_time: draft.startTime,
    end_time: draft.endTime,
    location: draft.location,
    notes: draft.notes,
    type: draft.type,
    priority: draft.priority,
    cost_estimate: draft.costEstimate,
  };
}

function documentDraftToRow(
  draft: DocumentDraft,
  filePath = "",
  fileUrl = "",
) {
  return {
    trip_id: draft.tripId,
    type: draft.type,
    title: draft.title,
    reference_number: draft.referenceNumber,
    issuer: draft.issuer,
    valid_until: draft.validUntil,
    status: draft.status,
    file_url: fileUrl || draft.fileUrl,
    file_path: filePath,
    notes: draft.notes,
  };
}

const supportsUploads = isSupabaseConfigured && isStorageConfigured;

async function uploadDocumentFile(userId: string, tripId: string, file: File) {
  if (!supportsUploads) {
    return {
      filePath: "",
      fileUrl: "",
    };
  }

  const client = requireSupabase();
  const extension = file.name.split(".").pop();
  const filePath = `${userId}/${tripId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await client.storage
    .from(documentBucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = client.storage.from(documentBucket).getPublicUrl(filePath);

  return {
    filePath,
    fileUrl: publicUrl,
  };
}

export const travelApi = {
  mode: isSupabaseConfigured ? "supabase" : "demo",
  supportsUploads,

  async listTripBundles(userId: string) {
    if (isSupabaseConfigured) {
      return fetchTripBundlesFromSupabase(userId);
    }

    return localTravelStore.listTripBundles(userId);
  },

  async getTripBundle(userId: string, tripId: string) {
    if (isSupabaseConfigured) {
      return fetchTripBundleFromSupabase(userId, tripId);
    }

    return localTravelStore.getTripBundle(userId, tripId);
  },

  async createTrip(userId: string, draft: TripDraft) {
    if (isSupabaseConfigured) {
      const client = requireSupabase();
      const { data, error } = await client
        .from("trips")
        .insert(tripDraftToRow(userId, draft))
        .select()
        .single();

      if (error) {
        throw error;
      }

      return mapTrip(data as Record<string, unknown>);
    }

    return localTravelStore.createTrip(userId, draft);
  },

  async updateTrip(userId: string, tripId: string, draft: TripDraft) {
    if (isSupabaseConfigured) {
      const client = requireSupabase();
      const { data, error } = await client
        .from("trips")
        .update(tripDraftToRow(userId, draft))
        .eq("id", tripId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return mapTrip(data as Record<string, unknown>);
    }

    return localTravelStore.updateTrip(userId, tripId, draft);
  },

  async deleteTrip(userId: string, tripId: string) {
    if (isSupabaseConfigured) {
      const client = requireSupabase();
      const { error } = await client
        .from("trips")
        .delete()
        .eq("id", tripId)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      return;
    }

    localTravelStore.deleteTrip(userId, tripId);
  },

  async createExpense(userId: string, draft: ExpenseDraft) {
    if (isSupabaseConfigured) {
      const client = requireSupabase();
      const { data, error } = await client
        .from("expense_items")
        .insert(expenseDraftToRow(draft))
        .select()
        .single();

      if (error) {
        throw error;
      }

      return mapExpense(data as Record<string, unknown>);
    }

    return localTravelStore.createExpense(userId, draft);
  },

  async updateExpense(userId: string, expenseId: string, draft: ExpenseDraft) {
    if (isSupabaseConfigured) {
      const client = requireSupabase();
      const { data, error } = await client
        .from("expense_items")
        .update(expenseDraftToRow(draft))
        .eq("id", expenseId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return mapExpense(data as Record<string, unknown>);
    }

    return localTravelStore.updateExpense(userId, expenseId, draft);
  },

  async deleteExpense(userId: string, expenseId: string) {
    if (isSupabaseConfigured) {
      const client = requireSupabase();
      const { error } = await client
        .from("expense_items")
        .delete()
        .eq("id", expenseId);

      if (error) {
        throw error;
      }

      return;
    }

    localTravelStore.deleteExpense(userId, expenseId);
  },

  async createItineraryItem(userId: string, draft: ItineraryDraft) {
    if (isSupabaseConfigured) {
      const client = requireSupabase();
      const { data, error } = await client
        .from("itinerary_items")
        .insert(itineraryDraftToRow(draft))
        .select()
        .single();

      if (error) {
        throw error;
      }

      return mapItinerary(data as Record<string, unknown>);
    }

    return localTravelStore.createItineraryItem(userId, draft);
  },

  async updateItineraryItem(userId: string, itemId: string, draft: ItineraryDraft) {
    if (isSupabaseConfigured) {
      const client = requireSupabase();
      const { data, error } = await client
        .from("itinerary_items")
        .update(itineraryDraftToRow(draft))
        .eq("id", itemId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return mapItinerary(data as Record<string, unknown>);
    }

    return localTravelStore.updateItineraryItem(userId, itemId, draft);
  },

  async deleteItineraryItem(userId: string, itemId: string) {
    if (isSupabaseConfigured) {
      const client = requireSupabase();
      const { error } = await client
        .from("itinerary_items")
        .delete()
        .eq("id", itemId);

      if (error) {
        throw error;
      }

      return;
    }

    localTravelStore.deleteItineraryItem(userId, itemId);
  },

  async createDocument(
    userId: string,
    draft: DocumentDraft,
    options?: { file?: File | null },
  ) {
    let filePath = "";
    let fileUrl = draft.fileUrl;

    if (options?.file) {
      const upload = await uploadDocumentFile(userId, draft.tripId, options.file);
      filePath = upload.filePath;
      fileUrl = upload.fileUrl;
    }

    if (isSupabaseConfigured) {
      const client = requireSupabase();
      const { data, error } = await client
        .from("document_items")
        .insert(documentDraftToRow(draft, filePath, fileUrl))
        .select()
        .single();

      if (error) {
        throw error;
      }

      return mapDocument(data as Record<string, unknown>);
    }

    return localTravelStore.createDocument(userId, {
      ...draft,
      filePath,
      fileUrl,
    });
  },

  async updateDocument(
    userId: string,
    documentId: string,
    draft: DocumentDraft,
    options?: { file?: File | null; currentFilePath?: string },
  ) {
    let filePath = options?.currentFilePath ?? "";
    let fileUrl = draft.fileUrl;

    if (options?.file) {
      const upload = await uploadDocumentFile(userId, draft.tripId, options.file);
      filePath = upload.filePath;
      fileUrl = upload.fileUrl;
    }

    if (isSupabaseConfigured) {
      const client = requireSupabase();
      const { data, error } = await client
        .from("document_items")
        .update(documentDraftToRow(draft, filePath, fileUrl))
        .eq("id", documentId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return mapDocument(data as Record<string, unknown>);
    }

    return localTravelStore.updateDocument(userId, documentId, {
      ...draft,
      filePath,
      fileUrl,
    });
  },

  async deleteDocument(userId: string, documentId: string) {
    if (isSupabaseConfigured) {
      const client = requireSupabase();
      const { error } = await client
        .from("document_items")
        .delete()
        .eq("id", documentId);

      if (error) {
        throw error;
      }

      return;
    }

    localTravelStore.deleteDocument(userId, documentId);
  },
};
