"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Sparkles, AtSign, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Atmospheric radial glow behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px circle at 50% 30%, rgba(var(--color-azen-accent-rgb), 0.14), transparent 60%), radial-gradient(800px circle at 80% 80%, rgba(var(--color-azen-accent-rgb), 0.06), transparent 70%)",
        }}
      />
      <div className="relative w-full max-w-md">
        {/* Brand lockup */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <span
            className="h-11 w-11 rounded-xl flex items-center justify-center shadow-accent"
            style={{
              background:
                "linear-gradient(135deg, var(--color-azen-accent), color-mix(in srgb, var(--color-azen-accent) 55%, black))",
            }}
          >
            <Sparkles size={18} strokeWidth={2.2} className="text-azen-bg" />
          </span>
          <div>
            <div className="font-display font-semibold text-white text-[36px] leading-none tracking-tight">azen</div>
            <div className="text-azen-muted text-[10px] uppercase tracking-[0.3em] mt-1">content · hub</div>
          </div>
        </div>

        <form
          onSubmit={handleLogin}
          className="relative bg-azen-surface/80 backdrop-blur-md border border-azen-line rounded-xl shadow-pop overflow-hidden"
        >
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-azen-accent/70 to-transparent" />
          <div className="p-8">
            <h2 className="font-display font-semibold text-white text-display-sm tracking-tight leading-none mb-1">
              Welcome back.
            </h2>
            <p className="text-azen-text text-[13px] mb-7">Sign in to your content hub.</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-[12px] rounded-md px-3 py-2.5 mb-5">
                {error}
              </div>
            )}

            <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted mb-1.5">Email</label>
            <div className="flex items-center gap-2 bg-azen-bg border border-azen-line rounded-md px-3 py-2.5 focus-within:border-azen-accent transition-colors mb-4">
              <AtSign size={14} className="text-azen-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="flex-1 bg-transparent text-white text-[13px] placeholder:text-azen-muted focus:outline-none"
                placeholder="you@company.com"
              />
            </div>

            <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted mb-1.5">Password</label>
            <div className="flex items-center gap-2 bg-azen-bg border border-azen-line rounded-md px-3 py-2.5 focus-within:border-azen-accent transition-colors mb-6">
              <Lock size={14} className="text-azen-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="flex-1 bg-transparent text-white text-[13px] placeholder:text-azen-muted focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-azen-accent text-azen-bg py-2.5 rounded-md text-[13px] font-semibold shadow-accent hover:shadow-accent-strong hover:-translate-y-px active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>

        <p className="text-center text-azen-muted text-[11px] mt-5">
          The content command centre for <span className="text-azen-text">@azen_ai</span> & <span className="text-azen-text">@tayyib.ai</span>
        </p>
      </div>
    </div>
  );
}
