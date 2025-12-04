import type { Practice } from "@/app/actions/practices-actions";

// UI status type
export type PracticeStatus = "assigned" | "in_progress" | "completed" | "cancelled";

// Map API status to UI status
export function mapApiStatusToUI(
  apiStatus: Practice["status"],
): PracticeStatus {
  switch (apiStatus) {
    case "assegnata":
      return "assigned";
    case "in lavorazione":
      return "in_progress";
    case "conclusa":
      return "completed";
    case "sospesa":
      return "cancelled";
    default:
      return "assigned";
  }
}

// Format date to Italian format
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
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch {
    return "Data non valida";
  }
}

// Convert Practice from API to PracticeRow for UI
export interface PracticeRow {
  id: string;
  praticaNumber: string;
  date: string;
  internalOperator: string;
  client: string;
  type: string;
  note: string | undefined;
  status: PracticeStatus;
}

export function convertPracticeToRow(practice: Practice): PracticeRow {
  return {
    id: practice.id.toString(),
    praticaNumber: practice.practice_number,
    date: formatDate(practice.created_at),
    internalOperator: practice.operator?.name ?? "Non assegnato",
    client: practice.client?.name ?? "Cliente sconosciuto",
    type: practice.type,
    note: practice.notes ?? undefined,
    status: mapApiStatusToUI(practice.status),
  };
}

