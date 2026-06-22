"use client";

import { Sparkles } from "lucide-react";

type AiFieldHeaderProps = {
  label: string;
  isPro: boolean;
  loading: boolean;
  loadingLabel: string;
  idleLabel: string;
  onAction: () => void;
  children: React.ReactNode;
};

export function AiFieldHeader({
  label,
  isPro,
  loading,
  loadingLabel,
  idleLabel,
  onAction,
  children,
}: AiFieldHeaderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </label>
        {isPro && (
          <button
            type="button"
            onClick={onAction}
            disabled={loading}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            <Sparkles className="size-3" />
            {loading ? loadingLabel : idleLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
