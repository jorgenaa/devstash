"use client";

import { useRouter } from "next/navigation";
import { Layers } from "lucide-react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ItemTypeIcon } from "@/lib/item-type-icons";
import { useItemDrawer } from "@/components/items/ItemDrawerContext";
import type { SearchData } from "@/lib/db/search";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchData: SearchData;
}

export function CommandPalette({ open, onOpenChange, searchData }: Props) {
  const router = useRouter();
  const { openDrawer } = useItemDrawer();

  function selectItem(id: string) {
    onOpenChange(false);
    openDrawer(id);
  }

  function selectCollection(id: string) {
    onOpenChange(false);
    router.push(`/collections/${id}`);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search" description="Search items and collections">
      <Command>
        <CommandInput placeholder="Search items and collections…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {searchData.items.length > 0 && (
            <CommandGroup heading="Items">
              {searchData.items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.title}
                  onSelect={() => selectItem(item.id)}
                  className="gap-2.5"
                >
                  <span
                    className="flex size-5 shrink-0 items-center justify-center rounded"
                    style={{ backgroundColor: `${item.type.color}20` }}
                  >
                    <ItemTypeIcon
                      name={item.type.icon}
                      className="size-3"
                      style={{ color: item.type.color }}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.title}</span>
                    {item.contentPreview && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.contentPreview}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground capitalize">
                    {item.type.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchData.items.length > 0 && searchData.collections.length > 0 && (
            <CommandSeparator />
          )}

          {searchData.collections.length > 0 && (
            <CommandGroup heading="Collections">
              {searchData.collections.map((col) => (
                <CommandItem
                  key={col.id}
                  value={col.name}
                  onSelect={() => selectCollection(col.id)}
                  className="gap-2.5"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded bg-muted">
                    <Layers className="size-3 text-muted-foreground" />
                  </span>
                  <span className="flex-1 truncate font-medium">{col.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {col.itemCount} {col.itemCount === 1 ? "item" : "items"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
