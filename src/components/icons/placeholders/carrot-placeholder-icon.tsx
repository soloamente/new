import { type SVGProps } from "react";

interface CarrotPlaceholderIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * Carrot placeholder icon to bring a bit of whimsy to avatar fallbacks.
 */
export function CarrotPlaceholderIcon({
  size,
  width,
  height,
  ...props
}: CarrotPlaceholderIconProps) {
  const resolvedWidth = width ?? size ?? 20;
  const resolvedHeight = height ?? size ?? 20;

  return (
    <svg
      width={resolvedWidth}
      height={resolvedHeight}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      suppressHydrationWarning
      {...props}
    >
      <path
        d="M14.0521 0.168044L13.6111 0.605318C12.4833 1.73284 12.4833 3.56505 13.6111 4.69257C14.175 5.25633 14.7389 5.82009 15.3064 6.38746C16.4341 7.51498 18.2668 7.51498 19.3945 6.38746L19.8319 5.95019C20.056 5.72613 20.056 5.35752 19.8319 5.13346L19.3945 4.69619C18.2668 3.56867 16.4341 3.56867 15.3064 4.69619C16.4341 3.56867 16.4341 1.73645 15.3064 0.608932L14.869 0.168044C14.6449 -0.0560145 14.2762 -0.0560145 14.0521 0.168044ZM9.66029 4.96361C8.02647 4.96361 6.51194 5.70083 5.50345 6.92592L7.55295 8.97497C7.89273 9.31467 7.89273 9.86398 7.55295 10.2001C7.21318 10.5362 6.66375 10.5398 6.32759 10.2001L4.59979 8.47626L0.103162 18.3637C-0.0956437 18.801 -0.00166276 19.3178 0.338114 19.6611C0.677891 20.0044 1.19479 20.0948 1.63577 19.896L6.75412 17.5687L5.1709 15.9858C4.83112 15.6461 4.83112 15.0968 5.1709 14.7607C5.51068 14.4246 6.0601 14.421 6.39627 14.7607L8.43854 16.8025L11.8833 15.2378C13.8027 14.3668 15.0353 12.4515 15.0353 10.341C15.0353 7.37043 12.6279 4.96361 9.65668 4.96361H9.66029Z"
        fill="currentColor"
        suppressHydrationWarning
      />
    </svg>
  );
}


