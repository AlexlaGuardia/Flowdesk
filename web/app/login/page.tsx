"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/magic-link", { email });
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stamp-900 px-4">
        <div className="max-w-sm w-full text-center">
          {/* Stamp-style confirmation badge */}
          <div className="inline-block mb-6">
            <div
              className="border-4 border-dashed border-stamp-600 rounded-arcade px-8 py-5 rotate-[-2deg]"
              style={{ boxShadow: "3px 3px 0 #1e0d07" }}
            >
              <p className="font-heading text-[9px] text-stamp-300 tracking-[0.2em] uppercase">
                Link Sent
              </p>
            </div>
          </div>
          <p className="font-mono text-sm text-stamp-400 mt-2">
            Check your inbox at{" "}
            <span className="text-stamp-200 font-bold">{email}</span>
          </p>
          <p className="font-mono text-xs text-stamp-600 mt-3 tracking-wider">
            The link expires in 15 minutes.
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-8 font-mono text-[10px] text-stamp-600 hover:text-stamp-400 uppercase tracking-[0.15em] transition-colors"
          >
            &#9664; Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(180deg, #3D1810 0%, #2a1209 100%)" }}
    >
      {/* Cabinet frame */}
      <div className="max-w-sm w-full">
        {/* Screen-style header */}
        <div
          className="rounded-t-[12px] px-6 pt-8 pb-6 text-center"
          style={{
            background: "#1a0a06",
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.4)",
          }}
        >
          {/* Scanline overlay */}
          <div className="relative">
            <div
              className="absolute inset-0 pointer-events-none rounded-[8px]"
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)",
              }}
            />
            <div className="w-2 h-2 rounded-full bg-ledger-green mx-auto mb-5 animate-pulse"
              style={{ boxShadow: "0 0 6px rgba(61,107,79,0.9)" }}
            />
            <h1
              className="font-heading text-[11px] text-stamp-200 tracking-[0.2em] leading-relaxed"
              style={{ textShadow: "0 0 14px rgba(229,174,159,0.35)" }}
            >
              SIGN IN
            </h1>
            <p className="font-mono text-[10px] text-stamp-600 mt-2 tracking-[0.2em] uppercase">
              Stampwerk
            </p>
          </div>
        </div>

        {/* Form panel */}
        <div
          className="rounded-b-[12px] px-6 py-6 border-t-0"
          style={{
            background: "linear-gradient(180deg, #2a1209 0%, #3D1810 100%)",
            boxShadow: "0 8px 0 #1e0d07, 4px 4px 0 #1e0d07, -4px 4px 0 #1e0d07",
          }}
        >
          <p className="font-mono text-[10px] text-stamp-500 mb-5 text-center tracking-[0.15em] uppercase">
            No password needed &mdash; we&apos;ll email you a link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-[9px] text-stamp-500 uppercase tracking-[0.2em] mb-2">
                Your email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 bg-stamp-900 border-[3px] border-stamp-700 rounded-arcade text-sm font-mono text-stamp-200
                           placeholder:text-stamp-700 outline-none
                           focus:border-stamp-500 focus:ring-2 focus:ring-stamp-800
                           transition-colors"
              />
            </div>
            {error && (
              <p className="font-mono text-[10px] text-void-red tracking-wider">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-insert-coin w-full disabled:opacity-50 disabled:animate-none disabled:shadow-arcade"
            >
              {loading ? "SENDING..." : "SEND MAGIC LINK"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-stamp-700" />
            <span className="font-mono text-[9px] text-stamp-600 uppercase tracking-[0.2em]">or</span>
            <div className="flex-1 h-px bg-stamp-700" />
          </div>

          {/* Google OAuth */}
          <a
            href="/api/auth/google"
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5
                       bg-stamp-900 border-[3px] border-stamp-700 rounded-arcade
                       font-mono text-[10px] text-stamp-300 uppercase tracking-[0.15em]
                       hover:border-stamp-500 hover:text-stamp-200 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" className="flex-shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </a>

          {/* Blinking prompt */}
          <p className="font-mono text-[9px] text-stamp-700 text-center mt-5 tracking-[0.2em] animate-blink">
            &#9608;
          </p>
        </div>
      </div>
    </div>
  );
}
