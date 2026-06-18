"use client";

import { useState } from "react";
import { Check, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createCheckoutSession } from "@/actions/billing";
import { toast } from "sonner";

const FREE_FEATURES: { text: string; included: boolean }[] = [
  { text: "50 items total", included: true },
  { text: "3 collections", included: true },
  { text: "All text item types", included: true },
  { text: "Basic search", included: true },
  { text: "File & image uploads", included: false },
  { text: "AI features", included: false },
  { text: "Data export", included: false },
];

const PRO_FEATURES = [
  "Unlimited items",
  "Unlimited collections",
  "File & image uploads",
  "All AI features",
  "Data export (JSON / ZIP)",
  "Priority support",
  "Custom types (coming soon)",
];

export function UpgradePricingCards() {
  const [yearly, setYearly] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      await createCheckoutSession(yearly ? "yearly" : "monthly");
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
        <button
          role="switch"
          aria-checked={yearly}
          aria-label="Billing period"
          onClick={() => setYearly((v) => !v)}
          className="relative h-5 w-10 cursor-pointer rounded-full transition-colors"
          style={{ background: yearly ? "#3b82f6" : "rgba(255,255,255,0.15)" }}
        >
          <span
            className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
            style={{ transform: yearly ? "translateX(20px)" : "translateX(0)" }}
          />
        </button>
        <span className={`flex items-center gap-1.5 text-sm transition-colors ${yearly ? "text-foreground" : "text-muted-foreground"}`}>
          Yearly
          <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-xs font-medium text-blue-400">
            Save 25%
          </span>
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
