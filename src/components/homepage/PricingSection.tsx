"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Simple pricing</h2>
          <p className="text-white/50 mb-8">Start free. Upgrade when you&apos;re ready.</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3">
            <span className={`text-sm transition-colors ${!yearly ? "text-white" : "text-white/40"}`}>
              Monthly
            </span>
            <button
              role="switch"
              aria-checked={yearly}
              aria-label="Billing period"
              onClick={() => setYearly((v) => !v)}
              className="relative w-10 h-5 rounded-full transition-colors cursor-pointer"
              style={{ background: yearly ? "#3b82f6" : "rgba(255,255,255,0.15)" }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                style={{ transform: yearly ? "translateX(20px)" : "translateX(0)" }}
              />
            </button>
            <span className={`text-sm flex items-center gap-1.5 transition-colors ${yearly ? "text-white" : "text-white/40"}`}>
              Yearly
              <span
                className="text-xs px-1.5 py-0.5 rounded font-medium"
                style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}
              >
                Save 25%
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {/* Free */}
          <div
            className="rounded-xl p-6"
            style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <h3 className="text-white font-semibold mb-2">Free</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-white/40 text-sm">/ month</span>
            </div>
            <ul className="flex flex-col gap-3 mb-6">
              {FREE_FEATURES.map(({ text, included }) => (
                <li key={text} className="flex items-center gap-2.5 text-sm">
                  {included ? (
                    <Check size={14} style={{ color: "#10b981" }} className="shrink-0" />
                  ) : (
                    <X size={14} className="shrink-0 text-white/20" />
                  )}
                  <span className={included ? "text-white/70" : "text-white/25"}>{text}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full justify-center border-white/25 text-white/90 hover:text-white hover:bg-white/5"
              )}
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro */}
          <div
            className="rounded-xl p-6 relative"
            style={{
              background: "#111111",
              border: "1px solid #3b82f6",
              boxShadow:
                "0 0 0 1px rgba(59,130,246,0.2), 0 4px 32px rgba(59,130,246,0.08)",
            }}
          >
            <span
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: "#3b82f6", color: "white" }}
            >
              Most Popular
            </span>
            <h3 className="text-white font-semibold mb-2">Pro</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-white">{yearly ? "$6" : "$8"}</span>
              <span className="text-white/40 text-sm">/ month</span>
            </div>
            {yearly && (
              <p className="text-white/40 text-xs mb-5">$72 billed annually</p>
            )}
            <ul className={`flex flex-col gap-3 mb-6 ${!yearly ? "mt-6" : ""}`}>
              {PRO_FEATURES.map((text) => (
                <li key={text} className="flex items-center gap-2.5 text-sm">
                  <Check size={14} style={{ color: "#3b82f6" }} className="shrink-0" />
                  <span className="text-white/70">{text}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className={cn(buttonVariants(), "w-full justify-center text-white")}
              style={{ background: "#3b82f6" }}
            >
              Get Pro
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
