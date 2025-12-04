"use client";

import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { useState } from "react";

import { DashboardIcon } from "@/components/icons/dashboard-icon";
import {
  ClientsIcon,
  OperatoriIcon,
  PraticheIcon,
  GearIcon,
  HelpIcon,
} from "./icons";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { SettingsDialog } from "./ui/settings-dialog";
import type { User, UserRole } from "@/app/actions/auth-actions";

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

  // Dashboard is visible to all roles
  if (href === "/dashboard") return true;

  // Role-based visibility
  switch (role) {
    case "DATAWEB":
      // Super Admin: Dashboard only (can add Studi management later)
      return href === "/dashboard";
    case "AMMINISTRATORE_STUDIO":
      // Admin: Dashboard, Pratiche, Clienti, Operatori
      return (
        href === "/dashboard" ||
        href === "/pratiche" ||
        href === "/clienti" ||
        href === "/operatori"
      );
    case "OPERATORE":
      // Operator: Dashboard, Pratiche (filtered to their own)
      return href === "/dashboard" || href === "/pratiche";
    default:
      return false;
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // All possible navigation items
  const allNavigationItems: NavigationItem[] = [
    {
      icon: DashboardIcon,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: PraticheIcon,
      label: "Pratiche",
      href: "/pratiche",
    },
    {
      icon: ClientsIcon,
      label: "Clienti",
      href: "/clienti",
    },
    {
      icon: OperatoriIcon,
      label: "Operatori",
      href: "/operatori",
    },
  ];

  // Filter navigation items based on user role
  const userRole = user ? getRoleName(user.role_id) : null;
  const navigationItems = allNavigationItems.filter((item) =>
    isNavigationItemVisible(item.href, userRole),
  );

  const navFooter: FooterItem[] = [
    {
      icon: HelpIcon as IconComponent,
      label: "Supporto",
    },
    {
      icon: GearIcon as IconComponent,
      label: "Impostazioni",
    },
  ];

  // Check if a navigation item is currently active based on pathname
  function isActiveItem(itemHref: string): boolean {
    return pathname === itemHref;
  }

  return (
    <aside
      aria-label="Sidebar"
      className="h-full w-full min-w-60.5 flex-0 px-6.5 py-6 font-medium"
    >
      {/* Sidebar Groups Wrapper */}
      <div className="flex h-full flex-col justify-between">
        {/* Navigation Group Wrapper */}
        <div className="flex flex-col gap-6 pt-2">
          {/* Navigation Group */}
          <div className="flex gap-7">
            {/* Dashboard Navigation */}
            <div className="flex flex-col gap-7">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
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
          {navFooter.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.label === "Impostazioni") {
                  setIsSettingsOpen(true);
                }
              }}
              className="text-sidebar-secondary hover:text-sidebar-primary flex items-center gap-3.5"
            >
              <item.icon size={24} />
              {item.label}
            </button>
          ))}

          <div className="hover:bg-card flex cursor-pointer items-center gap-3.5 rounded-full">
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
