"use client";

import { useState, useMemo } from "react";
import {
  ArrowUpRightIcon,
  CheckIcon,
  HalfStatusIcon,
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
import { cn } from "@/lib/utils";
import { FaChevronDown, FaPlus } from "react-icons/fa";
import { AnimateNumber } from "motion-plus/react";
import type { UserRow } from "@/lib/users-utils";
import { CreateAdminDialog } from "@/components/create-admin-dialog";

interface UtentiProps {
  users: UserRow[];
}

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

  // Calculate statistics from users
  const totalUsers = users.length;
  const datawebCount = users.filter((u) => u.role === "DATAWEB").length;
  const adminCount = users.filter(
    (u) => u.role === "AMMINISTRATORE_STUDIO",
  ).length;
  const operatorCount = users.filter((u) => u.role === "OPERATORE").length;
  const activeUsers = users.filter((u) => u.status === "active").length;

  // Calculate select all checkbox state
  const allSelected = useMemo(
    () => totalUsers > 0 && selectedUsers.size === totalUsers,
    [totalUsers, selectedUsers.size],
  );

  const someSelected = useMemo(
    () => selectedUsers.size > 0 && selectedUsers.size < totalUsers,
    [totalUsers, selectedUsers.size],
  );

  // Handlers for checkbox selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
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

  // Get unique roles and studios from users for filters
  const uniqueRoles = useMemo(() => {
    const roles = new Set(users.map((u) => u.role).filter(Boolean));
    return Array.from(roles).map((role) => ({
      label: role,
      value: role.toLowerCase().replace(/\s+/g, "-"),
      active: false,
    }));
  }, [users]);

  const uniqueStudios = useMemo(() => {
    const studios = new Set(users.map((u) => u.studio).filter(Boolean));
    return Array.from(studios).map((studio) => ({
      label: studio,
      value: studio.toLowerCase().replace(/\s+/g, "-"),
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
      {
        triggerLabel: "Utente N.",
        values: users.slice(0, 10).map((u, idx) => ({
          label: `Utente N. ${idx + 1}`,
          value: u.id,
        })),
      },
    ],
    [uniqueRoles, uniqueStudios, users],
  );

  // State for assignee filter values
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
                id="search"
                placeholder="Nome, email, ruolo, studio..."
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
          {/* Stats - Totale utenti */}
          <div className="flex flex-col items-start justify-center gap-2.5">
            <h3 className="text-stats-title text-sm font-medium">
              Totale utenti
            </h3>
            <div className="flex items-center justify-start gap-3.75">
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
            <div className="text-table-header-foreground grid grid-cols-[minmax(120px,max-content)_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 text-sm font-medium">
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
            {users.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8">
                <p className="text-stats-title text-center">
                  Nessun utente trovato
                </p>
              </div>
            ) : (
              users.map((user) => {
                const statusKey = user.status.toLowerCase();
                const statusVisual =
                  userStatusStyles[statusKey] ||
                  userStatusStyles[user.status] || {
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
                    <div className="grid grid-cols-[minmax(120px,max-content)_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 text-base">
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

