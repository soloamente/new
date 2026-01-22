"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowUpRightIcon,
  CheckIcon,
  ClientsIcon,
  SearchIcon,
  UserCircleIcon,
  XIcon,
} from "@/components/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FaPlus } from "react-icons/fa";
import { AnimateNumber } from "motion-plus/react";
import type { ClientRow, ClientStatus } from "@/lib/clients-utils";

interface ClientiProps {
  clients: ClientRow[];
}

// Component to show tooltip only when text is truncated
function EmailWithTooltip({ email }: { email: string }) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(
          textRef.current.scrollWidth > textRef.current.clientWidth,
        );
      }
    };

    requestAnimationFrame(() => {
      checkTruncation();
    });

    window.addEventListener("resize", checkTruncation);

    return () => {
      window.removeEventListener("resize", checkTruncation);
    };
  }, [email]);

  const emailSpan = (
    <span ref={textRef} className="block w-full truncate text-left">
      {email}
    </span>
  );

  if (!isTruncated) {
    return emailSpan;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          ref={textRef}
          className="block w-full cursor-help truncate text-left"
        >
          {email}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={4} className="max-w-md">
        <p className="">{email}</p>
      </TooltipContent>
    </Tooltip>
  );
}

const clientStatusStyles: Record<
  ClientStatus,
  {
    label: string;
    accent: string;
    background: string;
    icon: React.ReactNode;
    iconColor: string;
  }
> = {
  active: {
    label: "Attivo",
    accent: "var(--status-completed-accent)",
    background: "var(--status-completed-background)",
    icon: <CheckIcon />,
    iconColor: "var(--status-completed-icon)",
  },
  inactive: {
    label: "Inattivo",
    accent: "var(--status-suspended-accent)",
    background: "var(--status-suspended-background)",
    icon: <XIcon />,
    iconColor: "var(--status-suspended-icon)",
  },
  pending: {
    label: "In attesa",
    accent: "var(--status-assigned-accent)",
    background: "var(--status-assigned-background)",
    icon: <UserCircleIcon />,
    iconColor: "var(--status-assigned-icon)",
  },
};

export default function Clienti({ clients }: ClientiProps) {
  // State for selected clients
  const [selectedClients, setSelectedClients] = useState<Set<string>>(
    new Set(),
  );
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // No assignee filters for clienti page

  // Derived filtered clients for the UI (status + search)
  const filteredClients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesStatus =
        statusFilter === "all" ? true : client.status === statusFilter;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          client.clientNumber,
          client.name,
          client.company ?? "",
          client.email ?? "",
          client.phone ?? "",
          client.status,
        ]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(normalizedSearch));

      return matchesStatus && matchesSearch;
    });
  }, [clients, searchTerm, statusFilter]);

  // Calculate statistics from filtered clients
  const totalClients = filteredClients.length;
  const activeCount = filteredClients.filter((c) => c.status === "active").length;
  const inactiveCount = filteredClients.filter((c) => c.status === "inactive")
    .length;
  const pendingCount = filteredClients.filter((c) => c.status === "pending")
    .length;
  // Calculate select all checkbox state scoped to filtered rows
  const allSelected = useMemo(
    () =>
      filteredClients.length > 0 &&
      filteredClients.every((client) => selectedClients.has(client.id)),
    [filteredClients, selectedClients],
  );

  const someSelected = useMemo(
    () =>
      filteredClients.some((client) => selectedClients.has(client.id)) &&
      !allSelected,
    [allSelected, filteredClients, selectedClients],
  );

  // Handlers for checkbox selection
  const handleSelectAll = (checked: boolean) => {
    setSelectedClients((prev) => {
      const next = new Set(prev);
      if (checked) {
        filteredClients.forEach((c) => next.add(c.id));
      } else {
        filteredClients.forEach((c) => next.delete(c.id));
      }
      return next;
    });
  };

  const handleSelectClient = (clientId: string, checked: boolean) => {
    const newSelected = new Set(selectedClients);
    if (checked) {
      newSelected.add(clientId);
    } else {
      newSelected.delete(clientId);
    }
    setSelectedClients(newSelected);
  };

  const activePercentage =
    totalClients > 0 ? Math.round((activeCount / totalClients) * 100) : 0;
  const previousActivePercentage =
    totalClients > 0 ? Math.round(((activeCount - 1) / totalClients) * 100) : 0;
  const activeTrend = activePercentage - previousActivePercentage;

  const statusFilters = [
    {
      label: "Tutti i clienti",
      value: "all",
      active: statusFilter === "all",
      onClick: () => setStatusFilter("all"),
    },
    {
      label: "Clienti attivi",
      value: "active",
      active: statusFilter === "active",
      onClick: () => setStatusFilter("active"),
    },
    {
      label: "Clienti inattivi",
      value: "inactive",
      active: statusFilter === "inactive",
      onClick: () => setStatusFilter("inactive"),
    },
    {
      label: "In attesa",
      value: "pending",
      active: statusFilter === "pending",
      onClick: () => setStatusFilter("pending"),
    },
  ];

  return (
    <main className="bg-card m-2.5 flex flex-1 flex-col gap-2.5 overflow-hidden rounded-3xl px-9 pt-6 font-medium">
      {/* Header - Info Container */}
      <div className="relative flex w-full flex-col gap-4.5">
        {/* Header - Title and Export Button */}
        <div className="flex items-center justify-between gap-2.5">
          <h1 className="flex items-center justify-center gap-3.5">
            <ClientsIcon />
            <span>Clienti</span>
          </h1>
          <div className="flex items-center justify-center gap-2.5">
            <button className="bg-background cursor-pointer flex items-center justify-center gap-2.5 rounded-full py-1.75 pr-2.5 pl-3.75 text-sm">
              Aggiungi
              <FaPlus className="text-button-secondary" />
            </button>
          </div>
        </div>
        {/* Header - Filters & Search Container */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex w-full items-center justify-start gap-1.25">
            {/* Header - StatusFilters */}
            <div className="flex items-center justify-center">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={filter.onClick}
                  className={cn(
                    "bg-background flex items-center justify-center gap-2.5 rounded-full px-3.75 py-1.75 text-sm",
                    !filter.active &&
                      "bg-button-inactive text-button-inactive-foreground",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            {/* Header - Assignee Filters removed */}
            <div className="flex w-full flex-0 items-center justify-center gap-1.25" />
          </div>
          {/* Header - Search */}
          <div className="absolute right-0 flex items-center justify-center">
            <label
              htmlFor="search"
              className="bg-background flex w-60 items-center justify-between rounded-full px-3.75 py-1.75 text-sm shadow-[-18px_0px_14px_var(--color-card)] transition-[width,box-shadow] duration-300 ease-out focus-within:w-84"
            >
              <input
                placeholder="Nome, email, cliente..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="placeholder:text-search-placeholder w-full truncate focus:outline-none"
              />
              <SearchIcon className="text-search-placeholder" />
            </label>
          </div>
        </div>
      </div>
      {/* Body Wrapper */}
      <div className="bg-background flex min-h-0 flex-1 flex-col gap-6.25 rounded-t-3xl px-5.5 pt-6.25">
        {/* Body Header */}
        {/* Body Header - Stats */}
        <div className="flex shrink-0 items-start gap-25.5">
          {/* Stats - Totale clienti */}
          <div className="flex flex-col items-start justify-center gap-2.5">
            <h3 className="text-stats-title text-sm font-medium">
              Totale clienti
            </h3>
            <div className="flex items-center justify-start gap-3.75">
              <AnimateNumber className="text-xl">{totalClients}</AnimateNumber>
              <div className="bg-stats-secondary h-5 w-0.75 rounded-full" />
              {/* Stats - Totale clienti - Status Counts */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center gap-1.25 text-xl">
                  <CheckIcon size={24} className="text-stats-secondary" />
                  <AnimateNumber>{activeCount}</AnimateNumber>
                </div>
                <div className="flex items-center justify-center gap-1.25 text-xl">
                  <XIcon size={24} className="text-stats-secondary" />
                  <AnimateNumber>{inactiveCount}</AnimateNumber>
                </div>
                <div className="flex items-center justify-center gap-1.25 text-xl">
                  <UserCircleIcon size={24} className="text-stats-secondary" />
                  <AnimateNumber>{pendingCount}</AnimateNumber>
                </div>
              </div>
            </div>
          </div>

          {/* Stats - Clienti attivi */}
          <div className="flex flex-col items-start justify-center gap-2.5">
            <h3 className="text-stats-title text-sm font-medium">
              Clienti attivi
            </h3>
            <div className="flex items-center justify-start gap-2.5 text-xl">
              <AnimateNumber suffix="%">{activePercentage}</AnimateNumber>
              {activeTrend !== 0 && (
                <>
                  <ArrowUpRightIcon size={24} />
                  <h4 className="flex items-center justify-center gap-1.25">
                    <AnimateNumber
                      prefix={activeTrend > 0 ? "+" : ""}
                      suffix="%"
                      className={activeTrend > 0 ? "text-green" : ""}
                    >
                      {activeTrend}
                    </AnimateNumber>{" "}
                    rispetto al mese precedente
                  </h4>
                </>
              )}
              {activeTrend === 0 && (
                <h4>Stabile rispetto al mese precedente</h4>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl">
          {/* Body Head */}
          <div className="bg-table-header shrink-0 rounded-xl px-3 py-2.25">
            <div className="text-table-header-foreground grid grid-cols-[minmax(120px,max-content)_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  aria-label="Seleziona tutti i clienti"
                  labelClassName="items-center"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span>Cliente N.</span>
              </div>
              <div>Nome</div>
              <div>Email</div>
              <div>Telefono</div>
              <div>Pratiche</div>
              <div>Ultima attività</div>
              <div>Stato</div>
            </div>
          </div>
          {/* Table Body */}
          <div className="scroll-fade-y flex h-full min-h-0 flex-1 flex-col overflow-scroll">
            {filteredClients.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8">
                <p className="text-stats-title text-center">
                  Nessun cliente trovato
                </p>
              </div>
            ) : (
              filteredClients.map((client) => {
                const statusVisual = clientStatusStyles[client.status];

                return (
                  <div
                    key={client.id}
                    className="border-checkbox-border/70 hover:bg-muted border-b px-3 py-5 transition-colors last:border-b-0"
                  >
                    <div className="grid grid-cols-[minmax(120px,max-content)_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 text-base">
                      <div className="flex items-center gap-2.5">
                        <Checkbox
                          aria-label={`Seleziona ${client.clientNumber}`}
                          labelClassName="items-center"
                          checked={selectedClients.has(client.id)}
                          onChange={(e) =>
                            handleSelectClient(client.id, e.target.checked)
                          }
                        />
                        <span className="font-semibold">
                          {client.clientNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <Avatar aria-hidden className="bg-background">
                          <AvatarFallback placeholderSeed={client.name} />
                        </Avatar>
                        <div className="flex flex-col truncate">
                          <span className="truncate font-medium">
                            {client.name}
                          </span>
                          {client.company && (
                            <span className="text-stats-title truncate text-sm">
                              {client.company}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="truncate">
                        {client.email ? (
                          <EmailWithTooltip email={client.email} />
                        ) : (
                          <span className="text-stats-title">
                            Nessuna email
                          </span>
                        )}
                      </div>
                      <div className="truncate">
                        {client.phone || (
                          <span className="text-stats-title">
                            Nessun telefono
                          </span>
                        )}
                      </div>
                      <div className="truncate">{client.practicesCount}</div>
                      <div className="truncate">{client.lastActivity}</div>
                      <div>
                        <span
                          className="inline-flex items-center justify-center gap-2 rounded-full py-1.25 pr-3 pl-2.5 text-base font-medium"
                          style={{
                            backgroundColor: statusVisual.background,
                            color: statusVisual.accent,
                          }}
                          suppressHydrationWarning
                        >
                          <span
                            style={{
                              color: statusVisual.iconColor,
                            }}
                            suppressHydrationWarning
                          >
                            {statusVisual.icon}
                          </span>
                          {statusVisual.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
