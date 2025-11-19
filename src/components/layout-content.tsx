"use client";

import { usePathname } from "next/navigation";

import Sidebar from "@/components/sidebar";
import Preferences from "@/components/ui/preferences";

/**
 * LayoutContent Component
 *
 * Wraps the sidebar and children, conditionally rendering the sidebar
 * based on the current pathname. Pages that should hide the sidebar
 * can be added to the hideSidebarPaths array.
 */
export default function LayoutContent({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  // List of paths where the sidebar should be hidden
  // Add paths here to hide the sidebar on specific pages
  const hideSidebarPaths: string[] = [
    // Add specific paths here if needed in the future
    // Example: "/login", "/auth", etc.
  ];

  // List of paths where the sidebar should be visible
  // All routes that match these patterns will show the sidebar
  const visibleSidebarPaths = [
    "/",
    "/dashboard",
    "/pratiche",
    "/clienti",
    "/operatori",
  ];

  // Check if current pathname matches any hide patterns
  const shouldHideSidebar = hideSidebarPaths.some((path) =>
    pathname.startsWith(path),
  );

  // Check if current pathname matches any visible patterns
  // For 404 pages with invalid routes (e.g., /random-page), pathname won't match our known routes,
  // so the sidebar will be hidden. For 404s under known paths (e.g., /dashboard/invalid),
  // the sidebar will still show, which is acceptable as the user is navigating within that section.
  const matchesVisiblePath = visibleSidebarPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );

  // Show sidebar if it matches visible paths AND is not in the hide list
  const shouldShowSidebar = matchesVisiblePath && !shouldHideSidebar;

  return (
    <div className="flex h-screen overflow-hidden">
      {shouldShowSidebar && <Sidebar />}
      {children}
      {shouldShowSidebar && <Preferences />}
    </div>
  );
}
