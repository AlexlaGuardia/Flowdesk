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
              INSERT COIN
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
              {loading ? "SENDING..." : "PRESS START"}
            </button>
          </form>

          {/* Blinking prompt */}
          <p className="font-mono text-[9px] text-stamp-700 text-center mt-5 tracking-[0.2em] animate-blink">
            &#9608;
          </p>
        </div>
      </div>
    </div>
  );
}
