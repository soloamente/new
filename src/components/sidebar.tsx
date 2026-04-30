"use client";

import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { useState } from "react";

import { DashboardIcon } from "@/components/icons/dashboard-icon";
import {
  OperatoriIcon,
  PraticheIcon,
  HelpIcon,
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
import { WeatherWidget } from "./weather-widget";
import { useMobileSidebar } from "./mobile-sidebar-context";
import { X } from "lucide-react";

type IconComponent = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number; className?: string }
>;

interface NavigationItem {
  icon: IconComponent;
  label: string;
  href: string;
}

/** Footer row: either opens the default mail client (`mailto:`) or runs logout. */
interface FooterItem {
  icon: IconComponent;
  label: string;
  /** e.g. `mailto:info@dataweb-srl.it` for Supporto */
  href?: string;
  isLogout?: boolean;
}

interface SidebarProps {
  user: User | null;
}

// Helper function to get role name from role_id
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

// Check if a navigation item should be visible for a given role
function isNavigationItemVisible(href: string, role: UserRole | null): boolean {
  if (!role) return false;

  // Role-based visibility
  switch (role) {
    case "DATAWEB":
      // Super Admin: Dashboard, Studi, Utenti
      return (
        href === "/dashboard" || href === "/studi" || href === "/utenti"
      );
    case "AMMINISTRATORE_STUDIO":
      // Admin: Dashboard, Pratiche, Clienti, Operatori
      return (
        href === "/dashboard" ||
        href === "/pratiche" ||
        // href === "/clienti" ||
        href === "/operatori"
      );
    case "OPERATORE":
      // Operator: Tutte le pratiche, Mie pratiche, Clienti (NO Dashboard)
      return (
        href === "/pratiche" ||
        href === "/mie-pratiche" ||
        href === "/clienti"
      );
    default:
      return false;
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isMobileSidebarOpen, closeMobileSidebar } = useMobileSidebar();

  // All possible navigation items
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
    
    // {
    //   icon: ClientsIcon,
    //   label: "Clienti",
    //   href: "/clienti",
    // },
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

  // Filter navigation items based on user role
  const userRole = user ? getRoleName(user.role_id) : null;
  const navigationItems = allNavigationItems.filter((item) =>
    isNavigationItemVisible(item.href, userRole),
  );

  const supportMailto = "mailto:info@dataweb-srl.it";
  const navFooter: FooterItem[] = [
    {
      icon: HelpIcon as IconComponent,
      label: "Supporto",
      href: supportMailto,
    },
    {
      icon: OpenRectArrowOutIcon as IconComponent,
      label: "Esci dall'account",
      isLogout: true,
    },
  ];

  // Check if a navigation item is currently active based on pathname
  function isActiveItem(itemHref: string): boolean {
    return pathname === itemHref;
  }

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        "h-full px-6.5 py-6 font-medium",
        /* Desktop: fixed-width column — do NOT use lg:w-full or the flex item steals the full row and hides main content. */
        "lg:relative lg:z-auto lg:w-auto lg:min-w-60.5 lg:max-w-none lg:flex-shrink-0 lg:translate-x-0",
        "max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:z-50 max-lg:h-full max-lg:w-[min(17rem,85vw)] max-lg:min-w-0 max-lg:overflow-y-auto max-lg:shadow-xl",
        "max-lg:transition-transform max-lg:duration-200 max-lg:ease-out max-lg:motion-reduce:transition-none",
        isMobileSidebarOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
      )}
    >
      {/* Sidebar Groups Wrapper */}
      <div className="flex h-full flex-col justify-between">
        {/* Navigation Group Wrapper */}
        <div className="flex flex-col gap-6 pt-2">
          {/* Mobile: explicit close so users aren’t forced to use backdrop only */}
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
          {/* Weather Widget */}
          <WeatherWidget className="mb-2" />
          
          {/* Navigation Group */}
          <div className="flex gap-7">
            {/* Dashboard Navigation */}
            <div className="flex flex-col gap-7">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileSidebar}
                  className={cn(
                    "text-sidebar-secondary hover:text-sidebar-primary flex items-center gap-3.5",
                    isActiveItem(item.href) && "text-sidebar-primary",
                  )}
                >
                  <item.icon size={24} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          {/* Operatori Group */}
          <div className="flex flex-col gap-2"></div>
        </div>
        <div className="flex flex-col gap-6 pb-2">
          {navFooter.map((item) => {
            const className =
              "text-sidebar-secondary hover:text-sidebar-primary flex cursor-pointer items-center gap-3.5";
            if (item.href) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={closeMobileSidebar}
                  className={className}
                >
                  <item.icon size={24} />
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
                    // Server action returns a Promise; explicitly void so ESLint accepts fire-and-forget.
                    void logout();
                  }
                }}
                className={className}
              >
                <item.icon size={24} />
                {item.label}
              </button>
            );
          })}

          {/* p-1 pr-2: tight padding + extra right so hover pill breathes next to the edge */}
          <div className="hover:bg-card flex cursor-pointer items-center gap-3.5 rounded-full p-1 pr-2">
            <Avatar className="size-9">
              <AvatarFallback placeholderSeed={user?.name ?? "User"} />
            </Avatar>
            <div className="flex flex-col gap-1 truncate">
              {user ? (
                <>
                  <span className="truncate leading-none">{user.name}</span>
                  <span className="text-sidebar-secondary text-xs leading-none">
                    {userRole === "DATAWEB"
                      ? "Super Admin"
                      : userRole === "AMMINISTRATORE_STUDIO"
                        ? "Amministratore"
                        : "Operatore"}
                  </span>
                </>
              ) : (
                <span>User</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        user={user}
      />
    </aside>
  );
}
