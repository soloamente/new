"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import "sonner/dist/styles.css";

/**
 * Global toast host (Sonner), themed with next-themes to avoid a light/dark flash before mount.
 */
export function AppToaster() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Toaster
      closeButton
      duration={4000}
      position="top-center"
      richColors
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}
