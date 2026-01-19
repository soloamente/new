"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRightIcon,
  CheckIcon,
  HalfStatusIcon,
  PraticheIcon,
  SearchIcon,
  UserCircleIcon,
  XIcon,
} from "@/components/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  DateRangeFilter,
  type DateRange,
} from "@/components/ui/date-range-filter";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FaPlus } from "react-icons/fa";
import { AnimateNumber } from "motion-plus/react";
import type { PracticeRow } from "@/lib/practices-utils";
import { CreatePracticeDialog } from "@/components/create-practice-dialog";

type PracticeView = "all" | "mine";

interface PraticheProps {
  practices: PracticeRow[];
  userRoleId?: number;
  currentUserId?: number;
  view?: PracticeView;
  paths?: {
    all: string;
    mine: string;
  };
}

const normalizeValue = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, "-");

// Component to show tooltip only when text is truncated
function NoteWithTooltip({ note }: { note: string }) {
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

    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      checkTruncation();
    });

    window.addEventListener("resize", checkTruncation);

    return () => {
      window.removeEventListener("resize", checkTruncation);
    };
  }, [note]);

  const noteSpan = (
    <span ref={textRef} className="block w-full truncate text-left">
      {note}
    </span>
  );

  if (!isTruncated) {
    return noteSpan;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          ref={textRef}
          className="block w-full cursor-help truncate text-left"
        >
          {note}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={4} className="max-w-md">
        <p className="">{note}</p>
      </TooltipContent>
    </Tooltip>
  );
}

const practiceStatusStyles: Record<
  PracticeRow["status"],
  {
    label: string;
    accent: string;
    background: string;
    icon: React.ReactNode;
    iconColor: string;
  }
> = {
  assigned: {
    label: "Assegnata",
    accent: "var(--status-assigned-accent)",
    background: "var(--status-assigned-background)",
    icon: <UserCircleIcon />,
    iconColor: "var(--status-assigned-icon)",
  },
  in_progress: {
    label: "In lavorazione",
    accent: "var(--status-in-progress-accent)",
    background: "var(--status-in-progress-background)",
    icon: <HalfStatusIcon />,
    iconColor: "var(--status-in-progress-icon)",
  },
  completed: {
    label: "Conclusa",
    accent: "var(--status-completed-accent)",
    background: "var(--status-completed-background)",
    icon: <CheckIcon />,
    iconColor: "var(--status-completed-icon)",
  },
  suspended: {
    label: "Sospesa",
    accent: "var(--status-suspended-accent)",
    background: "var(--status-suspended-background)",
    icon: <XIcon />,
    iconColor: "var(--status-suspended-icon)",
  },
};

export default function Pratiche({
  practices,
  userRoleId,
  currentUserId,
  view = "all",
  paths = { all: "/pratiche", mine: "/mie-pratiche" },
}: PraticheProps) {
  const router = useRouter();
  const isOperator = userRoleId === 3;
  const isMineView = isOperator && view === "mine";
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    PracticeRow["status"] | "all"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateRange | null>(null);
  const pageTitle = view === "mine" ? "Le mie pratiche" : "Tutte le pratiche";

  // State for selected practices
  const [selectedPractices, setSelectedPractices] = useState<Set<string>>(
    new Set(),
  );

  // Status filters - for OPERATORE, first filter is dynamic (Tutte/Mie)
  const statusFilters = [
    {
      label: isOperator
        ? isMineView
          ? "Mie pratiche"
          : "Tutte le pratiche"
        : "Tutte le pratiche",
      value: "all",
      active: statusFilter === "all",
      onClick: isOperator
        ? () => {
            setStatusFilter("all");
            // Operators jump between full studio list and personal list via dedicated routes
            router.push(isMineView ? paths.all : paths.mine);
          }
        : () => setStatusFilter("all"),
    },
    {
      label: "Pratiche assegnate",
      value: "assigned",
      active: statusFilter === "assigned",
      onClick: () => setStatusFilter("assigned"),
    },
    {
      label: "Pratiche in lavorazione",
      value: "in_progress",
      active: statusFilter === "in_progress",
      onClick: () => setStatusFilter("in_progress"),
    },
    {
      label: "Pratiche concluse",
      value: "completed",
      active: statusFilter === "completed",
      onClick: () => setStatusFilter("completed"),
    },
    {
      label: "Pratiche sospese",
      value: "suspended",
      active: statusFilter === "suspended",
      onClick: () => setStatusFilter("suspended"),
    },
  ];

  // Get unique operators and clients from practices for filters
  const uniqueOperators = useMemo(() => {
    const operators = new Set(
      practices.map((p) => p.internalOperator).filter(Boolean),
    );
    return Array.from(operators).map((name) => ({
      label: name,
      value: name.toLowerCase().replace(/\s+/g, "-"),
      active: false,
    }));
  }, [practices]);

  const uniqueClients = useMemo(() => {
    const clients = new Set(practices.map((p) => p.client).filter(Boolean));
    return Array.from(clients).map((name) => ({
      label: name,
      value: name.toLowerCase().replace(/\s+/g, "-"),
      active: false,
    }));
  }, [practices]);

  const assigneeFilters = useMemo(
    () => [
      {
        triggerLabel: "Operatore",
        values: uniqueOperators,
      },
      {
        triggerLabel: "Cliente",
        values: uniqueClients,
      },
    ],
    [uniqueOperators, uniqueClients],
  );

  // State for assignee filter values
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

  // Ensure select filters always have default placeholders even if options change
  useEffect(() => {
    setAssigneeFilterValues((prev) => {
      const next = { ...prev };
      let changed = false;

      assigneeFilters.forEach((filter) => {
        const key = normalizeValue(filter.triggerLabel);
        if (!(key in next)) {
          next[key] = filter.triggerLabel;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [assigneeFilters]);

  // Derived filtered practices for UI (status + selects + search + date)
  const filteredPractices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const operatorFilter = assigneeFilterValues[normalizeValue("Operatore")];
    const clientFilter = assigneeFilterValues[normalizeValue("Cliente")];

    return practices.filter((practice) => {
      const matchesStatus =
        statusFilter === "all" ? true : practice.status === statusFilter;

      const matchesOperator =
        !operatorFilter || operatorFilter === "Operatore"
          ? true
          : normalizeValue(practice.internalOperator) === operatorFilter;

      const matchesClient =
        !clientFilter || clientFilter === "Cliente"
          ? true
          : normalizeValue(practice.client) === clientFilter;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          practice.praticaNumber,
          practice.internalOperator,
          practice.client,
          practice.type,
          practice.status,
          practice.note ?? "",
        ]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(normalizedSearch));

      // Date filter - check if practice date is within the selected range
      const matchesDate = (() => {
        if (!dateFilter || (!dateFilter.from && !dateFilter.to)) {
          return true;
        }
        if (!practice.rawDate) {
          return false;
        }
        const practiceDate = new Date(practice.rawDate);
        if (dateFilter.from && practiceDate < dateFilter.from) {
          return false;
        }
        if (dateFilter.to && practiceDate > dateFilter.to) {
          return false;
        }
        return true;
      })();

      return (
        matchesStatus &&
        matchesOperator &&
        matchesClient &&
        matchesSearch &&
        matchesDate
      );
    });
  }, [assigneeFilterValues, dateFilter, practices, searchTerm, statusFilter]);

  // Calculate statistics from filtered practices to mirror visible rows
  const totalPractices = filteredPractices.length;
  const completedCount = filteredPractices.filter(
    (p) => p.status === "completed",
  ).length;
  const inProgressCount = filteredPractices.filter(
    (p) => p.status === "in_progress",
  ).length;
  const assignedCount = filteredPractices.filter((p) => p.status === "assigned")
    .length;
  const suspendedCount = filteredPractices.filter(
    (p) => p.status === "suspended",
  ).length;

  // Calculate select all checkbox state
  const allSelected = useMemo(
    () =>
      filteredPractices.length > 0 &&
      filteredPractices.every((practice) =>
        selectedPractices.has(practice.id),
      ),
    [filteredPractices, selectedPractices],
  );

  const someSelected = useMemo(
    () =>
      filteredPractices.some((practice) =>
        selectedPractices.has(practice.id),
      ) && !allSelected,
    [allSelected, filteredPractices, selectedPractices],
  );

  // Handlers for checkbox selection
  const handleSelectAll = (checked: boolean) => {
    setSelectedPractices((prev) => {
      const next = new Set(prev);
      if (checked) {
        filteredPractices.forEach((p) => next.add(p.id));
      } else {
        filteredPractices.forEach((p) => next.delete(p.id));
      }
      return next;
    });
  };

  const handleSelectPractice = (practiceId: string, checked: boolean) => {
    const newSelected = new Set(selectedPractices);
    if (checked) {
      newSelected.add(practiceId);
    } else {
      newSelected.delete(practiceId);
    }
    setSelectedPractices(newSelected);
  };

  // Calculate completion percentage
  const completionPercentage =
    totalPractices > 0
      ? Math.round((completedCount / totalPractices) * 100)
      : 0;

  // For month-over-month comparison
  const activePractices = totalPractices - suspendedCount;
  const previousMonthCompletion =
    activePractices > 0
      ? Math.round(((completedCount - 1) / activePractices) * 100)
      : 0;
  const monthOverMonthChange = completionPercentage - previousMonthCompletion;

  return (
    <main className="bg-card m-2.5 flex flex-1 flex-col gap-2.5 overflow-hidden rounded-3xl px-9 pt-6 font-medium">
      {/* Header - Info Container */}
      <div className="relative flex w-full flex-col gap-4.5">
        {/* Header - Title and Export Button */}
        <div className="flex items-center justify-between gap-2.5">
          <h1 className="flex items-center justify-center gap-3.5">
            <PraticheIcon />
            <span>{pageTitle}</span>
          </h1>
          <div className="flex items-center justify-center gap-2.5">
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-background flex cursor-pointer items-center justify-center gap-2.5 rounded-full py-1.75 pr-2.5 pl-3.75 text-sm"
            >
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
            {/* Header - Assignee Filters */}
            <div className="flex w-full flex-0 items-center justify-center gap-1.25">
              {assigneeFilters.map((filter) => {
                const filterKey = filter.triggerLabel
                  .toLowerCase()
                  .replace(/\s+/g, "-");
                const isClientFilter = filter.triggerLabel === "Cliente";
                const isOperatorFilter = filter.triggerLabel === "Operatore";

                // Use SearchableSelect for both client and operator filters
                return (
                  <SearchableSelect
                    key={filter.triggerLabel}
                    placeholder={filter.triggerLabel}
                    value={assigneeFilterValues[filterKey] ?? filter.triggerLabel}
                    onValueChange={(value) => {
                      setAssigneeFilterValues((prev) => ({
                        ...prev,
                        [filterKey]: value,
                      }));
                    }}
                    options={filter.values}
                    searchPlaceholder={
                      isClientFilter
                        ? "Cerca cliente..."
                        : isOperatorFilter
                          ? "Cerca operatore..."
                          : "Cerca..."
                    }
                    showAllOption={true}
                    allOptionLabel={
                      isClientFilter
                        ? "Tutti i clienti"
                        : isOperatorFilter
                          ? "Tutti gli operatori"
                          : filter.triggerLabel
                    }
                  />
                );
              })}
              {/* Date Range Filter */}
              <DateRangeFilter
                value={dateFilter}
                onValueChange={setDateFilter}
                placeholder="Data"
              />
            </div>
          </div>
          {/* Header - Search */}
          <div className="absolute right-0 flex items-center justify-center">
            <label
              htmlFor="search"
              className="bg-background flex w-xs items-center justify-between rounded-full px-3.75 py-1.75 text-sm shadow-[-18px_0px_14px_var(--color-card)] transition-all duration-200"
            >
              <input
                placeholder="Numero pratica, stato, cliente..."
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
          {/* Stats - Totale pratiche */}
          <div className="flex flex-col items-start justify-center gap-2.5">
            <h3 className="text-stats-title text-sm font-medium">
              Totale pratiche
            </h3>
            <div className="flex items-center justify-start gap-3.75">
              <AnimateNumber className="text-xl">
                {totalPractices}
              </AnimateNumber>
              <div className="bg-stats-secondary h-5 w-0.75 rounded-full" />
              {/* Stats - Totale pratiche - Status Counts */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center gap-1.25 text-xl">
                  <CheckIcon size={24} className="text-stats-secondary" />
                  <AnimateNumber>{completedCount}</AnimateNumber>
                </div>
                <div className="flex items-center justify-center gap-1.25 text-xl">
                  <HalfStatusIcon size={24} className="text-stats-secondary" />
                  <AnimateNumber>{inProgressCount}</AnimateNumber>
                </div>
                <div className="flex items-center justify-center gap-1.25 text-xl">
                  <UserCircleIcon size={24} className="text-stats-secondary" />
                  <AnimateNumber>{assignedCount}</AnimateNumber>
                </div>
                <div className="flex items-center justify-center gap-1.25 text-xl">
                  <XIcon size={24} className="text-stats-secondary" />
                  <AnimateNumber>{suspendedCount}</AnimateNumber>
                </div>
              </div>
            </div>
          </div>
          {/* Stats - Andamento pratiche completate */}
          <div className="flex flex-col items-start justify-center gap-2.5">
            <h3 className="text-stats-title text-sm font-medium">
              Andamento pratiche completate
            </h3>
            <div className="flex items-center justify-start gap-2.5 text-xl">
              <AnimateNumber suffix="%">{completionPercentage}</AnimateNumber>
              {monthOverMonthChange !== 0 && (
                <>
                  <ArrowUpRightIcon size={24} />
                  <h4 className="flex items-center justify-center gap-1.25">
                    <AnimateNumber
                      prefix={monthOverMonthChange > 0 ? "+" : ""}
                      suffix="%"
                      className={monthOverMonthChange > 0 ? "text-green" : ""}
                    >
                      {monthOverMonthChange}
                    </AnimateNumber>{" "}
                    rispetto al mese precedente
                  </h4>
                </>
              )}
              {monthOverMonthChange === 0 && (
                <h4>Stabile rispetto al mese precedente</h4>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl">
          {/* Body Head */}
          <div className="bg-table-header shrink-0 rounded-xl px-3 py-2.25">
            <div
              className={cn(
                "text-table-header-foreground grid items-center gap-4 text-sm font-medium",
                isMineView
                  ? "grid-cols-[minmax(120px,max-content)_1fr_1fr_1fr_1fr_1fr]"
                  : "grid-cols-[minmax(120px,max-content)_1fr_1fr_1fr_1fr_1fr_1fr]",
              )}
            >
              <div className="flex items-center gap-2.5">
                <Checkbox
                  aria-label="Seleziona tutte le pratiche"
                  labelClassName="items-center"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span>Pratica N.</span>
              </div>
              <div>Data</div>
              {!isMineView && <div>Operatore Interno</div>}
              <div>Cliente</div>
              <div>Tipologia</div>
              <div>Note</div>
              <div>Stato</div>
            </div>
          </div>
          {/* Table Body */}
          <div className="scroll-fade-y flex h-full min-h-0 flex-1 flex-col overflow-scroll">
            {filteredPractices.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8">
                <p className="text-stats-title text-center">
                  Nessuna pratica trovata
                </p>
              </div>
            ) : (
              filteredPractices.map((practice) => {
                const statusVisual = practiceStatusStyles[practice.status];

                const handleRowClick = (e: React.MouseEvent) => {
                  // Don't navigate if clicking on checkbox or its label
                  const target = e.target as HTMLElement;
                const isCheckboxClick = Boolean(
                  target.closest('[role="checkbox"]') ??
                    target.closest('input[type="checkbox"]') ??
                    target.closest("label"),
                );

                  if (!isCheckboxClick) {
                    router.push(`/pratiche/${practice.id}`);
                  }
                };

                return (
                  <div
                    key={practice.id}
                    onClick={handleRowClick}
                    className="border-checkbox-border/70 hover:bg-muted cursor-pointer border-b px-3 py-5 transition-colors last:border-b-0"
                    role="button"
                    tabIndex={0}
                    aria-label={`Visualizza dettagli pratica ${practice.praticaNumber}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/pratiche/${practice.id}`);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "grid items-center gap-4 text-base",
                        isMineView
                          ? "grid-cols-[minmax(120px,max-content)_1fr_1fr_1fr_1fr_1fr]"
                          : "grid-cols-[minmax(120px,max-content)_1fr_1fr_1fr_1fr_1fr_1fr]",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            aria-label={`Seleziona ${practice.praticaNumber}`}
                            labelClassName="items-center"
                            checked={selectedPractices.has(practice.id)}
                            onChange={(e) =>
                              handleSelectPractice(
                                practice.id,
                                e.target.checked,
                              )
                            }
                          />
                        </div>
                        <span className="font-semibold">
                          {practice.praticaNumber}
                        </span>
                      </div>
                      <div>{practice.date}</div>
                      {!isMineView && (
                        <div className="flex items-center gap-2 truncate">
                          <Avatar aria-hidden className="bg-background">
                            <AvatarFallback
                              placeholderSeed={practice.internalOperator}
                            />
                          </Avatar>
                          <span className="truncate">
                            {practice.internalOperator}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 truncate">
                        <Avatar aria-hidden className="bg-background">
                          <AvatarFallback placeholderSeed={practice.client} />
                        </Avatar>
                        <span className="truncate">{practice.client}</span>
                      </div>
                      <div className="truncate">{practice.type}</div>
                      <div className="truncate">
                        {practice.note ? (
                          <NoteWithTooltip note={practice.note} />
                        ) : (
                          <span className="text-stats-title block w-full truncate text-left">
                            Nessuna nota
                          </span>
                        )}
                      </div>
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

      {/* Create Practice Dialog */}
      <CreatePracticeDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        currentUserId={currentUserId}
      />
    </main>
  );
}
