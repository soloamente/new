"use server";

import { apiFetch } from "@lib/api";

export interface Practice {
  id: number;
  studio_id: number;
  assigned_to: number;
  practice_number: string;
  year: number;
  number: number;
  type: string;
  is_concluded: boolean;
  concluded_at?: string | null;
  notes: string | null;
  created_at?: string | null;
  clients: Array<{
    id: number;
    name: string;
    email?: string;
    phone?: string;
  }>;
  operator?: {
    id: number;
    name: string;
  };
}

export interface ClientInput {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * Get all practices for the current user
 * @param assigned_to_me - If true, returns only practices assigned to the current user (OPERATORE role only)
 */
export async function getPractices(
  assigned_to_me?: boolean,
): Promise<Practice[]> {
  try {
    let endpoint = "/api/practices";
    if (assigned_to_me === true) {
      endpoint += "?assigned_to_me=true";
    }

    const practices = (await apiFetch(endpoint, {
      method: "GET",
    })) as Practice[];
    return practices;
  } catch (error: unknown) {
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
  assigned_to: number;
  clients: ClientInput[];
  type: string;
  notes?: string;
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
  clients?: ClientInput[];
  type?: string;
  is_concluded?: boolean;
  notes?: string | null;
  created_at?: string;
}

export interface PracticeAuditChange {
  field: string;
  label: string;
  old?: string | null;
  new?: string | null;
  added?: string[];
  removed?: string[];
}

export interface PracticeAudit {
  id: number;
  practice_id: number;
  user_id: number | null;
  action: "created" | "updated" | "status_changed";
  changes: PracticeAuditChange[] | null;
  created_at: string;
  user?: { id: number; name: string } | null;
}

export async function getPracticeAudits(id: number): Promise<PracticeAudit[]> {
  try {
    const audits = (await apiFetch(`/api/practices/${id}/audits`, {
      method: "GET",
    })) as PracticeAudit[];
    return audits;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return [];
    }
    if (error instanceof Error) {
      console.error(`Failed to get audits for practice ${id}:`, error.message);
    } else {
      console.error(`Failed to get audits for practice ${id}:`, error);
    }
    return [];
  }
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
