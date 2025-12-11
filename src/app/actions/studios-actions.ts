"use server";

import { apiFetch } from "@lib/api";
import type { User } from "./auth-actions";

// Studio type based on backend schema
export interface Studio {
  id: number;
  name: string;
  city: string | null;
  vat_number: string | null;
  admin?: User; // Amministratore dello studio
  operators?: User[]; // Array di operatori dello studio
}

/**
 * Get all studios (SuperAdmin only)
 * Returns empty array if error occurs or user doesn't have permission
 */
export async function getStudios(): Promise<Studio[]> {
  try {
    const studios = (await apiFetch("/api/studios", {
      method: "GET",
    })) as Studio[];
    return studios;
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
      console.error("Failed to get studios:", error.message);
    } else {
      console.error("Failed to get studios:", error);
    }
    return [];
  }
}

/**
 * Get a single studio by ID (SuperAdmin only)
 * Returns null if not found or error occurs
 */
export async function getStudio(id: number): Promise<Studio | null> {
  try {
    const studio = (await apiFetch(`/api/studios/${id}`, {
      method: "GET",
    })) as Studio;
    return studio;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return null;
    }

    if (error instanceof Error) {
      console.error(`Failed to get studio ${id}:`, error.message);
    } else {
      console.error(`Failed to get studio ${id}:`, error);
    }
    return null;
  }
}

/**
 * Create a new studio (SuperAdmin only)
 * Returns the created studio or null if error occurs
 */
export interface CreateStudioInput {
  name: string; // Obbligatorio, Univoco
  city?: string; // Opzionale
  vat_number?: string; // Opzionale
}

export async function createStudio(
  input: CreateStudioInput,
): Promise<Studio | null> {
  try {
    const studio = (await apiFetch("/api/studios", {
      method: "POST",
      body: JSON.stringify(input),
    })) as Studio;
    return studio;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return null;
    }

    if (error instanceof Error) {
      console.error("Failed to create studio:", error.message);
    } else {
      console.error("Failed to create studio:", error);
    }
    return null;
  }
}

/**
 * Update an existing studio (SuperAdmin only)
 * Returns the updated studio or null if error occurs
 */
export interface UpdateStudioInput {
  name?: string;
  city?: string;
  vat_number?: string;
}

export async function updateStudio(
  id: number,
  input: UpdateStudioInput,
): Promise<Studio | null> {
  try {
    const studio = (await apiFetch(`/api/studios/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    })) as Studio;
    return studio;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return null;
    }

    if (error instanceof Error) {
      console.error(`Failed to update studio ${id}:`, error.message);
    } else {
      console.error(`Failed to update studio ${id}:`, error);
    }
    return null;
  }
}

/**
 * Delete a studio by ID (SuperAdmin only)
 * Returns true if successful, false otherwise
 */
export async function deleteStudio(id: number): Promise<boolean> {
  try {
    await apiFetch(`/api/studios/${id}`, {
      method: "DELETE",
    });
    return true;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return false;
    }

    if (error instanceof Error) {
      console.error(`Failed to delete studio ${id}:`, error.message);
    } else {
      console.error(`Failed to delete studio ${id}:`, error);
    }
    return false;
  }
}

