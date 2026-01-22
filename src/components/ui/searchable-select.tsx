"use client";

import * as React from "react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { FaChevronDown } from "react-icons/fa";
import { CheckIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { SearchIcon } from "@/components/icons";

export interface SearchableSelectOption {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  /** Placeholder text shown in the trigger when no value is selected */
  placeholder: string;
  /** Currently selected value */
  value: string;
  /** Callback when value changes */
  onValueChange: (value: string) => void;
  /** Array of options to display */
  options: SearchableSelectOption[];
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Custom class for the trigger button */
  triggerClassName?: string;
  /** Whether to show the "all" option at the top (resets to placeholder) */
  showAllOption?: boolean;
  /** Label for the "all" option */
  allOptionLabel?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * A searchable select component that allows filtering through options.
 * Useful for long lists of items like clients or operators.
 */
export function SearchableSelect({
  placeholder,
  value,
  onValueChange,
  options,
  searchPlaceholder = "Cerca...",
  triggerClassName,
  showAllOption = true,
  allOptionLabel,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find the current option label for display
  const currentLabel = useMemo(() => {
    if (value === placeholder || !value) {
      return placeholder;
    }
    const option = options.find((opt) => opt.value === value);
    return option?.label || placeholder;
  }, [value, options, placeholder]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return options;
    }
    const normalizedSearch = searchTerm.toLowerCase().trim();
    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedSearch)
    );
  }, [options, searchTerm]);

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
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Small delay to ensure the dropdown is rendered
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle selecting an option
  const handleSelect = useCallback(
    (optionValue: string) => {
      onValueChange(optionValue);
      setIsOpen(false);
      setSearchTerm("");
    },
    [onValueChange]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
        triggerRef.current?.focus();
      } else if (e.key === "Enter" && filteredOptions.length === 1) {
        // If there's only one filtered option, select it on Enter
        // TS: array indexing can still be `undefined` even when length === 1.
        const onlyOption = filteredOptions[0];
        if (onlyOption) handleSelect(onlyOption.value);
      }
    },
    [filteredOptions, handleSelect]
  );

  // Toggle dropdown
  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
      if (isOpen) {
        setSearchTerm("");
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
        <span
          className={cn(
            "line-clamp-1",
            value === placeholder && "text-muted-foreground"
          )}
        >
          {currentLabel}
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
            className="bg-popover absolute left-0 top-full z-50 mt-1 min-w-48 overflow-hidden rounded-[1.3rem] shadow-xl"
            style={{ willChange: "opacity, transform" }}
            role="listbox"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input */}
            <div className="pt-2 px-2">
              <label className="bg-background flex items-center gap-2 rounded-xl px-3 py-2">
                <SearchIcon className="text-muted-foreground size-4 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
                  aria-label="Cerca nelle opzioni"
                />
              </label>
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto px-2 py-2 flex flex-col">
              {/* "All" option to reset selection */}
              {showAllOption && (
                <button
                  type="button"
                  onClick={() => handleSelect(placeholder)}
                  className={cn(
                    "hover:bg-accent flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                    value === placeholder && "bg-accent mb-1"
                  )}
                  role="option"
                  aria-selected={value === placeholder}
                >
                  <span>{allOptionLabel || placeholder}</span>
                  {value === placeholder && (
                    <CheckIcon className="text-foreground size-4" />
                  )}
                </button>
              )}

              {/* Filtered Options */}
              {filteredOptions.length === 0 ? (
                <div className="text-muted-foreground px-3 py-4 text-center text-sm">
                  Nessun risultato trovato
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "hover:bg-accent flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                      value === option.value && "bg-accent"
                    )}
                    role="option"
                    aria-selected={value === option.value}
                  >
                    <span className="truncate">{option.label}</span>
                    {value === option.value && (
                      <CheckIcon className="text-foreground size-4 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
