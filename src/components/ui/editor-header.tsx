"use client";

import { Clipboard, Crown, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const MAC_DOTS = ["#ff5f57", "#febc2e", "#28c840"] as const;

export function EditorMacDots() {
  return (
    <div className="flex items-center gap-1.5">
      {MAC_DOTS.map((color) => (
        <span
          key={color}
          className="block size-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

export function EditorCopyButton({ value }: { value: string }) {
  async function handleCopy() {
    if (!value) {
      toast.error("Nothing to copy");
      return;
    }
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200"
    >
      <Clipboard className="size-3" />
      Copy
    </button>
  );
}

type AiEditorButtonProps = {
  isPro: boolean;
  loading: boolean;
  loadingLabel: string;
  idleLabel: string;
  onAction: () => void;
};

export function AiEditorButton({ isPro, loading, loadingLabel, idleLabel, onAction }: AiEditorButtonProps) {
  if (isPro) {
    return (
      <button
        type="button"
        onClick={onAction}
        disabled={loading}
        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200 disabled:opacity-50"
      >
        {loading ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
        {loading ? loadingLabel : idleLabel}
      </button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            disabled
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-zinc-600 opacity-60"
          >
            <Crown className="size-3" />
            {idleLabel}
          </button>
        }
      />
      <TooltipContent>AI features require Pro subscription</TooltipContent>
    </Tooltip>
  );
}
