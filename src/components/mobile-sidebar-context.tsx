"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface MobileSidebarContextValue {
  /** True when the drawer is open (only meaningful below lg breakpoint). */
  isMobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
}

const MobileSidebarContext = createContext<MobileSidebarContextValue | null>(
  null,
);

export function MobileSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);

  const openMobileSidebar = useCallback(() => setOpen(true), []);
  const closeMobileSidebar = useCallback(() => setOpen(false), []);
  const toggleMobileSidebar = useCallback(() => setOpen((o) => !o), []);

  const value = useMemo(
    () => ({
      isMobileSidebarOpen: isOpen,
      openMobileSidebar,
      closeMobileSidebar,
      toggleMobileSidebar,
    }),
    [isOpen, openMobileSidebar, closeMobileSidebar, toggleMobileSidebar],
  );

  return (
    <MobileSidebarContext.Provider value={value}>
      {children}
    </MobileSidebarContext.Provider>
  );
}

export function useMobileSidebar(): MobileSidebarContextValue {
  const ctx = useContext(MobileSidebarContext);
  if (!ctx) {
    throw new Error(
      "useMobileSidebar must be used within MobileSidebarProvider",
    );
  }
  return ctx;
}
