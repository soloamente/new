import type { Practice } from "@/app/actions/practices-actions";

// UI status type derived from the new binary API state.
export type PracticeStatus = "assigned" | "completed";

// Map API boolean state to UI status key.
export function mapApiStatusToUI(isConcluded: Practice["is_concluded"]): PracticeStatus {
  return isConcluded ? "completed" : "assigned";
}

// Format date to Italian format (date only, no time)
/**
 * Initials for a person/entity display name (first + last word, or two chars of a single word).
 * Used for avatar fallbacks instead of whimsical placeholder icons.
 */
export function getDisplayNameInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  if (trimmed === "Non assegnato") return "NA";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const w = parts[0];
    if (!w) return "?";
    return w.length >= 2 ? w.slice(0, 2).toUpperCase() : w.slice(0, 1).toUpperCase();
  }
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Data non disponibile";

  try {
    const date = new Date(dateString);
    const months = [
      "Gen",
      "Feb",
      "Mar",
      "Apr",
      "Mag",
      "Giu",
      "Lug",
      "Ago",
      "Set",
      "Ott",
      "Nov",
      "Dic",
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return "Data non valida";
  }
}

// Convert Practice from API to PracticeRow for UI
export interface PracticeRow {
  id: string;
  praticaNumber: string;
  date: string;
  /** Raw date string from API for filtering purposes */
  rawDate: string | null;
  internalOperator: string;
  /** All client names joined by ", " — used for text search and legacy filter matching */
  client: string;
  /** All client phones joined by ", " — used for text search */
  clientPhone: string;
  /** Full clients list for avatar stack rendering */
  clients: Array<{ id: number; name: string; phone?: string }>;
  type: string;
  note: string | undefined;
  status: PracticeStatus;
  isConcluded: boolean;
  concludedAt: string | null;
}

export function convertPracticeToRow(practice: Practice): PracticeRow {
  const clients = practice.clients ?? [];
  return {
    id: practice.id.toString(),
    praticaNumber: practice.practice_number,
    date: formatDate(practice.created_at),
    rawDate: practice.created_at ?? null,
    internalOperator: practice.operator?.name ?? "Non assegnato",
    client: clients.length > 0 ? clients.map((c) => c.name).join(", ") : "Cliente sconosciuto",
    clientPhone: clients.map((c) => c.phone ?? "").filter(Boolean).join(", ") || "N/D",
    clients: clients.map((c) => ({ id: c.id, name: c.name, phone: c.phone })),
    type: practice.type,
    note: practice.notes ?? undefined,
    status: mapApiStatusToUI(practice.is_concluded),
    isConcluded: practice.is_concluded,
    concludedAt: practice.concluded_at ? formatDate(practice.concluded_at) : null,
  };
}

