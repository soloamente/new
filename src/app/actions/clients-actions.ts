"use server";

import { apiFetch } from "@lib/api";

// Client type based on backend schema
export interface Client {
  id: number;
  studio_id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
}

/**
 * Get all clients for the current user
 * Returns empty array if error occurs
 */
export async function getClients(): Promise<Client[]> {
  try {
    const clients = (await apiFetch("/api/clients", {
      method: "GET",
    })) as Client[];
    return clients;
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
      console.error("Failed to get clients:", error.message);
    } else {
      console.error("Failed to get clients:", error);
    }
    return [];
  }
}

/**
 * Search clients by name (partial match, case-insensitive)
 * Uses the /api/clients?search=<query> endpoint
 * Returns empty array if error occurs
 */
export async function searchClients(searchQuery: string): Promise<Client[]> {
  try {
    // Build URL with search parameter
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    
    const endpoint = `/api/clients${params.toString() ? `?${params.toString()}` : ""}`;
    
    const clients = (await apiFetch(endpoint, {
      method: "GET",
    })) as Client[];
    return clients;
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
      console.error("Failed to search clients:", error.message);
    } else {
      console.error("Failed to search clients:", error);
    }
    return [];
  }
}

/**
 * Get a single client by ID
 * Returns null if not found or error occurs
 */
export async function getClient(id: number): Promise<Client | null> {
  try {
    const client = (await apiFetch(`/api/clients/${id}`, {
      method: "GET",
    })) as Client;
    return client;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return null;
    }

    if (error instanceof Error) {
      console.error(`Failed to get client ${id}:`, error.message);
    } else {
      console.error(`Failed to get client ${id}:`, error);
    }
    return null;
  }
}

/**
 * Create a new client
 * Returns the created client or null if error occurs
 */
export interface CreateClientInput {
  name: string;
  email?: string;
  phone?: string;
}

export async function createClient(
  input: CreateClientInput,
): Promise<Client | null> {
  try {
    const client = (await apiFetch("/api/clients", {
      method: "POST",
      body: JSON.stringify(input),
    })) as Client;
    return client;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return null;
    }

    if (error instanceof Error) {
      console.error("Failed to create client:", error.message);
    } else {
      console.error("Failed to create client:", error);
    }
    return null;
  }
}

/**
 * Update an existing client
 * Returns the updated client or null if error occurs
 */
export interface UpdateClientInput {
  name?: string;
  email?: string;
  phone?: string;
}

export async function updateClient(
  id: number,
  input: UpdateClientInput,
): Promise<Client | null> {
  try {
    const client = (await apiFetch(`/api/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    })) as Client;
    return client;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return null;
    }

    if (error instanceof Error) {
      console.error(`Failed to update client ${id}:`, error.message);
    } else {
      console.error(`Failed to update client ${id}:`, error);
    }
    return null;
  }
}

/**
 * Delete a client by ID
 * Returns true if successful, false otherwise
 */
export async function deleteClient(id: number): Promise<boolean> {
  try {
    await apiFetch(`/api/clients/${id}`, {
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
      console.error(`Failed to delete client ${id}:`, error.message);
    } else {
      console.error(`Failed to delete client ${id}:`, error);
    }
    return false;
  }
}
