"use server";

import { apiFetch } from "@lib/api";
import type { User } from "./auth-actions";

/**
 * Get all users (Admin only)
 * Returns empty array if error occurs or user doesn't have permission
 */
export async function getUsers(): Promise<User[]> {
  try {
    const users = (await apiFetch("/api/users", {
      method: "GET",
    })) as User[];
    return users;
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
      console.error("Failed to get users:", error.message);
    } else {
      console.error("Failed to get users:", error);
    }
    return [];
  }
}

/**
 * Get operators (users with role_id = 3) for the current user's studio
 * For AMMINISTRATORE_STUDIO: returns operators of their studio
 * For DATAWEB: returns all operators
 * Returns empty array if error occurs
 */
export async function getOperators(): Promise<User[]> {
  try {
    const users = await getUsers();
    // Filter to only operators (role_id = 3)
    return users.filter((user) => user.role_id === 3);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return [];
    }

    if (error instanceof Error) {
      console.error("Failed to get operators:", error.message);
    } else {
      console.error("Failed to get operators:", error);
    }
    return [];
  }
}

/**
 * Get a single user by ID (Admin only)
 * Returns null if not found or error occurs
 */
export async function getUser(id: number): Promise<User | null> {
  try {
    const user = (await apiFetch(`/api/users/${id}`, {
      method: "GET",
    })) as User;
    return user;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return null;
    }

    if (error instanceof Error) {
      console.error(`Failed to get user ${id}:`, error.message);
    } else {
      console.error(`Failed to get user ${id}:`, error);
    }
    return null;
  }
}

/**
 * Create a new user (Admin only)
 * Returns the created user or null if error occurs
 */
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role_id: number; // 1=DATAWEB, 2=ADMIN, 3=OPERATORE
  studio_id?: number | null;
  status?: string;
}

/**
 * Create a new Admin user with Studio (SuperAdmin only)
 * Creates both the admin user and the studio together
 * Returns the created user or null if error occurs
 */
export interface CreateAdminWithStudioInput {
  name: string;
  email: string;
  password: string;
  role_id: 2; // Must be 2 = AMMINISTRATORE_STUDIO
  studio_name: string; // Obbligatorio: Crea il nuovo studio
  studio_city?: string; // Opzionale
  studio_vat_number?: string; // Opzionale
}

export async function createUser(input: CreateUserInput): Promise<User | null> {
  try {
    const user = (await apiFetch("/api/users", {
      method: "POST",
      body: JSON.stringify(input),
    })) as User;
    return user;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return null;
    }

    if (error instanceof Error) {
      console.error("Failed to create user:", error.message);
    } else {
      console.error("Failed to create user:", error);
    }
    return null;
  }
}

/**
 * Create a new Admin user with Studio (SuperAdmin only)
 * Creates both the admin user and the studio together
 * Returns the created user or null if error occurs
 * 
 * Note: This endpoint creates an Admin (role_id: 2) and automatically creates
 * the associated Studio. It's not possible to associate an Admin to an existing Studio.
 */
export async function createAdminWithStudio(
  input: CreateAdminWithStudioInput,
): Promise<User | null> {
  try {
    const user = (await apiFetch("/api/users", {
      method: "POST",
      body: JSON.stringify(input),
    })) as User;
    return user;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return null;
    }

    if (error instanceof Error) {
      console.error("Failed to create admin with studio:", error.message);
    } else {
      console.error("Failed to create admin with studio:", error);
    }
    return null;
  }
}

/**
 * Update an existing user (Admin only)
 * Returns the updated user or null if error occurs
 */
export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role_id?: number;
  studio_id?: number | null;
  status?: string;
}

export async function updateUser(
  id: number,
  input: UpdateUserInput,
): Promise<User | null> {
  try {
    const user = (await apiFetch(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    })) as User;
    return user;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return null;
    }

    if (error instanceof Error) {
      console.error(`Failed to update user ${id}:`, error.message);
    } else {
      console.error(`Failed to update user ${id}:`, error);
    }
    return null;
  }
}

/**
 * Delete a user by ID (Admin only)
 * Returns true if successful, false otherwise
 */
export async function deleteUser(id: number): Promise<boolean> {
  try {
    await apiFetch(`/api/users/${id}`, {
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
      console.error(`Failed to delete user ${id}:`, error.message);
    } else {
      console.error(`Failed to delete user ${id}:`, error);
    }
    return false;
  }
}
