"use client";

import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ItemTypeIcon } from "@/lib/item-type-icons";
import { useItemDrawer } from "@/components/items/ItemDrawerContext";
import type { DashboardItem } from "@/lib/db/items";
import type { FavoriteCollection } from "@/lib/db/favorites";
import { SHORT_DATE_FORMATTER } from "@/lib/formatters";

export function FavoriteItemRow({ item }: { item: DashboardItem }) {
  const { openDrawer } = useItemDrawer();
  const { type } = item;

  return (
    <button
      type="button"
      onClick={() => openDrawer(item.id)}
      className="group flex w-full items-center gap-3 border-b border-border/50 px-3 py-2 text-left font-mono text-sm transition-colors hover:bg-muted/40 focus:outline-none focus-visible:bg-muted/40"
    >
      <span
        aria-hidden
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: type.color }}
      />

      <ItemTypeIcon
        name={type.icon}
        className="size-3.5 shrink-0"
        style={{ color: type.color }}
        aria-hidden
      />

      <span className="min-w-0 flex-1 truncate text-foreground">
        {item.title}
      </span>

      <Badge
        variant="outline"
        className="shrink-0 font-mono text-[10px] text-muted-foreground"
      >
        {type.name}
      </Badge>

      <time
        dateTime={item.updatedAt.toISOString()}
        className="w-12 shrink-0 text-right text-xs text-muted-foreground"
      >
        {SHORT_DATE_FORMATTER.format(item.updatedAt)}
      </time>
    </button>
  );
}

export function FavoriteCollectionRow({
  collection,
}: {
  collection: FavoriteCollection;
}) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="flex w-full items-center gap-3 border-b border-border/50 px-3 py-2 font-mono text-sm transition-colors hover:bg-muted/40"
    >
      <span
        aria-hidden
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: collection.accentColor ?? "#6b7280" }}
      />

      <FolderOpen
        className="size-3.5 shrink-0 text-muted-foreground"
        aria-hidden
      />

      <span className="min-w-0 flex-1 truncate text-foreground">
        {collection.name}
      </span>

      <Badge
        variant="outline"
        className="shrink-0 font-mono text-[10px] text-muted-foreground"
      >
        {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
      </Badge>

      <time
        dateTime={collection.updatedAt.toISOString()}
        className="w-12 shrink-0 text-right text-xs text-muted-foreground"
      >
        {SHORT_DATE_FORMATTER.format(collection.updatedAt)}
      </time>
    </Link>
  );
}
