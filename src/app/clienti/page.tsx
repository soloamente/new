"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FaChevronDown, FaPlus } from "react-icons/fa";
import { AnimateNumber } from "motion-plus/react";

type ClientStatus = "active" | "inactive" | "pending";

interface ClientRow {
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

const mockClients: ClientRow[] = [
  {
    id: "C-1001",
    clientNumber: "C-1001",
    name: "Marco Bianchi",
    email: "marco.bianchi@example.com",
    phone: "+39 123 456 7890",
    company: undefined,
    practicesCount: 3,
    lastActivity: "12 Nov 2025, 09:32",
    status: "active",
  },
  {
    id: "C-1002",
    clientNumber: "C-1002",
    name: "Sara Martini",
    email: "sara.martini@example.com",
    phone: "+39 123 456 7891",
    company: undefined,
    practicesCount: 2,
    lastActivity: "10 Nov 2025, 15:10",
    status: "active",
  },
  {
    id: "C-1003",
    clientNumber: "C-1003",
    name: "Luca Esposito",
    email: "luca.esposito@example.com",
    phone: "+39 123 456 7892",
    company: undefined,
    practicesCount: 1,
    lastActivity: "07 Nov 2025, 11:47",
    status: "active",
  },
  {
    id: "C-1004",
    clientNumber: "C-1004",
    name: "Helios S.p.A.",
    email: "info@helios.it",
    phone: "+39 123 456 7893",
    company: "Helios S.p.A.",
    practicesCount: 5,
    lastActivity: "05 Nov 2025, 17:25",
    status: "active",
  },
  {
    id: "C-1005",
    clientNumber: "C-1005",
    name: "Chiara D'Amico",
    email: "chiara.damico@example.com",
    phone: "+39 123 456 7894",
    company: undefined,
    practicesCount: 2,
    lastActivity: "28 Ott 2025, 08:05",
    status: "inactive",
  },
  {
    id: "C-1006",
    clientNumber: "C-1006",
    name: "Roberto Ferrari",
    email: "roberto.ferrari@example.com",
    phone: "+39 123 456 7895",
    company: undefined,
    practicesCount: 1,
    lastActivity: "25 Ott 2025, 14:20",
    status: "active",
  },
  {
    id: "C-1007",
    clientNumber: "C-1007",
    name: "Elena Romano",
    email: "elena.romano@example.com",
    phone: "+39 123 456 7896",
    company: undefined,
    practicesCount: 4,
    lastActivity: "22 Ott 2025, 10:15",
    status: "active",
  },
  {
    id: "C-1008",
    clientNumber: "C-1008",
    name: "Andrea Conti",
    email: "andrea.conti@example.com",
    phone: "+39 123 456 7897",
    company: undefined,
    practicesCount: 1,
    lastActivity: "20 Ott 2025, 16:45",
    status: "pending",
  },
  {
    id: "C-1009",
    clientNumber: "C-1009",
    name: "Francesca Russo",
    email: "francesca.russo@example.com",
    phone: "+39 123 456 7898",
    company: undefined,
    practicesCount: 2,
    lastActivity: "18 Ott 2025, 11:30",
    status: "active",
  },
  {
    id: "C-1010",
    clientNumber: "C-1010",
    name: "Davide Lombardi",
    email: "davide.lombardi@example.com",
    phone: "+39 123 456 7899",
    company: undefined,
    practicesCount: 1,
    lastActivity: "15 Ott 2025, 09:50",
    status: "active",
  },
  {
    id: "C-1011",
    clientNumber: "C-1011",
    name: "Sofia Greco",
    email: "sofia.greco@example.com",
    phone: "+39 123 456 7900",
    company: undefined,
    practicesCount: 1,
    lastActivity: "12 Ott 2025, 13:25",
    status: "inactive",
  },
  {
    id: "C-1012",
    clientNumber: "C-1012",
    name: "Mario Rossi",
    email: "mario.rossi@example.com",
    phone: "+39 123 456 7901",
    company: undefined,
    practicesCount: 2,
    lastActivity: "10 Ott 2025, 08:40",
    status: "active",
  },
  {
    id: "C-1013",
    clientNumber: "C-1013",
    name: "Tech Solutions S.r.l.",
    email: "info@techsolutions.it",
    phone: "+39 123 456 7902",
    company: "Tech Solutions S.r.l.",
    practicesCount: 3,
    lastActivity: "08 Ott 2025, 15:20",
    status: "active",
  },
  {
    id: "C-1014",
    clientNumber: "C-1014",
    name: "Laura Bianco",
    email: "laura.bianco@example.com",
    phone: "+39 123 456 7903",
    company: undefined,
    practicesCount: 1,
    lastActivity: "05 Ott 2025, 10:10",
    status: "active",
  },
  {
    id: "C-1015",
    clientNumber: "C-1015",
    name: "Giuseppe Verdi",
    email: "giuseppe.verdi@example.com",
    phone: "+39 123 456 7904",
    company: undefined,
    practicesCount: 2,
    lastActivity: "02 Ott 2025, 14:55",
    status: "active",
  },
];

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
    accent: "var(--status-cancelled-accent)",
    background: "var(--status-cancelled-background)",
    icon: <XIcon />,
    iconColor: "var(--status-cancelled-icon)",
  },
  pending: {
    label: "In attesa",
    accent: "var(--status-assigned-accent)",
    background: "var(--status-assigned-background)",
    icon: <UserCircleIcon />,
    iconColor: "var(--status-assigned-icon)",
  },
};

export default function ClientiPage() {
  // State for selected clients
  const [selectedClients, setSelectedClients] = useState<Set<string>>(
    new Set(),
  );

  // Calculate statistics from mockClients
  const totalClients = mockClients.length;
  const activeCount = mockClients.filter((c) => c.status === "active").length;
  const inactiveCount = mockClients.filter(
    (c) => c.status === "inactive",
  ).length;
  const pendingCount = mockClients.filter((c) => c.status === "pending").length;
  const totalPractices = mockClients.reduce(
    (sum, client) => sum + client.practicesCount,
    0,
  );

  // Calculate select all checkbox state
  const allSelected = useMemo(
    () => totalClients > 0 && selectedClients.size === totalClients,
    [totalClients, selectedClients.size],
  );

  const someSelected = useMemo(
    () => selectedClients.size > 0 && selectedClients.size < totalClients,
    [totalClients, selectedClients.size],
  );

  // Handlers for checkbox selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(new Set(mockClients.map((c) => c.id)));
    } else {
      setSelectedClients(new Set());
    }
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

  const activePercentage = Math.round((activeCount / totalClients) * 100);
  const previousActivePercentage = Math.round(
    ((activeCount - 1) / totalClients) * 100,
  );
  const activeTrend = activePercentage - previousActivePercentage;

  const statusFilters = [
    {
      label: "Tutti i clienti",
      value: "all",
      active: true,
    },
    {
      label: "Clienti attivi",
      value: "active",
      active: false,
    },
    {
      label: "Clienti inattivi",
      value: "inactive",
      active: false,
    },
    {
      label: "In attesa",
      value: "pending",
      active: false,
    },
  ];

  const assigneeFilters = useMemo(
    () => [
      {
        triggerLabel: "Cliente N.",
        values: [
          {
            label: "Cliente N. 1",
            value: "client1",
            active: false,
          },
          {
            label: "Cliente N. 2",
            value: "client2",
            active: false,
          },
          {
            label: "Cliente N. 3",
            value: "client3",
            active: false,
          },
        ],
      },
    ],
    [],
  );

  const initialFilterValues = useMemo(
    () =>
      Object.fromEntries(
        assigneeFilters.map((filter) => [
          filter.triggerLabel.toLowerCase().replace(/\s+/g, "-"),
          filter.triggerLabel,
        ]),
      ),
    [assigneeFilters],
  );

  const [assigneeFilterValues, setAssigneeFilterValues] =
    useState<Record<string, string>>(initialFilterValues);

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
            <button className="bg-background flex items-center justify-center gap-2.5 rounded-full py-1.75 pr-2.5 pl-3.75 text-sm">
              Esporta
              <FaChevronDown size={15} className="text-button-secondary" />
            </button>
            <button className="bg-background flex items-center justify-center gap-2.5 rounded-full py-1.75 pr-2.5 pl-3.75 text-sm">
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
            {/* Header - Assignee Filters */}
            <div className="flex w-full flex-0 items-center justify-center gap-1.25">
              {assigneeFilters.map((filter) => {
                const filterKey = filter.triggerLabel
                  .toLowerCase()
                  .replace(/\s+/g, "-");

                return (
                  <Select
                    key={filter.triggerLabel}
                    value={
                      assigneeFilterValues[filterKey] ?? filter.triggerLabel
                    }
                    onValueChange={(value) => {
                      setAssigneeFilterValues((prev) => ({
                        ...prev,
                        [filterKey]: value,
                      }));
                    }}
                  >
                    <SelectTrigger className="w-auto font-medium">
                      <SelectValue placeholder={filter.triggerLabel} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={filter.triggerLabel}>
                        {filter.triggerLabel}
                      </SelectItem>
                      {filter.values.map((value) => (
                        <SelectItem key={value.value} value={value.value}>
                          {value.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              })}
            </div>
          </div>
          {/* Header - Search */}
          <div className="absolute right-0 flex items-center justify-center">
            <label
              htmlFor="search"
              className="bg-background flex w-xs items-center justify-between rounded-full px-3.75 py-1.75 text-sm shadow-[-18px_0px_14px_var(--color-card)] transition-all duration-200"
            >
              <input
                placeholder="Nome, email, cliente..."
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
            {mockClients.map((client) => {
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
                      <EmailWithTooltip email={client.email} />
                    </div>
                    <div className="truncate">{client.phone}</div>
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
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
