import { AppToaster } from "@/components/app-toaster";
import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Agentation } from "agentation";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
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
    </TRPCReactProvider>
  );
}
