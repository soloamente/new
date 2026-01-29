import { cookies } from "next/headers";

export const API_BASE_URL =
  "https://cruscotto-pratiche-api-production.up.railway.app";

type FetchOptions = RequestInit & {
  headers?: HeadersInit;
};

/**
 * Statistiche pratiche per studio.
 * NOTE: le chiavi includono anche lo stato con spazio ("in lavorazione") e
 * i conteggi includono gli zeri (come da specifica API).
 */
export interface PracticeStatusStats {
  assegnata: number;
  "in lavorazione": number;
  conclusa: number;
  sospesa: number;
}

export interface StudioStatisticsOperator {
  operator_id: number;
  operator_name: string;
  stats: PracticeStatusStats;
}

export interface StudioStatisticsResponse {
  operators: StudioStatisticsOperator[];
  studio_total: PracticeStatusStats;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPracticeStatusStats(value: unknown): value is PracticeStatusStats {
  if (!isRecord(value)) return false;

  return (
    isFiniteNumber(value.assegnata) &&
    isFiniteNumber(value["in lavorazione"]) &&
    isFiniteNumber(value.conclusa) &&
    isFiniteNumber(value.sospesa)
  );
}

function parseStudioStatisticsResponse(
  value: unknown,
): StudioStatisticsResponse {
  // We keep this validation intentionally lightweight: it protects the UI from
  // unexpected backend changes without pulling in a schema lib.
  if (!isRecord(value)) throw new Error("Formato statistiche non valido.");

  const operators = value.operators;
  const studioTotal = value.studio_total;

  if (!Array.isArray(operators) || !isPracticeStatusStats(studioTotal)) {
    throw new Error("Formato statistiche non valido.");
  }

  const parsedOperators: StudioStatisticsOperator[] = [];
  for (const operator of operators) {
    if (!isRecord(operator)) continue;
    if (!isFiniteNumber(operator.operator_id)) continue;
    if (typeof operator.operator_name !== "string") continue;
    if (!isPracticeStatusStats(operator.stats)) continue;

    parsedOperators.push({
      operator_id: operator.operator_id,
      operator_name: operator.operator_name,
      stats: operator.stats,
    });
  }

  return {
    operators: parsedOperators,
    studio_total: studioTotal,
  };
}

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

/**
 * GET /api/statistics/studio
 * Requisiti backend: JWT Bearer + ruolo AMMINISTRATORE_STUDIO.
 */
export async function getStudioStatistics(): Promise<StudioStatisticsResponse> {
  const json = (await apiFetch("/api/statistics/studio", {
    method: "GET",
    // We want fresh data in the dashboard (no stale caching for operational stats).
    cache: "no-store",
  })) as unknown;

  return parseStudioStatisticsResponse(json);
}
