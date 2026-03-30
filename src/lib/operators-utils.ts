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
  // Practices use is_concluded instead of a status string (API migration).
  const completedPractices = operatorPractices.filter(
    (p) => p.is_concluded === true,
  ).length;

  // Get last activity from the most recent practice
  const lastActivity =
    operatorPractices.length > 0
      ? operatorPractices.sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime(),
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

export interface GetOperatorAvatarColorsOptions {
  /**
   * When rendering initials on a colored badge, set a near-white foreground so
   * text reads at full brightness (default placeholder icon color is muted gray).
   */
  withInitialsForeground?: boolean;
}

/**
 * Deterministically pick an operator avatar color from a small palette.
 * This keeps each operator recognizable without relying on uploaded images.
 */
export function getOperatorAvatarColors(
  seed?: string | null,
  options?: GetOperatorAvatarColorsOptions,
): CSSProperties {
  const normalizedSeed = seed?.trim().toLowerCase();
  // Simple stable hash (same approach used by avatar placeholder icons).
  let paletteIndex = 0;
  if (normalizedSeed) {
    let hash = 0;
    for (let index = 0; index < normalizedSeed.length; index += 1) {
      hash = (hash * 31 + normalizedSeed.charCodeAt(index)) >>> 0;
    }
    paletteIndex = hash % OPERATOR_AVATAR_BG_PALETTE.length;
  }
  const backgroundColor = OPERATOR_AVATAR_BG_PALETTE[paletteIndex]!;
  if (options?.withInitialsForeground) {
    return {
      backgroundColor,
      // Full-luminance foreground on saturated chips (AvatarFallback default would stay gray).
      color: "oklch(0.99 0 0)",
    };
  }
  return { backgroundColor };
}
