import type { SVGProps } from "react";

export interface AnchorPlaceholderIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function AnchorPlaceholderIcon({
  size = 20,
  ...props
}: AnchorPlaceholderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      {...props}
    >
      <circle
        cx="10"
        cy="5"
        r="2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      ></circle>
      <line
        x1="10"
        y1="7"
        x2="10"
        y2="17"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      ></line>
      <path
        d="m5,11l-2-1c0,3.866,3.134,7,7,7s7-3.134,7-7l-2,1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      ></path>
    </svg>
  );
}
