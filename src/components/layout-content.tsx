"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, type User } from "@/app/actions/auth-actions";
import Sidebar from "./sidebar";
import Preferences from "@/components/ui/preferences";

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

  // Fetch user on mount and when pathname changes (after login redirect)
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, [pathname]);

  // List of paths where the sidebar should be hidden
  const hideSidebarPaths: string[] = [];

  // List of paths where the sidebar should be visible
  const visibleSidebarPaths = [
    "/dashboard",
    "/pratiche",
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
    <div className="flex h-screen overflow-hidden">
      {shouldShowSidebar && <Sidebar user={user} />}
      {children}
      {shouldPreferences && <Preferences />}
    </div>
  );
}
