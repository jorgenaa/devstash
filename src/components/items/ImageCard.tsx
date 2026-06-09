"use client";

import { Pin, Star } from "lucide-react";

import type { DashboardItem } from "@/lib/db/items";
import { useItemDrawer } from "@/components/items/ItemDrawerContext";

export function ImageCard({ item }: { item: DashboardItem }) {
  const { openDrawer } = useItemDrawer();
  const src = item.fileUrl ? `/api/download/${item.fileUrl}` : null;

  return (
    <button
      type="button"
      onClick={() => openDrawer(item.id)}
      className="group block w-full text-left focus:outline-none"
    >
      <div className="overflow-hidden rounded-lg border border-border bg-muted focus-visible:ring-2 focus-visible:ring-ring">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {src ? (
            <img
              src={src}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}
          <div className="absolute right-2 top-2 flex items-center gap-1">
            {item.isPinned && (
              <span className="rounded bg-black/50 p-0.5">
                <Pin className="size-3 text-white" aria-label="Pinned" />
              </span>
            )}
            {item.isFavorite && (
              <span className="rounded bg-black/50 p-0.5">
                <Star className="size-3 fill-yellow-400 text-yellow-400" aria-label="Favorite" />
              </span>
            )}
          </div>
        </div>
        <div className="px-3 py-2">
          <p className="truncate text-sm font-medium">{item.title}</p>
          {item.description && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.description}</p>
          )}
        </div>
      </div>
    </button>
  );
}
