"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, type User } from "@/app/actions/auth-actions";
import Sidebar from "./sidebar";
import Preferences from "@/components/ui/preferences";
import { cn } from "@/lib/utils";

/**
 * LayoutContent Component (Client Component)
 *
 * Handles pathname-based conditional rendering of sidebar and preferences.
 * Fetches user data on mount and when pathname changes (e.g., after login redirect).
 */
export default function LayoutContent({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  // Track the mobile drawer state so the sidebar can stay collapsed on small screens.
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch user on mount and when pathname changes (after login redirect)
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => {
    // Close the mobile drawer on navigation to keep the UI predictable.
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  // List of paths where the sidebar should be hidden
  const hideSidebarPaths: string[] = [];

  // List of paths where the sidebar should be visible
  const visibleSidebarPaths = [
    "/dashboard",
    "/pratiche",
    "/mie-pratiche",
    "/clienti",
    "/operatori",
    "/studi",
    "/utenti",
  ];

  const hidePreferencesPaths: string[] = [];

  // Check if current pathname matches any hide patterns
  const shouldHideSidebar = hideSidebarPaths.some((path) =>
    pathname.startsWith(path),
  );

  // Check if current pathname matches any visible patterns
  const matchesVisiblePath = visibleSidebarPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );

  // Show sidebar if it matches visible paths AND is not in the hide list
  const shouldShowSidebar = matchesVisiblePath && !shouldHideSidebar;

  const shouldPreferences = !hidePreferencesPaths.some((path) =>
    pathname.startsWith(path),
  );

  return (
    <div className="relative flex h-screen overflow-hidden">
      {shouldShowSidebar && (
        <>
          {/* Mobile toggle button for the sidebar drawer. */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
            aria-controls="app-sidebar"
            aria-expanded={isMobileSidebarOpen}
            className={cn(
              "bg-background text-foreground fixed left-4 top-4 z-50 flex items-center gap-2 rounded-full px-4 py-2 text-sm shadow-sm",
              "focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none",
              "select-none lg:hidden",
            )}
          >
            Menu
          </button>
          {/* Sidebar wrapper handles mobile sliding without affecting desktop layout. */}
          <div
            className={cn(
              "fixed left-0 top-0 z-40 h-full w-[min(85vw,280px)] transition-transform duration-200 ease-out",
              isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
              "lg:static lg:translate-x-0 lg:transition-none lg:w-auto",
            )}
          >
            <Sidebar user={user} />
          </div>
        </>
      )}
      {/* Allow the main content area to scroll on smaller screens. */}
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
      {shouldPreferences && <Preferences />}
    </div>
  );
}
