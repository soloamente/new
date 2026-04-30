"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type {
  Practice,
  PracticeAudit,
  PracticeAuditChange,
} from "@/app/actions/practices-actions";
import {
  updatePractice,
  type ClientInput,
} from "@/app/actions/practices-actions";
import { searchClients, type Client } from "@/app/actions/clients-actions";
import type { User } from "@/app/actions/auth-actions";
import { ArrowBackIcon, CheckIcon, UserCircleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, mapApiStatusToUI } from "@/lib/practices-utils";
import { OperatorInitialsAvatar } from "@/components/operator-initials-avatar";
import { motion, AnimatePresence } from "motion/react";
import { FaPencilAlt, FaTimes, FaPlus, FaHistory, FaCheck } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DatePicker } from "@/components/ui/date-picker";

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

interface EditClientRow {
  tempId: string;
  id?: number;
  name: string;
  email: string;
  phone: string;
}

function emptyClientRow(): EditClientRow {
  return { tempId: crypto.randomUUID(), name: "", email: "", phone: "" };
}

function toDateInputValue(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function formatDateTime(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// EditableClientRow
// ---------------------------------------------------------------------------

interface EditableClientRowProps {
  row: EditClientRow;
  canRemove: boolean;
  onChange: (updated: EditClientRow) => void;
  onRemove: () => void;
  disabled: boolean;
}

function EditableClientRow({
  row,
  canRemove,
  onChange,
  onRemove,
  disabled,
}: EditableClientRowProps) {
  const [results, setResults] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchDebounced = useCallback((query: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    searchTimeoutRef.current = setTimeout(() => {
      void (async () => {
        setIsSearching(true);
        try {
          const res = await searchClients(query);
          setResults(res);
          setShowDropdown(res.length > 0);
        } catch {
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      })();
    }, 300);
  }, []);

  useEffect(
    () => () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    },
    [],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (client: Client) => {
    onChange({
      ...row,
      id: client.id,
      name: client.name,
      email: client.email ?? "",
      phone: client.phone ?? "",
    });
    setShowDropdown(false);
    setResults([]);
  };

  const handleNameChange = (value: string) => {
    onChange({ ...row, id: undefined, name: value });
    searchDebounced(value);
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-background p-3 ring-1 ring-border/60 transition-shadow focus-within:ring-border">
      <div className="flex items-start gap-2">
        <div className="relative flex-1">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Cerca o inserisci nome..."
              value={row.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              disabled={disabled}
              autoComplete="off"
              className="bg-card pr-8"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Spinner size="sm" />
              </div>
            )}
          </div>

          <AnimatePresence>
            {showDropdown && results.length > 0 && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-popover shadow-lg"
              >
                <ul className="max-h-36 overflow-y-auto p-1">
                  {results.map((client) => (
                    <li key={client.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(client)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted"
                      >
                        <Avatar aria-hidden className="size-6 bg-background">
                          <AvatarFallback placeholderSeed={client.name} />
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium leading-none">
                            {client.name}
                          </span>
                          {client.email && (
                            <span className="text-xs text-muted-foreground">
                              {client.email}
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border px-3 py-1.5 text-xs text-muted-foreground">
                  Seleziona esistente o continua a digitare per crearne uno nuovo
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {row.id && (
            <p className="mt-0.5 text-xs text-green-600 dark:text-green-400">
              ✓ Cliente esistente
            </p>
          )}
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="mt-1 flex size-7 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
            aria-label="Rimuovi cliente"
          >
            <FaTimes className="size-3" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          type="email"
          placeholder="Email (opzionale)"
          value={row.email}
          onChange={(e) => onChange({ ...row, email: e.target.value })}
          disabled={disabled}
          className="bg-card text-sm"
        />
        <Input
          type="tel"
          placeholder="Telefono (opzionale)"
          value={row.phone}
          onChange={(e) => onChange({ ...row, phone: e.target.value })}
          disabled={disabled}
          className="bg-card text-sm"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timeline components
// ---------------------------------------------------------------------------

function ChangeDetail({ change }: { change: PracticeAuditChange }) {
  if (change.field === "clients") {
    return (
      <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
        <span className="font-medium">{change.label}</span>
        {change.added && change.added.length > 0 && (
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="font-semibold text-green-600 dark:text-green-400">+</span>
            <span className="text-muted-foreground">{change.added.join(", ")}</span>
          </div>
        )}
        {change.removed && change.removed.length > 0 && (
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="font-semibold text-destructive">−</span>
            <span className="text-muted-foreground">{change.removed.join(", ")}</span>
          </div>
        )}
      </div>
    );
  }

  const oldVal =
    change.field === "notes" && change.old && change.old.length > 60
      ? `${change.old.slice(0, 60)}…`
      : change.old;
  const newVal =
    change.field === "notes" && change.new && change.new.length > 60
      ? `${change.new.slice(0, 60)}…`
      : change.new;

  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
      <span className="font-medium">{change.label}:</span>{" "}
      {oldVal != null ? (
        <>
          <span className="text-muted-foreground line-through opacity-70">
            {oldVal || "—"}
          </span>
          <span className="mx-1.5 text-muted-foreground">→</span>
          <span>{newVal || "—"}</span>
        </>
      ) : (
        <span>{newVal || "—"}</span>
      )}
    </div>
  );
}

const timelineActionConfig = {
  created: {
    label: "ha creato la pratica",
    dotClass:
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  },
  status_changed: {
    label: "ha cambiato lo stato",
    dotClass:
      "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  updated: {
    label: "ha modificato la pratica",
    dotClass: "bg-muted text-muted-foreground",
  },
} as const;

function TimelineEntry({
  audit,
  isLast,
}: {
  audit: PracticeAudit;
  isLast: boolean;
}) {
  const config = timelineActionConfig[audit.action];

  return (
    <div className="flex gap-4">
      {/* Dot + vertical line */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex size-8 flex-shrink-0 items-center justify-center rounded-full text-sm",
            config.dotClass,
          )}
        >
          {audit.action === "created" && <FaPlus className="size-3" />}
          {audit.action === "status_changed" && <FaCheck className="size-3" />}
          {audit.action === "updated" && <FaPencilAlt className="size-3" />}
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
      </div>

      {/* Content */}
      <div className={cn("flex-1 pb-5", isLast && "pb-1")}>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-semibold">
            {audit.user?.name ?? "Sistema"}
          </span>
          <span className="text-sm text-muted-foreground">{config.label}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {formatDateTime(audit.created_at)}
          </span>
        </div>

        {audit.changes && audit.changes.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {audit.changes.map((change, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <ChangeDetail key={i} change={change} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status styles
// ---------------------------------------------------------------------------

const practiceStatusStyles: Record<
  ReturnType<typeof mapApiStatusToUI>,
  {
    label: string;
    accent: string;
    background: string;
    icon: ReactNode;
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

// ---------------------------------------------------------------------------
// PracticeDetail
// ---------------------------------------------------------------------------

interface PracticeDetailProps {
  practice: Practice;
  audits: PracticeAudit[];
  operators: User[];
}

export default function PracticeDetail({
  practice,
  audits,
  operators,
}: PracticeDetailProps) {
  const router = useRouter();

  // --- Status state (existing logic) ---
  const [isUpdating, setIsUpdating] = useState(false);
  const [optimisticConcluded, setOptimisticConcluded] = useState<boolean | null>(null);
  const effectiveConcluded = optimisticConcluded ?? practice.is_concluded;

  useEffect(() => {
    setOptimisticConcluded(null);
  }, [practice.id, practice.is_concluded]);

  const status = mapApiStatusToUI(effectiveConcluded);
  const statusVisual = practiceStatusStyles[status];

  // --- Edit state ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editType, setEditType] = useState(practice.type);
  const [editNotes, setEditNotes] = useState(practice.notes ?? "");
  const [editAssignedTo, setEditAssignedTo] = useState(practice.assigned_to);
  const [editClients, setEditClients] = useState<EditClientRow[]>([]);
  const [editCreatedAt, setEditCreatedAt] = useState("");

  const enterEditMode = () => {
    setEditType(practice.type);
    setEditNotes(practice.notes ?? "");
    setEditAssignedTo(practice.assigned_to);
    setEditCreatedAt(toDateInputValue(practice.created_at));
    setEditClients(
      practice.clients.map((c) => ({
        tempId: crypto.randomUUID(),
        id: c.id,
        name: c.name,
        email: c.email ?? "",
        phone: c.phone ?? "",
      })),
    );
    setIsEditMode(true);
  };

  const cancelEditMode = () => setIsEditMode(false);

  const handleSave = async () => {
    if (!editType.trim()) {
      toast.error("La tipologia è obbligatoria");
      return;
    }
    if (editClients.length === 0) {
      toast.error("La pratica deve avere almeno un cliente");
      return;
    }
    const invalid = editClients.find((c) => !c.name.trim());
    if (invalid) {
      toast.error("Tutti i clienti devono avere un nome");
      return;
    }

    setIsSaving(true);
    try {
      const clients: ClientInput[] = editClients.map(
        ({ id, name, email, phone }) => {
          const entry: ClientInput = {};
          if (id) entry.id = id;
          if (name.trim()) entry.name = name.trim();
          if (email.trim()) entry.email = email.trim();
          if (phone.trim()) entry.phone = phone.trim();
          return entry;
        },
      );

      const result = await updatePractice(practice.id, {
        type: editType.trim(),
        notes: editNotes.trim() || null,
        assigned_to: editAssignedTo,
        clients,
        ...(editCreatedAt ? { created_at: editCreatedAt } : {}),
      });

      if (result) {
        toast.success("Pratica aggiornata con successo");
        setIsEditMode(false);
        router.refresh();
      } else {
        toast.error("Errore durante l'aggiornamento");
      }
    } catch {
      toast.error("Errore durante l'aggiornamento");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Status change (existing logic) ---
  const handleStatusChange = async (newIsConcluded: boolean) => {
    if (newIsConcluded === effectiveConcluded) return;
    setOptimisticConcluded(newIsConcluded);
    setIsUpdating(true);
    try {
      const result = await updatePractice(practice.id, {
        is_concluded: newIsConcluded,
      });
      if (result) {
        toast.success("Stato pratica aggiornato con successo");
        router.refresh();
      } else {
        setOptimisticConcluded(null);
        toast.error("Errore durante l'aggiornamento dello stato");
      }
    } catch {
      setOptimisticConcluded(null);
      toast.error("Errore durante l'aggiornamento dello stato");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Timeline toggle ---
  const [showTimeline, setShowTimeline] = useState(false);

  // --- Client helpers ---
  const updateClient = (tempId: string, updated: EditClientRow) =>
    setEditClients((prev) =>
      prev.map((r) => (r.tempId === tempId ? updated : r)),
    );
  const removeClient = (tempId: string) =>
    setEditClients((prev) => prev.filter((r) => r.tempId !== tempId));
  const addClient = () =>
    setEditClients((prev) => [...prev, emptyClientRow()]);

  return (
    <main className="bg-card m-2.5 flex flex-1 flex-col gap-2.5 overflow-hidden rounded-3xl px-9 pt-6 font-medium">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => router.push("/pratiche")}
            className="text-button-secondary hover:text-button-secondary/80 flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
            aria-label="Torna alla lista pratiche"
          >
            <ArrowBackIcon />
            Indietro
          </button>
          <div>
            <h1 className="text-3xl font-bold leading-tight">
              Pratica {practice.practice_number}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditMode ? "Modalità modifica" : practice.type}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center justify-center gap-2 rounded-full py-1.5 pr-4 pl-3 text-base font-medium"
            style={{ backgroundColor: statusVisual.background, color: statusVisual.accent }}
            suppressHydrationWarning
          >
            <span style={{ color: statusVisual.iconColor }} suppressHydrationWarning>
              {statusVisual.icon}
            </span>
            {statusVisual.label}
          </span>

          {isEditMode ? (
            <>
              <Button variant="outline" onClick={cancelEditMode} disabled={isSaving}>
                Annulla
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <><Spinner size="sm" className="mr-1.5" />Salvataggio…</>
                ) : (
                  "Salva modifiche"
                )}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={enterEditMode} className="gap-2">
              <FaPencilAlt className="size-3.5" />
              Modifica
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="bg-background flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto rounded-t-3xl px-6 pt-7 pb-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-6">

            {/* Dettagli Pratica */}
            <div className={cn("bg-card rounded-2xl border p-7 transition-colors", isEditMode ? "border-primary/40 ring-2 ring-primary/10" : "border-border")}>
              <h2 className="mb-6 text-xl font-semibold">Dettagli Pratica</h2>

              {/* Practice number hero */}
              <div className="mb-6 rounded-xl bg-muted/40 px-5 py-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Numero Pratica
                </p>
                <p className="text-4xl font-bold tracking-tight">
                  {practice.practice_number}
                </p>
              </div>

              <div className="space-y-6">
                {/* Tipologia */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Tipologia{isEditMode && <span className="text-destructive"> *</span>}
                  </span>
                  {isEditMode ? (
                    <Input
                      type="text"
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      disabled={isSaving}
                      placeholder="Compravendita, Mutuo…"
                      className="bg-background text-base"
                    />
                  ) : (
                    <span className="text-base font-medium">{practice.type}</span>
                  )}
                </div>

                {/* Data Creazione */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Data Creazione
                  </span>
                  {isEditMode ? (
                    <DatePicker
                      value={editCreatedAt}
                      onChange={setEditCreatedAt}
                      disabled={isSaving}
                    />
                  ) : (
                    <span className="text-base">{formatDate(practice.created_at)}</span>
                  )}
                </div>

                {/* Data Conclusione */}
                {effectiveConcluded && practice.concluded_at && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Data Conclusione
                    </span>
                    <span className="text-base">{formatDate(practice.concluded_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Note */}
            {(isEditMode || practice.notes) && (
              <div className={cn("bg-card rounded-2xl border p-7 transition-colors", isEditMode ? "border-primary/40 ring-2 ring-primary/10" : "border-border")}>
                <h2 className="mb-4 text-xl font-semibold">Note</h2>
                {isEditMode ? (
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    disabled={isSaving}
                    placeholder="Note opzionali sulla pratica…"
                    rows={5}
                    className="flex w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                ) : (
                  <p className="text-stats-title whitespace-pre-wrap text-base leading-relaxed">
                    {practice.notes}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-6">

            {/* Clienti */}
            <div className={cn("bg-card rounded-2xl border p-7 transition-colors", isEditMode ? "border-primary/40 ring-2 ring-primary/10" : "border-border")}>
              <h2 className="mb-5 text-xl font-semibold">
                {(practice.clients?.length ?? 0) > 1 ? "Clienti / Comparenti" : "Cliente"}
              </h2>

              {isEditMode ? (
                <div className="flex flex-col gap-3">
                  {editClients.map((row) => (
                    <EditableClientRow
                      key={row.tempId}
                      row={row}
                      canRemove={editClients.length > 1}
                      onChange={(updated) => updateClient(row.tempId, updated)}
                      onRemove={() => removeClient(row.tempId)}
                      disabled={isSaving}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addClient}
                    disabled={isSaving}
                    className="mt-1 gap-1.5 self-start"
                  >
                    <FaPlus className="size-2.5" />
                    Aggiungi cliente
                  </Button>
                </div>
              ) : practice.clients && practice.clients.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {practice.clients.map((client) => (
                    <div
                      key={client.id}
                      className="bg-background flex items-center gap-4 rounded-2xl p-4"
                    >
                      <OperatorInitialsAvatar
                        kind="client"
                        name={client.name}
                        seed={client.name}
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="truncate text-base font-semibold">{client.name}</span>
                        {client.email && (
                          <a href={`mailto:${client.email}`} className="text-stats-title truncate text-sm hover:underline">
                            {client.email}
                          </a>
                        )}
                        {client.phone && (
                          <a href={`tel:${client.phone}`} className="text-stats-title truncate text-sm hover:underline">
                            {client.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stats-title text-base">Nessun cliente associato</p>
              )}
            </div>

            {/* Operatore Interno */}
            <div className={cn("bg-card rounded-2xl border p-7 transition-colors", isEditMode ? "border-primary/40 ring-2 ring-primary/10" : "border-border")}>
              <h2 className="mb-5 text-xl font-semibold">Operatore Interno</h2>
              {isEditMode ? (
                <select
                  value={editAssignedTo}
                  onChange={(e) => setEditAssignedTo(Number(e.target.value))}
                  disabled={isSaving}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>{op.name}</option>
                  ))}
                </select>
              ) : practice.operator ? (
                <div className="bg-background flex items-center gap-4 rounded-2xl p-4">
                  <OperatorInitialsAvatar
                    name={practice.operator.name}
                    seed={practice.operator.id != null ? String(practice.operator.id) : practice.operator.name}
                  />
                  <span className="text-base font-semibold">{practice.operator.name}</span>
                </div>
              ) : (
                <p className="text-stats-title text-base">Non assegnato</p>
              )}
            </div>

            {/* Stato Pratica — visual toggle cards */}
            <div className="bg-card rounded-2xl border border-border p-7">
              <h2 className="mb-5 text-xl font-semibold">Stato Pratica</h2>
              <div className="grid grid-cols-2 gap-3">
                {/* Assegnata */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(false)}
                  disabled={isUpdating || !effectiveConcluded}
                  className={cn(
                    "flex flex-col items-center gap-2.5 rounded-2xl border-2 px-3 py-6 text-center transition-all",
                    !effectiveConcluded
                      ? "cursor-default border-[var(--status-assigned-accent)] bg-[var(--status-assigned-background)]"
                      : "border-border hover:bg-muted/40 disabled:opacity-50",
                  )}
                  suppressHydrationWarning
                >
                  <span
                    className="flex size-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: !effectiveConcluded ? "var(--status-assigned-background)" : undefined, color: !effectiveConcluded ? "var(--status-assigned-icon)" : "var(--muted-foreground)" }}
                    suppressHydrationWarning
                  >
                    <UserCircleIcon />
                  </span>
                  <span
                    className="text-base font-semibold"
                    style={{ color: !effectiveConcluded ? "var(--status-assigned-accent)" : undefined }}
                    suppressHydrationWarning
                  >
                    Assegnata
                  </span>
                  {!effectiveConcluded && (
                    <span className="text-xs text-muted-foreground">Stato attuale</span>
                  )}
                </button>

                {/* Conclusa */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(true)}
                  disabled={isUpdating || effectiveConcluded}
                  className={cn(
                    "flex flex-col items-center gap-2.5 rounded-2xl border-2 px-3 py-6 text-center transition-all",
                    effectiveConcluded
                      ? "cursor-default border-[var(--status-completed-accent)] bg-[var(--status-completed-background)]"
                      : "border-border hover:bg-muted/40 disabled:opacity-50",
                  )}
                  suppressHydrationWarning
                >
                  <span
                    className="flex size-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: effectiveConcluded ? "var(--status-completed-background)" : undefined, color: effectiveConcluded ? "var(--status-completed-icon)" : "var(--muted-foreground)" }}
                    suppressHydrationWarning
                  >
                    <CheckIcon />
                  </span>
                  <span
                    className="text-base font-semibold"
                    style={{ color: effectiveConcluded ? "var(--status-completed-accent)" : undefined }}
                    suppressHydrationWarning
                  >
                    Conclusa
                  </span>
                  {effectiveConcluded && (
                    <span className="text-xs text-muted-foreground">Stato attuale</span>
                  )}
                </button>
              </div>
              {isUpdating && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner size="sm" />
                  Aggiornamento in corso…
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Storico Modifiche */}
        <div className="bg-card rounded-2xl border border-border">
          <button
            type="button"
            onClick={() => setShowTimeline((v) => !v)}
            className="flex w-full items-center justify-between gap-2 rounded-2xl px-7 py-5 text-left transition-colors hover:bg-muted/30"
          >
            <span className="flex items-center gap-2.5 text-lg font-semibold">
              <FaHistory className="size-4 text-muted-foreground" />
              Storico Modifiche
              {audits.length > 0 && (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-muted-foreground">
                  {audits.length}
                </span>
              )}
            </span>
            <span className="text-sm text-muted-foreground">
              {showTimeline ? "Nascondi" : "Mostra"}
            </span>
          </button>

          {showTimeline && (
            <div className="border-t border-border px-7 pb-7 pt-6">
              {audits.length === 0 ? (
                <p className="text-stats-title text-base">Nessuna modifica registrata.</p>
              ) : (
                <div>
                  {audits.map((audit, i) => (
                    <TimelineEntry key={audit.id} audit={audit} isLast={i === audits.length - 1} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
