"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { createItem } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { FileUpload, type UploadResult } from "@/components/ui/file-upload";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ItemTypeIcon } from "@/lib/item-type-icons";

const ITEM_TYPES = [
  { name: "snippet", icon: "Code", label: "Snippet" },
  { name: "prompt", icon: "Sparkles", label: "Prompt" },
  { name: "command", icon: "Terminal", label: "Command" },
  { name: "note", icon: "StickyNote", label: "Note" },
  { name: "link", icon: "Link", label: "Link" },
  { name: "file", icon: "File", label: "File" },
  { name: "image", icon: "Image", label: "Image" },
] as const;

export type TypeName = (typeof ITEM_TYPES)[number]["name"];

const TEXT_CONTENT_TYPES: TypeName[] = ["snippet", "prompt", "command", "note"];
const LANGUAGE_TYPES: TypeName[] = ["snippet", "command"];
const FILE_TYPES: TypeName[] = ["file", "image"];

type FormState = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
};

function defaultForm(): FormState {
  return {
    title: "",
    description: "",
    content: "",
    url: "",
    language: "",
    tags: "",
  };
}

type Props = {
  defaultType?: TypeName;
};

export function NewItemDialog({ defaultType }: Props = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TypeName>(defaultType ?? "snippet");
  const [form, setForm] = useState<FormState>(defaultForm);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [saving, setSaving] = useState(false);

  function field(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setForm(defaultForm());
      setSelectedType(defaultType ?? "snippet");
      setUploadResult(null);
    }
  }

  function handleTypeChange(type: TypeName) {
    setSelectedType(type);
    setUploadResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const isFileType = FILE_TYPES.includes(selectedType);

    const result = await createItem({
      typeName: selectedType,
      title: form.title,
      description: form.description || null,
      content: isFileType ? null : (form.content || null),
      url: form.url || null,
      fileUrl: uploadResult?.key ?? null,
      fileName: uploadResult?.fileName ?? null,
      fileSize: uploadResult?.fileSize ?? null,
      language: form.language || null,
      tags,
    });

    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Item created");
    handleOpenChange(false);
    router.refresh();
  }

  const showContent = TEXT_CONTENT_TYPES.includes(selectedType);
  const showLanguage = LANGUAGE_TYPES.includes(selectedType);
  const showUrl = selectedType === "link";
  const showFileUpload = FILE_TYPES.includes(selectedType);

  const canSubmit =
    form.title.trim().length > 0 &&
    (!showUrl || form.url.trim().length > 0) &&
    (!showFileUpload || uploadResult !== null);

  const triggerLabel = defaultType
    ? `Add ${ITEM_TYPES.find((t) => t.name === defaultType)?.label ?? "Item"}`
    : "New Item";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-1.5">
            {ITEM_TYPES.map((type) => (
              <button
                key={type.name}
                type="button"
                onClick={() => handleTypeChange(type.name)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedType === type.name
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <ItemTypeIcon name={type.icon} className="size-3.5" />
                {type.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.title}
              onChange={(e) => field("title", e.target.value)}
              placeholder="Item title"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Description
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => field("description", e.target.value)}
              placeholder="Optional description"
              rows={2}
              className="resize-none"
            />
          </div>

          {showFileUpload && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {selectedType === "image" ? "Image" : "File"}{" "}
                <span className="text-destructive">*</span>
              </label>
              <FileUpload
                itemType={selectedType as "file" | "image"}
                onUpload={setUploadResult}
                onClear={() => setUploadResult(null)}
              />
            </div>
          )}

          {showContent && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Content
              </label>
              {showLanguage ? (
                <CodeEditor
                  value={form.content}
                  onChange={(v) => field("content", v)}
                  language={form.language}
                />
              ) : (
                <MarkdownEditor
                  value={form.content}
                  onChange={(v) => field("content", v)}
                />
              )}
            </div>
          )}

          {showUrl && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                URL <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.url}
                onChange={(e) => field("url", e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </div>
          )}

          {showLanguage && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Language
              </label>
              <Input
                value={form.language}
                onChange={(e) => field("language", e.target.value)}
                placeholder="e.g. typescript"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tags
            </label>
            <Input
              value={form.tags}
              onChange={(e) => field("tags", e.target.value)}
              placeholder="react, hooks, typescript"
            />
            <p className="text-[11px] text-muted-foreground">Comma-separated</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || saving}>
              {saving ? "Creating…" : "Create Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
