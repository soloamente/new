"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { CheckIcon, HalfStatusIcon, SearchIcon, UserCircleIcon, XIcon } from "@/components/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaChevronDown, FaPlus } from "react-icons/fa";
import { AnimateNumber } from "motion-plus/react";
import type { UserRow } from "@/lib/users-utils";
import { CreateAdminDialog } from "@/components/create-admin-dialog";

interface UtentiProps {
  users: UserRow[];
}

const normalizeValue = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, "-");

const userStatusStyles: Record<
  string,
  {
    label: string;
    accent: string;
    background: string;
    icon: React.ReactNode;
    iconColor: string;
  }
> = {
  active: {
    label: "Attivo",
    accent: "var(--status-completed-accent)",
    background: "var(--status-completed-background)",
    icon: <CheckIcon />,
    iconColor: "var(--status-completed-icon)",
  },
  inactive: {
    label: "Inattivo",
    accent: "var(--status-suspended-accent)",
    background: "var(--status-suspended-background)",
    icon: <XIcon />,
    iconColor: "var(--status-suspended-icon)",
  },
  pending: {
    label: "In attesa",
    accent: "var(--status-in-progress-accent)",
    background: "var(--status-in-progress-background)",
    icon: <HalfStatusIcon />,
    iconColor: "var(--status-in-progress-icon)",
  },
};

export default function Utenti({ users }: UtentiProps) {
  // State for selected users
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // State for create admin dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");

  // Get unique roles and studios from users for filters
  const uniqueRoles = useMemo(() => {
    const roles = new Set(users.map((u) => u.role).filter(Boolean));
    return Array.from(roles).map((role) => ({
      label: role,
      value: normalizeValue(role),
      active: false,
    }));
  }, [users]);

  const uniqueStudios = useMemo(() => {
    const studios = new Set(users.map((u) => u.studio).filter(Boolean));
    return Array.from(studios).map((studio) => ({
      label: studio,
      value: normalizeValue(studio),
      active: false,
    }));
  }, [users]);

  const assigneeFilters = useMemo(
    () => [
      {
        triggerLabel: "Ruolo",
        values: uniqueRoles,
      },
      {
        triggerLabel: "Studio",
        values: uniqueStudios,
      },
    ],
    [uniqueRoles, uniqueStudios],
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

  // Ensure new filters always have a default value when options change
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

  // Derived users based on active filters and search term
  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const roleFilter = assigneeFilterValues[normalizeValue("Ruolo")];
    const studioFilter = assigneeFilterValues[normalizeValue("Studio")];

    return users.filter((user) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [user.id, user.name, user.email, user.role, user.studio]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(normalizedSearch));

      const matchesRole =
        !roleFilter || roleFilter === "Ruolo"
          ? true
          : normalizeValue(user.role) === roleFilter;

      const matchesStudio =
        !studioFilter || studioFilter === "Studio"
          ? true
          : normalizeValue(user.studio) === studioFilter;

      return matchesSearch && matchesRole && matchesStudio;
    });
  }, [assigneeFilterValues, searchTerm, users]);

  // Calculate statistics from filtered users to mirror the visible table
  const totalUsers = filteredUsers.length;
  const datawebCount = filteredUsers.filter((u) => u.role === "DATAWEB").length;
  const adminCount = filteredUsers.filter(
    (u) => u.role === "AMMINISTRATORE_STUDIO",
  ).length;
  const operatorCount = filteredUsers.filter((u) => u.role === "OPERATORE").length;

  // Calculate select all checkbox state scoped to filtered rows
  const allSelected = useMemo(
    () =>
      filteredUsers.length > 0 &&
      filteredUsers.every((user) => selectedUsers.has(user.id)),
    [filteredUsers, selectedUsers],
  );

  const someSelected = useMemo(
    () =>
      filteredUsers.some((user) => selectedUsers.has(user.id)) && !allSelected,
    [allSelected, filteredUsers, selectedUsers],
  );

  // Handlers for checkbox selection (scoped to filtered rows)
  const handleSelectAll = (checked: boolean) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (checked) {
        filteredUsers.forEach((u) => next.add(u.id));
      } else {
        filteredUsers.forEach((u) => next.delete(u.id));
      }
      return next;
    });
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  return (
    <main className="bg-card m-2.5 flex flex-1 flex-col gap-2.5 overflow-hidden rounded-3xl px-9 pt-6 font-medium">
      {/* Header - Info Container */}
      <div className="relative flex w-full flex-col gap-4.5">
        {/* Header - Title and Export Button */}
        <div className="flex items-center justify-between gap-2.5">
          <h1 className="flex items-center justify-center gap-3.5">
            <UserCircleIcon />
            <span>Utenti</span>
          </h1>
          <div className="flex items-center justify-center gap-2.5">
            <button className="bg-background flex items-center justify-center gap-2.5 rounded-full py-1.75 pr-2.5 pl-3.75 text-sm">
              Esporta
              <FaChevronDown size={15} className="text-button-secondary" />
            </button>
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
              className="bg-background flex w-xs items-center justify-between rounded-full px-3.75 py-1.75 text-sm shadow-[-18px_0px_14px_var(--color-card)] transition-all duration-200"
            >
              <input
                id="search"
                placeholder="Nome, email, ruolo, studio..."
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
          {/* Stats - Totale utenti */}
          <div className="flex flex-col items-start justify-center gap-2.5">
            <h3 className="text-stats-title text-sm font-medium">
              Totale utenti
            </h3>
            <div className="flex items-center justify-start gap-3.75 tabular-nums">
              <AnimateNumber className="text-xl">{totalUsers}</AnimateNumber>
              <div className="bg-stats-secondary h-5 w-0.75 rounded-full" />
              {/* Stats - Totale utenti - Role Counts */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center gap-1.25 text-xl">
                  <UserCircleIcon size={24} className="text-stats-secondary" />
                  <AnimateNumber>{datawebCount}</AnimateNumber>
                </div>
                <div className="flex items-center justify-center gap-1.25 text-xl">
                  <CheckIcon size={24} className="text-stats-secondary" />
                  <AnimateNumber>{adminCount}</AnimateNumber>
                </div>
                <div className="flex items-center justify-center gap-1.25 text-xl">
                  <XIcon size={24} className="text-stats-secondary" />
                  <AnimateNumber>{operatorCount}</AnimateNumber>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl">
          {/* Body Head */}
          <div className="bg-table-header shrink-0 rounded-xl px-3 py-2.25">
            {/* Shift width toward name/email/studio; keep ID very compact and grow status */}
            <div className="text-table-header-foreground grid grid-cols-[minmax(90px,0.5fr)_minmax(220px,1fr)_minmax(320px,1.35fr)_minmax(150px,0.8fr)_minmax(200px,1.1fr)_minmax(200px,1fr)] items-center gap-3.5 text-sm font-medium">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  aria-label="Seleziona tutti gli utenti"
                  labelClassName="items-center"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span>Utente N.</span>
              </div>
              <div>Nome</div>
              <div>Email</div>
              <div>Ruolo</div>
              <div>Studio</div>
              <div>Stato</div>
            </div>
          </div>
          {/* Table Body */}
          <div className="scroll-fade-y flex h-full min-h-0 flex-1 flex-col overflow-scroll">
            {filteredUsers.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8">
                <p className="text-stats-title text-center">
                  Nessun utente trovato
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const statusKey = user.status.toLowerCase();
                const statusVisual =
                  userStatusStyles[statusKey] ??
                  userStatusStyles[user.status] ?? {
                    label: user.status,
                    accent: "var(--status-assigned-accent)",
                    background: "var(--status-assigned-background)",
                    icon: <UserCircleIcon />,
                    iconColor: "var(--status-assigned-icon)",
                  };

                return (
                  <div
                    key={user.id}
                    className="border-checkbox-border/70 hover:bg-muted border-b px-3 py-5 transition-colors last:border-b-0"
                  >
                    <div className="grid grid-cols-[minmax(90px,0.5fr)_minmax(220px,1fr)_minmax(320px,1.35fr)_minmax(150px,0.8fr)_minmax(200px,1.1fr)_minmax(200px,1fr)] items-center gap-3.5 text-base">
                      <div className="flex items-center gap-2.5">
                        <div
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            aria-label={`Seleziona ${user.name}`}
                            labelClassName="items-center"
                            checked={selectedUsers.has(user.id)}
                            onChange={(e) =>
                              handleSelectUser(user.id, e.target.checked)
                            }
                          />
                        </div>
                        <span className="font-semibold">{user.id}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <Avatar aria-hidden className="bg-background">
                          <AvatarFallback placeholderSeed={user.name} />
                        </Avatar>
                        <span className="truncate">{user.name}</span>
                      </div>
                      <div className="truncate">{user.email}</div>
                      <div className="truncate">{user.role}</div>
                      <div className="truncate">{user.studio}</div>
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
              })
            )}
          </div>
        </div>
      </div>

      <CreateAdminDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </main>
  );
}

