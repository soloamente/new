"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
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
  createAdminWithStudio,
  createUser,
  type CreateAdminWithStudioInput,
} from "@/app/actions/users-actions";
import { Spinner } from "@/components/ui/spinner";
import { AnimatePresence, motion, MotionConfig } from "motion/react";

export interface StudioOption {
  id: number;
  name: string;
}

type StudioMode = "new" | "existing";

interface CreateAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studios: StudioOption[];
}

export function CreateAdminDialog({
  open,
  onOpenChange,
  studios,
}: CreateAdminDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studioMode, setStudioMode] = useState<StudioMode>("new");
  const [selectedStudioId, setSelectedStudioId] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const innerContentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | "auto">("auto");

  const [formData, setFormData] = useState<CreateAdminWithStudioInput>({
    name: "",
    email: "",
    password: "",
    role_id: 2, // AMMINISTRATORE_STUDIO
    studio_name: "",
    studio_city: "",
    studio_vat_number: "",
  });

  // Measure content height for smooth transitions
  useEffect(() => {
    if (innerContentRef.current) {
      // Set initial height
      const updateHeight = () => {
        if (innerContentRef.current) {
          setContentHeight(innerContentRef.current.scrollHeight);
        }
      };

      // Initial measurement
      updateHeight();

      const resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });
      resizeObserver.observe(innerContentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [currentStep, formData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result =
        studioMode === "existing"
          ? await createUser({
              name: formData.name.trim(),
              email: formData.email.trim(),
              password: formData.password,
              role_id: 2,
              studio_id: Number(selectedStudioId),
            })
          : await createAdminWithStudio({
              name: formData.name.trim(),
              email: formData.email.trim(),
              password: formData.password,
              role_id: 2,
              studio_name: formData.studio_name.trim(),
              // Clean up empty optional fields
              ...(formData.studio_city?.trim() && {
                studio_city: formData.studio_city.trim(),
              }),
              ...(formData.studio_vat_number?.trim() && {
                studio_vat_number: formData.studio_vat_number.trim(),
              }),
            });

      if (result) {
        // Reset form and close dialog
        setFormData({
          name: "",
          email: "",
          password: "",
          role_id: 2,
          studio_name: "",
          studio_city: "",
          studio_vat_number: "",
        });
        setStudioMode("new");
        setSelectedStudioId("");
        setCurrentStep(0);
        setDirection(1);
        onOpenChange(false);
        // Refresh the page to show the new admin
        router.refresh();
      } else {
        setError("Errore durante la creazione del visore. Riprova.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore durante la creazione del visore. Riprova.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = useCallback(
    (field: keyof CreateAdminWithStudioInput) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
          ...prev,
          [field]: e.target.value,
        }));
        // Clear error when user starts typing
        setError(null);
      },
    [],
  );

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      // Reset form and step when closing
      setFormData({
        name: "",
        email: "",
        password: "",
        role_id: 2,
        studio_name: "",
        studio_city: "",
        studio_vat_number: "",
      });
      setStudioMode("new");
      setSelectedStudioId("");
      setError(null);
      setCurrentStep(0);
      setDirection(1);
    }
    onOpenChange(newOpen);
  };

  const isStep1Valid =
    formData.name.trim() && formData.email.trim() && formData.password;

  const isStep2Valid =
    studioMode === "existing"
      ? selectedStudioId !== ""
      : formData.studio_name.trim();

  const isFormValid = isStep1Valid && isStep2Valid;

  const handleNext = () => {
    if (currentStep === 0 && isStep1Valid) {
      setDirection(1);
      setCurrentStep(1);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setDirection(-1);
      setCurrentStep(0);
    }
  };

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-name"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Nome <span className="text-destructive">*</span>
                </label>
                <Input
                  id="admin-name"
                  type="text"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="admin-email"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@studio.it"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="admin-password"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Password <span className="text-destructive">*</span>
                </label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-3">
            <div
              role="radiogroup"
              aria-label="Studio"
              className="grid grid-cols-2 gap-2"
            >
              {(
                [
                  { value: "new", label: "Nuovo studio" },
                  { value: "existing", label: "Studio esistente" },
                ] as const
              ).map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={studioMode === option.value}
                  variant={studioMode === option.value ? "default" : "outline"}
                  onClick={() => {
                    setStudioMode(option.value);
                    setError(null);
                  }}
                  disabled={
                    isSubmitting ||
                    (option.value === "existing" && studios.length === 0)
                  }
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {studioMode === "existing" ? (
              <div className="space-y-1.5">
                <label
                  htmlFor="existing-studio"
                  className="text-sm leading-none font-medium"
                >
                  Studio <span className="text-destructive">*</span>
                </label>
                <Select
                  value={selectedStudioId}
                  onValueChange={(value) => {
                    setSelectedStudioId(value);
                    setError(null);
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="existing-studio" className="w-full">
                    <SelectValue placeholder="Seleziona uno studio" />
                  </SelectTrigger>
                  <SelectContent>
                    {studios.map((studio) => (
                      <SelectItem key={studio.id} value={String(studio.id)}>
                        {studio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="studio-name"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Nome Studio <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="studio-name"
                    type="text"
                    placeholder="Nome Studio"
                    value={formData.studio_name}
                    onChange={handleInputChange("studio_name")}
                    required
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label
                      htmlFor="studio-city"
                      className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Città
                    </label>
                    <Input
                      id="studio-city"
                      type="text"
                      placeholder="Città"
                      value={formData.studio_city ?? ""}
                      onChange={handleInputChange("studio_city")}
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="studio-vat"
                      className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Partita IVA
                    </label>
                    <Input
                      id="studio-vat"
                      type="text"
                      placeholder="IT12345678901"
                      value={formData.studio_vat_number ?? ""}
                      onChange={handleInputChange("studio_vat_number")}
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  }, [
    currentStep,
    formData,
    isSubmitting,
    handleInputChange,
    studioMode,
    selectedStudioId,
    studios,
  ]);

  const stepVariants = {
    initial: (direction: number) => ({
      x: `${110 * direction}%`,
      opacity: 0,
    }),
    active: {
      x: "0%",
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: `${-110 * direction}%`,
      opacity: 0,
    }),
  };

  const stepTitles = ["Dati Visore", "Dati Studio"];
  const stepDescriptions = [
    "Inserisci i dati del visore dello studio",
    studioMode === "existing"
      ? "Scegli lo studio a cui aggiungere il visore"
      : "Inserisci i dati dello studio da creare",
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden sm:max-w-[500px]"
      >
        <DialogHeader>
          <DialogTitle>Crea Nuovo Visore Studio</DialogTitle>
          <DialogDescription>{stepDescriptions[currentStep]}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <MotionConfig
            transition={{ duration: 0.3, type: "spring", bounce: 0 }}
          >
            <motion.div
              animate={{
                height:
                  typeof contentHeight === "number" && contentHeight > 0
                    ? `${contentHeight}px`
                    : "auto",
              }}
              className="overflow-hidden"
              style={{ willChange: "height" }}
            >
              <div ref={contentRef} className="relative w-full">
                <AnimatePresence
                  mode="popLayout"
                  initial={false}
                  custom={direction}
                >
                  <motion.div
                    key={currentStep}
                    variants={stepVariants}
                    initial="initial"
                    animate="active"
                    exit="exit"
                    custom={direction}
                    className="absolute inset-0 w-full"
                    style={{ willChange: "transform, opacity" }}
                  >
                    <div ref={innerContentRef} className="space-y-3">
                      <h3 className="text-sm font-semibold">
                        {stepTitles[currentStep]}
                      </h3>
                      {stepContent}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </MotionConfig>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-destructive/10 text-destructive mt-3 rounded-md p-2 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter className="mt-4">
            <div className="flex w-full items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Annulla
              </Button>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Indietro
                  </Button>
                )}
                {currentStep === 0 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!isStep1Valid || isSubmitting}
                  >
                    Continua
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting || !isFormValid}>
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Creazione...
                      </>
                    ) : (
                      "Crea Visore"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
