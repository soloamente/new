"use client";

import { AppToaster } from "@/components/app-toaster";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Agentation } from "agentation";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { createQueryClient } from "@/trpc/query-client";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          {children}
          <AppToaster />
        </TooltipProvider>
        {process.env.NODE_ENV === "development" && <Agentation />}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
