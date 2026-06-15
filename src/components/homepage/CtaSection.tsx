import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CtaSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%), #111111",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Ready to organize your
            <br />
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              developer knowledge?
            </span>
          </h2>
          <p className="text-white/50 text-base mb-8 max-w-md mx-auto">
            Join developers who use DevStash to stay organized and move faster.
          </p>
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "lg" }), "text-white font-medium px-8")}
            style={{ background: "#3b82f6" }}
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </section>
  );
}
