import type { ReactNode } from "react";

import { CheckIcon, HalfStatusIcon, PraticheIcon, XIcon } from "@/components/icons";

interface DashboardCard {
  id: string;
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  iconClassName: string;
}

interface MiniTrendChartProps {
  data: number[];
  strokeColor?: string;
  height?: number;
}

// Small SVG chart used to show the overall trend at a glance.
function MiniTrendChart({
  data,
  strokeColor = "var(--green)",
  height = 80,
}: MiniTrendChartProps) {
  const width = 240;
  const padding = 6;
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
      viewBox={`0 0 ${width} ${height}`}
      className="h-20 w-full"
      aria-hidden="true"
    >
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function DashboardPage() {
  // Summary cards for the simplified dashboard overview.
  const dashboardCards: DashboardCard[] = [
    {
      id: "in-progress",
      title: "Pratiche in lavorazione",
      value: "12",
      description: "Aggiornate oggi",
      icon: <HalfStatusIcon size={18} aria-hidden="true" />,
      iconClassName: "text-stats-secondary",
    },
    {
      id: "completed",
      title: "Pratiche concluse",
      value: "45",
      description: "Ultimi 30 giorni",
      icon: <CheckIcon size={18} aria-hidden="true" />,
      iconClassName: "text-green",
    },
    {
      id: "suspended",
      title: "Pratiche sospese",
      value: "3",
      description: "In attesa di ripresa",
      icon: <XIcon size={18} aria-hidden="true" />,
      iconClassName: "text-stats-title",
    },
    {
      id: "total",
      title: "Totale pratiche",
      value: "60",
      description: "Contabilizzate ad oggi",
      icon: <PraticheIcon size={18} aria-hidden="true" />,
      iconClassName: "text-foreground",
    },
  ];

  // Fixed points keep the trend chart deterministic and lightweight.
  const trendData = [18, 20, 19, 22, 24, 23, 26, 28, 27, 30, 32, 31, 34, 36];

  return (
    <main className="bg-card m-2.5 flex flex-1 flex-col gap-6 overflow-hidden rounded-3xl px-9 py-6 font-medium">
      {/* Simple header for the dashboard overview */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-stats-title text-sm">
          Panoramica rapida delle pratiche in corso.
        </p>
      </header>

      {/* Four key cards focused on practice status */}
      <section aria-labelledby="practices-overview" className="flex flex-col gap-3">
        <h2 id="practices-overview" className="sr-only">
          Riepilogo pratiche
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {dashboardCards.map((card) => (
            <div key={card.id} className="bg-background flex flex-col gap-3 rounded-4xl p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-stats-title text-sm font-medium">
                  {card.title}
                </span>
                <span
                  className={`flex size-9 items-center justify-center rounded-full bg-muted ${card.iconClassName}`}
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

      {/* Small trend chart for overall andamento */}
      <section
        aria-labelledby="trend-heading"
        className="bg-background flex flex-col gap-3 rounded-4xl p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h2 id="trend-heading" className="text-stats-title text-sm font-medium">
              Andamento pratiche
            </h2>
            <p className="text-stats-title text-sm">Ultimi 14 giorni</p>
          </div>
          <span className="text-green text-sm font-medium">
            +8% rispetto al periodo precedente
          </span>
        </div>
        <div className="pt-2">
          <MiniTrendChart data={trendData} strokeColor="var(--green)" />
        </div>
      </section>
    </main>
  );
}
