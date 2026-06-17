"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

type Props = { message: string };

export function UpgradePrompt({ message }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm">
      <Crown className="size-4 shrink-0 text-yellow-500" />
      <span className="text-muted-foreground">{message}</span>
      <Link
        href="/settings#billing"
        className={buttonVariants({ variant: "outline", size: "sm", className: "ml-auto shrink-0" })}
      >
        Upgrade
      </Link>
    </div>
  );
}
