"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { createItem } from "@/actions/items";
import { generateAutoTags, generateDescription, optimizePrompt } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { CollectionSelect } from "@/components/ui/collection-select";
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
import { TEXT_CONTENT_TYPES, LANGUAGE_TYPES, FILE_TYPES, SUPPORTED_LANGUAGES } from "@/lib/item-type-constants";
import { FormField } from "@/components/ui/form-field";
import { AiFieldHeader } from "@/components/ui/ai-action-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type UserCollection = { id: string; name: string };

type FormState = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
  collectionIds: string[];
};

function defaultForm(): FormState {
  return {
    title: "",
    description: "",
    content: "",
    url: "",
    language: "",
    tags: "",
    collectionIds: [],
  };
}

type Props = {
  defaultType?: TypeName;
  isPro?: boolean;
};

export function NewItemDialog({ defaultType, isPro = false }: Props = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TypeName>(defaultType ?? "snippet");
  const [form, setForm] = useState<FormState>(defaultForm);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  function field(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      fetch("/api/collections")
        .then((res) => res.ok ? res.json() as Promise<UserCollection[]> : [])
        .then(setCollections)
        .catch(() => {});
    } else {
      setForm(defaultForm());
      setSelectedType(defaultType ?? "snippet");
      setUploadResult(null);
      setSuggestedTags([]);
      setOptimizedPrompt(null);
    }
  }

  async function handleGenerateDescription() {
    if (!form.title.trim()) {
      toast.error("Add a title before generating a description");
      return;
    }
    setGeneratingDescription(true);
    const result = await generateDescription({
      typeName: selectedType,
      title: form.title,
      content: form.content || undefined,
      url: form.url || undefined,
      fileName: uploadResult?.fileName || undefined,
    });
    setGeneratingDescription(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    field("description", result.description);
  }

  async function handleOptimize() {
    if (!form.content.trim()) {
      toast.error("Add content before optimizing");
      return;
    }
    setOptimizing(true);
    const result = await optimizePrompt({
      title: form.title || undefined,
      content: form.content,
    });
    setOptimizing(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setOptimizedPrompt(result.optimizedPrompt);
  }

  function handleAcceptOptimized() {
    if (!optimizedPrompt) return;
    field("content", optimizedPrompt);
    setOptimizedPrompt(null);
  }

  function handleRejectOptimized() {
    setOptimizedPrompt(null);
  }

  async function handleSuggestTags() {
    if (!form.title.trim()) {
      toast.error("Add a title before suggesting tags");
      return;
    }
    setSuggesting(true);
    const result = await generateAutoTags({
      typeName: selectedType,
      title: form.title,
      content: form.content || undefined,
    });
    setSuggesting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setSuggestedTags(result.tags);
  }

  function acceptTag(tag: string) {
    const existing = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!existing.includes(tag)) {
      const next = [...existing, tag].join(", ");
      setForm((prev) => ({ ...prev, tags: next }));
    }
    setSuggestedTags((prev) => prev.filter((t) => t !== tag));
  }

  function rejectTag(tag: string) {
    setSuggestedTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleTypeChange(type: TypeName) {
    setSelectedType(type);
    setUploadResult(null);
    setOptimizedPrompt(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const isFileType = (FILE_TYPES as readonly string[]).includes(selectedType);

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
      collectionIds: form.collectionIds,
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

  const showContent = (TEXT_CONTENT_TYPES as readonly string[]).includes(selectedType);
  const showLanguage = (LANGUAGE_TYPES as readonly string[]).includes(selectedType);
  const showUrl = selectedType === "link";
  const showFileUpload = (FILE_TYPES as readonly string[]).includes(selectedType);

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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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

          <FormField label="Title" required>
            <Input
              value={form.title}
              onChange={(e) => field("title", e.target.value)}
              placeholder="Item title"
              autoFocus
            />
          </FormField>

          <AiFieldHeader
            label="Description"
            isPro={isPro}
            loading={generatingDescription}
            loadingLabel="Generating…"
            idleLabel="Generate"
            onAction={handleGenerateDescription}
          >
            <Textarea
              value={form.description}
              onChange={(e) => field("description", e.target.value)}
              placeholder="Optional description"
              rows={2}
              className="resize-none"
            />
          </AiFieldHeader>

          {showFileUpload && (
            <FormField label={selectedType === "image" ? "Image" : "File"} required>
              <FileUpload
                itemType={selectedType as "file" | "image"}
                onUpload={setUploadResult}
                onClear={() => setUploadResult(null)}
              />
            </FormField>
          )}

          {showLanguage && (
            <FormField label="Language">
              <Select
                value={form.language || "plaintext"}
                onValueChange={(v) => field("language", !v || v === "plaintext" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}

          {showContent && (
            <FormField label="Content">
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
                  optimize={selectedType === "prompt" ? {
                    isPro,
                    onOptimize: handleOptimize,
                    optimizing,
                    optimizedPrompt,
                    onAccept: handleAcceptOptimized,
                    onReject: handleRejectOptimized,
                  } : undefined}
                />
              )}
            </FormField>
          )}

          {showUrl && (
            <FormField label="URL" required>
              <Input
                value={form.url}
                onChange={(e) => field("url", e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </FormField>
          )}

          <AiFieldHeader
            label="Tags"
            isPro={isPro}
            loading={suggesting}
            loadingLabel="Suggesting…"
            idleLabel="Suggest Tags"
            onAction={handleSuggestTags}
          >
            <Input
              value={form.tags}
              onChange={(e) => field("tags", e.target.value)}
              placeholder="react, hooks, typescript"
            />
            <p className="text-[11px] text-muted-foreground">Comma-separated</p>
            {suggestedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {suggestedTags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => acceptTag(tag)}
                      aria-label={`Accept tag ${tag}`}
                      className="text-emerald-500 hover:text-emerald-400"
                    >
                      <Check className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectTag(tag)}
                      aria-label={`Reject tag ${tag}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </AiFieldHeader>

          <FormField label="Collections">
            <CollectionSelect
              collections={collections}
              value={form.collectionIds}
              onChange={(ids) => setForm((prev) => ({ ...prev, collectionIds: ids }))}
            />
          </FormField>

          <div className="sticky bottom-0 -mx-4 -mb-4 flex justify-end gap-2 border-t border-border bg-popover px-4 py-4">
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
