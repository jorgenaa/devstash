import Link from "next/link";
import { Pin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { DashboardItem } from "@/lib/db/items";
import { ItemTypeIcon } from "@/lib/item-type-icons";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export function ItemRow({ item }: { item: DashboardItem }) {
  const { type } = item;
  const color = type.color;

  return (
    <Link
      href={`/items/detail/${item.id}`}
      className="group block focus:outline-none"
    >
      <Card
        size="sm"
        className="relative gap-2 px-4 pl-5 transition-colors hover:bg-muted/40 group-focus-visible:ring-2 group-focus-visible:ring-ring"
      >
        <span
          aria-hidden
          className="absolute inset-y-2 left-0 w-1 rounded-r-sm"
          style={{ backgroundColor: color }}
        />

        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <ItemTypeIcon
                name={type.icon}
                className="size-3.5 shrink-0"
                style={{ color }}
                aria-label={type.name}
              />
              <h3 className="truncate text-sm font-medium">{item.title}</h3>
              {item.isPinned && (
                <Pin
                  className="size-3 shrink-0 text-muted-foreground"
                  aria-label="Pinned"
                />
              )}
              {item.isFavorite && (
                <Star
                  className="size-3 shrink-0 fill-yellow-400 text-yellow-400"
                  aria-label="Favorite"
                />
              )}
            </div>

            {item.description && (
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {item.description}
              </p>
            )}

            {item.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <time
            dateTime={item.createdAt.toISOString()}
            className="shrink-0 text-xs text-muted-foreground"
          >
            {DATE_FORMATTER.format(item.createdAt)}
          </time>
        </div>
      </Card>
    </Link>
  );
}
