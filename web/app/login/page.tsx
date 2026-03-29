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
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <div className="max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-stamp-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-stamp-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-ink-900">Check your email</h2>
          <p className="mt-2 text-sm text-ink-500">
            We sent a sign-in link to <strong>{email}</strong>
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-6 text-sm ink-link"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment">
      <div className="max-w-sm w-full">
        <h1 className="text-2xl font-bold text-center text-ink-900 font-heading letterpress">Sign in to Stampwerk</h1>
        <p className="mt-2 text-center text-sm text-ink-500">No password needed. We'll email you a link.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="input-field w-full"
          />
          {error && <p className="text-sm text-void-red">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
