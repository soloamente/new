import type { User } from "@/app/actions/auth-actions";
import type { Practice } from "@/app/actions/practices-actions";
import type { CSSProperties } from "react";
import { formatDate } from "./practices-utils";

// UI status type
export type OperatorStatus = "active" | "inactive" | "on_leave";

// Map API status to UI status
export function mapApiStatusToUI(apiStatus: string): OperatorStatus {
  if (apiStatus === "active") return "active";
  if (apiStatus === "inactive") return "inactive";
  if (apiStatus === "on_leave") return "on_leave";
  return "active"; // Default to active
}

// Convert User (operator) from API to OperatorRow for UI
export interface OperatorRow {
  id: string;
  operatorNumber: string;
  name: string;
  email: string;
  phone: string;
  practicesCount: number;
  completedPractices: number;
  lastActivity: string;
  status: OperatorStatus;
  imageUrl?: string;
}

export function convertOperatorToRow(
  operator: User,
  practices: Practice[],
): OperatorRow {
  // Filter practices assigned to this operator
  const operatorPractices = practices.filter(
    (p) => p.assigned_to === operator.id,
  );

  const practicesCount = operatorPractices.length;
  const completedPractices = operatorPractices.filter(
    (p) => p.status === "conclusa",
  ).length;

  // Get last activity from the most recent practice
  const lastActivity =
    operatorPractices.length > 0
      ? operatorPractices.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime(),
        )[0]?.created_at ?? null
      : null;

  return {
    id: operator.id.toString(),
    operatorNumber: `OP-${operator.id.toString().padStart(3, "0")}`,
    name: operator.name,
    email: operator.email,
    phone: "N/A", // Phone is not in User schema, would need to be added
    practicesCount: practicesCount,
    completedPractices: completedPractices,
    lastActivity: lastActivity ? formatDate(lastActivity) : "Nessuna attività",
    status: mapApiStatusToUI(operator.status),
  };
}

const OPERATOR_AVATAR_BG_PALETTE: string[] = [
  // Keep contrast high: darker backgrounds so the primary icon color pops.
  "oklch(0.42 0.11 264)", // indigo
  "oklch(0.42 0.10 200)", // cyan
  "oklch(0.41 0.11 150)", // green
  "oklch(0.42 0.12 100)", // lime
  "oklch(0.42 0.12 55)", // amber
  "oklch(0.42 0.12 25)", // orange
  "oklch(0.42 0.12 340)", // magenta
  "oklch(0.40 0.06 280)", // violet (lower chroma)
];

/**
 * Deterministically pick an operator avatar color from a small palette.
 * This keeps each operator recognizable without relying on uploaded images.
 */
export function getOperatorAvatarColors(
  seed?: string | null,
): CSSProperties {
  const normalizedSeed = seed?.trim().toLowerCase();
  if (!normalizedSeed) return { backgroundColor: OPERATOR_AVATAR_BG_PALETTE[0]! };

  // Simple stable hash (same approach used by avatar placeholder icons).
  let hash = 0;
  for (let index = 0; index < normalizedSeed.length; index += 1) {
    hash = (hash * 31 + normalizedSeed.charCodeAt(index)) >>> 0;
  }

  const paletteIndex = hash % OPERATOR_AVATAR_BG_PALETTE.length;

  return {
    backgroundColor: OPERATOR_AVATAR_BG_PALETTE[paletteIndex]!,
  };
}
