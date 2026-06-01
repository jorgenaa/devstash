"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
          DS
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Forgot password?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-4 text-center">
          <div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
            If an account exists for <span className="font-medium text-foreground">{email}</span>, you&apos;ll receive a reset link shortly.
          </div>
          <Link
            href="/sign-in"
            className="block text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
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
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <Mail className="size-4" />
              {loading ? "Sending…" : "Send reset link"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/sign-in"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
