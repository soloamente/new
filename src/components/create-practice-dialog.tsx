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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createPractice,
  type CreatePracticeInput,
} from "@/app/actions/practices-actions";
import { searchClients, type Client } from "@/app/actions/clients-actions";
import { Spinner } from "@/components/ui/spinner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface CreatePracticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: number;
}

export function CreatePracticeDialog({
  open,
  onOpenChange,
  currentUserId,
}: CreatePracticeDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePracticeInput>({
    assigned_to: currentUserId || 0,
    client: "",
    client_email: "",
    client_phone: "",
    type: "",
    status: "assegnata",
    notes: "",
  });

  // Client search autocomplete state
  const [clientSearchResults, setClientSearchResults] = useState<Client[]>([]);
  const [isSearchingClients, setIsSearchingClients] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const clientInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced client search function
  const searchClientsDebounced = useCallback(async (query: string) => {
    // Clear any pending search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search if query is too short
    if (query.trim().length < 2) {
      setClientSearchResults([]);
      setShowClientDropdown(false);
      return;
    }

    // Debounce the search by 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearchingClients(true);
      try {
        const results = await searchClients(query);
        setClientSearchResults(results);
        setShowClientDropdown(results.length > 0);
      } catch (err) {
        console.error("Client search error:", err);
        setClientSearchResults([]);
      } finally {
        setIsSearchingClients(false);
      }
    }, 300);
  }, []);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        clientInputRef.current &&
        !clientInputRef.current.contains(event.target as Node)
      ) {
        setShowClientDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle selecting a client from the dropdown
  const handleSelectClient = (client: Client) => {
    setSelectedClientId(client.id);
    setFormData((prev) => ({
      ...prev,
      client: client.name,
      client_email: client.email || "",
      client_phone: client.phone || "",
    }));
    setShowClientDropdown(false);
    setClientSearchResults([]);
    // Clear error when user makes a selection
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Clean up empty optional fields
      const payload: CreatePracticeInput = {
        assigned_to: formData.assigned_to || currentUserId || 0,
        client: formData.client.trim(),
        type: formData.type.trim(),
        status: formData.status,
        ...(formData.client_email?.trim() && {
          client_email: formData.client_email.trim(),
        }),
        ...(formData.client_phone?.trim() && {
          client_phone: formData.client_phone.trim(),
        }),
        ...(formData.notes?.trim() && { notes: formData.notes.trim() }),
      };

      // Validate required fields
      if (!payload.client) {
        setError("Il nome del cliente è obbligatorio");
        setIsSubmitting(false);
        return;
      }

      if (!payload.type) {
        setError("La tipologia pratica è obbligatoria");
        setIsSubmitting(false);
        return;
      }

      if (!payload.assigned_to) {
        setError("L'operatore assegnato è obbligatorio");
        setIsSubmitting(false);
        return;
      }

      const result = await createPractice(payload);

      if (result) {
        // Reset form and close dialog
        setFormData({
          assigned_to: currentUserId || 0,
          client: "",
          client_email: "",
          client_phone: "",
          type: "",
          status: "assegnata",
          notes: "",
        });
        // Reset client search state
        setClientSearchResults([]);
        setShowClientDropdown(false);
        setSelectedClientId(null);
        onOpenChange(false);
        // Refresh the page to show the new practice
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

  const handleInputChange = (
    field: keyof CreatePracticeInput,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // If user is typing in the client field, trigger search and reset selected client
    if (field === "client") {
      setSelectedClientId(null);
      searchClientsDebounced(value);
    }
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSelectChange = (field: keyof CreatePracticeInput) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user makes a selection
    if (error) setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      // Reset form when closing
      setFormData({
        assigned_to: currentUserId || 0,
        client: "",
        client_email: "",
        client_phone: "",
        type: "",
        status: "assegnata",
        notes: "",
      });
      setError(null);
      // Reset client search state
      setClientSearchResults([]);
      setShowClientDropdown(false);
      setSelectedClientId(null);
      setIsSearchingClients(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-[500px]">
        <DialogHeader className="space-y-0">
          <DialogTitle className="text-xl text-center">Crea nuova pratica</DialogTitle>
          <DialogDescription className="text-center">
            Inserisci i dati per creare una nuova pratica. I campi con asterisco
            sono obbligatori.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative space-y-2">
              <label
                htmlFor="practice-client"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Nome Cliente <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  ref={clientInputRef}
                  id="practice-client"
                  type="text"
                  placeholder="Cerca cliente esistente..."
                  value={formData.client}
                  onChange={handleInputChange("client")}
                  onFocus={() => {
                    // Show dropdown if there are results when focusing
                    if (clientSearchResults.length > 0) {
                      setShowClientDropdown(true);
                    }
                  }}
                  required
                  disabled={isSubmitting}
                  autoComplete="off"
                  className="w-full"
                />
                {/* Loading spinner shown while searching */}
                {isSearchingClients && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Spinner size="sm" />
                  </div>
                )}
              </div>
              
              {/* Client search dropdown */}
              <AnimatePresence>
                {showClientDropdown && clientSearchResults.length > 0 && (
                  <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute z-50 w-full rounded-xl border border-border bg-popover shadow-lg"
                    style={{ willChange: "opacity, transform" }}
                  >
                    <ul className="max-h-48 overflow-y-auto p-1">
                      {clientSearchResults.map((client) => (
                        <li key={client.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectClient(client)}
                            className={cn(
                              "flex w-full flex-col cursor-pointer items- justify-center px-2 py-2 rounded-lg text-left transition-colors hover:bg-muted",
                              selectedClientId === client.id && "bg-muted"
                            )}
                          >
                            <div className="flex items-center gap-2 justify-start">
                              <Avatar aria-hidden className="bg-background">  <AvatarFallback placeholderSeed={client.name} /></Avatar>
                            <div className="flex flex-col">
                            <span className="font-medium leading-none">{client.name}</span>
                            {(client.email ) && (
                              <span className="text-xs text-muted-foreground leading-none">
                                {client.email}
                              </span>
                            )}
                            </div>
                            </div>
                            
                          </button>
                        </li>
                      ))}
                    </ul>
                    {/* Hint to show user can type a new name */}
                    <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                      Seleziona un cliente o continua a digitare per crearne uno nuovo
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Show indicator if existing client is selected */}
              {selectedClientId && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  Cliente esistente selezionato
                </p>
              )}
            </div>

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
                placeholder="Consulenza..."
                value={formData.type}
                onChange={handleInputChange("type")}
                required
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="practice-client-email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Email Cliente
              </label>
              <Input
                id="practice-client-email"
                type="email"
                placeholder="mario.rossi@esempio.it"
                value={formData.client_email || ""}
                onChange={handleInputChange("client_email")}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="practice-client-phone"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Telefono Cliente
              </label>
              <Input
                id="practice-client-phone"
                type="tel"
                placeholder="333 1234567"
                value={formData.client_phone || ""}
                onChange={handleInputChange("client_phone")}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="practice-status"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Stato <span className="text-destructive">*</span>
              </label>
              <Select
                value={formData.status}
                onValueChange={handleSelectChange("status")}
                required
                disabled={isSubmitting}
              >
                <SelectTrigger id="practice-status" className="w-full cursor-pointer bg-card px-3.75 py-3 rounded-xl">
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
                <SelectContent className="w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width)">
                  <SelectItem value="assegnata" className="cursor-pointer">Assegnata</SelectItem>
                  <SelectItem value="in lavorazione" className="cursor-pointer">In lavorazione</SelectItem>
                  <SelectItem value="conclusa" className="cursor-pointer">Conclusa</SelectItem>
                  <SelectItem value="sospesa" className="cursor-pointer">Sospesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="practice-notes"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Note
              </label>
              <textarea
                id="practice-notes"
                placeholder="Note opzionali sulla pratica..."
                value={formData.notes || ""}
                onChange={handleInputChange("notes")}
                disabled={isSubmitting}
                rows={3}
                className="flex w-full rounded-xl bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-destructive/10 text-destructive rounded-md p-3 text-sm"
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
              disabled={isSubmitting || !formData.client.trim() || !formData.type.trim()}
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

