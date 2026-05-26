import Link from "next/link";
import { Star } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { DashboardCollection } from "@/lib/db/collections";
import { ItemTypeIcon } from "@/lib/item-type-icons";

export function CollectionCard({
  collection,
}: {
  collection: DashboardCollection;
}) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group block focus:outline-none"
    >
      <Card
        size="sm"
        className="h-full gap-3 border-l-2 border-l-transparent px-4 transition-colors hover:bg-muted/40 group-focus-visible:ring-2 group-focus-visible:ring-ring"
        style={
          collection.accentColor
            ? { borderLeftColor: collection.accentColor }
            : undefined
        }
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-medium">
                {collection.name}
              </h3>
              {collection.isFavorite && (
                <Star
                  className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400"
                  aria-label="Favorite"
                />
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {collection.itemCount}{" "}
              {collection.itemCount === 1 ? "item" : "items"}
            </span>
          </div>
        </div>

        {collection.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {collection.description}
          </p>
        )}

        {collection.types.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {collection.types.map((type) => (
              <ItemTypeIcon
                key={type.id}
                name={type.icon}
                className="size-3.5 shrink-0"
                style={{ color: type.color }}
                aria-label={type.name}
              />
            ))}
          </div>
        )}
      </Card>
    </Link>
  );
}
