"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowUpRightIcon,
  CheckIcon,
  OperatoriIcon,
  SearchIcon,
  UserCircleIcon,
  XIcon,
  HalfStatusIcon,
} from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

type OperatorStatus = "active" | "inactive" | "on_leave";

interface OperatorRow {
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

const internalOperators = {
  aliceRizzi: {
    name: "Alice Rizzi",
    avatar: "alice-rizzi",
    email: "alice.rizzi@example.com",
    phone: "+39 123 456 7890",
    imageUrl: "/icons/placeholders/alice-rizzi.jpg",
  },
  marcoRosali: {
    name: "Marco Rosali",
    avatar: "marco-rosali",
    email: "marco.rosali@example.com",
    phone: "+39 123 456 7891",
    imageUrl: "/icons/placeholders/maco-rosali.png",
  },
  giuliaVerdi: {
    name: "Giulia Verdi",
    avatar: "giulia-verdi",
    email: "giulia.verdi@example.com",
    phone: "+39 123 456 7892",
    imageUrl: "/icons/placeholders/giulia-verdi.png",
  },
  lucaFerrari: {
    name: "Luca Ferrari",
    avatar: "luca-ferrari",
    email: "luca.ferrari@example.com",
    phone: "+39 123 456 7893",
    imageUrl: "/icons/placeholders/luca-ferrari.jpg",
  },
  sofiaBianchi: {
    name: "Sofia Bianchi",
    avatar: "sofia-bianchi",
    email: "sofia.bianchi@example.com",
    phone: "+39 123 456 7894",
    imageUrl: "/icons/placeholders/sofia-bianchi.jpg",
  },
  andreaRossi: {
    name: "Andrea Rossi",
    avatar: "andrea-rossi",
    email: "andrea.rossi@example.com",
    phone: "+39 123 456 7895",
    imageUrl: "/icons/placeholders/andrea-rossi.jpg",
  },
  elenaMartini: {
    name: "Elena Martini",
    avatar: "elena-martini",
    email: "elena.martini@example.com",
    phone: "+39 123 456 7896",
    imageUrl: "/icons/placeholders/elena-martini.jpg",
  },
  davideRomano: {
    name: "Davide Romano",
    avatar: "davide-romano",
    email: "davide.romano@example.com",
    phone: "+39 123 456 7897",
    imageUrl: "/icons/placeholders/davide-romano.jpg",
  },
};

const mockOperators: OperatorRow[] = [
  {
    id: "OP-001",
    operatorNumber: "OP-001",
    name: internalOperators.aliceRizzi.name,
    email: internalOperators.aliceRizzi.email,
    phone: internalOperators.aliceRizzi.phone,
    practicesCount: 8,
    completedPractices: 5,
    lastActivity: "12 Nov 2025, 09:32",
    status: "active",
    imageUrl: internalOperators.aliceRizzi.imageUrl,
  },
  {
    id: "OP-002",
    operatorNumber: "OP-002",
    name: internalOperators.marcoRosali.name,
    email: internalOperators.marcoRosali.email,
    phone: internalOperators.marcoRosali.phone,
    practicesCount: 6,
    completedPractices: 4,
    lastActivity: "10 Nov 2025, 15:10",
    status: "active",
    imageUrl: internalOperators.marcoRosali.imageUrl,
  },
  {
    id: "OP-003",
    operatorNumber: "OP-003",
    name: internalOperators.giuliaVerdi.name,
    email: internalOperators.giuliaVerdi.email,
    phone: internalOperators.giuliaVerdi.phone,
    practicesCount: 7,
    completedPractices: 3,
    lastActivity: "07 Nov 2025, 11:47",
    status: "active",
    imageUrl: internalOperators.giuliaVerdi.imageUrl,
  },
  {
    id: "OP-004",
    operatorNumber: "OP-004",
    name: internalOperators.lucaFerrari.name,
    email: internalOperators.lucaFerrari.email,
    phone: internalOperators.lucaFerrari.phone,
    practicesCount: 5,
    completedPractices: 4,
    lastActivity: "05 Nov 2025, 17:25",
    status: "active",
    imageUrl: internalOperators.lucaFerrari.imageUrl,
  },
  {
    id: "OP-005",
    operatorNumber: "OP-005",
    name: internalOperators.sofiaBianchi.name,
    email: internalOperators.sofiaBianchi.email,
    phone: internalOperators.sofiaBianchi.phone,
    practicesCount: 4,
    completedPractices: 2,
    lastActivity: "28 Ott 2025, 08:05",
    status: "on_leave",
    imageUrl: internalOperators.sofiaBianchi.imageUrl,
  },
  {
    id: "OP-006",
    operatorNumber: "OP-006",
    name: internalOperators.andreaRossi.name,
    email: internalOperators.andreaRossi.email,
    phone: internalOperators.andreaRossi.phone,
    practicesCount: 6,
    completedPractices: 3,
    lastActivity: "25 Ott 2025, 14:20",
    status: "active",
    imageUrl: internalOperators.andreaRossi.imageUrl,
  },
  {
    id: "OP-007",
    operatorNumber: "OP-007",
    name: internalOperators.elenaMartini.name,
    email: internalOperators.elenaMartini.email,
    phone: internalOperators.elenaMartini.phone,
    practicesCount: 5,
    completedPractices: 4,
    lastActivity: "22 Ott 2025, 10:15",
    status: "active",
    imageUrl: internalOperators.elenaMartini.imageUrl,
  },
  {
    id: "OP-008",
    operatorNumber: "OP-008",
    name: internalOperators.davideRomano.name,
    email: internalOperators.davideRomano.email,
    phone: internalOperators.davideRomano.phone,
    practicesCount: 4,
    completedPractices: 2,
    lastActivity: "20 Ott 2025, 16:45",
    status: "inactive",
    imageUrl: internalOperators.davideRomano.imageUrl,
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

const operatorStatusStyles: Record<
  OperatorStatus,
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
  on_leave: {
    label: "In ferie",
    accent: "var(--status-assigned-accent)",
    background: "var(--status-assigned-background)",
    icon: <UserCircleIcon />,
    iconColor: "var(--status-assigned-icon)",
  },
};

export default function OperatoriPage() {
  // State for selected operators
  const [selectedOperators, setSelectedOperators] = useState<Set<string>>(
    new Set(),
  );

  // Calculate statistics from mockOperators
  const totalOperators = mockOperators.length;
  const activeCount = mockOperators.filter((o) => o.status === "active").length;
  const inactiveCount = mockOperators.filter(
    (o) => o.status === "inactive",
  ).length;
  const onLeaveCount = mockOperators.filter(
    (o) => o.status === "on_leave",
  ).length;
  const totalPractices = mockOperators.reduce(
    (sum, operator) => sum + operator.practicesCount,
    0,
  );
  const totalCompletedPractices = mockOperators.reduce(
    (sum, operator) => sum + operator.completedPractices,
    0,
  );

  // Calculate select all checkbox state
  const allSelected = useMemo(
    () => totalOperators > 0 && selectedOperators.size === totalOperators,
    [totalOperators, selectedOperators.size],
  );

  const someSelected = useMemo(
    () => selectedOperators.size > 0 && selectedOperators.size < totalOperators,
    [totalOperators, selectedOperators.size],
  );

  // Handlers for checkbox selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOperators(new Set(mockOperators.map((o) => o.id)));
    } else {
      setSelectedOperators(new Set());
    }
  };

  const handleSelectOperator = (operatorId: string, checked: boolean) => {
    const newSelected = new Set(selectedOperators);
    if (checked) {
      newSelected.add(operatorId);
    } else {
      newSelected.delete(operatorId);
    }
    setSelectedOperators(newSelected);
  };

  const activePercentage = Math.round((activeCount / totalOperators) * 100);
  const previousActivePercentage = Math.round(
    ((activeCount - 1) / totalOperators) * 100,
  );
  const activeTrend = activePercentage - previousActivePercentage;

  const completionRate = Math.round(
    (totalCompletedPractices / totalPractices) * 100,
  );

  const statusFilters = [
    {
      label: "Tutti gli operatori",
      value: "all",
      active: true,
    },
    {
      label: "Operatori attivi",
      value: "active",
      active: false,
    },
    {
      label: "Operatori inattivi",
      value: "inactive",
      active: false,
    },
    {
      label: "In ferie",
      value: "on_leave",
      active: false,
    },
  ];

  const assigneeFilters = useMemo(
    () => [
      {
        triggerLabel: "Operatore N.",
        values: [
          {
            label: "Operatore N. 1",
            value: "operator1",
            active: false,
          },
          {
            label: "Operatore N. 2",
            value: "operator2",
            active: false,
          },
          {
            label: "Operatore N. 3",
            value: "operator3",
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
            <OperatoriIcon />
            <span>Operatori</span>
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
                placeholder="Nome, email, operatore..."
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
          {/* Stats - Totale operatori */}
          <div className="flex flex-col items-start justify-center gap-2.5">
            <h3 className="text-stats-title text-sm font-medium">
              Totale operatori
            </h3>
            <div className="flex items-center justify-start gap-3.75">
              <AnimateNumber className="text-xl">
                {totalOperators}
              </AnimateNumber>
              <div className="bg-stats-secondary h-5 w-0.75 rounded-full" />
              {/* Stats - Totale operatori - Status Counts */}
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
                  <AnimateNumber>{onLeaveCount}</AnimateNumber>
                </div>
              </div>
            </div>
          </div>
          {/* Stats - Operatori attivi */}
          <div className="flex flex-col items-start justify-center gap-2.5">
            <h3 className="text-stats-title text-sm font-medium">
              Operatori attivi
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
          {/* Stats - Tasso di completamento */}
          <div className="flex flex-col items-start justify-center gap-2.5">
            <h3 className="text-stats-title text-sm font-medium">
              Tasso di completamento
            </h3>
            <div className="flex items-center justify-start gap-2.5 text-xl">
              <AnimateNumber suffix="%">{completionRate}</AnimateNumber>
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
                  aria-label="Seleziona tutti gli operatori"
                  labelClassName="items-center"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span>Operatore N.</span>
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
            {mockOperators.map((operator) => {
              const statusVisual = operatorStatusStyles[operator.status];
              const completionPercentage = Math.round(
                (operator.completedPractices / operator.practicesCount) * 100,
              );

              return (
                <div
                  key={operator.id}
                  className="border-checkbox-border/70 hover:bg-muted border-b px-3 py-5 transition-colors last:border-b-0"
                >
                  <div className="grid grid-cols-[minmax(120px,max-content)_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 text-base">
                    <div className="flex items-center gap-2.5">
                      <Checkbox
                        aria-label={`Seleziona ${operator.operatorNumber}`}
                        labelClassName="items-center"
                        checked={selectedOperators.has(operator.id)}
                        onChange={(e) =>
                          handleSelectOperator(operator.id, e.target.checked)
                        }
                      />
                      <span className="font-semibold">
                        {operator.operatorNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Tooltip>
                        <TooltipTrigger className="truncate">
                          <div className="flex cursor-help items-center gap-2 truncate">
                            {operator.imageUrl ? (
                              <Avatar aria-hidden className="bg-background">
                                <AvatarImage
                                  src={operator.imageUrl}
                                  alt={operator.name}
                                />
                                <AvatarFallback
                                  placeholderSeed={operator.name}
                                />
                              </Avatar>
                            ) : (
                              <Avatar aria-hidden className="bg-background">
                                <AvatarFallback
                                  placeholderSeed={operator.name}
                                />
                              </Avatar>
                            )}
                            <span className="truncate font-medium">
                              {operator.name}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          sideOffset={8}
                          className="max-w-xs p-0"
                        >
                          <div className="flex flex-col gap-3 p-4">
                            <div className="flex items-center gap-3">
                              {operator.imageUrl ? (
                                <Avatar className="bg-background size-16 rounded-lg">
                                  <AvatarImage
                                    src={operator.imageUrl}
                                    alt={operator.name}
                                  />
                                  <AvatarFallback
                                    placeholderSeed={operator.name}
                                  />
                                </Avatar>
                              ) : (
                                <Avatar className="bg-background size-16 rounded-lg">
                                  <AvatarFallback
                                    placeholderSeed={operator.name}
                                  />
                                </Avatar>
                              )}
                              <div className="flex flex-col gap-0.5">
                                <h4 className="text-sm font-semibold">
                                  {operator.name}
                                </h4>
                                <p className="text-muted-foreground text-xs">
                                  Operatore Interno
                                </p>
                              </div>
                            </div>
                            <div className="border-border flex flex-col gap-2 border-t pt-3">
                              <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground text-xs">
                                  Email
                                </span>
                                <span className="text-sm">
                                  {operator.email}
                                </span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground text-xs">
                                  Telefono
                                </span>
                                <span className="text-sm">
                                  {operator.phone}
                                </span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground text-xs">
                                  Pratiche completate
                                </span>
                                <span className="text-sm">
                                  {operator.completedPractices} /{" "}
                                  {operator.practicesCount} (
                                  {completionPercentage}
                                  %)
                                </span>
                              </div>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="truncate">
                      <EmailWithTooltip email={operator.email} />
                    </div>
                    <div className="truncate">{operator.phone}</div>
                    <div className="flex items-center gap-2 truncate">
                      <span>{operator.practicesCount}</span>
                      <div className="text-stats-secondary flex items-center gap-1 text-sm">
                        <CheckIcon size={14} />
                        <span>{operator.completedPractices}</span>
                      </div>
                    </div>
                    <div className="truncate">{operator.lastActivity}</div>
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
