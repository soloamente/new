"use client";

import { useState, useRef, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { MiniCalendar } from "./date-range-filter";

const monthNames = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

function formatDisplayDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year!, month! - 1, day!);
    return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleziona data",
  disabled = false,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (value) {
      const [year, month] = value.split("-").map(Number);
      return new Date(year!, month! - 1, 1);
    }
    return new Date();
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedDate = value
    ? (() => {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year!, month! - 1, day!);
      })()
    : null;

  const handleSelect = (date: Date) => {
    const iso = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    onChange(iso);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen((v) => !v)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm transition-colors",
          "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground",
          className,
        )}
      >
        <FaCalendarAlt className="size-3.5 shrink-0 text-muted-foreground" />
        <span>{value ? formatDisplayDate(value) : placeholder}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full z-50 mt-1.5 rounded-2xl bg-popover p-3 shadow-xl ring-1 ring-border/50"
          >
            <MiniCalendar
              selectedDate={selectedDate}
              onSelectDate={handleSelect}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
