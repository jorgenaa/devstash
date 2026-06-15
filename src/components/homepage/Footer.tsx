import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="px-6 py-12" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10 mb-10">
          {/* Brand */}
          <div className="flex-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <span
                className="text-sm font-bold px-1.5 py-0.5 rounded text-white"
                style={{ background: "#3b82f6" }}
              >
                DS
              </span>
              <span className="font-semibold text-white text-sm">DevStash</span>
            </Link>
            <p className="text-white/40 text-sm">Your developer knowledge hub.</p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div className="flex flex-col gap-3">
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Product</h4>
              <a href="#features" className="text-white/40 hover:text-white/70 text-sm transition-colors">Features</a>
              <a href="#pricing" className="text-white/40 hover:text-white/70 text-sm transition-colors">Pricing</a>
              <Link href="/dashboard" className="text-white/40 hover:text-white/70 text-sm transition-colors">Dashboard</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Account</h4>
              <Link href="/sign-in" className="text-white/40 hover:text-white/70 text-sm transition-colors">Sign In</Link>
              <Link href="/register" className="text-white/40 hover:text-white/70 text-sm transition-colors">Register</Link>
              <Link href="/settings" className="text-white/40 hover:text-white/70 text-sm transition-colors">Settings</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Legal</h4>
              <a href="#" className="text-white/40 hover:text-white/70 text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-white/40 hover:text-white/70 text-sm transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} className="pt-6">
          <p className="text-white/25 text-sm">
            © {year} DevStash. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
