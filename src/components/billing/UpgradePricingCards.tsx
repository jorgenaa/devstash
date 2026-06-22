"use client";

import { useState } from "react";
import { Check, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BillingIntervalToggle, SaveBadge } from "@/components/ui/billing-interval-toggle";
import { FREE_FEATURES, PRO_FEATURES } from "@/lib/pricing-features";
import { createCheckoutSession } from "@/actions/billing";
import { toast } from "sonner";

export function UpgradePricingCards() {
  const [interval, setInterval] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);
  const yearly = interval === "yearly";

  async function handleUpgrade() {
    setLoading(true);
    try {
      await createCheckoutSession(interval);
    } catch {
      toast.error("Failed to start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Toggle */}
      <div className="flex items-center gap-3">
        <span className={`text-sm transition-colors ${!yearly ? "text-foreground" : "text-muted-foreground"}`}>
          Monthly
        </span>
        <BillingIntervalToggle value={interval} onChange={setInterval} />
        <span className={`flex items-center gap-1.5 text-sm transition-colors ${yearly ? "text-foreground" : "text-muted-foreground"}`}>
          Yearly
          <SaveBadge />
        </span>
      </div>

      {/* Cards */}
      <div className="grid w-full max-w-2xl grid-cols-1 gap-5 md:grid-cols-2">
        {/* Free */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-2 font-semibold">Free</h3>
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-sm text-muted-foreground">/ month</span>
          </div>
          <ul className="mb-6 flex flex-col gap-3">
            {FREE_FEATURES.map(({ text, included }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm">
                {included ? (
                  <Check size={14} className="shrink-0 text-emerald-500" />
                ) : (
                  <X size={14} className="shrink-0 text-muted-foreground/40" />
                )}
                <span className={included ? "text-foreground/70" : "text-muted-foreground/40"}>
                  {text}
                </span>
              </li>
            ))}
          </ul>
          <div className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground">
            Current plan
          </div>
        </div>

        {/* Pro */}
        <div
          className="relative rounded-xl p-6"
          style={{
            background: "hsl(var(--card))",
            border: "1px solid #3b82f6",
            boxShadow: "0 0 0 1px rgba(59,130,246,0.15), 0 4px 24px rgba(59,130,246,0.08)",
          }}
        >
          <Badge
            className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1 bg-blue-500 text-white hover:bg-blue-500"
          >
            <Crown className="size-3" />
            Most Popular
          </Badge>

          <h3 className="mb-2 font-semibold">Pro</h3>
          <div className="mb-1 flex items-baseline gap-1">
            <span className="text-4xl font-bold">{yearly ? "$6" : "$8"}</span>
            <span className="text-sm text-muted-foreground">/ month</span>
          </div>
          {yearly && (
            <p className="mb-5 text-xs text-muted-foreground">$72 billed annually</p>
          )}

          <ul className={`mb-6 flex flex-col gap-3 ${!yearly ? "mt-6" : ""}`}>
            {PRO_FEATURES.map((text) => (
              <li key={text} className="flex items-center gap-2.5 text-sm">
                <Check size={14} className="shrink-0 text-blue-400" />
                <span className="text-foreground/70">{text}</span>
              </li>
            ))}
          </ul>

          <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-blue-500 text-white hover:bg-blue-600"
          >
            {loading ? "Redirecting…" : `Upgrade to Pro — ${yearly ? "$72 / year" : "$8 / month"}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
