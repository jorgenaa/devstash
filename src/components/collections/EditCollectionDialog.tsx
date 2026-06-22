"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { updateCollection } from "@/actions/collections";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CollectionForm } from "@/components/collections/CollectionForm";

interface EditCollectionDialogProps {
  collection: { id: string; name: string; description: string | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditCollectionDialog({
  collection,
  open,
  onOpenChange,
  onSuccess,
}: EditCollectionDialogProps) {
  const [form, setForm] = useState({
    name: collection.name,
    description: collection.description ?? "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ name: collection.name, description: collection.description ?? "" });
    }
  }, [open, collection]);

  async function handleSave() {
    setSaving(true);
    const result = await updateCollection(collection.id, {
      name: form.name,
      description: form.description || null,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Collection updated");
    onOpenChange(false);
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
        </DialogHeader>

        <CollectionForm
          form={form}
          onChange={setForm}
          onSubmit={handleSave}
          onCancel={() => onOpenChange(false)}
          saving={saving}
          submitLabel="Save"
          savingLabel="Saving…"
        />
      </DialogContent>
    </Dialog>
  );
}
