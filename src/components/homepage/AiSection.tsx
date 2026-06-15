import { Check, Sparkles } from "lucide-react";

const CHECKLIST = [
  {
    title: "Auto-tag suggestions",
    description: "AI reads your content and suggests relevant tags",
  },
  {
    title: "AI summaries",
    description: "Get a plain-English summary of any item instantly",
  },
  {
    title: "Explain this code",
    description: "Plain-English explanation of any snippet",
  },
  {
    title: "Prompt optimizer",
    description: "Improve and refine your AI prompts automatically",
  },
];

export default function AiSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Left: content */}
          <div className="flex-1">
            <div
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full mb-6 font-mono"
              style={{
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.25)",
                color: "#a78bfa",
              }}
            >
              <Sparkles size={11} />
              Pro Feature
            </div>

            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              Your AI-powered
              <br />
              knowledge assistant
            </h2>

            <p className="text-white/50 text-sm leading-relaxed mb-8">
              Let AI do the heavy lifting — auto-tag items, generate summaries, explain code, and optimize your prompts.
            </p>

            <ul className="flex flex-col gap-4">
              {CHECKLIST.map(({ title, description }) => (
                <li key={title} className="flex items-start gap-3">
                  <span
                    className="flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5"
                    style={{ background: "rgba(59,130,246,0.15)" }}
                  >
                    <Check size={11} style={{ color: "#60a5fa" }} />
                  </span>
                  <span className="text-sm text-white/70">
                    <strong className="text-white">{title}</strong> — {description}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: code window mockup */}
          <div className="flex-1 w-full">
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {/* Header */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
                </div>
                <span className="text-white/40 text-xs font-mono ml-2">useOptimisticUpdate.ts</span>
              </div>

              {/* Code */}
              <pre
                className="px-5 py-4 text-xs font-mono leading-relaxed overflow-x-auto"
                style={{ color: "#d4d4d4" }}
              >
                <code>
                  <span style={{ color: "#569cd6" }}>{"export function "}</span>
                  <span style={{ color: "#dcdcaa" }}>{"useOptimisticUpdate"}</span>
                  <span style={{ color: "#808080" }}>{"<"}</span>
                  <span style={{ color: "#4ec9b0" }}>{"T"}</span>
                  <span style={{ color: "#808080" }}>{">"}</span>
                  {"(\n  "}
                  <span style={{ color: "#9cdcfe" }}>{"initialData"}</span>
                  {": "}
                  <span style={{ color: "#4ec9b0" }}>{"T"}</span>
                  {",\n  "}
                  <span style={{ color: "#9cdcfe" }}>{"updateFn"}</span>
                  {": ("}
                  <span style={{ color: "#9cdcfe" }}>{"data"}</span>
                  {": "}
                  <span style={{ color: "#4ec9b0" }}>{"T"}</span>
                  {") => "}
                  <span style={{ color: "#4ec9b0" }}>{"T\n"}</span>
                  {") {\n  "}
                  <span style={{ color: "#569cd6" }}>{"const"}</span>
                  {" ["}
                  <span style={{ color: "#9cdcfe" }}>{"optimistic"}</span>
                  {", "}
                  <span style={{ color: "#9cdcfe" }}>{"setOptimistic"}</span>
                  {"] =\n    "}
                  <span style={{ color: "#dcdcaa" }}>{"useState"}</span>
                  {"("}
                  <span style={{ color: "#9cdcfe" }}>{"initialData"}</span>
                  {");\n\n  "}
                  <span style={{ color: "#569cd6" }}>{"return"}</span>
                  {" { "}
                  <span style={{ color: "#9cdcfe" }}>{"optimistic"}</span>
                  {", "}
                  <span style={{ color: "#dcdcaa" }}>{"update"}</span>
                  {": ("}
                  <span style={{ color: "#9cdcfe" }}>{"d"}</span>
                  {": "}
                  <span style={{ color: "#4ec9b0" }}>{"T"}</span>
                  {") => {\n    "}
                  <span style={{ color: "#dcdcaa" }}>{"setOptimistic"}</span>
                  {"("}
                  <span style={{ color: "#dcdcaa" }}>{"updateFn"}</span>
                  {"("}
                  <span style={{ color: "#9cdcfe" }}>{"d"}</span>
                  {"));\n  }};\n}"}
                </code>
              </pre>

              {/* AI tags */}
              <div
                className="px-5 py-3 flex flex-wrap gap-2 items-center"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="flex items-center gap-1 text-white/30 text-xs">
                  <Sparkles size={11} />
                  AI Generated Tags
                </span>
                {["react", "hooks", "typescript", "optimistic-ui", "state"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full font-mono"
                    style={{
                      background: "rgba(59,130,246,0.12)",
                      color: "#60a5fa",
                      border: "1px solid rgba(59,130,246,0.2)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
