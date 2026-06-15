import { Code, Sparkles, Terminal, StickyNote, Link2, File } from "lucide-react";

const FEATURES = [
  {
    Icon: Code,
    title: "Code Snippets",
    description: "Save reusable code with syntax highlighting, language tags, and instant copy.",
    color: "#3b82f6",
  },
  {
    Icon: Sparkles,
    title: "AI Prompts",
    description: "Store and refine your best prompts. Organize by model, task, or workflow.",
    color: "#8b5cf6",
  },
  {
    Icon: Terminal,
    title: "CLI Commands",
    description: "Never google that command again. Save shell commands with notes and tags.",
    color: "#f97316",
  },
  {
    Icon: StickyNote,
    title: "Notes",
    description: "Write markdown notes for architecture decisions, meeting summaries, and ideas.",
    color: "#fde047",
  },
  {
    Icon: Link2,
    title: "Links",
    description: "Bookmark docs, tools, and resources. Never lose a useful URL again.",
    color: "#10b981",
  },
  {
    Icon: File,
    title: "Files & Images",
    description: "Upload PDFs, screenshots, diagrams — stored securely in the cloud.",
    color: "#6b7280",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">
            Everything developers need
          </h2>
          <p className="text-white/50 text-base">
            Seven item types built for how you actually work
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ Icon, title, description, color }) => (
            <div
              key={title}
              className="relative rounded-xl p-5 overflow-hidden"
              style={{
                background: "#111111",
                border: "1px solid rgba(255,255,255,0.07)",
                borderTop: `2px solid ${color}`,
              }}
            >
              <div
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg mb-4"
                style={{ background: `${color}1a` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <h3 className="text-white font-semibold text-sm mb-2">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
