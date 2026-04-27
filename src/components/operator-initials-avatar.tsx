"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getDisplayNameInitials } from "@/lib/practices-utils";
import { getOperatorAvatarColors } from "@/lib/operators-utils";

/** Same colored-chip initials as collapsible operator groups on `/pratiche` (`--operator-avatar-initials-*`). */
export type OperatorInitialsAvatarKind = "operator" | "client";

export interface OperatorInitialsAvatarProps {
  name: string;
  /** Deterministic color seed (e.g. operator id). Defaults to `name`. */
  seed?: string;
  /** Merged with the default class list on `Avatar` root. */
  className?: string;
  "aria-hidden"?: boolean;
  /** `client` = “Cliente:” in aria; same multi-color backgrounds as group headers. */
  kind?: OperatorInitialsAvatarKind;
}

export function OperatorInitialsAvatar({
  name,
  seed,
  className,
  "aria-hidden": ariaHidden = true,
  kind = "operator",
}: OperatorInitialsAvatarProps) {
  const fromSeed = seed?.trim();
  const colorSeed =
    fromSeed != null && fromSeed.length > 0 ? fromSeed : name.trim();
  const roleLabel = kind === "client" ? "Cliente" : "Operatore";
  return (
    <Avatar
      aria-hidden={ariaHidden}
      className={cn("size-9 shrink-0 rounded-md bg-transparent", className)}
    >
      <AvatarFallback
        className="rounded-md"
        aria-label={`${roleLabel}: ${name}`}
        placeholderSeed={colorSeed}
        style={getOperatorAvatarColors(colorSeed, {
          withInitialsForeground: true,
        })}
      >
        <span className="text-[11px] font-semibold uppercase leading-none tracking-tight">
          {getDisplayNameInitials(name)}
        </span>
      </AvatarFallback>
    </Avatar>
  );
}
