"use client";

import { Menu } from "lucide-react";

import { useMobileSidebar } from "./mobile-sidebar-context";

/** Floating control to reveal the sidebar on small viewports (main content is full-width until opened). */
export function MobileMenuOpenButton() {
  const { isMobileSidebarOpen, openMobileSidebar } = useMobileSidebar();

  if (isMobileSidebarOpen) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={openMobileSidebar}
      className="bg-background text-foreground border-border hover:bg-muted fixed top-4 left-4 z-[60] flex size-11 items-center justify-center rounded-full border shadow-md transition-colors lg:hidden"
      aria-label="Apri menu di navigazione"
    >
      <Menu className="size-5" aria-hidden />
    </button>
  );
}
