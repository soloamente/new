import { type SVGProps } from "react";

export interface SearchIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function SearchIcon({ size = 20, ...props }: SearchIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      suppressHydrationWarning
      {...props}
    >
      <line
        x1="16.5"
        y1="16.5"
        x2="12.0355"
        y2="12.0355"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
        suppressHydrationWarning
      ></line>
      <circle
        cx="8.5"
        cy="8.5"
        r="5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        suppressHydrationWarning
      ></circle>
    </svg>
  );
}
