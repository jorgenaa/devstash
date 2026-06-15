"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(8,8,8,0.95)" : "rgba(8,8,8,0.6)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid transparent",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14">
        <Link href="/" className="text-white">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="text-white/60 hover:text-white transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-white/60 hover:text-white transition-colors">
            Pricing
          </a>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "sm" }), "text-white hover:opacity-90")}
            style={{ background: "#3b82f6" }}
          >
            Get Started
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-white/70 hover:text-white"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden border-t flex flex-col"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            background: "rgba(8,8,8,0.97)",
          }}
        >
          <a
            href="#features"
            onClick={() => setMobileOpen(false)}
            className="px-6 py-3 text-white/70 hover:text-white text-sm border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            Features
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileOpen(false)}
            className="px-6 py-3 text-white/70 hover:text-white text-sm border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            Pricing
          </a>
          <Link
            href="/sign-in"
            onClick={() => setMobileOpen(false)}
            className="px-6 py-3 text-white/70 hover:text-white text-sm border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            Sign In
          </Link>
          <div className="px-6 py-4">
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className={cn(buttonVariants(), "w-full text-white justify-center")}
              style={{ background: "#3b82f6" }}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
