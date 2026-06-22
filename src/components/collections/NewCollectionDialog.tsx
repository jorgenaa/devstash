"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus } from "lucide-react";
import { toast } from "sonner";

import { createCollection } from "@/actions/collections";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CollectionForm } from "@/components/collections/CollectionForm";

function defaultForm() {
  return { name: "", description: "" };
}

export function NewCollectionDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm());
  const [saving, setSaving] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setForm(defaultForm());
  }

  async function handleCreate() {
    setSaving(true);
    const result = await createCollection({
      name: form.name,
      description: form.description || null,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Collection created");
    setOpen(false);
    setForm(defaultForm());
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
        <FolderPlus className="size-4" />
        New Collection
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Collection</DialogTitle>
        </DialogHeader>

        <CollectionForm
          form={form}
          onChange={setForm}
          onSubmit={handleCreate}
          onCancel={() => handleOpenChange(false)}
          saving={saving}
          submitLabel="Create"
          savingLabel="Creating…"
        />
      </DialogContent>
    </Dialog>
  );
}
