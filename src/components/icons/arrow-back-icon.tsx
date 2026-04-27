import { type SVGProps } from "react";

interface ArrowBackIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * Curved “back to list” arrow (20×20) — stroke uses `currentColor` for theme-aware buttons.
 */
export function ArrowBackIcon({
  size = 20,
  ...props
}: ArrowBackIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      {...props}
    >
      <path
        d="m10,16h3c2.209,0,4-1.791,4-4h0c0-2.209-1.791-4-4-4H3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <polyline
        points="7 4 3 8 7 12"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
