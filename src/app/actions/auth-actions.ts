"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { API_BASE_URL, apiFetch } from "@lib/api";

// User role types based on backend schema
export type UserRole = "DATAWEB" | "AMMINISTRATORE_STUDIO" | "OPERATORE";

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number; // 1=DATAWEB, 2=ADMIN, 3=OPERATORE
  studio_id: number | null;
  status: string;
  created_at?: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ApiError {
  message?: string;
  errors?: unknown;
}

export async function login(formData: FormData) {
  const email = formData.get("username") as string; // Form field is named 'username' but API expects 'email'
  const password = formData.get("password") as string;
  let redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  if (!email || !password) {
    return { error: "Email e password sono obbligatori" };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ApiError;
      return {
        error: errorData.message ?? "Credenziali non valide",
      };
    }

    const data = (await response.json()) as LoginResponse;
    const token = data.access_token;
    const expiresIn = data.expires_in ?? 3600;

    // Store token in HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn,
      path: "/",
    });

    // If redirecting to dashboard (default), check user role and redirect operators to /mie-pratiche
    if (redirectTo === "/dashboard") {
      try {
        // Fetch user data directly using the token we just received
        // This avoids cache issues with getCurrentUser()
        const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.ok) {
          const user = (await userResponse.json()) as User;
          // Operators (role_id === 3) should be redirected to "Le mie pratiche"
          if (user?.role_id === 3) {
            redirectTo = "/mie-pratiche";
          }
        }
      } catch (error) {
        // If we can't get user info, fall back to default redirect
        console.error("Failed to get user after login:", error);
      }
    }
  } catch (error: unknown) {
    console.error("Login error:", error);
    return { error: "Errore durante il login. Riprova più tardi." };
  }

  // Redirect must be called outside of try-catch because it throws a special exception
  redirect(redirectTo);
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (token) {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  cookieStore.delete("access_token");
  redirect("/login");
}

/**
 * Get the current authenticated user
 * Returns null if not authenticated or token is invalid
 * Handles rate limiting gracefully by returning null
 * Uses React cache to deduplicate requests during a single render
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    const user = (await apiFetch("/api/auth/me", {
      method: "POST",
    })) as User;
    return user;
  } catch (error: unknown) {
    // Don't log rate limiting errors to avoid spam
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      // Rate limited - return null silently
      return null;
    }

    // Log other errors
    if (error instanceof Error) {
      console.error("Failed to get current user:", error.message);
    } else {
      console.error("Failed to get current user:", error);
    }
    return null;
  }
});

/**
 * Refresh the access token
 * Returns new token data or null if refresh fails
 */
export async function refreshToken(): Promise<LoginResponse | null> {
  try {
    const data = (await apiFetch("/api/auth/refresh", {
      method: "POST",
    })) as LoginResponse;

    if (data.access_token) {
      const expiresIn = data.expires_in ?? 3600;
      const cookieStore = await cookies();
      cookieStore.set("access_token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: expiresIn,
        path: "/",
      });
    }

    return data;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as Error & { status?: number }).status === 429
    ) {
      return null;
    }

    if (error instanceof Error) {
      console.error("Failed to refresh token:", error.message);
    } else {
      console.error("Failed to refresh token:", error);
    }
    return null;
  }
}
