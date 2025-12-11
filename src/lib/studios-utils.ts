import type { Studio } from "@/app/actions/studios-actions";
import { formatDate } from "./practices-utils";

// Convert Studio from API to StudioRow for UI
export interface StudioRow {
  id: string;
  name: string;
  city: string;
  vatNumber: string;
  admin: string;
  operatorsCount: number;
  createdAt: string;
}

export function convertStudioToRow(studio: Studio): StudioRow {
  return {
    id: studio.id.toString(),
    name: studio.name,
    city: studio.city || "N/A",
    vatNumber: studio.vat_number || "N/A",
    admin: studio.admin?.name ?? "Nessun admin",
    operatorsCount: studio.operators?.length ?? 0,
    createdAt: formatDate(
      (studio as Studio & { created_at?: string | null }).created_at,
    ),
  };
}

