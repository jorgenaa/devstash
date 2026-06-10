"use client";

import React from "react";
import {
  Download,
  FileArchive,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  File,
} from "lucide-react";

import type { DashboardItem } from "@/lib/db/items";
import { useItemDrawer } from "@/components/items/ItemDrawerContext";

type IconComponent = React.ComponentType<{ className?: string }>;

function getFileIcon(fileName: string | null): IconComponent {
  if (!fileName) return File;
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"].includes(ext)) return FileImage;
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return FileVideo;
  if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) return FileArchive;
  if (["xls", "xlsx", "csv"].includes(ext)) return FileSpreadsheet;
  if (["js", "ts", "tsx", "jsx", "py", "rb", "go", "rs", "java", "php"].includes(ext)) return FileCode;
  if (["txt", "md", "pdf", "doc", "docx"].includes(ext)) return FileText;
  return File;
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileListRow({ item }: { item: DashboardItem }) {
  const { openDrawer } = useItemDrawer();
  const downloadUrl = item.fileUrl ? `/api/download/${item.fileUrl}` : null;

  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = item.fileName ?? item.title;
    a.click();
  }

  return (
    <button
      type="button"
      onClick={() => openDrawer(item.id)}
      className="group flex w-full items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="shrink-0 text-muted-foreground">
        {React.createElement(getFileIcon(item.fileName), { className: "size-5" })}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.fileName ?? item.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground sm:flex-nowrap">
          {item.title !== item.fileName && (
            <span className="truncate">{item.title}</span>
          )}
          {item.fileSize !== null && (
            <span className="shrink-0">{formatFileSize(item.fileSize)}</span>
          )}
          <span className="shrink-0">
            {item.updatedAt.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {downloadUrl && (
        <button
          type="button"
          onClick={handleDownload}
          title="Download"
          className="shrink-0 rounded p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Download className="size-4" />
        </button>
      )}
    </button>
  );
}
