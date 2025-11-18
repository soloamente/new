import type { SVGProps } from "react";

export interface PraticheIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function PraticheIcon({ size = 20, ...props }: PraticheIconProps) {
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
        x1="9"
        y1="17"
        x2="9"
        y2="15"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        suppressHydrationWarning
      ></line>
      <path
        d="m15,6c0,1.654-1.346,3-3,3-.552,0-1-.448-1-1s.448-1,1-1,1-.449,1-1v-.184c-.847-.302-1.519-.971-1.822-1.816h-5.178c-2.206,0-4,1.794-4,4v5.5c0,1.378,1.122,2.5,2.5,2.5h11c1.378,0,2.5-1.122,2.5-2.5v-5.5c0-1.05-.415-2-1.08-2.714-.522.439-1.186.714-1.92.714Zm-7,8h-3.5c-.276,0-.5-.224-.5-.5v-5.5c0-1.103.897-2,2-2s2,.897,2,2v6Z"
        strokeWidth="0"
        fill="currentColor"
      ></path>
      <rect
        x="11"
        y="1"
        width="5"
        height="3"
        rx="1"
        ry="1"
        fill="currentColor"
        strokeWidth="0"
        data-color="color-2"
      ></rect>
      <line
        x1="12"
        y1="3"
        x2="12"
        y2="6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
        suppressHydrationWarning
      ></line>
    </svg>
  );
}
