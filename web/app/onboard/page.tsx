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
    <div className="min-h-screen flex items-center justify-center bg-parchment">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-ink-900 font-heading letterpress">Welcome to Stampwerk</h1>
        <p className="mt-2 text-sm text-ink-500">Tell us a bit about your business.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="label-field">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
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
          </div>
          <div>
            <label className="label-field">Brand color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-10 h-10 rounded-retro border border-ledger cursor-pointer"
              />
              <span className="text-sm text-ink-400 font-mono">{brandColor}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !name}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {loading ? "LOADING..." : "PRESS START"}
          </button>
        </form>
      </div>
    </div>
  );
}
