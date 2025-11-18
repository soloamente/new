import type { SVGProps } from "react";

export interface ClientsIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function ClientsIcon({
  size = 20,
  className,
  ...props
}: ClientsIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      className={className}
      {...props}
    >
      <circle
        cx="5.75"
        cy="4"
        r="2"
        strokeWidth="0"
        fill="currentColor"
      ></circle>
      <path
        d="m8.25,12H3.25l.444-2.369c.177-.946,1.003-1.631,1.966-1.631h.18c.962,0,1.788.685,1.966,1.631l.444,2.369Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        fill="currentColor"
      ></path>
      <polygon
        points="6.5 17 5 17 4.5 12.5 7 12.5 6.5 17"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        fill="currentColor"
      ></polygon>
      <circle
        cx="14.25"
        cy="4"
        r="2"
        fill="currentColor"
        strokeWidth="0"
        data-color="color-2"
      ></circle>
      <path
        d="m16.75,14h-5l.533-4.264c.124-.992.967-1.736,1.967-1.736h0c1,0,1.843.744,1.967,1.736l.533,4.264Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      ></path>
      <polygon
        points="15 17 13.5 17 13 12.5 15.5 12.5 15 17"
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      ></polygon>
    </svg>
  );
}
