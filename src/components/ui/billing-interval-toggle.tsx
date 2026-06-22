"use client";

type Props = {
  value: "monthly" | "yearly";
  onChange: (v: "monthly" | "yearly") => void;
};

export function BillingIntervalToggle({ value, onChange }: Props) {
  const isYearly = value === "yearly";
  return (
    <button
      role="switch"
      aria-checked={isYearly}
      aria-label="Billing period"
      onClick={() => onChange(isYearly ? "monthly" : "yearly")}
      className="relative h-5 w-10 cursor-pointer rounded-full transition-colors"
      style={{ background: isYearly ? "#3b82f6" : "rgba(255,255,255,0.15)" }}
    >
      <span
        className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
        style={{ transform: isYearly ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

export function SaveBadge({ className }: { className?: string }) {
  return (
    <span className={`rounded bg-blue-500/10 px-1.5 py-0.5 text-xs font-medium text-blue-400 ${className ?? ""}`}>
      Save 25%
    </span>
  );
}
