"use client";

import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { useState } from "react";

import { DashboardIcon } from "@/components/icons/dashboard-icon";
import {
  OperatoriIcon,
  PraticheIcon,
  UserCircleIcon,
} from "./icons";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { SettingsDialog } from "./ui/settings-dialog";
import type { User, UserRole } from "@/app/actions/auth-actions";
import HouseUserIcon from "./icons/house-user";
import OpenRectArrowOutIcon from "./icons/open-rect-arrow-out";
import { logout } from "@/app/actions/auth-actions";
import Image from "next/image";
import { useMobileSidebar } from "./mobile-sidebar-context";
import { X, ChevronDown, Settings2, BarChart3 } from "lucide-react";

type IconComponent = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number; className?: string }
>;

interface NavigationItem {
  icon: IconComponent;
  label: string;
  href: string;
}

interface FooterItem {
  icon: IconComponent;
  label: string;
  href?: string;
  isLogout?: boolean;
}

interface SidebarProps {
  user: User | null;
}

function getRoleName(roleId: number): UserRole {
  switch (roleId) {
    case 1:
      return "DATAWEB";
    case 2:
      return "AMMINISTRATORE_STUDIO";
    case 3:
      return "OPERATORE";
    default:
      return "OPERATORE";
  }
}

function isNavigationItemVisible(href: string, role: UserRole | null): boolean {
  if (!role) return false;

  switch (role) {
    case "DATAWEB":
      return href === "/dashboard" || href === "/studi" || href === "/utenti";
    case "AMMINISTRATORE_STUDIO":
      // Dashboard e Operatori sono nel sottomenu Gestione, non nel nav principale
      return href === "/pratiche" || href === "/mie-pratiche";
    case "OPERATORE":
      return href === "/mie-pratiche" || href === "/clienti";
    default:
      return false;
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  // Calcola ruolo prima degli state per usarlo nell'inizializzatore
  const userRole = user ? getRoleName(user.role_id) : null;
  const isAdminStudio = userRole === "AMMINISTRATORE_STUDIO";
  const isGestioneActive =
    isAdminStudio && (pathname === "/dashboard" || pathname === "/operatori");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Aperto di default se si è già su una rotta Gestione
  const [isGestioneOpen, setIsGestioneOpen] = useState(isGestioneActive);
  const { isMobileSidebarOpen, closeMobileSidebar } = useMobileSidebar();

  const allNavigationItems: NavigationItem[] = [
    {
      icon: PraticheIcon,
      label: "Tutte le pratiche",
      href: "/pratiche",
    },
    {
      icon: PraticheIcon,
      label: "Le mie pratiche",
      href: "/mie-pratiche",
    },
    {
      icon: DashboardIcon,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: OperatoriIcon,
      label: "Operatori",
      href: "/operatori",
    },
    {
      icon: HouseUserIcon,
      label: "Studi",
      href: "/studi",
    },
    {
      icon: UserCircleIcon,
      label: "Utenti",
      href: "/utenti",
    },
  ];

  const navigationItems = allNavigationItems.filter((item) =>
    isNavigationItemVisible(item.href, userRole),
  );

  // Supporto rimosso per tutti i ruoli
  const navFooter: FooterItem[] = [
    {
      icon: OpenRectArrowOutIcon as IconComponent,
      label: "Esci dall'account",
      isLogout: true,
    },
  ];

  function isActiveItem(itemHref: string): boolean {
    return pathname === itemHref;
  }

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        "h-full px-6.5 py-6 font-medium",
        "lg:relative lg:z-auto lg:w-auto lg:min-w-60.5 lg:max-w-none lg:flex-shrink-0 lg:translate-x-0",
        "max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:z-50 max-lg:h-full max-lg:w-[min(17rem,85vw)] max-lg:min-w-0 max-lg:overflow-y-auto max-lg:shadow-xl",
        "max-lg:transition-transform max-lg:duration-200 max-lg:ease-out max-lg:motion-reduce:transition-none",
        isMobileSidebarOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
      )}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Top: mobile close + weather + nav */}
        <div className="flex flex-col gap-6 pt-2">
          {/* Mobile: close button */}
          <div className="flex items-center justify-end lg:hidden">
            <button
              type="button"
              onClick={closeMobileSidebar}
              className="text-sidebar-secondary hover:text-sidebar-primary flex size-10 items-center justify-center rounded-full"
              aria-label="Chiudi menu"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          {/* Marina Militare brand block */}
          <div className="flex flex-col items-center gap-3 py-2">
            <Image
              src="/images/logo-marina.png"
              alt="Marina Militare"
              width={80}
              height={80}
              className="size-20 shrink-0 object-contain"
            />
            <div className="flex flex-col items-center gap-0.5 text-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-secondary">
                Cruscotto
              </span>
              <span className="text-[16px] font-bold leading-tight tracking-[0.01em] text-sidebar-primary">
                Gestione Pratiche
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-0.5">
            {/* Voci filtrate per ruolo (nav principale) */}
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileSidebar}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sidebar-secondary transition-colors hover:bg-[#eef3fb] hover:text-sidebar-primary dark:hover:bg-white/[0.08]",
                  isActiveItem(item.href) && "border-[#dbe5f3] bg-gradient-to-r from-[#eef3fb] to-white font-semibold text-sidebar-primary shadow-[inset_3px_0_0_#d33144] dark:border-white/[0.12] dark:bg-none dark:bg-white/[0.12] dark:from-transparent dark:to-transparent",
                )}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}

            {/* Gestione (solo AMMINISTRATORE_STUDIO): sottomenu con Statistiche e Operatori */}
            {isAdminStudio && (
              <>
                <button
                  type="button"
                  data-no-press-scale
                  onClick={() => setIsGestioneOpen((v) => !v)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-secondary transition-colors hover:bg-foreground/[0.06] hover:text-sidebar-primary",
                    isGestioneActive && "font-semibold text-sidebar-primary",
                  )}
                  aria-expanded={isGestioneOpen}
                >
                  <Settings2 className="size-5 shrink-0" aria-hidden />
                  <span className="flex-1 text-left">Gestione</span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 transition-transform duration-200",
                      isGestioneOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>

                {isGestioneOpen && (
                  <div className="ml-3 flex flex-col gap-0.5 border-l border-foreground/[0.1] pl-3">
                    <Link
                      href="/dashboard"
                      onClick={closeMobileSidebar}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm text-sidebar-secondary transition-colors hover:bg-[#eef3fb] hover:text-sidebar-primary dark:hover:bg-white/[0.08]",
                        isActiveItem("/dashboard") && "border-[#dbe5f3] bg-gradient-to-r from-[#eef3fb] to-white font-semibold text-sidebar-primary shadow-[inset_3px_0_0_#d33144] dark:border-white/[0.12] dark:bg-none dark:bg-white/[0.12] dark:from-transparent dark:to-transparent",
                      )}
                    >
                      <BarChart3 className="size-[18px] shrink-0" aria-hidden />
                      Statistiche
                    </Link>
                    <Link
                      href="/operatori"
                      onClick={closeMobileSidebar}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm text-sidebar-secondary transition-colors hover:bg-[#eef3fb] hover:text-sidebar-primary dark:hover:bg-white/[0.08]",
                        isActiveItem("/operatori") && "border-[#dbe5f3] bg-gradient-to-r from-[#eef3fb] to-white font-semibold text-sidebar-primary shadow-[inset_3px_0_0_#d33144] dark:border-white/[0.12] dark:bg-none dark:bg-white/[0.12] dark:from-transparent dark:to-transparent",
                      )}
                    >
                      <OperatoriIcon size={18} />
                      Operatori
                    </Link>
                  </div>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Bottom: footer items + user card */}
        <div className="flex flex-col gap-4 pb-2">
          <div className="flex flex-col gap-0.5">
            {navFooter.map((item) => {
              const className =
                "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-secondary transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400";
              if (item.href) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={closeMobileSidebar}
                    className={className}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </a>
                );
              }
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (item.isLogout) {
                      void logout();
                    }
                  }}
                  className={className}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User card */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-2.5">
            <Avatar className="size-9 shrink-0">
              <AvatarFallback placeholderSeed={user?.name ?? "User"} />
            </Avatar>
            <div className="flex min-w-0 flex-col gap-1">
              {user ? (
                <>
                  <span className="truncate text-sm font-semibold leading-none">{user.name}</span>
                  <span className="text-sidebar-secondary text-xs leading-none">
                    {userRole === "DATAWEB"
                      ? "Super Admin"
                      : userRole === "AMMINISTRATORE_STUDIO"
                        ? "Amministratore"
                        : "Operatore"}
                  </span>
                </>
              ) : (
                <span className="text-sm">User</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        user={user}
      />
    </aside>
  );
}
