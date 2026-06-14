"use client";

import { useState, useMemo } from "react";
import { Star } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FavoriteItemRow, FavoriteCollectionRow } from "./FavoriteRows";
import type { DashboardItem } from "@/lib/db/items";
import type { FavoriteCollection } from "@/lib/db/favorites";

type ItemSortKey = "date-desc" | "date-asc" | "name-asc" | "name-desc" | "type-asc" | "type-desc";
type CollectionSortKey = "date-desc" | "date-asc" | "name-asc" | "name-desc";

const ITEM_SORT_OPTIONS: { value: ItemSortKey; label: string }[] = [
  { value: "date-desc", label: "Date: Newest" },
  { value: "date-asc", label: "Date: Oldest" },
  { value: "name-asc", label: "Name: A → Z" },
  { value: "name-desc", label: "Name: Z → A" },
  { value: "type-asc", label: "Type: A → Z" },
  { value: "type-desc", label: "Type: Z → A" },
];

const COLLECTION_SORT_OPTIONS: { value: CollectionSortKey; label: string }[] = [
  { value: "date-desc", label: "Date: Newest" },
  { value: "date-asc", label: "Date: Oldest" },
  { value: "name-asc", label: "Name: A → Z" },
  { value: "name-desc", label: "Name: Z → A" },
];

function sortItems(items: DashboardItem[], key: ItemSortKey): DashboardItem[] {
  return [...items].sort((a, b) => {
    switch (key) {
      case "date-desc": return b.updatedAt.getTime() - a.updatedAt.getTime();
      case "date-asc":  return a.updatedAt.getTime() - b.updatedAt.getTime();
      case "name-asc":  return a.title.localeCompare(b.title);
      case "name-desc": return b.title.localeCompare(a.title);
      case "type-asc":  return a.type.name.localeCompare(b.type.name);
      case "type-desc": return b.type.name.localeCompare(a.type.name);
    }
  });
}

function sortCollections(collections: FavoriteCollection[], key: CollectionSortKey): FavoriteCollection[] {
  return [...collections].sort((a, b) => {
    switch (key) {
      case "date-desc": return b.updatedAt.getTime() - a.updatedAt.getTime();
      case "date-asc":  return a.updatedAt.getTime() - b.updatedAt.getTime();
      case "name-asc":  return a.name.localeCompare(b.name);
      case "name-desc": return b.name.localeCompare(a.name);
    }
  });
}

interface FavoritesListProps {
  items: DashboardItem[];
  collections: FavoriteCollection[];
}

export function FavoritesList({ items, collections }: FavoritesListProps) {
  const [itemSort, setItemSort] = useState<ItemSortKey>("date-desc");
  const [collectionSort, setCollectionSort] = useState<CollectionSortKey>("date-desc");

  const sortedItems = useMemo(() => sortItems(items, itemSort), [items, itemSort]);
  const sortedCollections = useMemo(() => sortCollections(collections, collectionSort), [collections, collectionSort]);

  const isEmpty = items.length === 0 && collections.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <Star className="size-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No favorites yet.</p>
        <p className="text-xs text-muted-foreground">
          Star items and collections to find them here quickly.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {items.length > 0 && (
        <section>
          <div className="mb-1 flex items-center justify-between px-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Items — {items.length}
            </p>
            <Select value={itemSort} onValueChange={(v) => setItemSort(v as ItemSortKey)}>
              <SelectTrigger className="h-6 w-[130px] border-none bg-transparent px-2 text-[11px] text-muted-foreground shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {ITEM_SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border border-border/50">
            {sortedItems.map((item) => (
              <FavoriteItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {collections.length > 0 && (
        <section>
          <div className="mb-1 flex items-center justify-between px-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Collections — {collections.length}
            </p>
            <Select value={collectionSort} onValueChange={(v) => setCollectionSort(v as CollectionSortKey)}>
              <SelectTrigger className="h-6 w-[130px] border-none bg-transparent px-2 text-[11px] text-muted-foreground shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {COLLECTION_SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border border-border/50">
            {sortedCollections.map((collection) => (
              <FavoriteCollectionRow key={collection.id} collection={collection} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
