import type { SVGProps } from "react";

export interface HalfStatusIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function HalfStatusIcon({ size = 20, ...props }: HalfStatusIconProps) {
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
      <path
        d="m14.9498,5.0502c-1.3668-1.3668-3.1583-2.0502-4.9498-2.0502v14c1.7914,0,3.5829-.6834,4.9498-2.0502,2.7336-2.7337,2.7336-7.1658,0-9.8995Z"
        fill="currentColor"
        strokeWidth="0"
        data-color="color-2"
        suppressHydrationWarning
      ></path>
      <circle
        cx="10"
        cy="10"
        r="7"
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

export default HalfStatusIcon;
