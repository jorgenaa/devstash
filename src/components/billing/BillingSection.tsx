"use client";

import { useState } from "react";
import { Crown, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BillingIntervalToggle, SaveBadge } from "@/components/ui/billing-interval-toggle";
import { createCheckoutSession, createBillingPortalSession } from "@/actions/billing";
import { toast } from "sonner";

type Props = { isPro: boolean };

export function BillingSection({ isPro }: Props) {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      await createCheckoutSession(billingInterval);
    } catch {
      toast.error("Failed to start checkout. Please try again.");
      setLoading(false);
    }
  }

  async function handlePortal() {
    setLoading(true);
    try {
      await createBillingPortalSession();
    } catch {
      toast.error("Failed to open billing portal. Please try again.");
      setLoading(false);
    }
  }

  if (isPro) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-yellow-500" />
          <span className="text-sm font-medium">DevStash Pro</span>
          <Badge variant="outline" className="text-[10px] text-yellow-500 border-yellow-500/30">
            Active
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={handlePortal} disabled={loading}>
          Manage Billing
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className={`text-sm transition-colors ${billingInterval === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
          Monthly — $8
        </span>
        <BillingIntervalToggle value={billingInterval} onChange={setBillingInterval} />
        <span className={`flex items-center gap-1.5 text-sm transition-colors ${billingInterval === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
          Yearly — $72
          <SaveBadge />
        </span>
      </div>

      <ul className="space-y-1 text-sm text-muted-foreground">
        {["Unlimited items", "Unlimited collections", "File & image uploads", "All AI features", "Data export"].map((f) => (
          <li key={f} className="flex items-center gap-2">
            <CheckCircle className="size-3.5 text-emerald-500 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <Button onClick={handleCheckout} disabled={loading} className="w-fit">
        {loading ? "Redirecting…" : "Upgrade to Pro"}
      </Button>
    </div>
  );
}
