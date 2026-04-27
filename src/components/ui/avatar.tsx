"use client";

import { Children, useMemo, type ReactNode } from "react";

import { Avatar as AvatarPrimitive } from "@base-ui-components/react/avatar";

import { cn } from "@/lib/utils";
import { getAvatarPlaceholderIcon } from "./avatar-placeholder-icons";

function Avatar({ className, ...props }: AvatarPrimitive.Root.Props) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "inline-flex size-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-background align-middle font-medium text-xs",
        className,
      )}
      data-slot="avatar"
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      className={cn("size-full object-cover", className)}
      data-slot="avatar-image"
      {...props}
    />
  );
}

interface AvatarFallbackProps extends AvatarPrimitive.Fallback.Props {
  placeholderSeed?: string;
  children?: ReactNode;
}

/**
 * Avatar fallback renders a deterministic whimsical icon so each client always
 * gets the same placeholder art when no profile image is available.
 */
function AvatarFallback({
  className,
  placeholderSeed,
  children,
  ...props
}: AvatarFallbackProps) {
  const { ["aria-label"]: ariaLabelProp, style: inlineStyle, ...restProps } = props;

  const derivedSeed =
    placeholderSeed ??
    (typeof children === "string" && children.length > 0 ? children : undefined) ??
    (typeof ariaLabelProp === "string" ? ariaLabelProp : undefined);

  const placeholder = useMemo(
    () => getAvatarPlaceholderIcon(derivedSeed),
    [derivedSeed],
  );

  // Prefer initials/custom nodes when provided. Do not rely on `children ??` alone—some runtimes
  // pass empty or fragment children in ways that still need the whimsical icon path.
  const hasCustomFallbackContent = Children.count(children) > 0;
  const fallbackContent = hasCustomFallbackContent ? (
    children
  ) : (
    <placeholder.Icon
      aria-hidden="true"
      size={18}
      style={{ color: "var(--avatar-placeholder-icon)" }}
      suppressHydrationWarning
    />
  );

  const fallbackStyle = {
    // Default palette for placeholder avatars. Consumers may override this by passing
    // `style={{ backgroundColor, color }}` (used for operator avatars, for example).
    backgroundColor: "var(--avatar-placeholder-bg)",
    color: "var(--avatar-placeholder-icon)",
    ...inlineStyle,
  };

  // Spread restProps before `style` so consumer + default palette (fallbackStyle) always win
  // over any `style` merged in from the primitive (which could otherwise wash out token colors).
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex size-full items-center justify-center rounded-full text-sm",
        className,
      )}
      data-slot="avatar-fallback"
      aria-label={ariaLabelProp ?? `Avatar placeholder: ${placeholder.label}`}
      suppressHydrationWarning
      {...restProps}
      /* Applied last: operator/custom bg + icon colors from callers must not be clobbered */
      style={fallbackStyle}
    >
      {fallbackContent}
    </AvatarPrimitive.Fallback>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
