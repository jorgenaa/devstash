import { createElement } from "react";
import {
  Code,
  File,
  Image,
  Link,
  Sparkles,
  StickyNote,
  Terminal,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

export const itemTypeIcons: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
};

export function getItemTypeIcon(name: string): LucideIcon {
  return itemTypeIcons[name] ?? Code;
}

export function ItemTypeIcon({
  name,
  ...props
}: { name: string } & LucideProps) {
  return createElement(getItemTypeIcon(name), props);
}
