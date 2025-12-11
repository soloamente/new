"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRightIcon,
  CheckIcon,
  HalfStatusIcon,
  XIcon,
} from "@/components/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Mock data for recent activities
interface ActivityRow {
  id: string;
  started: string;
  pratica: string;
  operator: string;
  duration: string;
  status: "completed" | "in_progress" | "suspended";
}

const mockActivities: ActivityRow[] = [
  {
    id: "act-1",
    started: "5 min fa",
    pratica: "P-10231",
    operator: "Alice Rizzi",
    duration: "12 giorni",
    status: "completed",
  },
  {
    id: "act-2",
    started: "15 min fa",
    pratica: "P-10218",
    operator: "Marco Rosali",
    duration: "8 giorni",
    status: "in_progress",
  },
  {
    id: "act-3",
    started: "1 ora fa",
    pratica: "P-10194",
    operator: "Giulia Verdi",
    duration: "15 giorni",
    status: "completed",
  },
  {
    id: "act-4",
    started: "2 ore fa",
    pratica: "P-10177",
    operator: "Luca Ferrari",
    duration: "10 giorni",
    status: "completed",
  },
  {
    id: "act-5",
    started: "3 ore fa",
    pratica: "P-10139",
    operator: "Sofia Bianchi",
    duration: "20 giorni",
    status: "suspended",
  },
];

// Mock data for time series (for charts)
// Generate deterministic data using a seeded random function to avoid hydration mismatches
const generateTimeSeries = (
  baseValue: number,
  variance = 0.1,
  seed?: number,
) => {
  const points = 20;
  // Use a simple seeded random function for consistent values
  let currentSeed = seed ?? Math.floor(baseValue * 1000);
  const seededRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  return Array.from({ length: points }, () => {
    const variation = (seededRandom() - 0.5) * variance;
    return baseValue * (1 + variation);
  });
};

// Simple SVG Line Chart Component
function MiniLineChart({
  data,
  color = "var(--green)",
  height = 40,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const width = 200;
  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(" L ")}`;

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible"
      style={{ minWidth: width }}
    >
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// Simple SVG Bar Chart Component
function MiniBarChart({
  data,
  colors,
  height = 60,
}: {
  data: number[];
  colors: string[];
  height?: number;
}) {
  const width = 200;
  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const barWidth = chartWidth / data.length - 2;
  const max = Math.max(...data, 1);

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible"
      style={{ minWidth: width }}
    >
      {data.map((value, index) => {
        const barHeight = (value / max) * chartHeight;
        const x = padding + index * (barWidth + 2);
        const y = padding + chartHeight - barHeight;

        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={colors[index] ?? colors[0]}
            rx="2"
          />
        );
      })}
    </svg>
  );
}

export default function DashboardPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [selectedTab, setSelectedTab] = useState<"live" | "upcoming">("live");

  // Mock stats data - metriche di business
  const completedThisMonth = 45;
  // Use seeded random generation to ensure consistent values between server and client
  const completedData = generateTimeSeries(45, 0.15, 45000);

  const averageCompletionDays = 12;
  const averageDaysData = generateTimeSeries(12, 0.2, 12000);

  const practicesDueSoon = 8;
  const dueSoonData = generateTimeSeries(8, 0.25, 8000);

  const totalPractices = 20;
  const activePractices = 12;
  const pausedPractices = 3;

  const completedCount = 15;
  const inProgressCount = 5;
  const completionRate = 75;

  const mostCommonTypes = [
    {
      name: "Mutuo Prima Casa",
      count: 36,
      percentage: 42,
    },
    {
      name: "Cessione del Quinto",
      count: 18,
      percentage: 21,
    },
    {
      name: "Prestito Personale",
      count: 15,
      percentage: 17,
    },
  ];

  const statusStyles = {
    completed: {
      label: "Completata",
      className: "text-green",
      icon: <CheckIcon size={16} />,
    },
    in_progress: {
      label: "In lavorazione",
      className: "text-stats-secondary",
      icon: <HalfStatusIcon size={16} />,
    },
    failed: {
      label: "Fallita",
      className: "text-destructive",
      icon: <XIcon size={16} />,
    },
    suspended: {
      label: "Sospesa",
      className: "text-stats-title",
      icon: <XIcon size={16} />,
    },
  };

  const timeRanges = [
    { label: "1H", value: "1h" },
    { label: "4H", value: "4h" },
    { label: "24H", value: "24h" },
    { label: "72H", value: "72h" },
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabElementRef = useRef<HTMLButtonElement>(null);
  const baseListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const activeTabElement = activeTabElementRef.current;
    const baseList = baseListRef.current;

    if (selectedTimeRange && container && activeTabElement && baseList) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        // Use the base list dimensions as the reference for calculations
        const listHeight = baseList.offsetHeight;
        const { offsetLeft, offsetWidth } = activeTabElement;

        // Container width is set to 100% via CSS, so we use the container's actual width
        const containerWidth = container.offsetWidth;
        container.style.height = `${listHeight}px`;

        // Calculate clip-path percentages based on the container width
        const clipLeftPercent = (offsetLeft / containerWidth) * 100;
        const clipRightPercent =
          100 - ((offsetLeft + offsetWidth) / containerWidth) * 100;

        // Ensure clip-path values are within valid range
        const safeClipLeft = Math.max(0, Math.min(100, clipLeftPercent));
        const safeClipRight = Math.max(0, Math.min(100, clipRightPercent));

        container.style.clipPath = `inset(0 ${safeClipRight.toFixed(2)}% 0 ${safeClipLeft.toFixed(2)}% round 17px)`;
      });
    }
  }, [selectedTimeRange]);

  return (
    <main className="bg-card m-2.5 flex flex-1 flex-col gap-2.5 overflow-hidden rounded-3xl px-9 pt-6 font-medium">
      {/* Header */}
      <div className="relative flex w-full flex-col">
        {/* Time Range Selector and Analytics Button */}
        <div className="relative flex items-center justify-between">
          <div className="relative flex flex-1 items-center">
            {/* Base list - visible buttons */}
            <ul ref={baseListRef} className="relative flex items-center gap-2">
              {timeRanges.map((range) => (
                <li key={range.value}>
                  <button
                    ref={
                      selectedTimeRange === range.value
                        ? activeTabElementRef
                        : null
                    }
                    data-tab={range.value}
                    onClick={() => setSelectedTimeRange(range.value)}
                    className={cn(
                      "flex h-[34px] cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
                      selectedTimeRange === range.value
                        ? "text-foreground"
                        : "text-stats-title hover:text-foreground",
                    )}
                  >
                    {range.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Overlay list - clipped with background */}
            <div
              ref={containerRef}
              aria-hidden
              className="clip-path-container bg-background"
            >
              <ul className="relative flex items-center gap-2">
                {timeRanges.map((range) => (
                  <li key={range.value}>
                    <button
                      data-tab={range.value}
                      onClick={() => setSelectedTimeRange(range.value)}
                      className="text-foreground flex h-[34px] cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium"
                      tabIndex={-1}
                    >
                      {range.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button className="bg-background flex items-center gap-2 rounded-full px-3.75 py-1.75 text-sm">
            Analitiche
            <ArrowUpRightIcon size={16} />
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex min-h-0 flex-1 flex-col gap-12 overflow-y-auto">
        {/* KPI Cards */}
        <div className="flex flex-col gap-1.5">
          <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-3">
            {/* Pratiche completate questo mese */}
            <div className="bg-background flex flex-col gap-4 rounded-4xl p-5">
              <h3 className="text-stats-title text-sm font-medium">
                Pratiche completate questo mese
              </h3>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-semibold">{completedThisMonth}</h2>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-stats-title">
                    +12 rispetto al mese scorso
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stats-title">
                    Obiettivo mensile: 50 pratiche
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <MiniLineChart data={completedData} color="var(--green)" />
              </div>
            </div>

            {/* Tempo medio di completamento */}
            <div className="bg-background flex flex-col gap-4 rounded-4xl p-5">
              <h3 className="text-stats-title text-sm font-medium">
                Tempo medio di completamento
              </h3>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-semibold">
                  {averageCompletionDays} giorni
                </h2>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-stats-title">Minimo: 5 giorni</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stats-title">Massimo: 28 giorni</span>
                </div>
              </div>
              <div className="mt-2">
                <MiniLineChart data={averageDaysData} color="var(--green)" />
              </div>
            </div>

            {/* Pratiche in scadenza */}
            <div className="bg-background flex flex-col gap-4 rounded-4xl p-5">
              <h3 className="text-stats-title text-sm font-medium">
                Pratiche in scadenza
              </h3>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-semibold">{practicesDueSoon}</h2>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-stats-title">
                    Nei prossimi 7 giorni
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stats-title">
                    Richiedono attenzione urgente
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <MiniLineChart
                  data={dueSoonData}
                  color="var(--status-in-progress-accent)"
                />
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-3">
            {/* Total Practices */}
            <div className="bg-background flex flex-col gap-4 rounded-4xl p-5">
              <h3 className="text-stats-title text-sm font-medium">
                Pratiche totali
              </h3>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-semibold">{totalPractices}</h2>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green">{activePractices} attive</span>
                <span className="text-stats-secondary">
                  {pausedPractices} in pausa
                </span>
              </div>
              <div className="mt-2">
                <MiniBarChart
                  data={[activePractices, pausedPractices]}
                  colors={["var(--green)", "var(--stats-secondary)"]}
                />
              </div>
            </div>

            {/* Tasso di completamento */}
            <div className="bg-background flex flex-col gap-4 rounded-4xl p-5">
              <h3 className="text-stats-title text-sm font-medium">
                Tasso di completamento
              </h3>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-semibold">{completionRate}%</h2>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green">{completedCount} completate</span>
                <span className="text-stats-secondary">
                  {inProgressCount} in corso
                </span>
              </div>
              <div className="mt-2">
                <MiniBarChart
                  data={[completedCount, inProgressCount]}
                  colors={["var(--green)", "var(--stats-secondary)"]}
                />
              </div>
            </div>

            {/* Tipologie più comuni */}
            <div className="bg-background flex flex-col gap-4 rounded-4xl p-5">
              <h3 className="text-stats-title text-sm font-medium">
                Tipologie più comuni
              </h3>
              <div className="flex flex-col gap-3">
                {mostCommonTypes.map((type, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{type.name}</span>
                      <span className="text-stats-title">
                        {type.count} pratiche
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-stats-title text-xs">
                        {type.percentage}% del totale
                      </span>
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${type.percentage}%`,
                          backgroundColor: "var(--green)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Live Feed Section */}
        <div className="flex flex-col gap-4">
          {/* Tabs and Action Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedTab("live")}
                className={cn(
                  "relative flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors",
                  selectedTab === "live"
                    ? "bg-background text-foreground"
                    : "text-stats-title hover:text-foreground",
                )}
              >
                Feed live
                {selectedTab === "live" && (
                  <div className="bg-background absolute -top-1 -right-1 overflow-hidden rounded-full p-1">
                    <span className="halo" />
                    <span className="bg-destructive relative z-10 block size-2.5 rounded-full" />
                  </div>
                )}
              </button>
              <button
                onClick={() => setSelectedTab("upcoming")}
                className={cn(
                  "cursor-pointer rounded-full px-3 py-1.5 text-sm transition-colors",
                  selectedTab === "upcoming"
                    ? "bg-background text-foreground"
                    : "text-stats-title hover:text-foreground",
                )}
              >
                Programmazione
              </button>
            </div>
            <button className="bg-background flex items-center gap-2 rounded-full px-3.75 py-1.75 text-sm">
              Esecuzioni e log
              <ArrowUpRightIcon size={16} />
            </button>
          </div>

          {/* Activity Table */}
          <div className="bg-background overflow-hidden rounded-4xl">
            <div className="bg-table-header px-3 py-2.25">
              <div className="text-table-header-foreground grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 text-sm font-medium">
                <div>Iniziata</div>
                <div>Pratica</div>
                <div>Operatore</div>
                <div>Durata</div>
                <div>Stato</div>
                <div>Note</div>
              </div>
            </div>
            <div className="divide-border divide-y">
              {mockActivities.map((activity) => {
                const statusStyle = statusStyles[activity.status];
                return (
                  <div
                    key={activity.id}
                    className="hover:bg-muted/50 grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-3 py-4 text-sm transition-colors"
                  >
                    <div>{activity.started}</div>
                    <div className="font-semibold">{activity.pratica}</div>
                    <div className="flex items-center gap-2">
                      <Avatar aria-hidden className="bg-background size-6">
                        <AvatarFallback placeholderSeed={activity.operator} />
                      </Avatar>
                      <span className="truncate">{activity.operator}</span>
                    </div>
                    <div>{activity.duration}</div>
                    <div className="flex items-center gap-2">
                      <span className={statusStyle.className}>
                        {statusStyle.icon}
                      </span>
                      <span className={statusStyle.className}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <div className="text-stats-title">
                      {activity.status === "completed" &&
                        "Pratica completata con successo"}
                      {activity.status === "in_progress" &&
                        "In attesa di documentazione"}
                      {activity.status === "suspended" &&
                        "Sospesa su richiesta cliente"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
