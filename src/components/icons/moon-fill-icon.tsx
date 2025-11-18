import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

function IconMoonFill18({ size = 18, ...props }: IconProps) {
  const sizeString = `${size}px`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={sizeString}
      height={sizeString}
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        d="M16.705,10.223c-.246-.183-.579-.197-.838-.037-.868,.532-1.859,.813-2.867,.813-3.033,0-5.5-2.467-5.5-5.5,0-1.146,.354-2.247,1.023-3.186,.177-.249,.186-.581,.021-.839-.164-.258-.467-.386-.77-.334C3.994,1.847,1.25,5.152,1.25,9c0,4.411,3.589,8,8,8,3.638,0,6.819-2.461,7.735-5.986,.077-.296-.034-.609-.28-.791Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default IconMoonFill18;

