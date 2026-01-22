import type React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

function IconPersonDress({size = 20, ...props}: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width={size} height={size} viewBox="0 0 20 20" {...props}><path d="m13.5,14h-7l.854-4.785c.229-1.282,1.344-2.215,2.646-2.215h0c1.302,0,2.417.933,2.646,2.215l.854,4.785Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" fill="currentColor"></path><polygon points="11.5 18 8.5 18 8 12 12 12 11.5 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" fill="currentColor"></polygon><circle cx="10" cy="3" r="2" fill="currentColor" strokeWidth="0" data-color="color-2"></circle></svg>
  );
};

export default IconPersonDress;