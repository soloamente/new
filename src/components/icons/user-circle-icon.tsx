import { type SVGProps } from "react";

export interface UserCircleIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function UserCircleIcon({
  size = 20,
  className,
  ...props
}: UserCircleIconProps) {
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
        d="m10,2C5.589,2,2,5.589,2,10s3.589,8,8,8,8-3.589,8-8S14.411,2,10,2Zm0,4c1.378,0,2.5,1.122,2.5,2.5s-1.122,2.5-2.5,2.5-2.5-1.122-2.5-2.5,1.122-2.5,2.5-2.5Zm0,10c-1.522,0-2.908-.574-3.967-1.511.92-1.228,2.361-1.989,3.967-1.989s3.048.761,3.967,1.989c-1.059.937-2.446,1.511-3.967,1.511Z"
        strokeWidth="0"
        fill="currentColor"
      ></path>
    </svg>
  );
}
