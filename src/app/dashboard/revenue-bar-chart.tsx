"use client";

import type { CSSProperties } from "react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { PracticeStatusStats } from "@/lib/api";

/** Una colonna del grafico: stato + valore (es. Assegnate, 12) */
export interface StatusBarDatum {
  key: keyof PracticeStatusStats;
  label: string;
  value: number;
}

interface RevenueBarChartProps {
  /** Le 4 colonne in ordine: Assegnate, In lavorazione, Concluse, Sospese */
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
          <div className="tabular-nums">{value.toLocaleString("it-IT")}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getStatusAccentVar(key: keyof PracticeStatusStats): string {
  return key === "assegnata"
    ? "var(--status-assigned-accent)"
    : key === "in lavorazione"
      ? "var(--status-in-progress-accent)"
      : key === "conclusa"
        ? "var(--status-completed-accent)"
        : "var(--status-suspended-accent)";
}

/**
 * Grafico a barre verticali: 4 colonne fisse (Assegnate, In lavorazione, Concluse, Sospese).
 * I dati dipendono dal filtro operatore (operatore selezionato o totale studio).
 */
export function RevenueBarChart({
  data,
  dataSourceLabel,
}: RevenueBarChartProps) {
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
      <div
        className="bg-muted/50 flex h-full w-full items-end justify-between gap-4 rounded-4xl p-6"
        role="img"
        aria-label={`Grafico a barre: pratiche per stato. Dati: ${dataSourceLabel}.`}
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
              <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-end gap-1">
                {item.value > 0 && (
                  <span
                    className="text-foreground text-xs font-bold tabular-nums"
                    aria-label={`${item.label}: ${item.value}`}
                  >
                    {item.value}
                  </span>
                )}
                <div
                  className={[
                    "min-h-0 w-full overflow-visible rounded-4xl",
                    "transition-[height,box-shadow] duration-200 ease-out motion-reduce:transition-none",
                    "focus-visible:ring-primary focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2",
                  ].join(" ")}
                  style={
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: "transparent",
                    } as CSSProperties
                  }
                  title={`${item.label}: ${item.value}`}
                >
                  <div
                    className={[
                      "h-full w-full cursor-pointer rounded-4xl",
                      "transition-all duration-200 ease-out motion-reduce:transition-none",
                      "border-foreground/5 border",
                    ].join(" ")}
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
