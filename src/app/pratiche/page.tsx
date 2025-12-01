"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowUpRightIcon,
  CheckIcon,
  HalfStatusIcon,
  PraticheIcon,
  SearchIcon,
  UserCircleIcon,
  XIcon,
} from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FaChevronDown, FaPlus } from "react-icons/fa";
import { AnimateNumber } from "motion-plus/react";
type PracticeStatus = "assigned" | "in_progress" | "completed" | "cancelled";

interface PracticeRow {
  id: string;
  praticaNumber: string;
  date: string;
  internalOperator: string;
  client: string;
  type: string;
  note: string | undefined;
  status: PracticeStatus;
}

const internalOperators = {
  aliceRizzi: {
    name: "Alice Rizzi",
    avatar: "alice-rizzi",
    email: "alice.rizzi@example.com",
    phone: "1234567890",
    imageUrl: "/icons/placeholders/alice-rizzi.jpg",
  },
  marcoRosali: {
    name: "Marco Rosali",
    avatar: "marco-rosali",
    email: "marco.rosali@example.com",
    phone: "1234567890",
    imageUrl: "/icons/placeholders/maco-rosali.png",
  },
  giuliaVerdi: {
    name: "Giulia Verdi",
    avatar: "giulia-verdi",
    email: "giulia.verdi@example.com",
    phone: "1234567890",
    imageUrl: "/icons/placeholders/giulia-verdi.png",
  },
  lucaFerrari: {
    name: "Luca Ferrari",
    avatar: "luca-ferrari",
    email: "luca.ferrari@example.com",
    phone: "1234567890",
    imageUrl: "/icons/placeholders/luca-ferrari.jpg",
  },
  sofiaBianchi: {
    name: "Sofia Bianchi",
    avatar: "sofia-bianchi",
    email: "sofia.bianchi@example.com",
    phone: "1234567890",
    imageUrl: "/icons/placeholders/sofia-bianchi.jpg",
  },
  andreaRossi: {
    name: "Andrea Rossi",
    avatar: "andrea-rossi",
    email: "andrea.rossi@example.com",
    phone: "1234567890",
    imageUrl: "/icons/placeholders/andrea-rossi.jpg",
  },
  elenaMartini: {
    name: "Elena Martini",
    avatar: "elena-martini",
    email: "elena.martini@example.com",
    phone: "1234567890",
    imageUrl: "/icons/placeholders/elena-martini.jpg",
  },
  davideRomano: {
    name: "Davide Romano",
    avatar: "davide-romano",
    email: "davide.romano@example.com",
    phone: "1234567890",
    imageUrl: "/icons/placeholders/davide-romano.jpg",
  },
};

// Component to show tooltip only when text is truncated
function NoteWithTooltip({ note }: { note: string }) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(
          textRef.current.scrollWidth > textRef.current.clientWidth,
        );
      }
    };

    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      checkTruncation();
    });

    window.addEventListener("resize", checkTruncation);

    return () => {
      window.removeEventListener("resize", checkTruncation);
    };
  }, [note]);

  const noteSpan = (
    <span ref={textRef} className="block w-full truncate text-left">
      {note}
    </span>
  );

  if (!isTruncated) {
    return noteSpan;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          ref={textRef}
          className="block w-full cursor-help truncate text-left"
        >
          {note}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={4} className="max-w-md">
        <p className="">{note}</p>
      </TooltipContent>
    </Tooltip>
  );
}

const practiceStatusStyles: Record<
  PracticeStatus,
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
  cancelled: {
    label: "Annullata",
    accent: "var(--status-cancelled-accent)",
    background: "var(--status-cancelled-background)",
    icon: <XIcon />,
    iconColor: "var(--status-cancelled-icon)",
  },
};

const mockPractices: PracticeRow[] = [
  {
    id: "P-10231",
    praticaNumber: "P-10231",
    date: "12 Nov 2025, 09:32",
    internalOperator: internalOperators.aliceRizzi.name,
    client: "Marco Bianchi",
    type: "Mutuo Prima Casa",
    note: "Richiesta integrazione redditi",
    status: "assigned",
  },
  {
    id: "P-10218",
    praticaNumber: "P-10218",
    date: "10 Nov 2025, 15:10",
    internalOperator: internalOperators.marcoRosali.name,
    client: "Sara Martini",
    type: "Cessione del Quinto",
    note: "In verifica con banca partner",
    status: "assigned",
  },
  {
    id: "P-10194",
    praticaNumber: "P-10194",
    date: "07 Nov 2025, 11:47",
    internalOperator: internalOperators.giuliaVerdi.name,
    client: "Luca Esposito",
    type: "Prestito Business",
    note: undefined,
    status: "in_progress",
  },
  {
    id: "P-10177",
    praticaNumber: "P-10177",
    date: "05 Nov 2025, 17:25",
    internalOperator: internalOperators.lucaFerrari.name,
    client: "Helios S.p.A.",
    type: "Finanziamento PMI",
    note: "Firma digitale completata",
    status: "completed",
  },
  {
    id: "P-10139",
    praticaNumber: "P-10139",
    date: "28 Ott 2025, 08:05",
    internalOperator: internalOperators.sofiaBianchi.name,
    client: "Chiara D'Amico",
    type: "Consolidamento debiti",
    note: "Contatto cliente programmato",
    status: "cancelled",
  },
  {
    id: "P-10115",
    praticaNumber: "P-10115",
    date: "25 Ott 2025, 14:20",
    internalOperator: internalOperators.andreaRossi.name,
    client: "Roberto Ferrari",
    type: "Mutuo Prima Casa",
    note: "Documentazione in revisione",
    status: "in_progress",
  },
  {
    id: "P-10089",
    praticaNumber: "P-10089",
    date: "22 Ott 2025, 10:15",
    internalOperator: internalOperators.elenaMartini.name,
    client: "Elena Romano",
    type: "Prestito Personale",
    note: undefined,
    status: "completed",
  },
  {
    id: "P-10067",
    praticaNumber: "P-10067",
    date: "20 Ott 2025, 16:45",
    internalOperator: internalOperators.davideRomano.name,
    client: "Andrea Conti",
    type: "Cessione del Quinto",
    note: "In attesa di risposta cliente",
    status: "assigned",
  },
  {
    id: "P-10045",
    praticaNumber: "P-10045",
    date: "18 Ott 2025, 11:30",
    internalOperator: internalOperators.aliceRizzi.name,
    client: "Francesca Russo",
    type: "Finanziamento PMI",
    note: "Perfezionamento pratiche completato",
    status: "completed",
  },
  {
    id: "P-10032",
    praticaNumber: "P-10032",
    date: "15 Ott 2025, 09:50",
    internalOperator: internalOperators.marcoRosali.name,
    client: "Davide Lombardi",
    type: "Prestito Business",
    note: undefined,
    status: "in_progress",
  },
  {
    id: "P-10018",
    praticaNumber: "P-10018",
    date: "12 Ott 2025, 13:25",
    internalOperator: internalOperators.giuliaVerdi.name,
    client: "Sofia Greco",
    type: "Consolidamento debiti",
    note: "Pratica annullata su richiesta cliente",
    status: "cancelled",
  },
  {
    id: "P-9998",
    praticaNumber: "P-9998",
    date: "10 Ott 2025, 08:40",
    internalOperator: internalOperators.lucaFerrari.name,
    client: "Mario Rossi",
    type: "Mutuo Prima Casa",
    note: "Nuova pratica da assegnare",
    status: "assigned",
  },
  {
    id: "P-9985",
    praticaNumber: "P-9985",
    date: "08 Ott 2025, 15:20",
    internalOperator: internalOperators.sofiaBianchi.name,
    client: "Tech Solutions S.r.l.",
    type: "Finanziamento PMI",
    note: "Acquisto macchinari approvato",
    status: "completed",
  },
  {
    id: "P-9972",
    praticaNumber: "P-9972",
    date: "05 Ott 2025, 10:10",
    internalOperator: internalOperators.andreaRossi.name,
    client: "Laura Bianco",
    type: "Prestito Personale",
    note: "Valutazione creditizia completata",
    status: "in_progress",
  },
  {
    id: "P-9961",
    praticaNumber: "P-9961",
    date: "02 Ott 2025, 14:55",
    internalOperator: internalOperators.elenaMartini.name,
    client: "Giuseppe Verdi",
    type: "Cessione del Quinto",
    note: undefined,
    status: "in_progress",
  },
  {
    id: "P-9948",
    praticaNumber: "P-9948",
    date: "30 Set 2025, 09:15",
    internalOperator: internalOperators.davideRomano.name,
    client: "Anna Moretti",
    type: "Mutuo Prima Casa",
    note: "Istruttoria completata con successo",
    status: "completed",
  },
  {
    id: "P-9935",
    praticaNumber: "P-9935",
    date: "27 Set 2025, 16:30",
    internalOperator: internalOperators.aliceRizzi.name,
    client: "Paolo Costa",
    type: "Prestito Business",
    note: "Richiesta informazioni aggiuntive",
    status: "assigned",
  },
  {
    id: "P-9922",
    praticaNumber: "P-9922",
    date: "25 Set 2025, 11:45",
    internalOperator: internalOperators.marcoRosali.name,
    client: "Elisabetta Fontana",
    type: "Consolidamento debiti",
    note: "Cliente ha ritirato la richiesta",
    status: "cancelled",
  },
  {
    id: "P-9910",
    praticaNumber: "P-9910",
    date: "22 Set 2025, 13:20",
    internalOperator: internalOperators.giuliaVerdi.name,
    client: "Federico Marino",
    type: "Finanziamento PMI",
    note: undefined,
    status: "in_progress",
  },
  {
    id: "P-9898",
    praticaNumber: "P-9898",
    date: "20 Set 2025, 10:00",
    internalOperator: internalOperators.lucaFerrari.name,
    client: "Cristina Serra",
    type: "Prestito Personale",
    note: "Erogazione fondi completata",
    status: "completed",
  },
];

export default function PratichePage() {
  // State for selected practices
  const [selectedPractices, setSelectedPractices] = useState<Set<string>>(
    new Set(),
  );

  // Calculate statistics from mockPractices
  const totalPractices = mockPractices.length;
  const completedCount = mockPractices.filter(
    (p) => p.status === "completed",
  ).length;
  const inProgressCount = mockPractices.filter(
    (p) => p.status === "in_progress",
  ).length;
  const assignedCount = mockPractices.filter(
    (p) => p.status === "assigned",
  ).length;
  const cancelledCount = mockPractices.filter(
    (p) => p.status === "cancelled",
  ).length;

  // Calculate select all checkbox state
  const allSelected = useMemo(
    () => totalPractices > 0 && selectedPractices.size === totalPractices,
    [totalPractices, selectedPractices.size],
  );

  const someSelected = useMemo(
    () => selectedPractices.size > 0 && selectedPractices.size < totalPractices,
    [totalPractices, selectedPractices.size],
  );

  // Handlers for checkbox selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPractices(new Set(mockPractices.map((p) => p.id)));
    } else {
      setSelectedPractices(new Set());
    }
  };

  const handleSelectPractice = (practiceId: string, checked: boolean) => {
    const newSelected = new Set(selectedPractices);
    if (checked) {
      newSelected.add(practiceId);
    } else {
      newSelected.delete(practiceId);
    }
    setSelectedPractices(newSelected);
  };

  // Calculate completion percentage
  const completionPercentage = Math.round(
    (completedCount / totalPractices) * 100,
  );

  // For month-over-month comparison, calculate based on active practices (not cancelled)
  // Since we don't have historical data, we'll calculate the trend based on completed vs total
  // This is a simplified calculation - in a real app you'd compare with previous month's data
  const activePractices = totalPractices - cancelledCount;
  const previousMonthCompletion =
    activePractices > 0
      ? Math.round(((completedCount - 1) / activePractices) * 100)
      : 0;
  const monthOverMonthChange = completionPercentage - previousMonthCompletion;

  const statusFilters = [
    {
      label: "Tutte le pratiche",
      value: "all",
      active: true,
    },
    {
      label: "Pratiche assegnate",
      value: "assigned",
      active: false,
    },

    {
      label: "Pratiche in lavorazione",
      value: "in_progress",
      active: false,
    },
    {
      label: "Pratiche concluse",
      value: "completed",
      active: false,
    },
  ];

  const assigneeFilters = useMemo(
    () => [
      {
        triggerLabel: "Operatore",
        values: [
          {
            label: internalOperators.aliceRizzi.name,
            value: "alice-rizzi",
            active: false,
          },
          {
            label: internalOperators.marcoRosali.name,
            value: "marco-rosali",
            active: false,
          },
          {
            label: internalOperators.giuliaVerdi.name,
            value: "giulia-verdi",
            active: false,
          },
          {
            label: internalOperators.lucaFerrari.name,
            value: "luca-ferrari",
            active: false,
          },
          {
            label: internalOperators.sofiaBianchi.name,
            value: "sofia-bianchi",
            active: false,
          },
          {
            label: internalOperators.andreaRossi.name,
            value: "andrea-rossi",
            active: false,
          },
          {
            label: internalOperators.elenaMartini.name,
            value: "elena-martini",
            active: false,
          },
          {
            label: internalOperators.davideRomano.name,
            value: "davide-romano",
            active: false,
          },
        ],
      },
      {
        triggerLabel: "Cliente",
        values: [
          {
            label: "Cliente 1",
            value: "client1",
            active: false,
          },
          {
            label: "Cliente 2",
            value: "client2",
            active: false,
          },
          {
            label: "Cliente 3",
            value: "client3",
            active: false,
          },
        ],
      },
      {
        triggerLabel: "Pratica N.",
        values: [
          {
            label: "Pratica N. 1",
            value: "pratica1",
          },
          {
            label: "Pratica N. 2",
            value: "pratica2",
          },
          {
            label: "Pratica N. 3",
            value: "pratica3",
          },
        ],
      },
    ],
    [],
  );

  // State for assignee filter values - initialized after assigneeFilters is defined
  const initialFilterValues = useMemo(
    () =>
      Object.fromEntries(
        assigneeFilters.map((filter) => [
          filter.triggerLabel.toLowerCase().replace(/\s+/g, "-"),
          filter.triggerLabel,
        ]),
      ),
    [assigneeFilters],
  );

  const [assigneeFilterValues, setAssigneeFilterValues] =
    useState<Record<string, string>>(initialFilterValues);

  return (
    <main className="bg-card m-2.5 flex flex-1 flex-col gap-2.5 overflow-hidden rounded-3xl px-9 pt-6 font-medium">
      {/* Header - Info Container */}
      <div className="relative flex w-full flex-col gap-4.5">
        {/* Header - Title and Export Button */}
        <div className="flex items-center justify-between gap-2.5">
          <h1 className="flex items-center justify-center gap-3.5">
            {" "}
            <PraticheIcon />
            <span>Pratiche</span>
          </h1>
          <div className="flex items-center justify-center gap-2.5">
            <button className="bg-background flex items-center justify-center gap-2.5 rounded-full py-1.75 pr-2.5 pl-3.75 text-sm">
              Esporta
              <FaChevronDown size={15} className="text-button-secondary" />
            </button>
            <button className="bg-background flex items-center justify-center gap-2.5 rounded-full py-1.75 pr-2.5 pl-3.75 text-sm">
              Aggiungi
              <FaPlus className="text-button-secondary" />
            </button>
          </div>
        </div>
        {/* Header - Filters & Search Container */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex w-full items-center justify-start gap-1.25">
            {/* Header - StatusFilters */}
            <div className="flex items-center justify-center">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  className={cn(
                    "bg-background flex items-center justify-center gap-2.5 rounded-full px-3.75 py-1.75 text-sm",
                    !filter.active &&
                      "bg-button-inactive text-button-inactive-foreground",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            {/* Header - Assignee Filters */}
            <div className="flex w-full flex-0 items-center justify-center gap-1.25">
              {assigneeFilters.map((filter) => {
                const filterKey = filter.triggerLabel
                  .toLowerCase()
                  .replace(/\s+/g, "-");

                return (
                  <Select
                    key={filter.triggerLabel}
                    value={
                      assigneeFilterValues[filterKey] ?? filter.triggerLabel
                    }
                    onValueChange={(value) => {
                      setAssigneeFilterValues((prev) => ({
                        ...prev,
                        [filterKey]: value,
                      }));
                    }}
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder={filter.triggerLabel} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={filter.triggerLabel}>
                        {filter.triggerLabel}
                      </SelectItem>
                      {filter.values.map((value) => (
                        <SelectItem key={value.value} value={value.value}>
                          {value.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              })}
            </div>
          </div>
          {/* Header - Search */}
          <div className="absolute right-0 flex items-center justify-center">
            <label
              htmlFor="search"
              className="bg-background flex w-xs items-center justify-between rounded-full px-3.75 py-1.75 text-sm shadow-[-18px_0px_14px_var(--color-card)] transition-all duration-200"
            >
              <input
                placeholder="Numero pratica, stato, cliente..."
                className="placeholder:text-search-placeholder w-full truncate focus:outline-none"
              />
              <SearchIcon className="text-search-placeholder" />
            </label>
          </div>
        </div>
      </div>
      {/* Body Wrapper */}
      <div className="bg-background flex min-h-0 flex-1 flex-col gap-6.25 rounded-t-3xl px-5.5 pt-6.25">
        {/* Body Header */}
        {/* Body Header - Stats */}
        <div className="flex shrink-0 items-start gap-25.5">
          {/* Stats - Totale pratiche */}
          <div className="flex flex-col items-start justify-center gap-2.5">
            <h3 className="text-stats-title text-sm font-medium">
              Totale pratiche
            </h3>
            <div className="flex items-center justify-start gap-3.75">
              <AnimateNumber className="text-xl">
                {totalPractices}
              </AnimateNumber>
              <div className="bg-stats-secondary h-5 w-0.75 rounded-full" />
              {/* Stats - Totale pratiche - Status Counts */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center gap-1.25 text-xl">
                  <CheckIcon size={24} className="text-stats-secondary" />
                  <AnimateNumber>{completedCount}</AnimateNumber>
                </div>
                <div className="flex items-center justify-center gap-1.25 text-xl">
                  <HalfStatusIcon size={24} className="text-stats-secondary" />
                  <AnimateNumber>{inProgressCount}</AnimateNumber>
                </div>
                <div className="flex items-center justify-center gap-1.25 text-xl">
                  <UserCircleIcon size={24} className="text-stats-secondary" />
                  <AnimateNumber>{assignedCount}</AnimateNumber>
                </div>
                <div className="flex items-center justify-center gap-1.25 text-xl">
                  <XIcon size={24} className="text-stats-secondary" />
                  <AnimateNumber>{cancelledCount}</AnimateNumber>
                </div>
              </div>
            </div>
          </div>
          {/* Stats - Andamento pratiche completate */}
          <div className="flex flex-col items-start justify-center gap-2.5">
            <h3 className="text-stats-title text-sm font-medium">
              Andamento pratiche completate
            </h3>
            <div className="flex items-center justify-start gap-2.5 text-xl">
              <AnimateNumber suffix="%">{completionPercentage}</AnimateNumber>
              {monthOverMonthChange !== 0 && (
                <>
                  <ArrowUpRightIcon size={24} />
                  <h4 className="flex items-center justify-center gap-1.25">
                    <AnimateNumber
                      prefix={monthOverMonthChange > 0 ? "+" : ""}
                      suffix="%"
                      className={monthOverMonthChange > 0 ? "text-green" : ""}
                    >
                      {monthOverMonthChange}
                    </AnimateNumber>{" "}
                    rispetto al mese precedente
                  </h4>
                </>
              )}
              {monthOverMonthChange === 0 && (
                <h4>Stabile rispetto al mese precedente</h4>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl">
          {/* Body Head */}
          <div className="bg-table-header shrink-0 rounded-xl px-3 py-2.25">
            <div className="text-table-header-foreground grid grid-cols-[minmax(120px,max-content)_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  aria-label="Seleziona tutte le pratiche"
                  labelClassName="items-center"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span>Pratica N.</span>
              </div>
              <div>Data</div>
              <div>Operatore Interno</div>
              <div>Cliente</div>
              <div>Tipologia</div>
              <div>Note</div>
              <div>Stato</div>
            </div>
          </div>
          {/* Table Body populated with mock data until API integration lands */}

          <div className="scroll-fade-y flex h-full min-h-0 flex-1 flex-col overflow-scroll">
            {mockPractices.map((practice) => {
              const statusVisual = practiceStatusStyles[practice.status];

              return (
                <div
                  key={practice.id}
                  className="border-checkbox-border/70 hover:bg-muted border-b px-3 py-5 transition-colors last:border-b-0"
                >
                  <div className="grid grid-cols-[minmax(120px,max-content)_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 text-base">
                    <div className="flex items-center gap-2.5">
                      <Checkbox
                        aria-label={`Seleziona ${practice.praticaNumber}`}
                        labelClassName="items-center"
                        checked={selectedPractices.has(practice.id)}
                        onChange={(e) =>
                          handleSelectPractice(practice.id, e.target.checked)
                        }
                      />
                      <span className="font-semibold">
                        {practice.praticaNumber}
                      </span>
                    </div>
                    <div>{practice.date}</div>
                    <div className="flex items-center gap-2 truncate">
                      {(() => {
                        const operator = Object.values(internalOperators).find(
                          (op) => op.name === practice.internalOperator,
                        );
                        const imageUrl = operator?.imageUrl;

                        if (!operator) {
                          return (
                            <div className="flex items-center gap-2 truncate">
                              <Avatar aria-hidden className="bg-background">
                                <AvatarFallback
                                  placeholderSeed={practice.internalOperator}
                                />
                              </Avatar>
                              <span className="truncate">
                                {practice.internalOperator}
                              </span>
                            </div>
                          );
                        }

                        return (
                          <Tooltip>
                            <TooltipTrigger className="truncate">
                              <div className="flex cursor-help items-center gap-2 truncate">
                                {imageUrl ? (
                                  <Avatar aria-hidden className="bg-background">
                                    <AvatarImage
                                      src={imageUrl}
                                      alt={operator.name}
                                    />
                                    <AvatarFallback
                                      placeholderSeed={
                                        practice.internalOperator
                                      }
                                    />
                                  </Avatar>
                                ) : (
                                  <Avatar aria-hidden className="bg-background">
                                    <AvatarFallback
                                      placeholderSeed={
                                        practice.internalOperator
                                      }
                                    />
                                  </Avatar>
                                )}
                                <span className="truncate">
                                  {practice.internalOperator}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              sideOffset={8}
                              className="max-w-xs p-0"
                            >
                              <div className="flex flex-col gap-3 p-4">
                                <div className="flex items-center gap-3">
                                  {imageUrl ? (
                                    <Avatar className="bg-background size-16 rounded-lg">
                                      <AvatarImage
                                        src={imageUrl}
                                        alt={operator.name}
                                      />
                                      <AvatarFallback
                                        placeholderSeed={
                                          practice.internalOperator
                                        }
                                      />
                                    </Avatar>
                                  ) : (
                                    <Avatar className="bg-background size-16 rounded-lg">
                                      <AvatarFallback
                                        placeholderSeed={
                                          practice.internalOperator
                                        }
                                      />
                                    </Avatar>
                                  )}
                                  <div className="flex flex-col gap-0.5">
                                    <h4 className="text-sm font-semibold">
                                      {operator.name}
                                    </h4>
                                    <p className="text-muted-foreground text-xs">
                                      Operatore Interno
                                    </p>
                                  </div>
                                </div>
                                <div className="border-border flex flex-col gap-2 border-t pt-3">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground text-xs">
                                      Email
                                    </span>
                                    <span className="text-sm">
                                      {operator.email}
                                    </span>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground text-xs">
                                      Telefono
                                    </span>
                                    <span className="text-sm">
                                      {operator.phone}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      {/* Deterministic avatar so each client keeps the same placeholder art */}
                      <Avatar aria-hidden className="bg-background">
                        <AvatarFallback placeholderSeed={practice.client} />
                      </Avatar>
                      <span className="truncate">{practice.client}</span>
                    </div>
                    <div className="truncate">{practice.type}</div>
                    <div className="truncate">
                      {practice.note ? (
                        <NoteWithTooltip note={practice.note} />
                      ) : (
                        <span className="text-stats-title block w-full truncate text-left">
                          Nessuna nota
                        </span>
                      )}
                    </div>
                    <div>
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
