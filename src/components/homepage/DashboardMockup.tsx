const SIDEBAR_ITEMS = [
  { label: "Snippets", color: "#3b82f6", active: true },
  { label: "Prompts", color: "#8b5cf6" },
  { label: "Commands", color: "#f97316" },
  { label: "Notes", color: "#fde047" },
  { label: "Links", color: "#10b981" },
  { label: "Images", color: "#ec4899" },
];

const CARDS = [
  { title: "useDebounce hook", tag: "react", accent: "#3b82f6" },
  { title: "GPT-4o system prompt", tag: "ai", accent: "#8b5cf6" },
  { title: "git log --oneline", tag: "git", accent: "#f97316" },
  { title: "API design notes", tag: "notes", accent: "#fde047" },
  { title: "MDN Web Docs", tag: "docs", accent: "#10b981" },
  { title: "Design tokens.png", tag: "image", accent: "#ec4899" },
];

export default function DashboardMockup() {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-white/40 text-center font-mono">...with DevStash</p>
      <div
        className="rounded-xl overflow-hidden flex"
        style={{
          width: 340,
          height: 280,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "#0f0f0f",
        }}
      >
        {/* Sidebar */}
        <div
          className="flex flex-col gap-1 p-2 pt-3 shrink-0"
          style={{ width: 90, borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="font-bold text-white text-[10px] mb-1 px-1"
          >
            DS
          </div>
          {SIDEBAR_ITEMS.map(({ label, color, active }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-1 py-0.5 rounded text-[9px]"
              style={{
                color: active ? "#ffffff" : "rgba(255,255,255,0.4)",
                background: active ? "rgba(255,255,255,0.06)" : "transparent",
              }}
            >
              <span
                className="rounded-full shrink-0"
                style={{ width: 5, height: 5, background: color }}
              />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 p-2 overflow-hidden">
          <div className="grid grid-cols-2 gap-1.5">
            {CARDS.map(({ title, tag, accent }) => (
              <div
                key={title}
                className="rounded p-1.5 relative overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ background: accent }}
                />
                <div className="text-[8px] text-white/80 truncate leading-tight mt-0.5">{title}</div>
                <div
                  className="mt-1 text-[7px] px-1 py-0.5 rounded-sm inline-block"
                  style={{ background: `${accent}22`, color: accent }}
                >
                  {tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
