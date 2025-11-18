"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import IconBrightnessDecrease from "@/components/icons/brightness-decrease-icon";
import IconMoonFill18 from "@/components/icons/moon-fill-icon";
import IconMonitorSettingsFill18 from "@/components/icons/monitor-settings-fill-icon";

type ThemeOption = "light" | "dark" | "system";

const themeOptions: {
  value: ThemeOption;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { value: "light", label: "Chiaro", icon: IconBrightnessDecrease },
  { value: "dark", label: "Scuro", icon: IconMoonFill18 },
  { value: "system", label: "Automatico", icon: IconMonitorSettingsFill18 },
];

export default function Preferences() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine the active theme based on resolved theme
  const activeTheme: ThemeOption =
    !mounted || theme === "system"
      ? "system"
      : resolvedTheme === "dark"
        ? "dark"
        : "light";

  const cycleTheme = () => {
    // Cycle based on the actual theme value, not resolved theme
    const currentTheme = theme ?? "system";
    const currentIndex = themeOptions.findIndex(
      (opt) => opt.value === currentTheme,
    );
    // If not found, default to system (index 2)
    const safeIndex = currentIndex === -1 ? 2 : currentIndex;
    const nextIndex = (safeIndex + 1) % themeOptions.length;
    setTheme(themeOptions[nextIndex]!.value);
  };

  if (!mounted) {
    return (
      <div className="bg-primary absolute right-5 bottom-5 rounded-full px-3.75 py-1.75 text-sm font-medium opacity-0" />
    );
  }

  const activeOption = themeOptions.find((opt) => opt.value === activeTheme);
  const Icon = activeOption?.icon;

  return (
    <div className="absolute right-5 bottom-5">
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={cycleTheme}
            className={cn(
              "bg-primary text-primary-foreground flex cursor-pointer items-center justify-center",
              "rounded-full p-2 text-sm font-medium",
              "focus:ring-ring hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:outline-none",
              "select-none",
            )}
            whileHover={{
              scale: 1.08,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 20,
              },
            }}
            whileTap={{
              scale: 0.92,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 20,
              },
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 20,
            }}
            aria-label={`Switch theme. Current: ${activeOption?.label ?? "system"}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {Icon && (
                <motion.div
                  key={activeTheme}
                  variants={{
                    hidden: {
                      opacity: 0,
                      scale: 0.5,
                    },
                    visible: {
                      opacity: 1,
                      scale: 1,
                    },
                  }}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <Icon size={20} className="shrink-0" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="flex max-w-fit items-center gap-2 py-1.25 pr-1.25 pl-2.5"
          hideArrow={true}
          sideOffset={8}
        >
          <p>Tema attuale </p>
          <span className="text-primary bg-background rounded-md px-2 py-1 font-medium">
            {activeOption?.label ?? "automatico"}
          </span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
