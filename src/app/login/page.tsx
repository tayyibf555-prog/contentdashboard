"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen bg-azen-bg flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-white text-3xl font-bold">azen</h1>
          <p className="text-azen-accent text-sm mt-1">content dashboard</p>
        </div>
        <form onSubmit={handleLogin} className="bg-azen-card border border-azen-border rounded-lg p-6">
          <h2 className="text-white text-lg font-semibold mb-4">Sign In</h2>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-md p-3 mb-4">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="text-azen-text text-[11px] block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2.5 text-white text-xs focus:outline-none focus:border-azen-accent"
            />
          </div>
          <div className="mb-6">
            <label className="text-azen-text text-[11px] block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2.5 text-white text-xs focus:outline-none focus:border-azen-accent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-azen-accent text-azen-bg py-2.5 rounded-md text-xs font-semibold hover:bg-azen-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
