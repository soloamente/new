import type { User } from "@/app/actions/auth-actions";
import type { Practice } from "@/app/actions/practices-actions";
import type { CSSProperties } from "react";
import { formatDate } from "./practices-utils";

/** Shown when the API does not expose a phone number yet (User model has no phone field). */
export const OPERATOR_PHONE_NOT_PROVIDED = "Non indicato";

// UI status type (mirrors API: active / inactive only — no “on leave” in backend)
export type OperatorStatus = "active" | "inactive";

// Map API status to UI status
export function mapApiStatusToUI(apiStatus: string): OperatorStatus {
  if (apiStatus === "inactive") return "inactive";
  // Not exposed by current API; keep mapping if legacy data exists
  if (apiStatus === "on_leave") return "inactive";
  if (apiStatus === "active") return "active";
  return "active";
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
    phone: OPERATOR_PHONE_NOT_PROVIDED,
    practicesCount: practicesCount,
    completedPractices: completedPractices,
    lastActivity: lastActivity ? formatDate(lastActivity) : "Nessuna attività",
    status: mapApiStatusToUI(operator.status),
  };
}

const OPERATOR_AVATAR_BG_PALETTE: string[] = [
  // Theme-aware CSS variables: softer backgrounds in light mode and richer
  // chips in dark mode, while keeping deterministic color assignment per seed.
  "var(--operator-avatar-bg-1)",
  "var(--operator-avatar-bg-2)",
  "var(--operator-avatar-bg-3)",
  "var(--operator-avatar-bg-4)",
  "var(--operator-avatar-bg-5)",
  "var(--operator-avatar-bg-6)",
  "var(--operator-avatar-bg-7)",
  "var(--operator-avatar-bg-8)",
];

/** Initials badges (e.g. Pratiche group headers): separate tokens so light theme can use dark text, not near-white on pale chips. */
const OPERATOR_AVATAR_INITIALS_BG_PALETTE: string[] = [
  "var(--operator-avatar-initials-bg-1)",
  "var(--operator-avatar-initials-bg-2)",
  "var(--operator-avatar-initials-bg-3)",
  "var(--operator-avatar-initials-bg-4)",
  "var(--operator-avatar-initials-bg-5)",
  "var(--operator-avatar-initials-bg-6)",
  "var(--operator-avatar-initials-bg-7)",
  "var(--operator-avatar-initials-bg-8)",
];

export interface GetOperatorAvatarColorsOptions {
  /**
   * Initials badge (e.g. Pratiche group header): uses `--operator-avatar-initials-*`
   * tokens so light theme gets dark text on saturated chips (not white on pale).
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
    const initialsBackground =
      OPERATOR_AVATAR_INITIALS_BG_PALETTE[paletteIndex]!;
    return {
      backgroundColor: initialsBackground,
      // Light: dark text on saturated mid chips; dark: light text (see globals.css)
      color: "var(--operator-avatar-initials-fg)",
    };
  }
  // Operator icon fallback should be theme-aware (not always text-primary black in light mode).
  return {
    backgroundColor,
    color: "var(--operator-avatar-icon)",
  };
}
