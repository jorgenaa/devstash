"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c.995.005 1.999.138 2.936.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  EmailNotVerified: "Please verify your email before signing in.",
  InvalidToken: "This verification link is invalid or has expired.",
  default: "Something went wrong. Please try again.",
};

export function SignInForm({
  error: errorParam,
  callbackUrl = "/dashboard",
  registered = false,
  verified = false,
  reset = false,
}: {
  error?: string;
  callbackUrl?: string;
  registered?: boolean;
  verified?: boolean;
  reset?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    errorParam
      ? (ERROR_MESSAGES[errorParam] ?? ERROR_MESSAGES.default)
      : null
  );
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const toastShown = useRef(false);

  const isUnverified = errorParam === "EmailNotVerified";

  useEffect(() => {
    if (toastShown.current) return;
    if (registered) {
      toastShown.current = true;
      toast.success("Account created! Please check your email to verify your account.");
    } else if (verified) {
      toastShown.current = true;
      toast.success("Email verified! You can now sign in.");
    } else if (reset) {
      toastShown.current = true;
      toast.success("Password updated! You can now sign in with your new password.");
    }
  }, [registered, verified, reset]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(ERROR_MESSAGES.CredentialsSignin);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  async function handleResend() {
    if (!email) {
      setError("Enter your email above, then click resend.");
      return;
    }
    setResendLoading(true);
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResendLoading(false);
    toast.success("Verification email sent — check your inbox.");
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
          DS
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          Sign in to DevStash
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your developer knowledge hub
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
          {isUnverified && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="mt-2 block text-xs underline underline-offset-4 hover:no-underline disabled:opacity-50"
            >
              {resendLoading ? "Sending…" : "Resend verification email"}
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          <LogIn className="size-4" />
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-2 text-xs text-muted-foreground">or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => signIn("github", { callbackUrl })}
      >
        <GitHubIcon className="size-4" />
        Sign in with GitHub
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href="/register"
          className="text-foreground underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
