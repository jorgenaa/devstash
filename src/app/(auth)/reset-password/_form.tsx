"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, confirmPassword }),
    });

    const data = (await res.json()) as { error?: string };
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    router.push("/sign-in?reset=1");
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
          DS
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Set new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
          {error.includes("expired") && (
            <Link
              href="/forgot-password"
              className="mt-2 block text-xs underline underline-offset-4 hover:no-underline"
            >
              Request a new reset link
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          <KeyRound className="size-4" />
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}

export function ResetPasswordInvalidToken() {
  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm text-center">
      <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
        DS
      </div>
      <h1 className="text-xl font-semibold tracking-tight">Invalid reset link</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This password reset link is invalid or has already been used.
      </p>
      <Link
        href="/forgot-password"
        className="mt-6 inline-block text-sm text-foreground underline-offset-4 hover:underline"
      >
        Request a new reset link
      </Link>
    </div>
  );
}
