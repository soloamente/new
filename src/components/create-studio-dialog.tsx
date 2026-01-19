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
  createAdminWithStudio,
  type CreateAdminWithStudioInput,
} from "@/app/actions/users-actions";
import { Spinner } from "@/components/ui/spinner";
import { motion, AnimatePresence } from "motion/react";

interface CreateStudioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Form data type that includes both studio and admin fields
interface FormData {
  // Studio fields
  studio_name: string;
  studio_city: string;
  studio_vat_number: string;
  // Admin fields
  admin_name: string;
  admin_email: string;
  admin_password: string;
}

const initialFormData: FormData = {
  studio_name: "",
  studio_city: "",
  studio_vat_number: "",
  admin_name: "",
  admin_email: "",
  admin_password: "",
};

export function CreateStudioDialog({
  open,
  onOpenChange,
}: CreateStudioDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.studio_name.trim()) {
        setError("Il nome dello studio è obbligatorio");
        setIsSubmitting(false);
        return;
      }

      if (!formData.admin_name.trim()) {
        setError("Il nome dell'amministratore è obbligatorio");
        setIsSubmitting(false);
        return;
      }

      if (!formData.admin_email.trim()) {
        setError("L'email dell'amministratore è obbligatoria");
        setIsSubmitting(false);
        return;
      }

      if (!formData.admin_password.trim()) {
        setError("La password dell'amministratore è obbligatoria");
        setIsSubmitting(false);
        return;
      }

      if (formData.admin_password.length < 6) {
        setError("La password deve avere almeno 6 caratteri");
        setIsSubmitting(false);
        return;
      }

      // Build the payload for creating admin with studio
      const payload: CreateAdminWithStudioInput = {
        name: formData.admin_name.trim(),
        email: formData.admin_email.trim(),
        password: formData.admin_password,
        role_id: 2, // AMMINISTRATORE_STUDIO
        studio_name: formData.studio_name.trim(),
        ...(formData.studio_city?.trim() && {
          studio_city: formData.studio_city.trim(),
        }),
        ...(formData.studio_vat_number?.trim() && {
          studio_vat_number: formData.studio_vat_number.trim(),
        }),
      };

      const result = await createAdminWithStudio(payload);

      if (result) {
        // Reset form and close dialog
        setFormData(initialFormData);
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

  const handleInputChange = (field: keyof FormData) => (
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
      setFormData(initialFormData);
      setError(null);
    }
    onOpenChange(newOpen);
  };

  // Check if form is valid for submission
  const isFormValid =
    formData.studio_name.trim() &&
    formData.admin_name.trim() &&
    formData.admin_email.trim() &&
    formData.admin_password.trim();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-[550px]">
        <DialogHeader className="space-y-0">
          <DialogTitle className="text-xl text-center">
            Crea Nuovo Studio
          </DialogTitle>
          <DialogDescription className="text-center">
            Inserisci i dati dello studio e dell&apos;amministratore. I campi
            con asterisco sono obbligatori.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Studio Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Dati Studio
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="studio-name"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Nome Studio <span className="text-destructive">*</span>
                </label>
                <Input
                  id="studio-name"
                  type="text"
                  placeholder="Studio Legale Rossi"
                  value={formData.studio_name}
                  onChange={handleInputChange("studio_name")}
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
                  placeholder="Milano"
                  value={formData.studio_city}
                  onChange={handleInputChange("studio_city")}
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
                  value={formData.studio_vat_number}
                  onChange={handleInputChange("studio_vat_number")}
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-border border-t" />

          {/* Admin Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Amministratore Studio
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="admin-name"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Nome <span className="text-destructive">*</span>
                </label>
                <Input
                  id="admin-name"
                  type="text"
                  placeholder="Mario Rossi"
                  value={formData.admin_name}
                  onChange={handleInputChange("admin_name")}
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="admin-email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@studio.it"
                  value={formData.admin_email}
                  onChange={handleInputChange("admin_email")}
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="admin-password"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Password <span className="text-destructive">*</span>
                </label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Minimo 6 caratteri"
                  value={formData.admin_password}
                  onChange={handleInputChange("admin_password")}
                  required
                  disabled={isSubmitting}
                  className="w-full"
                  minLength={6}
                />
              </div>
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
              disabled={isSubmitting || !isFormValid}
              className="cursor-pointer"
            >
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

