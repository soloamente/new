import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

function IconBrightnessDecrease({ size = 20, ...props }: IconProps) {
  const sizeString = `${size}px`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={sizeString}
      height={sizeString}
      viewBox="0 0 20 20"
      {...props}
    >
      <circle
        cx="10"
        cy="10"
        r="4"
        strokeWidth="0"
        fill="currentColor"
      />
      <line
        x1="10"
        y1="3"
        x2="10"
        y2="3.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      />
      <line
        x1="14.95"
        y1="5.05"
        x2="14.596"
        y2="5.404"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      />
      <line
        x1="17"
        y1="10"
        x2="16.5"
        y2="10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      />
      <line
        x1="14.95"
        y1="14.95"
        x2="14.596"
        y2="14.596"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      />
      <line
        x1="10"
        y1="17"
        x2="10"
        y2="16.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      />
      <line
        x1="5.05"
        y1="14.95"
        x2="5.404"
        y2="14.596"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      />
      <line
        x1="3"
        y1="10"
        x2="3.5"
        y2="10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      />
      <line
        x1="5.05"
        y1="5.05"
        x2="5.404"
        y2="5.404"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      />
    </svg>
  );
}

export default IconBrightnessDecrease;

