"use client";

import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

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

export default function Sidebar() {
  const navigationItems: NavigationItem[] = [
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

  const pathname = usePathname();

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
        <div className="flex flex-col gap-6">
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
        <div className="flex flex-col gap-6 pb-7.25">
          {navFooter.map((item) => (
            <button
              key={item.label}
              className="text-sidebar-secondary hover:text-sidebar-primary flex items-center gap-3.5"
            >
              <item.icon size={24} />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
