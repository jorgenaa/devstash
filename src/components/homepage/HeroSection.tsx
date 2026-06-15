import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ChaosAnimation from "./ChaosAnimation";
import DashboardMockup from "./DashboardMockup";

export default function HeroSection() {
  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-12">
        {/* Text — centered above the visual */}
        <div className="text-center max-w-2xl">
          <div
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full mb-6 font-mono"
            style={{
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.2)",
              color: "#60a5fa",
            }}
          >
            ✦ The developer knowledge hub
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-white mb-4 text-balance">
            Stop Losing Your
            <br />
            <span
              style={{
                display: "inline-block",
                backgroundImage: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Developer Knowledge
            </span>
          </h1>

          <p className="text-white/60 text-base leading-relaxed mb-8 max-w-md mx-auto">
            Snippets, prompts, commands, notes, files, and links — all in one fast, searchable place. Built for developers who want to stay organized.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }), "text-white font-medium")}
              style={{ background: "#3b82f6" }}
            >
              Get Started Free
            </Link>
            <a
              href="#features"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/20 text-white/80 hover:text-white hover:bg-white/5"
              )}
            >
              See Features
            </a>
          </div>
        </div>

        {/* Visual — below the text */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <ChaosAnimation />

          <div className="flex items-center justify-center rotate-90 md:rotate-0">
            <div className="text-2xl animate-pulse" style={{ color: "#3b82f6" }}>
              →
            </div>
          </div>

          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
