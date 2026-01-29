import type { CSSProperties, ReactNode } from "react";
import { redirect } from "next/navigation";

import {
  CheckIcon,
  DashboardIcon,
  HalfStatusIcon,
  PraticheIcon,
  XIcon,
} from "@/components/icons";
import { getCurrentUser } from "@/app/actions/auth-actions";
import {
  getStudioStatistics,
  type PracticeStatusStats,
  type StudioStatisticsResponse,
} from "@/lib/api";
import { OperatorStatisticsFilter } from "./operator-statistics-filter";
import { RevenueBarChart, type StatusBarDatum } from "./revenue-bar-chart";

interface DashboardCard {
  id: string;
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  iconClassName: string;
}

interface RevenueBarDatum {
  id: number;
  label: string;
  fullLabel: string;
  stats: PracticeStatusStats;
  total: number;
}

// RevenueBarChart is now a client component in ./revenue-bar-chart.tsx
// Removed old implementation - see revenue-bar-chart.tsx for the current version
function _unused_OldRevenueBarChart({
  data,
  activeOperatorId,
  activeOperatorName,
  selectedOperatorId,
}: {
  data: RevenueBarDatum[];
  activeOperatorId: number | null;
  activeOperatorName: string;
  selectedOperatorId: number | null;
}) {
  // Reference-driven style (see screenshot):
  // - One "pill" bar per bucket (here: operator) that fills the card height
  // - Inactive bars are neutral / muted
  // - One active bar uses a warm gradient (orange/yellow) + glow
  //
  // We keep the existing operator filter behavior:
  // - If an operator is selected: highlight them, dim the others
  // - Else: highlight the best operator (computed by caller and passed as `activeOperatorId`)
  const maxTotal = Math.max(...data.map((item) => item.total), 1);

  function getBarHeightPercent(total: number): number {
    if (total <= 0) return 0;
    const percent = (total / Math.max(maxTotal, 1)) * 100;
    // If the value is > 0 we force at least 1% so it doesn't disappear due to rounding.
    return Math.max(1, Math.round(percent));
  }

  function getActiveGlow(): string {
    // Use the shared chart tokens so theme changes stay consistent.
    // `color-mix()` works well with OKLCH tokens and produces a soft "neon" glow on dark cards.
    return `0 26px 90px color-mix(in oklab, var(--chart-5) 35%, transparent)`;
  }

  return (
    <div
      // NOTE: We add a subtle background + borders to ensure bars are visible
      // across themes (dark/light) and on low-contrast monitors.
      className="bg-muted/50 flex h-full w-full items-end justify-between gap-2 rounded-4xl p-4"
      role="img"
      aria-label={`Grafico a barre: totale pratiche per operatore. Operatore evidenziato: ${activeOperatorName}.`}
    >
      {data.map((item) => {
        const isFiltered = selectedOperatorId != null;
        const isSelected = isFiltered && item.id === selectedOperatorId;
        // Requirement:
        // - When "Tutti gli operatori": ALL bars are colored equally (no highlight, no grey).
        // - When a specific operator is selected: THAT column is highlighted, all others
        //   are grey/inactive (dimmed).
        const isHighlighted = isSelected;
        const isGreyInactive = isFiltered && !isSelected;
        // When no filter, all bars are "active" (colored). When filtered, only selected is active.
        const isActive = !isFiltered || isSelected;
        const barHeight = getBarHeightPercent(item.total);

        // Build the ordered list of status segments that will form the vertical stack
        // of bars inside each operator column. This lets us render "una barra sopra
        // l'altra" with a small gap between them.
        const segments: Array<{
          key: keyof PracticeStatusStats;
          label: string;
          value: number;
        }> = [
          {
            key: "assegnata",
            label: "Assegnata",
            value: item.stats.assegnata,
          },
          {
            key: "in lavorazione",
            label: "In lavorazione",
            value: item.stats["in lavorazione"],
          },
          {
            key: "conclusa",
            label: "Conclusa",
            value: item.stats.conclusa,
          },
          {
            key: "sospesa",
            label: "Sospesa",
            value: item.stats.sospesa,
          },
        ];

        // Order segments so that the bar with the largest value is always at the
        // bottom and the smallest is at the top. With `flex-col` + `justify-end`,
        // the last rendered item sits closest to the bottom edge.
        const orderedSegments = [...segments].sort((a, b) => a.value - b.value);

        function getSegmentHeightPercent(count: number, total: number): number {
          if (total <= 0 || count <= 0) return 0;
          const percent = (count / total) * 100;
          // Clamp to a small minimum so very small but non-zero values still
          // produce a visible bar segment.
          return Math.max(4, Math.round(percent));
        }

        function getSegmentGradient(
          statusKey: keyof PracticeStatusStats,
          inactive: boolean,
          shouldGlow: boolean,
        ): CSSProperties & Record<string, string> {
          if (inactive) {
            // Inactive operators: use bg-card solid color (applied via className),
            // no glow so the active column stands out clearly.
            return {
              boxShadow: "none",
            };
          }

          const accentVar =
            statusKey === "assegnata"
              ? "var(--status-assigned-accent)"
              : statusKey === "in lavorazione"
                ? "var(--status-in-progress-accent)"
                : statusKey === "conclusa"
                  ? "var(--status-completed-accent)"
                  : "var(--status-suspended-accent)";

          // Active segments: brighter, more saturated vertical gradient inspired by the
          // reference orange pill (lighter in the center, deeper towards the bottom),
          // with a *subtle* glow so it doesn't overpower the rest of the UI.
          return {
            backgroundImage: `linear-gradient(180deg,
              color-mix(in oklab, ${accentVar} 78%, white 22%),
              color-mix(in oklab, ${accentVar} 100%, black 0%)
            )`,
            boxShadow: shouldGlow
              ? `0 18px 55px color-mix(in oklab, ${accentVar} 38%, transparent)`
              : "none",
          };
        }

        return (
          <div
            key={item.fullLabel}
            className="flex h-full w-full min-w-0 flex-1 flex-col items-center gap-3"
          >
            <div
              // `min-h-0` is critical: it lets the flex child shrink properly and prevents
              // overflow from forcing the labels out of view.
              className="flex min-h-0 w-full flex-1 items-end justify-end"
            >
              <div
                // Use a focus ring so keyboard users can inspect values (via `title`) as well.
                // Hit target is guaranteed by the bar width + padding.
                className={[
                  // Shape container (no base border; borders live on each status bar).
                  // We intentionally keep overflow visible so that each state bar's glow
                  // can extend outside the pill without being clipped.
                  "min-h-0 w-full overflow-visible rounded-3xl",
                  // Animation rules: keep interactions snappy (<= 200ms) and disable for reduced motion.
                  "transition-[height,opacity,filter,box-shadow,transform] duration-200 ease-out motion-reduce:transition-none",
                  // Hover/focus only on pointer devices; keep it subtle (no layout shift).
                  "focus-visible:ring-primary focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2",
                  // When filtered, we visually downplay non-selected operators.
                  isGreyInactive ? "opacity-70" : "opacity-100",
                ].join(" ")}
                style={
                  {
                    height: `${barHeight}%`,
                    // Container keeps only the height; the glow is applied to the
                    // individual state bars so each pill has its own luminous halo.
                    backgroundColor: "transparent",
                  } as CSSProperties & Record<string, string>
                }
                title={[
                  `${item.fullLabel} • Totale: ${item.total}`,
                  `Assegnata: ${item.stats.assegnata}`,
                  `In lavorazione: ${item.stats["in lavorazione"]}`,
                  `Conclusa: ${item.stats.conclusa}`,
                  `Sospesa: ${item.stats.sospesa}`,
                ].join("\n")}
              >
                {/* Inner vertical stack: one bar per status, with a small `gap-1`
                    between them. This satisfies “le barre per colonne dell'operatore
                    devono essere separate” while keeping the total column height
                    proportional to the operator total. */}
                <div className="flex h-full flex-col justify-end gap-2 p-px">
                  {orderedSegments.map((segment) => {
                    const segmentHeight = getSegmentHeightPercent(
                      segment.value,
                      item.total,
                    );

                    if (segmentHeight <= 0) {
                      return null;
                    }

                    const segmentStyle = getSegmentGradient(
                      segment.key,
                      isGreyInactive,
                      // Glow only when there is an active operator filter
                      // and this column is the selected operator.
                      isFiltered && isSelected,
                    );

                    return (
                      <div
                        key={segment.key}
                        className={[
                          "w-full rounded-3xl",
                          isGreyInactive
                            ? "bg-card border-border/70 border"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        style={
                          {
                            height: `${segmentHeight}%`,
                            ...segmentStyle,
                          } as CSSProperties & Record<string, string>
                        }
                        aria-hidden="true"
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            <span
              className={[
                "w-full truncate text-center text-xs font-medium tracking-wide",
                isActive ? "text-foreground" : "text-stats-title",
              ].join(" ")}
              title={item.fullLabel}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function sumPracticeStats(stats: PracticeStatusStats): number {
  return (
    stats.assegnata + stats["in lavorazione"] + stats.conclusa + stats.sospesa
  );
}

function getErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;
  const maybeStatus = (error as { status?: unknown }).status;
  return typeof maybeStatus === "number" ? maybeStatus : null;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ operator_id?: string }>;
}) {
  // Next.js 15: searchParams is a Promise, must be awaited.
  const resolvedSearchParams = await searchParams;

  // Check if user is authenticated and is not an operator
  const user = await getCurrentUser();

  // Redirect operators to "Le mie pratiche" - they don't have access to dashboard
  if (user?.role_id === 3) {
    redirect("/mie-pratiche");
  }

  // If not authenticated, redirect to login (handled by middleware/layout)
  if (!user) {
    redirect("/login");
  }

  // Fetch studio statistics only for AMMINISTRATORE_STUDIO.
  // The backend returns 403 for other roles, so we avoid calling it for them.
  let studioStatistics: StudioStatisticsResponse | null = null;
  let studioStatisticsError: string | null = null;
  if (user.role_id === 2) {
    try {
      studioStatistics = await getStudioStatistics();
    } catch (error: unknown) {
      const status = getErrorStatus(error);
      if (status === 401) {
        studioStatisticsError =
          "Sessione scaduta o token non valido. Effettua nuovamente l’accesso.";
      } else if (status === 403) {
        studioStatisticsError =
          "Non hai i permessi per vedere le statistiche di studio.";
      } else {
        studioStatisticsError =
          error instanceof Error
            ? error.message
            : "Errore nel caricamento delle statistiche.";
      }
    }
  }

  const studioTotal = studioStatistics?.studio_total ?? {
    assegnata: 0,
    "in lavorazione": 0,
    conclusa: 0,
    sospesa: 0,
  };
  const studioTotalAll = sumPracticeStats(studioTotal);

  // Summary cards for the simplified dashboard overview.
  const dashboardCards: DashboardCard[] = [
    {
      id: "in-progress",
      title: "Pratiche in lavorazione",
      value: studioTotal["in lavorazione"].toString(),
      description: "Totale studio",
      icon: <HalfStatusIcon size={18} aria-hidden="true" />,
      iconClassName: "text-stats-secondary",
    },
    {
      id: "completed",
      title: "Pratiche concluse",
      value: studioTotal.conclusa.toString(),
      description: "Totale studio",
      icon: <CheckIcon size={18} aria-hidden="true" />,
      iconClassName: "text-green",
    },
    {
      id: "suspended",
      title: "Pratiche sospese",
      value: studioTotal.sospesa.toString(),
      description: "Totale studio",
      icon: <XIcon size={18} aria-hidden="true" />,
      iconClassName: "text-stats-title",
    },
    {
      id: "total",
      title: "Totale pratiche",
      value: studioTotalAll.toString(),
      description: "Totale studio",
      icon: <PraticheIcon size={18} aria-hidden="true" />,
      iconClassName: "text-foreground",
    },
  ];

  const chartData: RevenueBarDatum[] = (studioStatistics?.operators ?? []).map(
    (operator) => {
      const total = sumPracticeStats(operator.stats);
      return {
        id: operator.operator_id,
        // Requested: do not show initials; show the operator name.
        // We keep `title` for the full name and truncate in the UI to avoid layout breaks.
        label: operator.operator_name,
        fullLabel: operator.operator_name,
        stats: operator.stats,
        total,
      };
    },
  );

  // Operator filter via URL param (keeps state shareable/back-button friendly).
  const requestedOperatorIdRaw = resolvedSearchParams?.operator_id?.trim();
  const requestedOperatorId = requestedOperatorIdRaw
    ? Number(requestedOperatorIdRaw)
    : Number.NaN;
  const selectedOperatorIdById =
    Number.isFinite(requestedOperatorId) &&
    chartData.some((operator) => operator.id === requestedOperatorId)
      ? requestedOperatorId
      : null;
  // Defensive: also accept operator name in the URL (e.g. if a client accidentally writes it).
  const selectedOperatorIdByName =
    selectedOperatorIdById == null && requestedOperatorIdRaw
      ? (chartData.find(
          (operator) =>
            operator.fullLabel.toLowerCase() ===
            requestedOperatorIdRaw.toLowerCase(),
        )?.id ?? null)
      : null;
  const selectedOperatorId = selectedOperatorIdById ?? selectedOperatorIdByName;

  // Active operator: selected one (if set), otherwise the one with the highest total.
  const activeOperator =
    (selectedOperatorId != null
      ? (chartData.find((operator) => operator.id === selectedOperatorId) ??
        null)
      : chartData.reduce<RevenueBarDatum | null>(
          (best, current) =>
            best && best.total >= current.total ? best : current,
          chartData[0] ?? null,
        )) ?? null;
  const activeOperatorId = activeOperator?.id ?? null;
  const activeOperatorName = activeOperator?.fullLabel ?? "—";

  // Dati per il grafico: 4 colonne (Assegnate, In lavorazione, Concluse, Sospese).
  // Se è selezionato un operatore usiamo i suoi dati, altrimenti il totale studio.
  const chartStats: PracticeStatusStats =
    selectedOperatorId != null && activeOperator != null
      ? activeOperator.stats
      : studioTotal;
  const chartStatusData: StatusBarDatum[] = [
    { key: "assegnata", label: "Assegnate", value: chartStats.assegnata },
    {
      key: "in lavorazione",
      label: "In lavorazione",
      value: chartStats["in lavorazione"],
    },
    { key: "conclusa", label: "Concluse", value: chartStats.conclusa },
    { key: "sospesa", label: "Sospese", value: chartStats.sospesa },
  ];
  const chartDataSourceLabel =
    selectedOperatorId != null && activeOperator != null
      ? activeOperator.fullLabel
      : "Totale studio";

  return (
    <main className="bg-card m-2.5 flex flex-1 flex-col gap-2.5 overflow-hidden rounded-3xl px-9 pt-6 font-medium">
      {/* Header - Info Container (kept consistent with other pages like Studi/Pratiche) */}
      <div className="relative flex w-full flex-col gap-4.5">
        {/* Header - Title */}
        <div className="flex items-center justify-between gap-2.5">
          <h1 className="flex items-center justify-center gap-3.5">
            <DashboardIcon />
            <span>Dashboard</span>
          </h1>
        </div>

        {/* Header - Filters & Legend (above the card, like other pages) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left side: Legend badges (stesso dato del grafico: operatore selezionato o totale studio) */}
          <div className="flex items-center">
            {[
              {
                key: "assigned",
                label: "Assegnata",
                value: chartStats.assegnata,
                accent: "var(--status-assigned-accent)",
              },
              {
                key: "in-progress",
                label: "In lavorazione",
                value: chartStats["in lavorazione"],
                accent: "var(--status-in-progress-accent)",
              },
              {
                key: "completed",
                label: "Conclusa",
                value: chartStats.conclusa,
                accent: "var(--status-completed-accent)",
              },
              {
                key: "suspended",
                label: "Sospesa",
                value: chartStats.sospesa,
                accent: "var(--status-suspended-accent)",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="bg-background flex items-center justify-center gap-2.5 rounded-full px-4.25 py-1.75 text-sm"
                aria-label={`${item.label}: ${item.value}`}
                title={`${item.label}: ${item.value}`}
              >
                {/* Color marker so users can map legend <-> bars instantly */}
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: item.accent } as CSSProperties}
                  aria-hidden="true"
                />
                <span className="whitespace-nowrap">{item.label}</span>
                <span className="text-foreground/80 tabular-nums">
                  {item.value.toLocaleString("it-IT")}
                </span>
              </div>
            ))}
          </div>

          {/* Right side: Operator filter */}
          <OperatorStatisticsFilter
            operators={chartData.map((operator) => ({
              id: operator.id,
              name: operator.fullLabel,
            }))}
            selectedOperatorId={selectedOperatorId}
            disabled={chartData.length === 0}
          />
        </div>
      </div>

      {/* Grafico a barre semplificato e chiaro */}
      <section
        aria-labelledby="revenue-heading"
        // Card made even taller so vertical bars can stretch further and remain very easy to compare.
        className="bg-background flex h-[750px] flex-col gap-4 rounded-4xl p-6"
      >
        {/* Titolo chiaro del grafico */}
        <div className="flex flex-col gap-1">
          <h2
            id="revenue-heading"
            className="text-foreground text-base font-semibold"
          >
            Pratiche per stato
          </h2>
          <p className="text-stats-title text-sm">
            Le quattro colonne sono: Assegnate, In lavorazione, Concluse,
            Sospese. Usa il filtro operatore per vedere i dati di un operatore o
            il totale studio.
          </p>
        </div>

        <div className="flex h-full w-full items-end pt-1">
          {studioStatisticsError ? (
            <div className="bg-muted/20 text-stats-title flex h-full w-full items-center justify-center rounded-3xl px-6 text-sm">
              {studioStatisticsError}
            </div>
          ) : user.role_id !== 2 ? (
            <div className="bg-muted/20 text-stats-title flex h-full w-full items-center justify-center rounded-3xl px-6 text-sm">
              Grafico disponibile solo per Amministratore Studio.
            </div>
          ) : (
            <RevenueBarChart
              data={chartStatusData}
              dataSourceLabel={chartDataSourceLabel}
            />
          )}
        </div>
      </section>

      {/* Four key cards focused on practice status (requested: place them under the chart card). */}
      <section
        aria-labelledby="practices-overview"
        className="flex flex-col gap-3"
      >
        <h2 id="practices-overview" className="sr-only">
          Riepilogo pratiche
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-2">
          {dashboardCards.map((card) => (
            <div
              key={card.id}
              className="bg-background flex flex-col gap-3 rounded-4xl p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-stats-title text-sm font-medium">
                  {card.title}
                </span>
                <span
                  className={`bg-muted flex size-9 items-center justify-center rounded-full ${card.iconClassName}`}
                  aria-hidden="true"
                >
                  {card.icon}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold">{card.value}</span>
              </div>
              <p className="text-stats-title text-sm">{card.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
