"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, type User } from "@/app/actions/auth-actions";
import Sidebar from "./sidebar";
import Preferences from "@/components/ui/preferences";
import { cn } from "@/lib/utils";
import { MobileSidebarProvider, useMobileSidebar } from "./mobile-sidebar-context";
import { MobileMenuOpenButton } from "./mobile-menu-open-button";

/**
 * Inner shell: subscribes to mobile sidebar context and closes the drawer on route change.
 */
function LayoutContentInner({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const { closeMobileSidebar, isMobileSidebarOpen } = useMobileSidebar();

  // Fetch user on mount and when pathname changes (e.g. after login redirect)
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, [pathname]);

  // After any navigation, collapse the mobile drawer so the new page uses full width.
  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

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
      {shouldShowSidebar && <Sidebar user={user} />}
      <div
        className={cn(
          "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
          shouldShowSidebar &&
            "transition-transform duration-200 ease-out motion-reduce:transition-none max-lg:motion-reduce:transform-none",
          shouldShowSidebar &&
            isMobileSidebarOpen &&
            "max-lg:translate-x-[min(17rem,85vw)]",
        )}
      >
        {children}
      </div>
      {/* No fullscreen scrim: a dark overlay sat above the whole viewport and dimmed the sidebar too. */}
      {shouldShowSidebar && <MobileMenuOpenButton />}
      {shouldPreferences && <Preferences />}
    </div>
  );
}

/**
 * LayoutContent Component (Client Component)
 *
 * Handles pathname-based conditional rendering of sidebar and preferences.
 * Fetches user data on mount and when pathname changes (e.g. after login redirect).
 */
export default function LayoutContent({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MobileSidebarProvider>
      <LayoutContentInner>{children}</LayoutContentInner>
    </MobileSidebarProvider>
  );
}
