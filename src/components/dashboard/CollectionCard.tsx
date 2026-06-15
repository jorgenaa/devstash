"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteCollection, toggleCollectionFavorite } from "@/actions/collections";
import { EditCollectionDialog } from "@/components/collections/EditCollectionDialog";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DashboardCollection } from "@/lib/db/collections";
import { ItemTypeIcon } from "@/lib/item-type-icons";

export function CollectionCard({
  collection,
}: {
  collection: DashboardCollection;
}) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(collection.isFavorite);
  const [toggling, setToggling] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleToggleFavorite() {
    setToggling(true);
    const result = await toggleCollectionFavorite(collection.id);
    setToggling(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setIsFavorite(result.isFavorite);
    toast.success(result.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteCollection(collection.id);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Collection deleted");
    setDeleteOpen(false);
    router.refresh();
  }

  return (
    <>
      <EditCollectionDialog
        collection={collection}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => router.refresh()}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &ldquo;{collection.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The collection will be removed. Items inside will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div
        className="group relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        role="button"
        tabIndex={0}
        onClick={() => router.push(`/collections/${collection.id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            router.push(`/collections/${collection.id}`);
          }
        }}
      >
        <Card
          size="sm"
          className="h-full gap-3 border-l-2 border-l-transparent px-4 transition-colors hover:bg-muted/40"
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
                {isFavorite && (
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

            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring [@media(hover:none)]:opacity-100"
                aria-label="Collection options"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem
                  onClick={() => setEditOpen(true)}
                  className="gap-2"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleToggleFavorite}
                  disabled={toggling}
                  className="gap-2"
                >
                  <Star className={`size-3.5 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                  {isFavorite ? "Unfavorite" : "Favorite"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
      </div>
    </>
  );
}
