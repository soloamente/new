import { cookies } from "next/headers";

export const API_BASE_URL = "https://cruscotto-pratiche-api.onrender.com";

type FetchOptions = RequestInit & {
  headers?: HeadersInit;
};

export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handle rate limiting (429) gracefully
    if (response.status === 429) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.message || "Troppe richieste. Riprova tra qualche istante.",
      );
      (error as Error & { status?: number }).status = 429;
      throw error;
    }

    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || `API Error: ${response.statusText}`,
    );
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
