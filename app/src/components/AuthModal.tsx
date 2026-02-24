"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

/*
 * NOTE: Google and Telegram login buttons are MOCK placeholders.
 * Wire real OAuth providers when Supabase is connected:
 *   - Google: supabase.auth.signInWithOAuth({ provider: "google" })
 *   - Telegram: use Telegram Login Widget + custom Supabase auth
 */

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (tab === "register") {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
    }

    window.location.href = "/";
  }

  function handleMockOAuth(provider: string) {
    // Mock: sign in as demo user and redirect
    supabase.auth.signInWithPassword({
      email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@secretlust.com",
      password: "admin123",
    }).then(() => {
      window.location.href = "/";
    });
    void provider;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[400px] bg-[#111015] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/50 hover:text-white cursor-pointer z-10 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        {/* Header */}
        <div className="pt-6 pb-4 px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <path d="M11 2C6.03 2 2 6.03 2 11s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm1 14.5v-4.5H8V10h4V7.5l3.5 3.5-3.5 3.5z" fill="white" />
              </svg>
            </span>
            <span className="text-white text-lg font-extrabold tracking-tight uppercase">
              SecretLust<span className="text-rose-500">AI</span>
            </span>
          </div>
          <p className="text-white/40 text-sm">
            {tab === "register" ? "Create your account to start generating" : "Welcome back"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mx-6 bg-white/[0.04] rounded-lg p-1 mb-5">
          <button
            onClick={() => { setTab("register"); setError(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
              tab === "register" ? "bg-rose-600 text-white" : "text-white/40 hover:text-white"
            }`}
          >
            Register
          </button>
          <button
            onClick={() => { setTab("login"); setError(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
              tab === "login" ? "bg-rose-600 text-white" : "text-white/40 hover:text-white"
            }`}
          >
            Login
          </button>
        </div>

        {/* OAuth buttons — MOCK, see note at top */}
        <div className="px-6 space-y-2.5 mb-4">
          <button
            onClick={() => handleMockOAuth("google")}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-white text-[#1a1a1a] text-sm font-semibold rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => handleMockOAuth("telegram")}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-[#2AABEE] text-white text-sm font-semibold rounded-lg cursor-pointer hover:bg-[#229ED9] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Continue with Telegram
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 px-6 mb-4">
          <div className="flex-1 h-px bg-white/[0.08]" />
          <span className="text-[11px] text-white/30 uppercase tracking-wider">or with email</span>
          <div className="flex-1 h-px bg-white/[0.08]" />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full px-3.5 py-2.5 mb-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-rose-600/50"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={tab === "register" ? "Create password (min. 6 chars)" : "Password"}
            required
            className="w-full px-3.5 py-2.5 mb-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-rose-600/50"
          />

          {error && <p className="text-sm text-rose-400 mb-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-sm font-bold rounded-lg cursor-pointer hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {loading ? "Please wait..." : tab === "register" ? "Create Account" : "Sign In"}
          </button>

          {/* Demo hint */}
          <div className="mt-4 text-center">
            <p className="text-[11px] text-white/20">Demo: admin@secretlust.com / admin123</p>
          </div>
        </form>
      </div>
    </div>
  );
}
