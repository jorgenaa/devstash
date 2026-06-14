"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteCollection, toggleCollectionFavorite } from "@/actions/collections";
import { EditCollectionDialog } from "@/components/collections/EditCollectionDialog";
import { Button } from "@/components/ui/button";
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

interface CollectionActionsProps {
  collection: { id: string; name: string; description: string | null; isFavorite: boolean };
}

export function CollectionActions({ collection }: CollectionActionsProps) {
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
    router.push("/collections");
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

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          onClick={handleToggleFavorite}
          disabled={toggling}
        >
          <Star
            className={
              isFavorite
                ? "size-4 fill-yellow-400 text-yellow-400"
                : "size-4"
            }
          />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Edit collection"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-destructive hover:text-destructive"
          aria-label="Delete collection"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </>
  );
}
