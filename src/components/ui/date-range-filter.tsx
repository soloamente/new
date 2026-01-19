"use client";

import * as React from "react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { FaChevronDown, FaCalendarAlt } from "react-icons/fa";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

// Date range type
export interface DateRange {
  from: Date | null;
  to: Date | null;
}

// Preset type
interface DatePreset {
  label: string;
  value: string;
  getRange: () => DateRange;
}

// Helper to get start of day
const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper to get end of day
const endOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Preset definitions
const datePresets: DatePreset[] = [
  {
    label: "Oggi",
    value: "today",
    getRange: () => {
      const today = new Date();
      return { from: startOfDay(today), to: endOfDay(today) };
    },
  },
  {
    label: "Ieri",
    value: "yesterday",
    getRange: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
    },
  },
  {
    label: "Ultimi 7 giorni",
    value: "last7days",
    getRange: () => {
      const today = new Date();
      const from = new Date();
      from.setDate(today.getDate() - 6);
      return { from: startOfDay(from), to: endOfDay(today) };
    },
  },
  {
    label: "Ultimi 30 giorni",
    value: "last30days",
    getRange: () => {
      const today = new Date();
      const from = new Date();
      from.setDate(today.getDate() - 29);
      return { from: startOfDay(from), to: endOfDay(today) };
    },
  },
  {
    label: "Questo mese",
    value: "thisMonth",
    getRange: () => {
      const today = new Date();
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: startOfDay(from), to: endOfDay(today) };
    },
  },
  {
    label: "Mese scorso",
    value: "lastMonth",
    getRange: () => {
      const today = new Date();
      const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const to = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: startOfDay(from), to: endOfDay(to) };
    },
  },
  {
    label: "Quest'anno",
    value: "thisYear",
    getRange: () => {
      const today = new Date();
      const from = new Date(today.getFullYear(), 0, 1);
      return { from: startOfDay(from), to: endOfDay(today) };
    },
  },
];

// Italian month names
const monthNames = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

// Italian short day names
const dayNamesShort = ["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"];

interface DateRangeFilterProps {
  /** Currently selected date range */
  value: DateRange | null;
  /** Callback when date range changes */
  onValueChange: (range: DateRange | null) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Custom class for the trigger button */
  triggerClassName?: string;
  /** Disabled state */
  disabled?: boolean;
}

// Mini calendar component
function MiniCalendar({
  selectedDate,
  onSelectDate,
  currentMonth,
  onMonthChange,
  minDate,
  maxDate,
  rangeStart,
  rangeEnd,
}: {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
}) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Convert to Monday-based (0 = Monday, 6 = Sunday)
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Get number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Get days from previous month to fill the first week
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Generate calendar days
  const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

  // Previous month days
  for (let i = startDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    days.push({
      date: new Date(year, month - 1, day),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
    });
  }

  // Next month days to complete the grid (6 rows)
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      date: new Date(year, month + 1, day),
      isCurrentMonth: false,
    });
  }

  const handlePrevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < startOfDay(minDate)) return true;
    if (maxDate && date > endOfDay(maxDate)) return true;
    return false;
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isDateInRange = (date: Date): boolean => {
    if (!rangeStart || !rangeEnd) return false;
    const d = startOfDay(date);
    return d >= startOfDay(rangeStart) && d <= startOfDay(rangeEnd);
  };

  const isRangeStart = (date: Date): boolean => {
    if (!rangeStart) return false;
    return (
      date.getDate() === rangeStart.getDate() &&
      date.getMonth() === rangeStart.getMonth() &&
      date.getFullYear() === rangeStart.getFullYear()
    );
  };

  const isRangeEnd = (date: Date): boolean => {
    if (!rangeEnd) return false;
    return (
      date.getDate() === rangeEnd.getDate() &&
      date.getMonth() === rangeEnd.getMonth() &&
      date.getFullYear() === rangeEnd.getFullYear()
    );
  };

  return (
    <div className="w-64 select-none">
      {/* Month/Year header */}
      <div className="mb-2 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="hover:bg-accent rounded-lg p-1.5 transition-colors"
          aria-label="Mese precedente"
        >
          <ChevronLeftIcon className="size-4" />
        </button>
        <span className="text-sm font-medium">
          {monthNames[month]} {year}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="hover:bg-accent rounded-lg p-1.5 transition-colors"
          aria-label="Mese successivo"
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {dayNamesShort.map((day) => (
          <div
            key={day}
            className="text-muted-foreground py-1 text-center text-xs font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map(({ date, isCurrentMonth }, index) => {
          const disabled = isDateDisabled(date);
          const selected = isDateSelected(date);
          const inRange = isDateInRange(date);
          const isStart = isRangeStart(date);
          const isEnd = isRangeEnd(date);

          return (
            <button
              key={index}
              type="button"
              onClick={() => !disabled && onSelectDate(date)}
              disabled={disabled}
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors",
                !isCurrentMonth && "text-muted-foreground/50",
                isCurrentMonth && !selected && !inRange && "hover:bg-accent",
                disabled && "cursor-not-allowed opacity-30",
                inRange && !selected && "bg-accent/50",
                (isStart || isEnd) && "bg-foreground text-background",
                selected && !isStart && !isEnd && "bg-foreground text-background"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * A date range filter component with presets and custom calendar selection.
 */
export function DateRangeFilter({
  value,
  onValueChange,
  placeholder = "Data",
  triggerClassName,
  disabled = false,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customFromMonth, setCustomFromMonth] = useState(new Date());
  const [customToMonth, setCustomToMonth] = useState(() => {
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    return next;
  });
  const [tempRange, setTempRange] = useState<DateRange>({ from: null, to: null });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Format date range for display
  const displayLabel = useMemo(() => {
    if (!value || (!value.from && !value.to)) {
      return placeholder;
    }

    // Check if matches a preset
    if (selectedPreset && selectedPreset !== "custom") {
      const preset = datePresets.find((p) => p.value === selectedPreset);
      if (preset) return preset.label;
    }

    // Custom range display
    const formatShortDate = (date: Date) => {
      const day = date.getDate();
      const month = monthNames[date.getMonth()].slice(0, 3);
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    };

    if (value.from && value.to) {
      return `${formatShortDate(value.from)} - ${formatShortDate(value.to)}`;
    }

    if (value.from) {
      return `Da ${formatShortDate(value.from)}`;
    }

    return placeholder;
  }, [value, selectedPreset, placeholder]);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowCustomRange(false);
        setTempRange({ from: null, to: null });
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle selecting a preset
  const handleSelectPreset = useCallback(
    (preset: DatePreset) => {
      const range = preset.getRange();
      setSelectedPreset(preset.value);
      onValueChange(range);
      setIsOpen(false);
      setShowCustomRange(false);
    },
    [onValueChange]
  );

  // Handle clearing the filter
  const handleClear = useCallback(() => {
    setSelectedPreset(null);
    onValueChange(null);
    setIsOpen(false);
    setShowCustomRange(false);
    setTempRange({ from: null, to: null });
  }, [onValueChange]);

  // Handle showing custom range picker
  const handleShowCustomRange = useCallback(() => {
    setShowCustomRange(true);
    setTempRange(value || { from: null, to: null });
    // Reset calendars to current month
    setCustomFromMonth(new Date());
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCustomToMonth(nextMonth);
  }, [value]);

  // Handle selecting a date in custom range
  const handleSelectCustomDate = useCallback((date: Date) => {
    setTempRange((prev) => {
      // If no start date or both dates are set, start fresh
      if (!prev.from || (prev.from && prev.to)) {
        return { from: date, to: null };
      }
      // If start date exists but no end date
      if (prev.from && !prev.to) {
        // If selected date is before start date, swap them
        if (date < prev.from) {
          return { from: date, to: prev.from };
        }
        return { from: prev.from, to: date };
      }
      return prev;
    });
  }, []);

  // Handle applying custom range
  const handleApplyCustomRange = useCallback(() => {
    if (tempRange.from && tempRange.to) {
      setSelectedPreset("custom");
      onValueChange({
        from: startOfDay(tempRange.from),
        to: endOfDay(tempRange.to),
      });
      setIsOpen(false);
      setShowCustomRange(false);
    }
  }, [tempRange, onValueChange]);

  // Toggle dropdown
  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
      if (isOpen) {
        setShowCustomRange(false);
        setTempRange({ from: null, to: null });
      }
    }
  }, [disabled, isOpen]);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "bg-background flex w-fit items-center justify-between gap-2 rounded-full border-0 px-3.75 py-1.75 text-sm font-normal whitespace-nowrap transition-colors outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          triggerClassName
        )}
      >
        <FaCalendarAlt size={12} className="text-button-secondary" />
        <span
          className={cn(
            "line-clamp-1",
            displayLabel === placeholder && "text-muted-foreground"
          )}
        >
          {displayLabel}
        </span>
        <FaChevronDown
          size={14}
          className={cn(
            "text-button-secondary transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="bg-popover absolute left-0 top-full z-50 mt-1 overflow-hidden rounded-2xl shadow-xl"
            style={{ willChange: "opacity, transform" }}
          >
            {!showCustomRange ? (
              /* Presets List */
              <div className="min-w-48 p-1">
                {/* Clear option */}
                <button
                  type="button"
                  onClick={handleClear}
                  className={cn(
                    "hover:bg-accent flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                    !value && "bg-accent"
                  )}
                >
                  <span>Tutte le date</span>
                  {!value && <CheckIcon className="text-foreground size-4" />}
                </button>

                {/* Preset options */}
                {datePresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={cn(
                      "hover:bg-accent flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                      selectedPreset === preset.value && "bg-accent"
                    )}
                  >
                    <span>{preset.label}</span>
                    {selectedPreset === preset.value && (
                      <CheckIcon className="text-foreground size-4" />
                    )}
                  </button>
                ))}

                {/* Custom range option */}
                <div className="border-border my-1 border-t" />
                <button
                  type="button"
                  onClick={handleShowCustomRange}
                  className={cn(
                    "hover:bg-accent flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                    selectedPreset === "custom" && "bg-accent"
                  )}
                >
                  <FaCalendarAlt size={12} className="text-muted-foreground" />
                  <span>Intervallo personalizzato</span>
                </button>
              </div>
            ) : (
              /* Custom Range Calendars */
              <div className="p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Seleziona intervallo</span>
                  <button
                    type="button"
                    onClick={() => setShowCustomRange(false)}
                    className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                  >
                    Torna ai preset
                  </button>
                </div>

                {/* Two calendars side by side */}
                <div className="flex gap-4">
                  <div>
                    <div className="text-muted-foreground mb-2 text-xs font-medium">
                      Data inizio
                    </div>
                    <MiniCalendar
                      selectedDate={tempRange.from}
                      onSelectDate={handleSelectCustomDate}
                      currentMonth={customFromMonth}
                      onMonthChange={setCustomFromMonth}
                      rangeStart={tempRange.from}
                      rangeEnd={tempRange.to}
                    />
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-2 text-xs font-medium">
                      Data fine
                    </div>
                    <MiniCalendar
                      selectedDate={tempRange.to}
                      onSelectDate={handleSelectCustomDate}
                      currentMonth={customToMonth}
                      onMonthChange={setCustomToMonth}
                      minDate={tempRange.from || undefined}
                      rangeStart={tempRange.from}
                      rangeEnd={tempRange.to}
                    />
                  </div>
                </div>

                {/* Selected range display and apply button */}
                <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
                  <div className="text-muted-foreground text-xs">
                    {tempRange.from && tempRange.to ? (
                      <span>
                        {tempRange.from.toLocaleDateString("it-IT")} -{" "}
                        {tempRange.to.toLocaleDateString("it-IT")}
                      </span>
                    ) : tempRange.from ? (
                      <span>Seleziona la data di fine</span>
                    ) : (
                      <span>Seleziona la data di inizio</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCustomRange}
                    disabled={!tempRange.from || !tempRange.to}
                    className={cn(
                      "bg-foreground text-background rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      (!tempRange.from || !tempRange.to) &&
                        "cursor-not-allowed opacity-50"
                    )}
                  >
                    Applica
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
