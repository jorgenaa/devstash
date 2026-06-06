"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clipboard,
  ExternalLink,
  Pencil,
  Pin,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { ItemDetail } from "@/lib/db/items";
import { ItemTypeIcon } from "@/lib/item-type-icons";

type ItemDetailResponse = Omit<ItemDetail, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function formatDate(iso: string) {
  return DATE_FORMATTER.format(new Date(iso));
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 pt-2">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-16" />
        ))}
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-14" />
        </div>
      </div>
    </div>
  );
}

function DrawerContent({ item }: { item: ItemDetailResponse }) {
  const { type } = item;

  async function handleCopy() {
    const text = item.content ?? item.url ?? "";
    if (!text) {
      toast.error("Nothing to copy");
      return;
    }
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  return (
    <>
      <SheetHeader className="gap-2 pr-10">
        <div className="flex items-center gap-2">
          <div
            className="flex size-7 shrink-0 items-center justify-center rounded"
            style={{ backgroundColor: `${type.color}20` }}
          >
            <ItemTypeIcon
              name={type.icon}
              className="size-3.5"
              style={{ color: type.color }}
            />
          </div>
          <SheetTitle className="truncate text-base">{item.title}</SheetTitle>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="capitalize">
            {type.name}
          </Badge>
          {item.language && (
            <Badge variant="secondary">{item.language}</Badge>
          )}
        </div>
      </SheetHeader>

      <Separator />

      <div className="flex items-center gap-0.5 px-4">
        <Button
          variant="ghost"
          size="sm"
          className={item.isFavorite ? "text-yellow-400 hover:text-yellow-400" : ""}
        >
          <Star
            className={`mr-1 size-3.5 ${item.isFavorite ? "fill-yellow-400" : ""}`}
          />
          Favorite
        </Button>
        <Button variant="ghost" size="sm">
          <Pin className="mr-1 size-3.5" />
          Pin
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          <Clipboard className="mr-1 size-3.5" />
          Copy
        </Button>
        <Button variant="ghost" size="sm">
          <Pencil className="mr-1 size-3.5" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-destructive hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-6">
        {item.description && (
          <section className="flex flex-col gap-1.5">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Description
            </h3>
            <p className="text-sm">{item.description}</p>
          </section>
        )}

        {item.content && (
          <section className="flex flex-col gap-1.5">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Content
            </h3>
            <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed whitespace-pre-wrap break-words">
              {item.content}
            </pre>
          </section>
        )}

        {item.url && (
          <section className="flex flex-col gap-1.5">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              URL
            </h3>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 break-all text-sm text-blue-400 hover:underline"
            >
              {item.url}
              <ExternalLink className="size-3 shrink-0" />
            </a>
          </section>
        )}

        {item.tags.length > 0 && (
          <section className="flex flex-col gap-1.5">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {item.collections.length > 0 && (
          <section className="flex flex-col gap-1.5">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Collections
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {item.collections.map((col) => (
                <Badge key={col.id} variant="outline" className="text-xs">
                  {col.name}
                </Badge>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Details
          </h3>
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3" />
                <span>Created</span>
              </div>
              <span>{formatDate(item.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3" />
                <span>Updated</span>
              </div>
              <span>{formatDate(item.updatedAt)}</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

type Props = {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ItemDetailDrawer({ itemId, open, onOpenChange }: Props) {
  const [item, setItem] = useState<ItemDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !itemId) return;

    setLoading(true);
    setItem(null);

    fetch(`/api/items/${itemId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load item");
        return res.json() as Promise<ItemDetailResponse>;
      })
      .then(setItem)
      .catch(() => toast.error("Failed to load item"))
      .finally(() => setLoading(false));
  }, [open, itemId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[480px]"
      >
        {loading || !item ? <DrawerSkeleton /> : <DrawerContent item={item} />}
      </SheetContent>
    </Sheet>
  );
}
