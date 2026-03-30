"use server";

import type { Client } from "@/app/actions/clients-actions";
import { apiFetch } from "@lib/api";

/**
 * Some API responses omit nested `client` on GET /api/practices/:id but still send
 * `client_id` or flat fields (`client_name`, …). We normalize so the UI can render.
 */
type PracticeApiFlatClient = {
  client_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
};

function buildClientFromFlatFields(
  practice: Practice,
  raw: PracticeApiFlatClient,
): Practice["client"] | undefined {
  const name = raw.client_name?.trim();
  if (!name) return undefined;
  return {
    id: practice.client_id,
    name,
    email: raw.client_email?.trim() || undefined,
    phone: raw.client_phone?.trim() || undefined,
  };
}

/**
 * Best-effort GET /api/clients/:id for practice hydration.
 * Uses `apiFetch` directly (not `getClient`) so failures never hit `console.error` in clients-actions.
 */
async function fetchClientForPracticeHydration(
  practiceId: number,
  clientId: number,
): Promise<Practice["client"] | null> {
  try {
    const c = (await apiFetch(`/api/clients/${clientId}`, {
      method: "GET",
    })) as Client;
    if (!c?.name) {
      console.log("[practice hydrate client] GET /api/clients/%s — response has no usable name", clientId, {
        practiceId,
        clientId,
        raw: c,
      });
      return null;
    }
    const normalized = {
      id: c.id,
      name: c.name,
      email: c.email ?? undefined,
      phone: c.phone ?? undefined,
    };
    console.log("[practice hydrate client] GET /api/clients/%s — OK", clientId, {
      practiceId,
      client: normalized,
    });
    return normalized;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const status =
      error instanceof Error && "status" in error
        ? (error as Error & { status?: number }).status
        : undefined;
    console.log("[practice hydrate client] GET /api/clients/%s — failed", clientId, {
      practiceId,
      status,
      message,
    });
    return null;
  }
}

/** Ensures `practice.client` when the backend only links by `client_id` or flat keys. */
async function hydratePracticeClient(practice: Practice): Promise<Practice> {
  const raw = practice as Practice & PracticeApiFlatClient;

  if (practice.client?.name) {
    console.log("[practice hydrate client] using nested client from GET /api/practices/:id", {
      practiceId: practice.id,
      client: practice.client,
    });
    return practice;
  }

  console.log("[practice hydrate client] no nested client on practice payload — will try flat fields + /api/clients/:id", {
    practiceId: practice.id,
    client_id: practice.client_id,
    flat: {
      client_name: raw.client_name ?? null,
      client_email: raw.client_email ?? null,
      client_phone: raw.client_phone ?? null,
    },
  });

  const fromFlat = buildClientFromFlatFields(practice, raw);
  if (fromFlat) {
    console.log("[practice hydrate client] built client from flat fields", {
      practiceId: practice.id,
      client: fromFlat,
    });
    return { ...practice, client: fromFlat };
  }

  if (practice.client_id > 0) {
    const client = await fetchClientForPracticeHydration(
      practice.id,
      practice.client_id,
    );
    if (client) {
      return { ...practice, client };
    }
  }

  console.log("[practice hydrate client] still no client after hydration — UI may show “Cliente non disponibile”", {
    practiceId: practice.id,
    client_id: practice.client_id,
  });
  return practice;
}

// Practice types based on backend schema
export interface Practice {
  id: number;
  studio_id: number;
  assigned_to: number;
  client_id: number;
  practice_number: string;
  year: number;
  number: number;
  type: string;
  // Backend now exposes a binary status model:
  // false = assegnata, true = conclusa
  is_concluded: boolean;
  notes: string | null;
  created_at?: string | null;
  client?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  operator?: {
    id: number;
    name: string;
  };
}

/**
 * Get all practices for the current user
 * @param assigned_to_me - If true, returns only practices assigned to the current user (OPERATORE role only)
 * Returns empty array if error occurs
 */
export async function getPractices(
  assigned_to_me?: boolean,
): Promise<Practice[]> {
  try {
    // Build endpoint with optional query parameter
    let endpoint = "/api/practices";
    if (assigned_to_me === true) {
      endpoint += "?assigned_to_me=true";
    }

    const practices = (await apiFetch(endpoint, {
      method: "GET",
    })) as Practice[];
    return practices;
  } catch (error: unknown) {
    // Don't log rate limiting errors
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return [];
    }

    if (error instanceof Error) {
      console.error("Failed to get practices:", error.message);
    } else {
      console.error("Failed to get practices:", error);
    }
    return [];
  }
}

/**
 * Get a single practice by ID
 * Returns null if not found or error occurs
 */
export async function getPractice(id: number): Promise<Practice | null> {
  try {
    const practice = (await apiFetch(`/api/practices/${id}`, {
      method: "GET",
    })) as Practice;
    return await hydratePracticeClient(practice);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return null;
    }

    if (error instanceof Error) {
      console.error(`Failed to get practice ${id}:`, error.message);
    } else {
      console.error(`Failed to get practice ${id}:`, error);
    }
    return null;
  }
}

/**
 * Create a new practice
 * Returns the created practice or null if error occurs
 */
export interface CreatePracticeInput {
  assigned_to: number; // ID Utente (Operatore)
  client: string; // Nome Cliente (Se nuovo, viene creato)
  client_email?: string; // Opzionale
  client_phone?: string; // Opzionale
  type: string; // Tipo pratica
  notes?: string; // Opzionale
}

export async function createPractice(
  input: CreatePracticeInput,
): Promise<Practice | null> {
  try {
    const practice = (await apiFetch("/api/practices", {
      method: "POST",
      body: JSON.stringify(input),
    })) as Practice;
    return practice;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return null;
    }

    if (error instanceof Error) {
      console.error("Failed to create practice:", error.message);
    } else {
      console.error("Failed to create practice:", error);
    }
    return null;
  }
}

/**
 * Update an existing practice
 * Returns the updated practice or null if error occurs
 */
export interface UpdatePracticeInput {
  assigned_to?: number;
  client?: string;
  client_email?: string;
  client_phone?: string;
  type?: string;
  // true = conclusa, false = assegnata/riaperta
  is_concluded?: boolean;
  notes?: string;
}

export async function updatePractice(
  id: number,
  input: UpdatePracticeInput,
): Promise<Practice | null> {
  try {
    const practice = (await apiFetch(`/api/practices/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    })) as Practice;
    return practice;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return null;
    }

    if (error instanceof Error) {
      console.error(`Failed to update practice ${id}:`, error.message);
    } else {
      console.error(`Failed to update practice ${id}:`, error);
    }
    return null;
  }
}
