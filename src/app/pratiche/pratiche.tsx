"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckIcon,
  PraticheIcon,
  SearchIcon,
  UserCircleIcon,
} from "@/components/icons";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  DateRangeFilter,
  type DateRange,
} from "@/components/ui/date-range-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FaChevronDown, FaChevronUp, FaPlus } from "react-icons/fa";
import { motion, useReducedMotion } from "motion/react";
// Animated stat counts: morph transitions between digits without motion-plus’s masked span layout.
import { TextMorph } from "torph/react";
import { type PracticeRow } from "@/lib/practices-utils";
import { OperatorInitialsAvatar } from "@/components/operator-initials-avatar";
import { getOperatorAvatarColors } from "@/lib/operators-utils";
import { CreatePracticeDialog } from "@/components/create-practice-dialog";
import { ClientsAvatarStack } from "@/components/clients-avatar-stack";

type PracticeView = "all" | "mine";

interface PraticheProps {
  practices: PracticeRow[];
  userRoleId?: number;
  currentUserId?: number;
  view?: PracticeView;
}

const normalizeValue = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, "-");

/** Five columns: pratica #, date, client, type, status. */
const PRATICHE_TABLE_GRID_CLASS =
  "grid-cols-[minmax(100px,max-content)_minmax(130px,170px)_minmax(160px,1fr)_minmax(120px,0.8fr)_minmax(220px,max-content)]";

/** Six columns: adds "Data Conclusione" after "Data" when filter = concluse. */
const PRATICHE_TABLE_GRID_CLASS_CONCLUDED =
  "grid-cols-[minmax(100px,max-content)_minmax(130px,170px)_minmax(130px,160px)_minmax(160px,1fr)_minmax(120px,0.8fr)_minmax(220px,max-content)]";

/**
 * Su viewport stretti la griglia supera la larghezza; come in operatori, un min-width
 * mantiene le colonne leggibili e lascia a overflow-x (wrapper esterno) lo scroll orizzontale.
 */
const PRATICHE_TABLE_MIN_WIDTH_CLASS = "min-w-208 lg:min-w-0";

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
  completed: {
    label: "Conclusa",
    accent: "var(--status-completed-accent)",
    background: "var(--status-completed-background)",
    icon: <CheckIcon />,
    iconColor: "var(--status-completed-icon)",
  },
};

export default function Pratiche({
  practices,
  userRoleId,
  currentUserId,
  view = "all",
}: PraticheProps) {
  const router = useRouter();
  const isOperator = userRoleId === 3;
  const isMineView = isOperator && view === "mine";
  const shouldGroupByOperator = view === "all";
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  // Tutte le pratiche: default to "assegnate"; Le mie pratiche: default to full list.
  const [statusFilter, setStatusFilter] = useState<
    PracticeRow["status"] | "all"
  >(() => (view === "all" ? "assigned" : "all"));
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateRange | null>(null);
  const pageTitle = view === "mine" ? "Le mie pratiche" : "Tutte le pratiche";

  const showConcludedDate = statusFilter === "completed";
  const tableGridClass = showConcludedDate
    ? PRATICHE_TABLE_GRID_CLASS_CONCLUDED
    : PRATICHE_TABLE_GRID_CLASS;

  /** Respect OS “reduce motion”; collapse/expand stays instant when enabled. */
  const prefersReducedMotion = useReducedMotion();

  // Track collapsed operator sections (empty set means all expanded by default).
  const [collapsedOperatorGroups, setCollapsedOperatorGroups] = useState<
    Set<string>
  >(new Set());

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
      // Status filter only — switching between /pratiche and /mie-pratiche is via sidebar nav, not this select.
      onClick: () => setStatusFilter("all"),
    },
    {
      label: "Pratiche assegnate",
      value: "assigned",
      active: statusFilter === "assigned",
      onClick: () => setStatusFilter("assigned"),
    },
    {
      label: "Pratiche concluse",
      value: "completed",
      active: statusFilter === "completed",
      onClick: () => setStatusFilter("completed"),
    },
  ];
  const statusFilterOptions = statusFilters.map((filter) => ({
    label: filter.label,
    value: filter.value,
  }));

  // Get unique client names across all practices for the filter dropdown
  const uniqueClients = useMemo(() => {
    const names = new Set(
      practices.flatMap((p) => p.clients?.map((c) => c.name) ?? []),
    );
    return Array.from(names)
      .sort()
      .map((name) => ({
        label: name,
        value: name.toLowerCase().replace(/\s+/g, "-"),
        active: false,
      }));
  }, [practices]);

  const [clientFilterValue, setClientFilterValue] = useState("Cliente");

  // Derived filtered practices for UI (status + selects + search + date)
  const filteredPractices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const clientFilter = clientFilterValue;

    return practices.filter((practice) => {
      const matchesStatus =
        statusFilter === "all" ? true : practice.status === statusFilter;

      const matchesClient =
        !clientFilter || clientFilter === "Cliente"
          ? true
          : (practice.clients ?? []).some(
              (c) => normalizeValue(c.name) === clientFilter,
            );

      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          practice.praticaNumber,
          practice.internalOperator,
          practice.client,
          practice.type,
          practice.status,
          practice.note ?? "",
          practice.clientPhone,
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
        matchesClient &&
        matchesSearch &&
        matchesDate
      );
    });
  }, [clientFilterValue, dateFilter, practices, searchTerm, statusFilter]);

  const groupedPractices = useMemo(() => {
    if (!shouldGroupByOperator) {
      return [];
    }

    const grouped = new Map<string, PracticeRow[]>();
    for (const practice of filteredPractices) {
      const key = practice.internalOperator?.trim() || "Non assegnato";
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)?.push(practice);
    }

    return Array.from(grouped.entries())
      .map(([operatorName, rows]) => ({
        operatorName,
        rows,
      }))
      .sort((a, b) => {
        if (a.operatorName === "Non assegnato") return 1;
        if (b.operatorName === "Non assegnato") return -1;
        return a.operatorName.localeCompare(b.operatorName, "it", {
          sensitivity: "base",
        });
      });
  }, [filteredPractices, shouldGroupByOperator]);

  // Keep collapse state in sync with the currently visible operator groups.
  useEffect(() => {
    if (!shouldGroupByOperator) return;
    setCollapsedOperatorGroups((prev) => {
      const validGroups = new Set(groupedPractices.map((g) => g.operatorName));
      const next = new Set<string>();
      for (const name of prev) {
        if (validGroups.has(name)) {
          next.add(name);
        }
      }
      return next.size === prev.size ? prev : next;
    });
  }, [groupedPractices, shouldGroupByOperator]);

  // Calculate statistics from filtered practices to mirror visible rows
  const totalPractices = filteredPractices.length;
  const completedCount = filteredPractices.filter(
    (p) => p.status === "completed",
  ).length;
  const assignedCount = filteredPractices.filter((p) => p.status === "assigned")
    .length;

  const toggleOperatorGroup = (operatorName: string) => {
    setCollapsedOperatorGroups((prev) => {
      const next = new Set(prev);
      if (next.has(operatorName)) {
        next.delete(operatorName);
      } else {
        next.add(operatorName);
      }
      return next;
    });
  };

  const renderPracticeRow = (practice: PracticeRow) => {
    const statusVisual = practiceStatusStyles[practice.status];

    const handleRowClick = () => {
      router.push(`/pratiche/${practice.id}`);
    };

    return (
      <div
        key={practice.id}
        onClick={handleRowClick}
        // muted ≈ card in light theme; use a visible overlay on hover instead
        className="hover:bg-foreground/5 dark:hover:bg-white/10 cursor-pointer px-3 py-5 transition-colors"
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
            tableGridClass,
          )}
        >
          <div className="flex items-center gap-2.5">
            <span className="font-semibold">{practice.praticaNumber}</span>
          </div>
          <div className="truncate font-semibold tabular-nums">{practice.date}</div>
          {showConcludedDate && (
            <div className="truncate font-semibold tabular-nums">
              {practice.concludedAt ?? "—"}
            </div>
          )}
          <div className="min-w-0 truncate font-semibold">
            <ClientsAvatarStack clients={practice.clients} />
          </div>
          <div className="truncate font-semibold">{practice.type}</div>
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
  };

  const renderTableHeader = () => (
    <div className="bg-table-header shrink-0 rounded-none px-3 py-2.25">
      <div
        className={cn(
          "text-table-header-foreground grid items-center gap-4 text-sm font-medium",
          tableGridClass,
        )}
      >
        <div className="flex items-center gap-2.5">
          <span>Pratica N.</span>
        </div>
        <div>Data</div>
        {showConcludedDate && <div>Data Conclusione</div>}
        <div>Cliente</div>
        <div>Tipologia</div>
        <div>Stato</div>
      </div>
    </div>
  );

  return (
    <main className="bg-card m-2.5 flex min-w-0 flex-1 flex-col gap-2.5 overflow-hidden rounded-3xl px-9 pt-6 font-medium">
      {/* Header - Info Container — `md:relative` serve alla search bar fissa a destra (come clienti) */}
      <div className="relative flex w-full min-w-0 flex-col gap-4.5">
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
        {/*
          Filtri + ricerca: su mobile — riga1 stato, riga2 Cliente+Data, riga3 ricerca a tutta larghezza.
          Da `md:`, stesso modello di clienti/utenti: riga con filtri a sinistra, ricerca `absolute right-0 w-60`
          (niente `flex-1` che allarga i select su tutta la pagina).
        */}
        {/*
          `md:pr-64` riserva lo spazio a destra (search assoluta ~15rem) così i filtri non sfiniscono sotto la ricerca.
        */}
        <div className="flex w-full min-w-0 flex-col gap-3 max-md:min-w-0 md:flex-row md:items-center md:gap-2 md:pr-64">
          <div className="flex w-full min-w-0 flex-col gap-2 max-md:min-w-0 md:min-h-0 md:min-w-0 md:w-fit md:flex-row md:items-center md:justify-start md:gap-1.25">
            {/* Riga 1 (mobile) / prima colonna (desktop): stato pratiche */}
            <div className="w-fit min-h-11 shrink-0 self-start md:min-h-0">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  const selectedFilter = statusFilters.find(
                    (f) => f.value === value,
                  );
                  if (selectedFilter) {
                    selectedFilter.onClick();
                  }
                }}
              >
                <SelectTrigger className="bg-background w-fit min-h-11 cursor-pointer rounded-full border-none px-3.75 py-1.75 text-sm shadow-none will-change-transform md:min-h-0">
                  <SelectValue placeholder="Stato pratiche" />
                </SelectTrigger>
                <SelectContent className="w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width)">
                  {statusFilterOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/*
              Mobile: griglia 2 col a tutta larghezza. Desktop: riga con larghezze al contenuto (`w-fit`) come prima.
            */}
            <div
              className="grid w-full min-w-0 [grid-template-columns:minmax(0,1fr)_minmax(0,1fr)] gap-1.25
                         max-md:min-w-0 md:flex md:min-w-0 md:w-fit"
            >
              <div className="min-w-0 md:min-w-0 md:w-fit">
                <SearchableSelect
                  placeholder="Cliente"
                  value={clientFilterValue}
                  onValueChange={setClientFilterValue}
                  options={uniqueClients}
                  searchPlaceholder="Cerca cliente..."
                  showAllOption={true}
                  allOptionLabel="Tutti i clienti"
                  triggerClassName="w-full min-w-0 min-h-11 max-md:min-w-0 md:min-h-0 md:w-fit"
                />
              </div>
              <div className="min-w-0 md:min-w-0 md:w-fit">
                <DateRangeFilter
                  value={dateFilter}
                  onValueChange={setDateFilter}
                  placeholder="Data"
                  triggerClassName="w-full min-w-0 min-h-11 max-md:min-w-0 md:min-h-0 md:w-fit"
                />
              </div>
            </div>
          </div>
          {/* Mobile: sotto, full width. Desktop: assoluta a destra, non occupa flesso in riga. */}
          <div className="w-full min-w-0 max-md:shrink-0 md:absolute md:right-0 md:flex md:w-auto md:items-center md:justify-center">
            <label
              htmlFor="pratiche-search"
              className="bg-background flex w-full min-h-11 min-w-0 max-w-full touch-manipulation items-center justify-between rounded-full px-3.75 py-1.75 text-base leading-normal shadow-sm transition-[width,box-shadow] duration-300 ease-out sm:text-sm md:h-auto md:w-60 md:min-h-0 md:text-sm md:shadow-[-18px_0px_14px_var(--color-card)] md:transition-[width,box-shadow] md:focus-within:w-84"
            >
              <input
                id="pratiche-search"
                name="q"
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                placeholder="Numero pratica, stato, cliente…"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="placeholder:text-search-placeholder w-full min-w-0 min-h-11 py-0 text-base leading-normal focus:outline-none sm:min-h-0 sm:text-sm md:min-h-0 md:truncate"
              />
              <SearchIcon className="text-search-placeholder shrink-0" />
            </label>
          </div>
        </div>
      </div>
      {/* Body Wrapper */}
      <div className="bg-background flex min-h-0 min-w-0 flex-1 flex-col gap-6.25 rounded-t-3xl px-5.5 pt-6.25">
        {/* Body Header - Stats: su mobile riga a scroll; da `md` stessa griglia 2/3 col di prima (niente w-max a tutta riga) */}
        <div
          className={cn(
            "shrink-0",
            "max-md:scroll-fade-x max-md:min-w-0 max-md:overflow-y-hidden max-md:overflow-x-auto",
            "max-md:overscroll-x-contain",
          )}
          aria-label="Riepilogo numeri pratiche"
        >
          <div
            className={cn(
              "min-w-0",
              "flex w-max min-w-0 flex-nowrap gap-3 max-md:pb-0.5",
              "md:grid md:w-full md:grid-cols-2 md:gap-3 md:overflow-visible md:pb-0",
              "xl:grid-cols-3",
            )}
            role="presentation"
          >
            <div className="bg-card min-w-[12rem] max-w-[16rem] shrink-0 rounded-xl p-4 md:min-w-0 md:max-w-none">
              <div className="text-stats-title text-sm">Totale pratiche</div>
              <div className="mt-3 flex items-center gap-2.5 text-2xl">
                <PraticheIcon />
                <TextMorph>{totalPractices}</TextMorph>
              </div>
            </div>
            <div className="bg-card min-w-[12rem] max-w-[16rem] shrink-0 rounded-xl p-4 md:min-w-0 md:max-w-none">
              <div className="text-stats-title text-sm">Assegnate</div>
              <div className="mt-3 flex items-center gap-2.5 text-2xl">
                <UserCircleIcon
                  size={24}
                  style={{ color: practiceStatusStyles.assigned.iconColor }}
                  suppressHydrationWarning
                />
                <TextMorph>{assignedCount}</TextMorph>
              </div>
            </div>
            <div className="bg-card min-w-[12rem] max-w-[16rem] shrink-0 rounded-xl p-4 md:min-w-0 md:max-w-none">
              <div className="text-stats-title text-sm">Concluse</div>
              <div className="mt-3 flex items-center gap-2.5 text-2xl">
                <CheckIcon
                  size={24}
                  style={{ color: practiceStatusStyles.completed.iconColor }}
                  suppressHydrationWarning
                />
                <TextMorph>{completedCount}</TextMorph>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl">
          {/* Table: scroll condiviso su X+Y (come operatori); min-width sul contenuto = swipe orizzontale su mobile */}
          <div
            className={cn(
              "scroll-fade-y min-h-0 w-full min-w-0 flex-1 overflow-x-auto overflow-y-auto",
              "overscroll-y-contain overscroll-x-contain [-webkit-overflow-scrolling:touch]",
            )}
          >
            {filteredPractices.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8">
                <p className="text-stats-title text-center">
                  Nessuna pratica trovata
                </p>
              </div>
            ) : shouldGroupByOperator ? (
              <div className="flex flex-col gap-3">
                {groupedPractices.map((group) => {
                const isCollapsed = collapsedOperatorGroups.has(group.operatorName);

                return (
                  <div
                    key={group.operatorName}
                    className="bg-card w-full min-w-0 shadow-none ring-0 rounded-xl overflow-hidden border-l-4"
                    style={{
                      borderLeftColor: getOperatorAvatarColors(group.operatorName, { withInitialsForeground: true }).backgroundColor,
                    }}
                  >
                    <button
                      type="button"
                      data-no-press-scale
                      onClick={() => toggleOperatorGroup(group.operatorName)}
                      // Match table row: transparent base, visible hover overlay only
                      className="hover:bg-foreground/5 dark:hover:bg-white/10 flex w-full items-center justify-between gap-3 bg-transparent! px-3 py-3 text-left transition-colors"
                      style={{ backgroundColor: "transparent" }}
                      aria-expanded={!isCollapsed}
                      aria-label={`Gruppo operatore ${group.operatorName}, ${group.rows.length} pratiche`}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        <OperatorInitialsAvatar name={group.operatorName} />
                        <span className="min-w-0 truncate font-semibold">
                          {group.operatorName}
                        </span>
                        <span className="text-stats-title shrink-0 text-sm">
                          ({group.rows.length})
                        </span>
                      </div>
                      <span className="text-stats-title flex shrink-0 items-center gap-1.5 text-sm">
                        {isCollapsed ? "Espandi" : "Comprimi"}
                        {isCollapsed ? (
                          <FaChevronDown aria-hidden className="size-3.5" />
                        ) : (
                          <FaChevronUp aria-hidden className="size-3.5" />
                        )}
                      </span>
                    </button>
                    {/* Height + opacity animate open/close (content stays mounted for smooth exit). */}
                    <motion.div
                      initial={false}
                      animate={{
                        height: isCollapsed ? 0 : "auto",
                        opacity: isCollapsed ? 0 : 1,
                      }}
                      transition={{
                        duration: prefersReducedMotion ? 0 : 0.2,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      // L’overflow è sul wrapper interno: così l’altezza animata resta clip, ma le righe larghe scrollano in orizzontale
                      style={{ overflow: "hidden" }}
                      aria-hidden={isCollapsed}
                      inert={isCollapsed ? true : undefined}
                    >
                      <div
                        // Scrollport orizzontale: larghezza = card; la griglia più larga scrolla dentro
                        className="w-full min-w-0 overflow-x-auto"
                      >
                        <div className={PRATICHE_TABLE_MIN_WIDTH_CLASS}>
                          {renderTableHeader()}
                          <div className="divide-checkbox-border/70 divide-y">
                            {group.rows.map((practice) => renderPracticeRow(practice))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
                })}
              </div>
            ) : (
              <div className={PRATICHE_TABLE_MIN_WIDTH_CLASS}>
                {renderTableHeader()}
                <div className="divide-checkbox-border/70 divide-y">
                  {filteredPractices.map((practice) => renderPracticeRow(practice))}
                </div>
              </div>
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
