"use client";

import { useRef, useState } from "react";
import { FileIcon, ImageIcon, UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export type UploadResult = {
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

type Props = {
  itemType: "file" | "image";
  onUpload: (result: UploadResult) => void;
  onClear: () => void;
};

const IMAGE_ACCEPT = ".png,.jpg,.jpeg,.gif,.webp,.svg";
const FILE_ACCEPT = ".pdf,.txt,.md,.json,.yaml,.yml,.xml,.csv,.toml,.ini";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

type Status = "idle" | "uploading" | "done" | "error";

export function FileUpload({ itemType, onUpload, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (itemType === "image" && file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }

    setStatus("uploading");
    setProgress(0);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("itemType", itemType);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText) as UploadResult;
        setResult(data);
        setStatus("done");
        onUpload(data);
      } else {
        let message = "Upload failed";
        try {
          message = (JSON.parse(xhr.responseText) as { error: string }).error;
        } catch {}
        setErrorMsg(message);
        setStatus("error");
      }
    });

    xhr.addEventListener("error", () => {
      setErrorMsg("Network error — upload failed");
      setStatus("error");
    });

    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleClear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setStatus("idle");
    setProgress(0);
    setErrorMsg(null);
    onClear();
  }

  const accept = itemType === "image" ? IMAGE_ACCEPT : FILE_ACCEPT;
  const maxLabel = itemType === "image" ? "5 MB" : "10 MB";

  if (status === "done" && result) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
        {previewUrl ? (
          // blob: URLs from createObjectURL are not supported by next/image
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={result.fileName}
            className="h-16 w-16 shrink-0 rounded object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-muted">
            <FileIcon className="size-5 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{result.fileName}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(result.fileSize)}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          onClick={handleClear}
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  if (status === "uploading") {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UploadCloud className="size-4 shrink-0" />
          <span>Uploading… {progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors ${
        dragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/30"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        {itemType === "image" ? (
          <ImageIcon className="size-5 text-muted-foreground" />
        ) : (
          <FileIcon className="size-5 text-muted-foreground" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">
          Drop {itemType === "image" ? "an image" : "a file"} here, or{" "}
          <span className="text-primary">browse</span>
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {itemType === "image"
            ? "PNG, JPG, GIF, WebP, SVG"
            : "PDF, TXT, MD, JSON, YAML, XML, CSV, TOML"}
          {" "}· max {maxLabel}
        </p>
      </div>
      {status === "error" && errorMsg && (
        <p className="text-xs text-destructive">{errorMsg}</p>
      )}
    </div>
  );
}
