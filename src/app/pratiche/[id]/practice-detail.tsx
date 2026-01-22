"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Practice } from "@/app/actions/practices-actions";
import {
  CheckIcon,
  HalfStatusIcon,
  PraticheIcon,
  UserCircleIcon,
  XIcon,
  ArrowUpRightIcon,
  MsgSmile2Icon,
} from "@/components/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate, mapApiStatusToUI } from "@/lib/practices-utils";
import { getOperatorAvatarColors } from "@/lib/operators-utils";
import { updatePractice } from "@/app/actions/practices-actions";

interface PracticeDetailProps {
  practice: Practice;
}

const practiceStatusStyles: Record<
  ReturnType<typeof mapApiStatusToUI>,
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
  suspended: {
    label: "Sospesa",
    accent: "var(--status-suspended-accent)",
    background: "var(--status-suspended-background)",
    icon: <XIcon />,
    iconColor: "var(--status-suspended-icon)",
  },
};

/**
 * Client component for displaying practice details
 * Follows the design patterns from the codebase
 */
export default function PracticeDetail({ practice }: PracticeDetailProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const status = mapApiStatusToUI(practice.status);
  const statusVisual = practiceStatusStyles[status];

  const handleBack = () => {
    router.push("/pratiche");
  };

  const handleStatusChange = async (
    newStatus: Practice["status"],
  ) => {
    if (newStatus === practice.status) return;

    setIsUpdating(true);
    setUpdateMessage(null);
    
    try {
      const result = await updatePractice(practice.id, {
        status: newStatus,
      });

      if (result) {
        setUpdateMessage({
          type: "success",
          text: "Stato pratica aggiornato con successo",
        });
        // Refresh the page to show updated data after a short delay
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setUpdateMessage({
          type: "error",
          text: "Errore durante l'aggiornamento dello stato",
        });
      }
    } catch (error) {
      setUpdateMessage({
        type: "error",
        text: "Errore durante l'aggiornamento dello stato",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const statusOptions: Array<{
    value: Practice["status"];
    label: string;
  }> = [
    { value: "assegnata", label: "Assegnata" },
    { value: "in lavorazione", label: "In lavorazione" },
    { value: "conclusa", label: "Conclusa" },
    { value: "sospesa", label: "Sospesa" },
  ];

  return (
    <main className="bg-card m-2.5 flex flex-1 flex-col gap-2.5 overflow-hidden rounded-3xl px-9 pt-6 font-medium">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={handleBack}
            className="text-button-secondary hover:text-button-secondary/80 flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
            aria-label="Torna alla lista pratiche"
          >
            <ArrowUpRightIcon className="rotate-180" />
            Indietro
          </button>
          <div className="flex items-center gap-3.5">
            <PraticheIcon />
            <h1 className="text-2xl font-semibold">
              Pratica {practice.practice_number}
            </h1>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
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

      {/* Content */}
      <div className="bg-background flex min-h-0 flex-1 flex-col gap-6.25 rounded-t-3xl px-5.5 pt-6.25">
        {/* Main Info Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column - Practice Info */}
          <div className="flex flex-col gap-6">
            {/* Practice Details Card */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="mb-4 text-lg font-semibold">Dettagli Pratica</h2>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <span className="text-stats-title text-sm">Numero Pratica</span>
                  <span className="text-right font-semibold">
                    {practice.practice_number}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-stats-title text-sm">Anno</span>
                  <span className="text-right">{practice.year}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-stats-title text-sm">Numero</span>
                  <span className="text-right">{practice.number}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-stats-title text-sm">Tipologia</span>
                  <span className="text-right">{practice.type}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-stats-title text-sm">Data Creazione</span>
                  <span className="text-right">
                    {formatDate(practice.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes Card */}
            {practice.notes && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="mb-4 text-lg font-semibold">Note</h2>
                <p className="text-stats-title whitespace-pre-wrap text-sm leading-relaxed">
                  {practice.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Client & Operator Info */}
          <div className="flex flex-col gap-6">
            {/* Client Card */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="mb-4 text-lg font-semibold">Cliente</h2>
              {practice.client ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar aria-hidden className="bg-background">
                      <AvatarFallback placeholderSeed={practice.client.name} />
                    </Avatar>
                    <div className="flex flex-1 flex-col">
                      <span className="font-semibold">{practice.client.name}</span>
                      {practice.client.email && (
                        <span className="text-stats-title text-sm">
                          {practice.client.email}
                        </span>
                      )}
                      {practice.client.phone && (
                        <span className="text-stats-title text-sm">
                          {practice.client.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-stats-title text-sm">Cliente non disponibile</p>
              )}
            </div>

            {/* Operator Card */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="mb-4 text-lg font-semibold">Operatore Interno</h2>
              {practice.operator ? (
                <div className="flex items-center gap-3">
                  <Avatar aria-hidden className="bg-background">
                    <AvatarFallback
                      aria-label={`Operatore: ${practice.operator.name}`}
                      placeholderSeed={practice.operator.email || practice.operator.id?.toString() || practice.operator.name}
                      style={getOperatorAvatarColors(
                        practice.operator.email ||
                          practice.operator.id?.toString() ||
                          practice.operator.name,
                      )}
                    >
                      {/* Operator placeholder icon per spec */}
                      <MsgSmile2Icon
                        aria-hidden="true"
                        size={16}
                        className="text-primary"
                      />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{practice.operator.name}</span>
                </div>
              ) : (
                <p className="text-stats-title text-sm">Non assegnato</p>
              )}
            </div>

            {/* Status Update Card */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="mb-4 text-lg font-semibold">Cambia Stato</h2>
              <div className="flex flex-col gap-2">
                {statusOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      practice.status === option.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleStatusChange(option.value)}
                    disabled={isUpdating || practice.status === option.value}
                    className="justify-start"
                  >
                    {option.label}
                  </Button>
                ))}
                {updateMessage && (
                  <div
                    className={cn(
                      "mt-2 rounded-lg px-3 py-2 text-sm",
                      updateMessage.type === "success"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-red-500/10 text-red-600 dark:text-red-400",
                    )}
                  >
                    {updateMessage.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

