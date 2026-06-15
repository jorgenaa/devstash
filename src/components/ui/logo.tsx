import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-1.5", className)}>
      <FolderOpen className="size-5 shrink-0 text-[#3b82f6]" />
      <span className="font-semibold text-sm">DevStash</span>
    </span>
  );
}
