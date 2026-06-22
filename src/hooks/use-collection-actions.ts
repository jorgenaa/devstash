import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleCollectionFavorite, deleteCollection } from "@/actions/collections";

type Collection = { id: string; name: string; isFavorite: boolean };

export function useCollectionActions(collection: Collection) {
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
    toast.success(result.isFavorite ? "Added to favorites" : "Removed from favorites");
    router.refresh();
  }

  async function handleDelete(onSuccess: () => void) {
    setDeleting(true);
    const result = await deleteCollection(collection.id);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Collection deleted");
    setDeleteOpen(false);
    onSuccess();
  }

  return {
    isFavorite,
    toggling,
    editOpen,
    setEditOpen,
    deleteOpen,
    setDeleteOpen,
    deleting,
    handleToggleFavorite,
    handleDelete,
  };
}
