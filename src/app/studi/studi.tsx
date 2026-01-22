"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckIcon,
  GearIcon,
  SearchIcon,
  UserCircleIcon,
  XIcon,
} from "@/components/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaPlus } from "react-icons/fa";
import { AnimateNumber } from "motion-plus/react";
import type { StudioRow } from "@/lib/studios-utils";
import { CreateStudioDialog } from "@/components/create-studio-dialog";

interface StudiProps {
  studios: StudioRow[];
}

const normalizeValue = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, "-");

export default function Studi({ studios }: StudiProps) {
  // State for selected studios
  const [selectedStudios, setSelectedStudios] = useState<Set<string>>(
    new Set(),
  );

  // State for create studio dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");

  // Get unique cities and admins from studios for filters
  const uniqueCities = useMemo(() => {
    const cities = new Set(studios.map((s) => s.city).filter(Boolean));
    return Array.from(cities).map((city) => ({
      label: city,
      value: normalizeValue(city),
      active: false,
    }));
  }, [studios]);

  const uniqueAdmins = useMemo(() => {
    const admins = new Set(
      studios.map((s) => s.admin).filter((a) => a !== "Nessun admin"),
    );
    return Array.from(admins).map((name) => ({
      label: name,
      value: normalizeValue(name),
      active: false,
    }));
  }, [studios]);

  const assigneeFilters = useMemo(
    () => [
      {
        triggerLabel: "Città",
        values: uniqueCities,
      },
      {
        triggerLabel: "Admin",
        values: uniqueAdmins,
      },
    ],
    [uniqueCities, uniqueAdmins],
  );

  // State for assignee filter values
  const initialFilterValues = useMemo(
    () =>
      Object.fromEntries(
        assigneeFilters.map((filter) => [
          normalizeValue(filter.triggerLabel),
          filter.triggerLabel,
        ]),
      ),
    [assigneeFilters],
  );

  const [assigneeFilterValues, setAssigneeFilterValues] =
    useState<Record<string, string>>(initialFilterValues);

  // Ensure new filters always have a default value when the options change
  useEffect(() => {
    setAssigneeFilterValues((prev) => {
      let changed = false;
      const next = { ...prev };

      assigneeFilters.forEach((filter) => {
        const key = normalizeValue(filter.triggerLabel);
        if (!(key in next)) {
          next[key] = filter.triggerLabel;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [assigneeFilters]);

  // Derived studios based on active filters and search term
  const filteredStudios = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const cityFilter = assigneeFilterValues[normalizeValue("Città")];
    const adminFilter = assigneeFilterValues[normalizeValue("Admin")];

    return studios.filter((studio) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [studio.id, studio.name, studio.city, studio.vatNumber, studio.admin]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(normalizedSearch));

      const matchesCity =
        !cityFilter || cityFilter === "Città"
          ? true
          : normalizeValue(studio.city) === cityFilter;

      const matchesAdmin =
        !adminFilter || adminFilter === "Admin"
          ? true
          : normalizeValue(studio.admin) === adminFilter;

      return matchesSearch && matchesCity && matchesAdmin;
    });
  }, [assigneeFilterValues, searchTerm, studios]);

  // Calculate statistics from filtered studios to mirror the visible table
  const totalStudios = filteredStudios.length;
  const studiosWithOperators = filteredStudios.filter(
    (s) => s.operatorsCount > 0,
  ).length;
  const studiosWithoutAdmin = filteredStudios.filter(
    (s) => s.admin === "Nessun admin",
  ).length;
  const studiosWithAdmin = totalStudios - studiosWithoutAdmin;

  // Calculate select all checkbox state scoped to the currently filtered rows
  const allSelected = useMemo(
    () =>
      filteredStudios.length > 0 &&
      filteredStudios.every((studio) => selectedStudios.has(studio.id)),
    [filteredStudios, selectedStudios],
  );

  const someSelected = useMemo(
    () =>
      filteredStudios.some((studio) => selectedStudios.has(studio.id)) &&
      !allSelected,
    [allSelected, filteredStudios, selectedStudios],
  );

  // Handlers for checkbox selection (scoped to filtered rows to match the UI)
  const handleSelectAll = (checked: boolean) => {
    setSelectedStudios((prev) => {
      const next = new Set(prev);
      if (checked) {
        filteredStudios.forEach((s) => next.add(s.id));
      } else {
        filteredStudios.forEach((s) => next.delete(s.id));
      }
      return next;
    });
  };

  const handleSelectStudio = (studioId: string, checked: boolean) => {
    const newSelected = new Set(selectedStudios);
    if (checked) {
      newSelected.add(studioId);
    } else {
      newSelected.delete(studioId);
    }
    setSelectedStudios(newSelected);
  };

  return (
    <main className="bg-card m-2.5 flex flex-1 flex-col gap-2.5 overflow-hidden rounded-3xl px-9 pt-6 font-medium">
      {/* Header - Info Container */}
      <div className="relative flex w-full flex-col gap-4.5">
        {/* Header - Title and Export Button */}
        <div className="flex items-center justify-between gap-2.5">
          <h1 className="flex items-center justify-center gap-3.5">
            <GearIcon />
            <span>Studi</span>
          </h1>
          <div className="flex items-center justify-center gap-2.5">
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-background flex cursor-pointer items-center justify-center gap-2.5 rounded-full py-1.75 pr-2.5 pl-3.75 text-sm"
            >
              Aggiungi
              <FaPlus className="text-button-secondary" />
            </button>
          </div>
        </div>
        {/* Header - Filters & Search Container */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex w-full items-center justify-start gap-1.25">
            {/* Header - Assignee Filters */}
            <div className="flex w-full flex-0 items-center justify-center gap-1.25">
              {assigneeFilters.map((filter) => {
                const filterKey = normalizeValue(filter.triggerLabel);

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
              className="bg-background flex w-60 items-center justify-between rounded-full px-3.75 py-1.75 text-sm shadow-[-18px_0px_14px_var(--color-card)] transition-[width,box-shadow] duration-300 ease-out focus-within:w-84"
            >
              <input
                id="search"
                placeholder="Nome studio, città, admin..."
                className="placeholder:text-search-placeholder w-full truncate focus:outline-none"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
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
          {/* Stats - Totale studi */}
          <div className="flex flex-col items-start justify-center gap-2.5">
            <h3 className="text-stats-title text-sm font-medium">
              Totale studi
            </h3>
            <div className="flex items-center justify-start gap-3.75 tabular-nums">
              <AnimateNumber className="text-xl ">{totalStudios}</AnimateNumber>
              <div className="bg-stats-secondary h-5 w-0.75 rounded-full" />
              {/* Stats - Totale studi - Details */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center gap-1.25 text-xl">
                  <UserCircleIcon size={24} className="text-stats-secondary" />
                  <AnimateNumber>{studiosWithAdmin}</AnimateNumber>
                </div>
                <div className="flex items-center justify-center gap-1.25 text-xl">
                  <CheckIcon size={24} className="text-stats-secondary" />
                  <AnimateNumber>{studiosWithOperators}</AnimateNumber>
                </div>
                <div className="flex items-center justify-center gap-1.25 text-xl">
                  <XIcon size={24} className="text-stats-secondary" />
                  <AnimateNumber>{studiosWithoutAdmin}</AnimateNumber>
                </div>
              </div>
            </div>
          </div>
         
        </div>

        {/* Table */}
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl">
          {/* Body Head */}
          <div className="bg-table-header shrink-0 rounded-xl px-3 py-2.25">
            <div className="text-table-header-foreground grid grid-cols-[minmax(120px,max-content)_1fr_1fr_1fr_1fr_1fr] items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  aria-label="Seleziona tutti gli studi"
                  labelClassName="items-center"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span>Studio N.</span>
              </div>
              <div>Nome</div>
              <div>Città</div>
              <div>P.IVA</div>
              <div>Admin</div>
              <div>Operatori</div>
            </div>
          </div>
          {/* Table Body */}
          <div className="scroll-fade-y flex h-full min-h-0 flex-1 flex-col overflow-scroll">
            {filteredStudios.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8">
                <p className="text-stats-title text-center">
                  Nessuno studio trovato
                </p>
              </div>
            ) : (
              filteredStudios.map((studio) => {
                return (
                  <div
                    key={studio.id}
                    className="border-checkbox-border/70 hover:bg-muted border-b px-3 py-5 transition-colors last:border-b-0"
                  >
                    <div className="grid grid-cols-[minmax(120px,max-content)_1fr_1fr_1fr_1fr_1fr] items-center gap-4 text-base">
                      <div className="flex items-center gap-2.5">
                        <div
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            aria-label={`Seleziona ${studio.name}`}
                            labelClassName="items-center"
                            checked={selectedStudios.has(studio.id)}
                            onChange={(e) =>
                              handleSelectStudio(studio.id, e.target.checked)
                            }
                          />
                        </div>
                        <span className="font-semibold">{studio.id}</span>
                      </div>
                      <div className="truncate">{studio.name}</div>
                      <div className="truncate">{studio.city}</div>
                      <div className="truncate">{studio.vatNumber}</div>
                      <div className="flex items-center gap-2 truncate">
                        <Avatar aria-hidden className="bg-background">
                          <AvatarFallback placeholderSeed={studio.admin} />
                        </Avatar>
                        <span className="truncate">{studio.admin}</span>
                      </div>
                      <div className="flex items-center gap-2 tabular-nums">
                        {studio.operatorsCount}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <CreateStudioDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </main>
  );
}

