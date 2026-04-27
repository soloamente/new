"use client";

import { TextMorph } from "torph/react";

import { cn } from "@/lib/utils";

interface DashboardStatMorphProps {
  /**
   * TextMorph only morphs plain text/numbers — pass formatted strings when using
   * `toLocaleString("it-IT")` so the morph matches what users read.
   */
  children: string | number;
  className?: string;
}

/**
 * Dashboard copy with torph morph when props change (numbers, operator name, “Totale studio”, …).
 */
export function DashboardStatMorph({
  children,
  className,
}: DashboardStatMorphProps) {
  return <TextMorph className={cn(className)}>{children}</TextMorph>;
}
