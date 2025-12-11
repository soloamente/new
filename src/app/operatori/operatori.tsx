"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRightIcon,
  CheckIcon,
  OperatoriIcon,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FaChevronDown, FaPlus } from "react-icons/fa";
import { AnimateNumber } from "motion-plus/react";
import type { OperatorRow, OperatorStatus } from "@/lib/operators-utils";
import { createUser } from "@/app/actions/users-actions";

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
    accent: "var(--status-suspended-accent)",
    background: "var(--status-suspended-background)",
    icon: <XIcon />,
    iconColor: "var(--status-suspended-icon)",
  },
  on_leave: {
    label: "In ferie",
    accent: "var(--status-assigned-accent)",
    background: "var(--status-assigned-background)",
    icon: <UserCircleIcon />,
    iconColor: "var(--status-assigned-icon)",
  },
};

interface OperatoriProps {
  operators: OperatorRow[];
}

export default function Operatori({ operators }: OperatoriProps) {
  const router = useRouter();
  // State for selected operators
  const [selectedOperators, setSelectedOperators] = useState<Set<string>>(
    new Set(),
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Calculate statistics from actual operators
  const totalOperators = operators.length;
  const activeCount = operators.filter((o) => o.status === "active").length;
  const inactiveCount = operators.filter((o) => o.status === "inactive").length;
  const onLeaveCount = operators.filter((o) => o.status === "on_leave").length;
  const totalPractices = operators.reduce(
    (sum, operator) => sum + operator.practicesCount,
    0,
  );
  const totalCompletedPractices = operators.reduce(
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
      setSelectedOperators(new Set(operators.map((o) => o.id)));
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

  const activePercentage =
    totalOperators > 0 ? Math.round((activeCount / totalOperators) * 100) : 0;
  const previousActivePercentage = Math.round(
    totalOperators > 0 ? ((activeCount - 1) / totalOperators) * 100 : 0,
  );
  const activeTrend = activePercentage - previousActivePercentage;

  const completionRate =
    totalPractices > 0
      ? Math.round((totalCompletedPractices / totalPractices) * 100)
      : 0;

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

  // Generate assignee filters dynamically from operators
  const assigneeFilters = useMemo(
    () => [
      {
        triggerLabel: "Operatore N.",
        values: operators.map((op) => ({
          label: op.operatorNumber,
          value: op.id,
          active: false,
        })),
      },
    ],
    [operators],
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
            <button
              type="button"
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
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            setCreateForm({ name: "", email: "", password: "" });
            setCreateError(null);
          }
          setIsCreateDialogOpen(open);
        }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-[480px]">
          <DialogHeader className="space-y-0">
            <DialogTitle className="text-2xl text-center">Crea operatore</DialogTitle>
            <DialogDescription className="text-center">
              Compila i campi obbligatori per creare un nuovo operatore dello
              studio (ruolo impostato automaticamente).
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setCreateError(null);
              const name = createForm.name.trim();
              const email = createForm.email.trim();
              const password = createForm.password.trim();
              if (!name || !email || !password) {
                setCreateError("Nome, email e password sono obbligatori.");
                return;
              }
              setIsSubmitting(true);
              try {
                const created = await createUser({
                  name,
                  email,
                  password,
                  role_id: 3,
                  status: "active",
                });
                if (!created) {
                  setCreateError("Errore nella creazione dell'operatore.");
                  return;
                }
                setCreateForm({ name: "", email: "", password: "" });
                setIsCreateDialogOpen(false);
                router.refresh();
              } catch (error) {
                setCreateError(
                  error instanceof Error
                    ? error.message
                    : "Errore nella creazione dell'operatore.",
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="operator-name"
                  className="text-sm font-medium leading-none"
                >
                  Nome completo <span className="text-destructive">*</span>
                </label>
                <Input
                  id="operator-name"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  disabled={isSubmitting}
                  placeholder="Mario Rossi"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="operator-email"
                  className="text-sm font-medium leading-none"
                >
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  id="operator-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                  disabled={isSubmitting}
                  placeholder="mario@studio.it"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="operator-password"
                  className="text-sm font-medium leading-none"
                >
                  Password <span className="text-destructive">*</span>
                </label>
                <Input
                  id="operator-password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  className="w-full"
                />
              </div>
            </div>
            {createError ? (
              <p className="text-destructive text-sm">{createError}</p>
            ) : null}
            <DialogFooter className="flex w-full items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !createForm.name.trim() ||
                  !createForm.email.trim() ||
                  !createForm.password.trim()
                }
                className="cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Creazione...
                  </>
                ) : (
                  "Crea operatore"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
            {operators.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <p>Nessun operatore trovato</p>
              </div>
            ) : (
              operators.map((operator) => {
                const statusVisual = operatorStatusStyles[operator.status];
                const completionPercentage =
                  operator.practicesCount > 0
                    ? Math.round(
                        (operator.completedPractices /
                          operator.practicesCount) *
                          100,
                      )
                    : 0;

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
                              <Avatar aria-hidden className="bg-background">
                                <AvatarFallback
                                  placeholderSeed={operator.name}
                                />
                              </Avatar>
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
                                <Avatar className="bg-background size-16 rounded-lg">
                                  <AvatarFallback
                                    placeholderSeed={operator.name}
                                  />
                                </Avatar>
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
                                    {operator.practicesCount} ({completionPercentage}
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
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

