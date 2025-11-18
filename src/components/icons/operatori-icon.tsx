import type { SVGProps } from "react";

export interface OperatoriIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function OperatoriIcon({
  size = 20,
  className,
  ...props
}: OperatoriIconProps) {
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
      <path
        d="m10,2C5.589,2,2,5.589,2,10c0,1.44.388,2.789,1.057,3.958l-1.018,3.055c-.09.27-.02.567.181.768.143.143.334.22.53.22.08,0,.16-.013.237-.039l3.055-1.018c1.169.669,2.518,1.057,3.958,1.057,4.411,0,8-3.589,8-8S14.411,2,10,2Zm-3.25,9.5c-.69,0-1.25-.56-1.25-1.25s.56-1.25,1.25-1.25,1.25.56,1.25,1.25-.56,1.25-1.25,1.25Zm3.25,3.5c-1.104,0-2-.896-2-2,0-.368.299-.667.667-.667h2.667c.368,0,.667.299.667.667,0,1.104-.896,2-2,2Zm3.25-3.5c-.69,0-1.25-.56-1.25-1.25s.56-1.25,1.25-1.25,1.25.56,1.25,1.25-.56,1.25-1.25,1.25Z"
        strokeWidth="0"
        fill="currentColor"
      ></path>
    </svg>
  );
}
