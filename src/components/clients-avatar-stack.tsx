"use client";

import { OperatorInitialsAvatar } from "@/components/operator-initials-avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ClientEntry {
  id: number;
  name: string;
  phone?: string;
}

interface ClientsAvatarStackProps {
  clients: ClientEntry[];
  /** Maximum avatars before showing "+N" badge. Default: 3. */
  max?: number;
}

export function ClientsAvatarStack({
  clients,
  max = 3,
}: ClientsAvatarStackProps) {
  if (clients.length === 0) {
    return (
      <span className="text-muted-foreground text-sm">
        Nessun cliente
      </span>
    );
  }

  const visible = clients.slice(0, max);
  const overflow = clients.length - visible.length;
  const allNames = clients
    .map((c) => (c.phone ? `${c.name} · ${c.phone}` : c.name))
    .join("\n");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex cursor-default items-center gap-2">
          {/* Avatar stack with negative margin overlap */}
          <div className="flex items-center -space-x-2">
            {visible.map((client) => (
              <OperatorInitialsAvatar
                key={client.id}
                kind="client"
                name={client.name}
                seed={client.name}
                className="size-8 ring-2 ring-background"
              />
            ))}
            {overflow > 0 && (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted ring-2 ring-background">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  +{overflow}
                </span>
              </div>
            )}
          </div>

          {/* Primary name label (first client) */}
          <span className="truncate text-sm">
            {clients[0]?.name}
            {clients.length > 1 && (
              <span className="text-muted-foreground ml-1 text-xs">
                +{clients.length - 1}
              </span>
            )}
          </span>
        </div>
      </TooltipTrigger>

      <TooltipContent side="right" className="max-w-48 whitespace-pre-line text-xs">
        {allNames}
      </TooltipContent>
    </Tooltip>
  );
}
