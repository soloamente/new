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
  createStudio,
  type CreateStudioInput,
} from "@/app/actions/studios-actions";
import { Spinner } from "@/components/ui/spinner";
import { motion, AnimatePresence } from "motion/react";

interface CreateStudioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateStudioDialog({
  open,
  onOpenChange,
}: CreateStudioDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateStudioInput>({
    name: "",
    city: "",
    vat_number: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Clean up empty optional fields
      const payload: CreateStudioInput = {
        name: formData.name.trim(),
        ...(formData.city?.trim() && { city: formData.city.trim() }),
        ...(formData.vat_number?.trim() && {
          vat_number: formData.vat_number.trim(),
        }),
      };

      const result = await createStudio(payload);

      if (result) {
        // Reset form and close dialog
        setFormData({ name: "", city: "", vat_number: "" });
        onOpenChange(false);
        // Refresh the page to show the new studio
        router.refresh();
      } else {
        setError("Errore durante la creazione dello studio. Riprova.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore durante la creazione dello studio. Riprova.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateStudioInput) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      // Reset form when closing
      setFormData({ name: "", city: "", vat_number: "" });
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-0">
          <DialogTitle className="text-2xl text-center">Crea Nuovo Studio</DialogTitle>
          <DialogDescription className="text-center">
            Inserisci i dati per creare un nuovo studio. Il nome è obbligatorio
            e deve essere univoco.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="studio-name"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Nome Studio <span className="text-destructive">*</span>
            </label>
            <Input
              id="studio-name"
              type="text"
              placeholder="Nome Studio"
              value={formData.name}
              onChange={handleInputChange("name")}
              required
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="studio-city"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Città
            </label>
            <Input
              id="studio-city"
              type="text"
              placeholder="Città"
              value={formData.city || ""}
              onChange={handleInputChange("city")}
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="studio-vat"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Partita IVA
            </label>
            <Input
              id="studio-vat"
              type="text"
              placeholder="IT12345678901"
              value={formData.vat_number || ""}
              onChange={handleInputChange("vat_number")}
              disabled={isSubmitting}
              className="w-full"
            />
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
            <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creazione...
                </>
              ) : (
                "Crea Studio"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

