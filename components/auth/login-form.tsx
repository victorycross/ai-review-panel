"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "magic-link">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push("/history");
      router.refresh();
    }
    setLoading(false);
  };

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  };

  if (magicLinkSent) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-center space-y-3">
        <div className="text-2xl">✉️</div>
        <p className="text-sm text-neutral-200 font-medium">Check your email</p>
        <p className="text-xs text-muted">
          We sent a sign-in link to <span className="text-neutral-300">{email}</span>.
          Click it to access techassist.
        </p>
        <button
          onClick={() => setMagicLinkSent(false)}
          className="text-xs text-accent hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6 space-y-5">
      <form
        onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-muted uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@brightpathtechnology.io"
            className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-neutral-200 placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {mode === "password" && (
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-neutral-200 placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        )}

        {error && (
          <p className="text-xs text-risk-critical bg-risk-critical/10 border border-risk-critical/30 rounded px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full rounded-md bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-medium text-white transition-colors"
        >
          {loading
            ? "Signing in…"
            : mode === "password"
              ? "Sign in"
              : "Send sign-in link"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface px-3 text-xs text-muted">or</span>
        </div>
      </div>

      <button
        onClick={() =>
          setMode((m) => (m === "password" ? "magic-link" : "password"))
        }
        className="w-full rounded-md border border-border bg-transparent hover:bg-surface-2 px-4 py-2.5 text-sm text-neutral-300 transition-colors"
      >
        {mode === "password" ? "Sign in with email link" : "Sign in with password"}
      </button>
    </div>
  );
}
