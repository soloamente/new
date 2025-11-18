import * as React from "react";
import { cn } from "@/lib/utils";
import "@/styles/checkbox.css";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /**
   * The aria-label for accessibility
   */
  "aria-label": string;
  /**
   * Optional className for the label wrapper
   */
  labelClassName?: string;
  /**
   * Optional text to display next to the checkbox
   */
  label?: React.ReactNode;
  /**
   * Whether the checkbox is in an indeterminate state (partially checked)
   */
  indeterminate?: boolean;
}

/**
 * Animated checkbox component with spring animations.
 * Maintains the same size, ring, and colors as the original table checkbox.
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      labelClassName,
      label,
      "aria-label": ariaLabel,
      indeterminate,
      ...props
    },
    ref,
  ) => {
    const id = React.useId();
    const inputId = props.id || `checkbox-${id}`;
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    // Sync indeterminate state
    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate ?? false;
      }
    }, [indeterminate]);

    return (
      <label
        htmlFor={inputId}
        className={cn("checkbox-label cursor-pointer", labelClassName)}
      >
        <input
          ref={inputRef}
          type="checkbox"
          id={inputId}
          aria-label={ariaLabel}
          className={cn("checkbox-input", className)}
          {...props}
        />
        <span className="checkbox-check" aria-hidden="true">
          <span className="checkbox-fill">
            {/* Checkmark icon */}
            <svg
              className="checkbox-checkmark"
              viewBox="0 0 16 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              suppressHydrationWarning
            >
              <path
                d="M2 6L6 10L14 2"
                pathLength="1"
                strokeDasharray="1"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                suppressHydrationWarning
              />
            </svg>
            {/* Indeterminate line */}
            <svg
              className="checkbox-indeterminate"
              viewBox="0 0 16 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              suppressHydrationWarning
            >
              <path
                d="M2 6L14 6"
                pathLength="1"
                strokeDasharray="1"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                suppressHydrationWarning
              />
            </svg>
          </span>
        </span>
        {label && <span className="checkbox-text">{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };

