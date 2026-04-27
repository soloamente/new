import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import {
  CheckIcon,
  DashboardIcon,
  UserCircleIcon,
  PraticheIcon,
} from "@/components/icons";
import { getCurrentUser } from "@/app/actions/auth-actions";
import {
  getStudioStatistics,
  type PracticeStatusStats,
  type StudioStatisticsResponse,
} from "@/lib/api";
import { ChartLoadingProvider } from "./chart-loading-context";
import { DashboardStatMorph } from "./dashboard-stat-morph";
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

function sumPracticeStats(stats: PracticeStatusStats): number {
  return stats.assegnata + stats.conclusa;
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
    conclusa: 0,
  };
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

  // Dati per il grafico: 2 colonne (Assegnate, Concluse).
  // Se è selezionato un operatore usiamo i suoi dati, altrimenti il totale studio.
  const chartStats: PracticeStatusStats =
    selectedOperatorId != null && activeOperator != null
      ? activeOperator.stats
      : studioTotal;
  const chartStatusData: StatusBarDatum[] = [
    { key: "assegnata", label: "Assegnate", value: chartStats.assegnata },
    { key: "conclusa", label: "Concluse", value: chartStats.conclusa },
  ];
  const chartDataSourceLabel =
    selectedOperatorId != null && activeOperator != null
      ? activeOperator.fullLabel
      : "Totale studio";

  // Summary cards use the same scope as the chart/legend: selected operator or whole studio.
  const cardsScopeDescription =
    selectedOperatorId != null && activeOperator != null
      ? activeOperator.fullLabel
      : "Totale studio";
  const cardsTotal = sumPracticeStats(chartStats);
  const dashboardCards: DashboardCard[] = [
    {
      id: "assigned",
      title: "Pratiche assegnate",
      value: chartStats.assegnata.toString(),
      description: cardsScopeDescription,
      icon: <UserCircleIcon size={84} aria-hidden="true" />,
      iconClassName: "text-stats-secondary",
    },
    {
      id: "completed",
      title: "Pratiche concluse",
      value: chartStats.conclusa.toString(),
      description: cardsScopeDescription,
      icon: <CheckIcon size={84} aria-hidden="true" />,
      iconClassName: "text-green",
    },
    {
      id: "total",
      title: "Totale pratiche",
      value: cardsTotal.toString(),
      description: cardsScopeDescription,
      icon: <PraticheIcon size={84} aria-hidden="true" />,
      iconClassName: "text-foreground",
    },
  ];

  return (
    <ChartLoadingProvider>
      <main className="bg-card m-2.5 flex flex-1 flex-col gap-2.5 overflow-hidden rounded-3xl px-9 pt-6 pb-6 font-medium">
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
            <div className="flex items-center gap-1.5">
              {[
                {
                  key: "assigned",
                  label: "Assegnata",
                  value: chartStats.assegnata,
                  accent: "var(--status-assigned-accent)",
                },
                {
                  key: "completed",
                  label: "Conclusa",
                  value: chartStats.conclusa,
                  accent: "var(--status-completed-accent)",
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
                    style={{ backgroundColor: item.accent }}
                    aria-hidden="true"
                  />
                  <span className="whitespace-nowrap">{item.label}</span>
                  <DashboardStatMorph className="text-foreground/80 tabular-nums">
                    {item.value.toLocaleString("it-IT")}
                  </DashboardStatMorph>
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

        <div className="grid h-full min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Grafico a barre semplificato e chiaro */}
          <section
            aria-labelledby="revenue-heading"
            // Main chart panel on the left; cards are now vertically stacked on the right.
            className="bg-background flex h-full min-h-0 flex-col gap-4 rounded-4xl p-6"
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
                Le colonne mostrano: Assegnate e Concluse. Usa il filtro
                operatore per vedere i dati di un operatore o il totale studio.
              </p>
            </div>

            <div className="flex h-full w-full items-end pt-1">
              {studioStatisticsError ? (
                <div className="bg-card text-stats-title flex h-full w-full items-center justify-center rounded-3xl px-6 text-sm">
                  {studioStatisticsError}
                </div>
              ) : user.role_id !== 2 ? (
                <div className="bg-card text-stats-title flex h-full w-full items-center justify-center rounded-3xl px-6 text-sm">
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

          {/* Overview cards: right side, vertical stack */}
          <section
            aria-labelledby="practices-overview"
            className="flex h-full min-h-0 flex-col gap-3"
          >
            <h2 id="practices-overview" className="sr-only">
              Riepilogo pratiche
            </h2>
            {dashboardCards.map((card) => (
              <div
                key={card.id}
                className="bg-background relative flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-4xl p-5"
              >
                <div className="relative z-10 flex items-center justify-between gap-3">
                  {/* Large titles on metric cards for ultra-wide viewports (pairs with oversized numeric values). */}
                  <span className="text-foreground text-2xl leading-tight font-semibold tracking-tight md:text-3xl">
                    {card.title}
                  </span>
                </div>
                <div className="relative z-10 flex items-baseline gap-2">
                  {/* Slightly smaller than before so metrics don’t overpower the layout on large screens */}
                  <DashboardStatMorph className="text-7xl leading-none font-semibold tracking-tight xl:text-8xl 2xl:text-9xl">
                    {card.value}
                  </DashboardStatMorph>
                </div>
                <p className="text-stats-secondary relative z-10 text-base md:text-lg">
                  <DashboardStatMorph className="text-inherit">
                    {card.description}
                  </DashboardStatMorph>
                </p>
                {/* Big decorative icon anchored to bottom-right to fill the card background. */}
                <span
                  className={`pointer-events-none absolute right-2 bottom-1 ${card.iconClassName} opacity-20`}
                  aria-hidden="true"
                >
                  {card.icon}
                </span>
              </div>
            ))}
          </section>
        </div>
      </main>
    </ChartLoadingProvider>
  );
}
