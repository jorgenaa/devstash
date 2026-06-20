"use client";

import { useState } from "react";
import { Check, Copy, Pin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { DashboardItem } from "@/lib/db/items";
import { ItemTypeIcon } from "@/lib/item-type-icons";
import { useItemDrawer } from "@/components/items/ItemDrawerContext";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export function ItemCard({ item }: { item: DashboardItem }) {
  const { type } = item;
  const { openDrawer } = useItemDrawer();
  const [copied, setCopied] = useState(false);

  const copyText = item.content ?? item.url;

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    if (!copyText) return;
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={item.title}
      onClick={() => openDrawer(item.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openDrawer(item.id); }}
      className="group block w-full cursor-pointer text-left focus-visible:outline-none"
    >
      <Card className="relative h-full px-4 pl-5 transition-colors hover:bg-muted/40 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <span
          aria-hidden
          className="absolute inset-y-2 left-0 w-1 rounded-r-sm"
          style={{ backgroundColor: type.color }}
        />

        <div className="flex items-center gap-3">
          {/* left: title, description, tags */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <ItemTypeIcon
                name={type.icon}
                className="size-3.5 shrink-0"
                style={{ color: type.color }}
                aria-label={type.name}
              />
              <h3 className="truncate text-sm font-medium">{item.title}</h3>
              <div className="ml-auto flex shrink-0 items-center gap-1">
                {item.isPinned && (
                  <Pin className="size-3 text-muted-foreground" aria-label="Pinned" />
                )}
                {item.isFavorite && (
                  <Star className="size-3 fill-yellow-400 text-yellow-400" aria-label="Favorite" />
                )}
              </div>
            </div>

            {item.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
            )}

            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* right: date centered + copy at bottom */}
          <div className="flex shrink-0 flex-col items-center justify-between self-stretch py-0.5">
            <span />
            <time
              dateTime={item.createdAt.toISOString()}
              className="text-xs text-muted-foreground"
            >
              {DATE_FORMATTER.format(item.createdAt)}
            </time>
            {copyText ? (
              <button
                type="button"
                onClick={handleCopy}
                className="rounded p-0.5 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-muted-foreground [@media(hover:none)]:opacity-100"
                aria-label="Copy"
              >
                {copied ? (
                  <Check className="size-3 text-emerald-400" />
                ) : (
                  <Copy className="size-3" />
                )}
              </button>
            ) : (
              <span />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
