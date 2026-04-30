"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import {
  createPractice,
  type ClientInput,
} from "@/app/actions/practices-actions";
import { searchClients, type Client } from "@/app/actions/clients-actions";
import { Spinner } from "@/components/ui/spinner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { FaPlus, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClientRowData {
  tempId: string;
  id?: number;
  name: string;
  email: string;
  phone: string;
}

function emptyRow(): ClientRowData {
  return { tempId: crypto.randomUUID(), name: "", email: "", phone: "" };
}

// ---------------------------------------------------------------------------
// ClientRowEditor — single card shown in the carousel
// ---------------------------------------------------------------------------

interface ClientRowEditorProps {
  row: ClientRowData;
  index: number;
  canRemove: boolean;
  onChange: (updated: ClientRowData) => void;
  onRemove: () => void;
  disabled: boolean;
}

function ClientRowEditor({
  row,
  index,
  canRemove,
  onChange,
  onRemove,
  disabled,
}: ClientRowEditorProps) {
  const [results, setResults] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchDebounced = useCallback(async (query: string) => {
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

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

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

  const handleSelectExisting = (client: Client) => {
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
    void searchDebounced(value);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow-sm ring-1 ring-border/70 transition-shadow focus-within:ring-border">
      {/* Card header: number badge + remove */}
      <div className="flex items-center gap-2">
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-semibold text-primary">
          {index + 1}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          Comparente
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="ml-auto flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
            aria-label="Rimuovi comparente"
          >
            <FaTimes className="size-3" />
          </button>
        )}
      </div>

      {/* Name with autocomplete */}
      <div className="relative">
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
            className="w-full bg-background pr-8"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </div>
          )}
        </div>

        {/* Autocomplete dropdown */}
        <AnimatePresence>
          {showDropdown && results.length > 0 && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute z-50 w-full rounded-xl border border-border bg-popover shadow-lg"
              style={{ willChange: "opacity, transform" }}
            >
              <ul className="max-h-36 overflow-y-auto p-1">
                {results.map((client) => (
                  <li key={client.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectExisting(client)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted",
                        row.id === client.id && "bg-muted",
                      )}
                    >
                      <Avatar aria-hidden className="size-7 bg-background">
                        <AvatarFallback placeholderSeed={client.name} />
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-none">
                          {client.name}
                        </span>
                        {client.email && (
                          <span className="text-xs leading-none text-muted-foreground">
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
          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
            ✓ Cliente esistente
          </p>
        )}
      </div>

      {/* Email + Phone — stacked to avoid overflow */}
      <div className="flex flex-col gap-2">
        <Input
          type="email"
          placeholder="Email (opzionale)"
          value={row.email}
          onChange={(e) => onChange({ ...row, email: e.target.value })}
          disabled={disabled}
          className="w-full bg-background"
        />
        <Input
          type="tel"
          placeholder="Telefono"
          value={row.phone}
          onChange={(e) => onChange({ ...row, phone: e.target.value })}
          disabled={disabled}
          className="w-full bg-background"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slide variants for carousel animation
// ---------------------------------------------------------------------------

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 52 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -52 }),
};

// ---------------------------------------------------------------------------
// CreatePracticeDialog
// ---------------------------------------------------------------------------

interface CreatePracticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: number;
}

interface FormState {
  assigned_to: number;
  type: string;
  notes: string;
}

export function CreatePracticeDialog({
  open,
  onOpenChange,
  currentUserId,
}: CreatePracticeDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormState>({
    assigned_to: currentUserId ?? 0,
    type: "",
    notes: "",
  });

  const [clientRows, setClientRows] = useState<ClientRowData[]>([emptyRow()]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const resetForm = () => {
    setFormData({ assigned_to: currentUserId ?? 0, type: "", notes: "" });
    setClientRows([emptyRow()]);
    setCurrentIndex(0);
    setDirection(1);
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) resetForm();
    onOpenChange(newOpen);
  };

  const goTo = (i: number) => {
    if (i === currentIndex) return;
    setDirection(i > currentIndex ? 1 : -1);
    setCurrentIndex(i);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const invalidRow = clientRows.find((r) => !r.name.trim());
    if (invalidRow) {
      setError("Tutti i comparenti devono avere un nome");
      return;
    }

    if (!formData.type.trim()) {
      setError("La tipologia pratica è obbligatoria");
      return;
    }

    if (!formData.assigned_to) {
      setError("L'operatore assegnato è obbligatorio");
      return;
    }

    setIsSubmitting(true);

    try {
      const clients: ClientInput[] = clientRows.map(({ id, name, email, phone }) => {
        const entry: ClientInput = {};
        if (id) entry.id = id;
        if (name.trim()) entry.name = name.trim();
        if (email.trim()) entry.email = email.trim();
        if (phone.trim()) entry.phone = phone.trim();
        return entry;
      });

      const result = await createPractice({
        assigned_to: formData.assigned_to || (currentUserId ?? 0),
        clients,
        type: formData.type.trim(),
        ...(formData.notes.trim() && { notes: formData.notes.trim() }),
      });

      if (result) {
        resetForm();
        onOpenChange(false);
        router.refresh();
      } else {
        setError("Errore durante la creazione della pratica. Riprova.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore durante la creazione della pratica. Riprova.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRow = (tempId: string, updated: ClientRowData) => {
    setClientRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? updated : r)),
    );
    if (error) setError(null);
  };

  const removeCurrentRow = () => {
    if (clientRows.length <= 1) return;
    const newRows = clientRows.filter((_, i) => i !== currentIndex);
    const newIndex = Math.max(0, currentIndex - 1);
    setDirection(-1);
    setClientRows(newRows);
    setCurrentIndex(newIndex);
  };

  const addRow = () => {
    const newIndex = clientRows.length;
    setClientRows((prev) => [...prev, emptyRow()]);
    setDirection(1);
    setCurrentIndex(newIndex);
  };

  const isSubmitDisabled =
    isSubmitting ||
    clientRows.every((r) => !r.name.trim()) ||
    !formData.type.trim();

  const currentRow = clientRows[currentIndex];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-[520px]">
        <DialogHeader className="space-y-0">
          <DialogTitle className="text-center text-xl">
            Crea nuova pratica
          </DialogTitle>
          <DialogDescription className="text-center">
            Inserisci i dati per creare una nuova pratica. I campi con asterisco
            sono obbligatori.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipologia */}
          <div className="space-y-2">
            <label
              htmlFor="practice-type"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Tipologia Pratica <span className="text-destructive">*</span>
            </label>
            <Input
              id="practice-type"
              type="text"
              placeholder="Compravendita, Mutuo..."
              value={formData.type}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, type: e.target.value }));
                if (error) setError(null);
              }}
              required
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          {/* Clienti — carousel */}
          <div className="space-y-2">
            {/* Section header */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium leading-none">
                Clienti / Comparenti <span className="text-destructive">*</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {clientRows.length}{" "}
                {clientRows.length === 1 ? "comparente" : "comparenti"}
              </span>
            </div>

            {/* Carousel controls */}
            <div className="flex items-center gap-2">
              {/* Prev */}
              <button
                type="button"
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0 || isSubmitting}
                className="flex size-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                aria-label="Comparente precedente"
              >
                <FaChevronLeft className="size-3" />
              </button>

              {/* Dot indicators */}
              <div className="flex items-center gap-1.5">
                {clientRows.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    disabled={isSubmitting}
                    className={cn(
                      "rounded-full transition-all duration-200",
                      i === currentIndex
                        ? "h-2 w-4 bg-primary"
                        : "size-2 bg-border hover:bg-muted-foreground/50",
                    )}
                    aria-label={`Vai al comparente ${i + 1}`}
                  />
                ))}
              </div>

              {/* Next */}
              <button
                type="button"
                onClick={() => goTo(currentIndex + 1)}
                disabled={currentIndex === clientRows.length - 1 || isSubmitting}
                className="flex size-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                aria-label="Comparente successivo"
              >
                <FaChevronRight className="size-3" />
              </button>

              {/* Add button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRow}
                disabled={isSubmitting}
                className="ml-auto h-7 gap-1.5 text-xs"
              >
                <FaPlus className="size-2.5" />
                Aggiungi
              </Button>
            </div>

            {/* Animated card */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                {currentRow && (
                  <motion.div
                    key={currentRow.tempId}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <ClientRowEditor
                      row={currentRow}
                      index={currentIndex}
                      canRemove={clientRows.length > 1}
                      onChange={(updated) => updateRow(currentRow.tempId, updated)}
                      onRemove={removeCurrentRow}
                      disabled={isSubmitting}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label
              htmlFor="practice-notes"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Note
            </label>
            <textarea
              id="practice-notes"
              placeholder="Note opzionali sulla pratica..."
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              disabled={isSubmitting}
              rows={3}
              className="flex w-full rounded-xl bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creazione...
                </>
              ) : (
                "Crea Pratica"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
