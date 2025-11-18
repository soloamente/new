import { type SVGProps } from "react";

export interface HourglassIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function HourglassIcon({ size = 20, ...props }: HourglassIconProps) {
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
      <path
        d="m4.502,3.0625l.1499,2.3984c.0811,1.291.6489,2.4849,1.5991,3.3623l1.2749,1.1768-1.2749,1.1768c-.9502.8774-1.5181,2.0713-1.5991,3.3623l-.1499,2.3984c-.0013.0214.0089.0411.0089.0625h10.9783c0-.0214.0103-.0411.0089-.0625l-.1499-2.3984c-.0811-1.291-.6489-2.4849-1.5991-3.3623l-1.2749-1.1768,1.2749-1.1768c.9502-.8774,1.5181-2.0713,1.5991-3.3623l.1499-2.3984c.0013-.0214-.0089-.0411-.0089-.0625H4.5109c0,.0214-.0103.0411-.0089.0625Zm5.2095,9.4951c.1846-.0771.3926-.0771.5771,0,1.1963.4985,2.0093,1.3179,2.416,2.436.084.23.0503.4863-.0903.6865-.1401.2007-.3696.3198-.6143.3198h-4c-.2446,0-.4741-.1191-.6143-.3198-.1406-.2002-.1743-.4565-.0903-.6865.4067-1.1182,1.2197-1.9375,2.416-2.436Z"
        strokeWidth="0"
        fill="currentColor"
      ></path>
      <line
        x1="16"
        y1="3"
        x2="4"
        y2="3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      ></line>
      <line
        x1="16"
        y1="17"
        x2="4"
        y2="17"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      ></line>
    </svg>
  );
}

export default HourglassIcon;
