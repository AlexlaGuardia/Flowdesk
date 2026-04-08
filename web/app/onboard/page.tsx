"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function OnboardPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [brandColor, setBrandColor] = useState("#6366f1");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/onboard", {
        name,
        business_name: businessName,
        brand_color: brandColor,
      });
      await refresh();
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment px-4">
      <div className="max-w-md w-full">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-ledger" />
            <span className="font-heading text-xs text-ink-400 tracking-[0.2em] uppercase">Get Started</span>
            <div className="h-px flex-1 bg-ledger" />
          </div>
          <h1 className="font-heading text-[13px] text-ink-900 tracking-wider leading-relaxed">
            WELCOME TO<br />STAMPWERK
          </h1>
          <p className="font-mono text-xs text-ink-500 mt-3 tracking-wider">
            Tell us a bit about your business.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-field">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Alex"
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="label-field">Business name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Optional"
              className="input-field w-full"
            />
            <p className="font-mono text-xs text-ink-400 mt-1.5 tracking-wider">
              Shown on proposals and invoices.
            </p>
          </div>

          <div>
            <label className="label-field">Brand color</label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-10 h-10 rounded-retro border-[3px] border-ledger cursor-pointer bg-paper p-0.5"
                  style={{ boxShadow: "2px 2px 0 rgba(201,191,168,0.5)" }}
                />
              </div>
              <div>
                <span className="font-mono text-sm text-ink-700 tracking-wider">{brandColor.toUpperCase()}</span>
                <p className="font-mono text-xs text-ink-400 mt-0.5 tracking-wider">
                  Used on your client portal.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !name}
              className="btn-insert-coin w-full disabled:opacity-50 disabled:animate-none disabled:shadow-arcade"
            >
              {loading ? "LOADING..." : "COMPLETE SETUP"}
            </button>
            {!name && (
              <p className="font-mono text-xs text-ink-400 text-center mt-3 tracking-wider">
                Enter your name to continue
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
