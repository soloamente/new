import { type ComponentType, type SVGProps } from "react";

import {
  AnchorPlaceholderIcon,
  BoltPlaceholderIcon,
  CarrotPlaceholderIcon,
  CoffeePlaceholderIcon,
  GhostPlaceholderIcon,
  MageHatPlaceholderIcon,
  PotionPlaceholderIcon,
  SnowflakePlaceholderIcon,
  SunPlaceholderIcon,
  WandPlaceholderIcon,
} from "@/components/icons";

type PlaceholderIconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

interface AvatarPlaceholderIconMeta {
  Icon: PlaceholderIconComponent;
  label: string;
}

const PLACEHOLDER_ICONS: AvatarPlaceholderIconMeta[] = [
  { Icon: AnchorPlaceholderIcon, label: "Ancora" },
  { Icon: BoltPlaceholderIcon, label: "Saetta" },
  { Icon: CarrotPlaceholderIcon, label: "Carota" },
  { Icon: CoffeePlaceholderIcon, label: "Tazza di caffè" },
  { Icon: GhostPlaceholderIcon, label: "Fantasma" },
  { Icon: MageHatPlaceholderIcon, label: "Cappello da mago" },
  { Icon: PotionPlaceholderIcon, label: "Pozione" },
  { Icon: SnowflakePlaceholderIcon, label: "Fiocco di neve" },
  { Icon: SunPlaceholderIcon, label: "Sole" },
  { Icon: WandPlaceholderIcon, label: "Bacchetta magica" },
];

/**
 * Selects a placeholder icon deterministically based on the given seed.
 * Using a stable hash keeps the avatar art consistent per user/client.
 */
export function getAvatarPlaceholderIcon(seed?: string | null): AvatarPlaceholderIconMeta {
  if (PLACEHOLDER_ICONS.length === 0) {
    throw new Error("Placeholder icon set is empty; please register at least one icon.");
  }

  const normalizedSeed = seed?.trim().toLowerCase();

  if (!normalizedSeed) {
    return PLACEHOLDER_ICONS[0];
  }

  let hash = 0;
  for (let index = 0; index < normalizedSeed.length; index += 1) {
    hash = (hash * 31 + normalizedSeed.charCodeAt(index)) >>> 0;
  }

  const iconIndex = hash % PLACEHOLDER_ICONS.length;

  return PLACEHOLDER_ICONS[iconIndex];
}



