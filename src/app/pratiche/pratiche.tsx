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
import type { PracticeRow } from "@/lib/practices-utils";

interface PraticheProps {
  practices: PracticeRow[];
}

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
  cancelled: {
    label: "Annullata",
    accent: "var(--status-cancelled-accent)",
    background: "var(--status-cancelled-background)",
    icon: <XIcon />,
    iconColor: "var(--status-cancelled-icon)",
  },
};

export default function Pratiche({ practices }: PraticheProps) {
  const router = useRouter();

  // State for selected practices
  const [selectedPractices, setSelectedPractices] = useState<Set<string>>(
    new Set(),
  );

  // Calculate statistics from practices
  const totalPractices = practices.length;
  const completedCount = practices.filter(
    (p) => p.status === "completed",
  ).length;
  const inProgressCount = practices.filter(
    (p) => p.status === "in_progress",
  ).length;
  const assignedCount = practices.filter((p) => p.status === "assigned").length;
  const cancelledCount = practices.filter(
    (p) => p.status === "cancelled",
  ).length;

  // Calculate select all checkbox state
  const allSelected = useMemo(
    () => totalPractices > 0 && selectedPractices.size === totalPractices,
    [totalPractices, selectedPractices.size],
  );

  const someSelected = useMemo(
    () => selectedPractices.size > 0 && selectedPractices.size < totalPractices,
    [totalPractices, selectedPractices.size],
  );

  // Handlers for checkbox selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPractices(new Set(practices.map((p) => p.id)));
    } else {
      setSelectedPractices(new Set());
    }
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
  const activePractices = totalPractices - cancelledCount;
  const previousMonthCompletion =
    activePractices > 0
      ? Math.round(((completedCount - 1) / activePractices) * 100)
      : 0;
  const monthOverMonthChange = completionPercentage - previousMonthCompletion;

  const statusFilters = [
    {
      label: "Tutte le pratiche",
      value: "all",
      active: true,
    },
    {
      label: "Pratiche assegnate",
      value: "assigned",
      active: false,
    },
    {
      label: "Pratiche in lavorazione",
      value: "in_progress",
      active: false,
    },
    {
      label: "Pratiche concluse",
      value: "completed",
      active: false,
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
      {
        triggerLabel: "Pratica N.",
        values: practices.slice(0, 10).map((p, idx) => ({
          label: `Pratica N. ${idx + 1}`,
          value: p.id,
        })),
      },
    ],
    [uniqueOperators, uniqueClients, practices],
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

  return (
    <main className="bg-card m-2.5 flex flex-1 flex-col gap-2.5 overflow-hidden rounded-3xl px-9 pt-6 font-medium">
      {/* Header - Info Container */}
      <div className="relative flex w-full flex-col gap-4.5">
        {/* Header - Title and Export Button */}
        <div className="flex items-center justify-between gap-2.5">
          <h1 className="flex items-center justify-center gap-3.5">
            <PraticheIcon />
            <span>Pratiche</span>
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
                    <SelectTrigger className="w-auto">
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
                placeholder="Numero pratica, stato, cliente..."
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
                  <AnimateNumber>{cancelledCount}</AnimateNumber>
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
            <div className="text-table-header-foreground grid grid-cols-[minmax(120px,max-content)_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 text-sm font-medium">
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
              <div>Operatore Interno</div>
              <div>Cliente</div>
              <div>Tipologia</div>
              <div>Note</div>
              <div>Stato</div>
            </div>
          </div>
          {/* Table Body */}
          <div className="scroll-fade-y flex h-full min-h-0 flex-1 flex-col overflow-scroll">
            {practices.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8">
                <p className="text-stats-title text-center">
                  Nessuna pratica trovata
                </p>
              </div>
            ) : (
              practices.map((practice) => {
                const statusVisual = practiceStatusStyles[practice.status];

                const handleRowClick = (e: React.MouseEvent) => {
                  // Don't navigate if clicking on checkbox or its label
                  const target = e.target as HTMLElement;
                  const isCheckboxClick =
                    target.closest('[role="checkbox"]') ||
                    target.closest('input[type="checkbox"]') ||
                    target.closest("label");

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
                    <div className="grid grid-cols-[minmax(120px,max-content)_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 text-base">
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
    </main>
  );
}
