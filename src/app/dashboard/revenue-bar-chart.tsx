"use client";

import type { CSSProperties } from "react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TextMorph } from "torph/react";
import type { PracticeStatusStats } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useDashboardChartLoading } from "./chart-loading-context";

/** Una colonna del grafico: stato + valore (es. Assegnate, 12) */
export interface StatusBarDatum {
  key: keyof PracticeStatusStats;
  label: string;
  value: number;
}

interface RevenueBarChartProps {
  /** Colonne stato pratiche (modello binario: Assegnate / Concluse) */
  data: StatusBarDatum[];
  /** Nome dell’operatore selezionato o "Totale studio" per l’accessibilità */
  dataSourceLabel: string;
}

// Tooltip che segue il mouse
function MouseTooltip({
  x,
  y,
  label,
  value,
  isVisible,
}: {
  x: number;
  y: number;
  label: string;
  value: number;
  isVisible: boolean;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{
            duration: 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="bg-foreground text-background pointer-events-none fixed z-50 rounded-xl px-3 py-1.5 text-xs shadow-lg"
          style={{
            left: `${x + 10}px`,
            top: `${y - 10}px`,
            transform: "translate(0, -100%)",
          }}
        >
          <div className="font-medium">{label}</div>
          <TextMorph className="tabular-nums">
            {value.toLocaleString("it-IT")}
          </TextMorph>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getStatusAccentVar(key: keyof PracticeStatusStats): string {
  return key === "assegnata"
    ? "var(--status-assigned-accent)"
    : "var(--status-completed-accent)";
}

/**
 * Grafico a barre verticali per il modello stato binario:
 * Assegnate e Concluse. I dati dipendono dal filtro operatore
 * (operatore selezionato o totale studio).
 */
export function RevenueBarChart({
  data,
  dataSourceLabel,
}: RevenueBarChartProps) {
  const { isChartLoading } = useDashboardChartLoading();
  const [hoveredKey, setHoveredKey] = useState<
    keyof PracticeStatusStats | null
  >(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [tooltipData, setTooltipData] = useState<{
    label: string;
    value: number;
  } | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  function getBarHeightPercent(value: number): number {
    if (value <= 0) return 0;
    const percent = (value / maxValue) * 100;
    return Math.max(1, Math.round(percent));
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (hoveredKey) setMousePosition({ x: e.clientX, y: e.clientY });
    };
    if (hoveredKey) {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [hoveredKey]);

  useEffect(() => {
    if (hoveredKey) {
      const item = data.find((d) => d.key === hoveredKey);
      if (item) setTooltipData({ label: item.label, value: item.value });
      else setTooltipData(null);
    } else {
      setTooltipData(null);
    }
  }, [hoveredKey, data]);

  return (
    <>
      {/*
        L’% di altezza vive su un’area traccia (relative+flex-1) separata dal numero sopra;
        in basso l’`absolute` con `height: N%` evita barre tutte uguali o a ~1px su mobile.
      */}
      <div
        className="relative flex h-full min-h-48 w-full items-end justify-between gap-4 rounded-4xl bg-muted/50 p-6"
        role="img"
        aria-busy={isChartLoading}
        aria-live="polite"
        aria-label={`Grafico a barre: pratiche per stato. Dati: ${dataSourceLabel}.`}
      >
        <div
          className={cn(
            "flex h-full min-h-0 w-full items-end justify-between gap-4",
            isChartLoading &&
              "pointer-events-none opacity-45 transition-opacity duration-200",
          )}
        >
        {data.map((item) => {
          const heightPercent = getBarHeightPercent(item.value);
          const accentVar = getStatusAccentVar(item.key);
          const isHovered = hoveredKey === item.key;

          return (
            <div
              key={item.key}
              className="flex h-full w-full min-w-0 flex-1 flex-col items-center gap-3"
            >
              {/*
                L’altezza della barra deve essere una % *solo* dell’area disegnabile, non
                del blocco pieno con l’etichetta sopra, altrimenti i % in flex (specialmente
                mobile / `h-40`) si confondono e le barre compaiono con la stessa altezza.
                Slot: `h-40` sotto `sm` e `flex-1` da `sm+` con `min-h-0`; la barra è
                ancorata in basso in quel box così l’% si risolve in modo stabile.
              */}
              <div
                className="flex w-full min-h-40 flex-1 flex-col gap-1
                           sm:min-h-0 sm:flex-1"
              >
                {item.value > 0 && (
                  <span
                    className="shrink-0 text-center"
                    aria-label={`${item.label}: ${item.value}`}
                  >
                    <TextMorph className="text-foreground text-xs font-bold tabular-nums">
                      {item.value}
                    </TextMorph>
                  </span>
                )}
                <div className="relative w-full min-h-0 flex-1">
                  <div
                    className={cn(
                      "absolute right-0 bottom-0 left-0 overflow-visible rounded-4xl",
                      "transition-[height,box-shadow] duration-200 ease-out motion-reduce:transition-none",
                      "focus-visible:ring-primary focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2",
                    )}
                    style={
                      {
                        height: `${heightPercent}%`,
                        maxHeight: "100%",
                        minHeight: heightPercent > 0 ? "0.5rem" : 0,
                        backgroundColor: "transparent",
                      } as CSSProperties
                    }
                    title={`${item.label}: ${item.value}`}
                  >
                    <div
                    className={cn(
                      "h-full w-full cursor-pointer rounded-4xl border border-foreground/5",
                      "transition-all duration-200 ease-out motion-reduce:transition-none",
                      isChartLoading && "animate-pulse motion-reduce:animate-none",
                    )}
                    style={
                      {
                        backgroundColor: accentVar,
                        boxShadow: isHovered
                          ? `0 8px 24px color-mix(in oklab, ${accentVar} 30%, transparent)`
                          : "none",
                        willChange: isHovered ? "box-shadow" : "auto",
                      } as CSSProperties & Record<string, string>
                    }
                    aria-label={`${item.label}: ${item.value} pratiche`}
                    title={`${item.label}: ${item.value}`}
                    onMouseEnter={(e) => {
                      setHoveredKey(item.key);
                      setMousePosition({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => {
                      setHoveredKey(null);
                      setTooltipData(null);
                    }}
                  />
                </div>
                </div>
              </div>
              <span
                className="text-foreground w-full truncate text-center text-xs font-medium tracking-wide"
                title={item.label}
              >
                {item.label}
              </span>
            </div>
          );
        })}
        </div>
        {isChartLoading ? (
          <div
            className="bg-background/35 pointer-events-none absolute inset-0 flex items-center justify-center rounded-4xl backdrop-blur-[2px]"
            aria-hidden="true"
          >
            <span className="text-stats-title text-sm font-medium">
              Aggiornamento dati…
            </span>
          </div>
        ) : null}
      </div>
      <MouseTooltip
        x={mousePosition.x}
        y={mousePosition.y}
        label={tooltipData?.label ?? ""}
        value={tooltipData?.value ?? 0}
        isVisible={tooltipData !== null}
      />
    </>
  );
}
