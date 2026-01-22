import type React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

function IconOpenRectArrowOut({size = 20, ...props}: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width={size} height={size} viewBox="0 0 20 20" {...props}><polyline points="7 14 3 10 7 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" data-color="color-2"></polyline><line x1="12" y1="10" x2="3" y2="10" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" data-color="color-2"></line><path d="m11,3h3c1.657,0,3,1.343,3,3v8c0,1.657-1.343,3-3,3h-3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
  );
};

export default IconOpenRectArrowOut;