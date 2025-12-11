"use client";

import { useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { motion, AnimatePresence } from "motion/react";
import { getCurrentUser, type User } from "@/app/actions/auth-actions";

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
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
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
            <div className="space-y-2">
              <label
                htmlFor="practice-client"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Nome Cliente <span className="text-destructive">*</span>
              </label>
              <Input
                id="practice-client"
                type="text"
                placeholder="Mario Rossi"
                value={formData.client}
                onChange={handleInputChange("client")}
                required
                disabled={isSubmitting}
                className="w-full"
              />
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

