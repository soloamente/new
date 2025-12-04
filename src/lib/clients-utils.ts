import type { Client } from "@/app/actions/clients-actions";
import type { Practice } from "@/app/actions/practices-actions";
import { formatDate } from "./practices-utils";

// UI status type for clients
export type ClientStatus = "active" | "inactive" | "pending";

// Convert Client from API to ClientRow for UI
export interface ClientRow {
  id: string;
  clientNumber: string;
  name: string;
  email: string;
  phone: string;
  company: string | undefined;
  practicesCount: number;
  lastActivity: string;
  status: ClientStatus;
}

/**
 * Convert API Client to UI ClientRow
 * Note: practicesCount and lastActivity are not available from the API,
 * so we use default values. These could be enhanced by fetching practices
 * and calculating counts/dates.
 */
export function convertClientToRow(client: Client): ClientRow {
  // Generate client number from ID (e.g., "C-1001")
  const clientNumber = `C-${client.id.toString().padStart(4, "0")}`;

  // Determine if it's a company based on name patterns (S.p.A., S.r.l., etc.)
  const isCompany =
    client.name.includes("S.p.A.") ||
    client.name.includes("S.r.l.") ||
    client.name.includes("S.n.c.") ||
    client.name.includes("S.a.s.");

  // Default status to active (since API doesn't provide status)
  // In a real scenario, you might derive this from practices or other data
  const status: ClientStatus = "active";

  return {
    id: client.id.toString(),
    clientNumber,
    name: client.name,
    email: client.email ?? "",
    phone: client.phone ?? "",
    company: isCompany ? client.name : undefined,
    practicesCount: 0, // Will be calculated if we fetch practices
    lastActivity: "Data non disponibile", // Will be calculated if we fetch practices
    status,
  };
}

/**
 * Enhanced version that includes practices data
 * This can be used when we have practices data to calculate counts and dates
 */
export function convertClientToRowWithPractices(
  client: Client,
  practices: Practice[],
): ClientRow {
  const baseRow = convertClientToRow(client);

  // Count practices for this client
  const clientPractices = practices.filter((p) => p.client_id === client.id);
  const practicesCount = clientPractices.length;

  // Find most recent practice date
  const lastActivityDate = clientPractices
    .map((p) => p.created_at)
    .filter(Boolean)
    .sort()
    .reverse()[0];

  return {
    ...baseRow,
    practicesCount,
    lastActivity: formatDate(lastActivityDate ?? null),
  };
}

