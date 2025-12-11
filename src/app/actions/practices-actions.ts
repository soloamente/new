"use server";

import { apiFetch } from "@lib/api";

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
  status: "assegnata" | "in lavorazione" | "conclusa" | "sospesa";
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
  status: "assegnata" | "in lavorazione" | "conclusa" | "sospesa";
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
  status?: "assegnata" | "in lavorazione" | "conclusa" | "sospesa";
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
