"use client";

import { useState } from "react";
import Shell from "@/components/Shell";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const data = await api.post<{ url: string }>("/billing/checkout", {});
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const data = await api.post<{ url: string }>("/billing/portal", {});
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to open billing portal");
    } finally {
      setLoading(false);
    }
  };

  const isPro = user?.tier === "pro";

  return (
    <Shell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-heading text-xs text-stamp-900 tracking-[0.2em] uppercase">
            Settings
          </h1>
          <p className="font-mono text-xs text-ink-500 mt-1 tracking-wider">
            Account & billing
          </p>
        </div>

        {/* Account Info */}
        <section
          className="rounded-arcade p-5 border-[3px] border-ink-200"
          style={{ background: "#fff", boxShadow: "3px 3px 0 #e5e0d6" }}
        >
          <h2 className="font-heading text-xs text-stamp-700 tracking-[0.2em] uppercase mb-4">
            Account
          </h2>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-ink-500 text-xs uppercase tracking-wider">Name</span>
              <span className="text-stamp-900 text-xs">{user?.name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500 text-xs uppercase tracking-wider">Email</span>
              <span className="text-stamp-900 text-xs">{user?.email || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500 text-xs uppercase tracking-wider">Business</span>
              <span className="text-stamp-900 text-xs">{user?.business_name || "—"}</span>
            </div>
          </div>
        </section>

        {/* Billing */}
        <section
          className="rounded-arcade p-5 border-[3px] border-ink-200"
          style={{ background: "#fff", boxShadow: "3px 3px 0 #e5e0d6" }}
        >
          <h2 className="font-heading text-xs text-stamp-700 tracking-[0.2em] uppercase mb-4">
            Subscription
          </h2>

          {isPro ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span
                  className="inline-block px-3 py-1 rounded-arcade font-heading text-xs tracking-[0.2em] uppercase text-ledger-green border-2 border-ledger-green"
                  style={{ boxShadow: "2px 2px 0 rgba(61,107,79,0.2)" }}
                >
                  Pro
                </span>
                <span className="font-mono text-xs text-stamp-900">$12/month</span>
              </div>
              <p className="font-mono text-xs text-ink-500 tracking-wider">
                Unlimited proposals, contracts, invoices, and follow-ups.
              </p>
              <button
                onClick={handleManage}
                disabled={loading}
                className="font-mono text-xs text-stamp-600 hover:text-stamp-900 uppercase tracking-[0.15em] transition-colors disabled:opacity-50"
              >
                {loading ? "Loading..." : "Manage subscription →"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span
                  className="inline-block px-3 py-1 rounded-arcade font-heading text-xs tracking-[0.2em] uppercase text-ink-500 border-2 border-ink-300"
                >
                  Free
                </span>
              </div>
              <p className="font-mono text-xs text-ink-500 tracking-wider">
                Upgrade to Pro for unlimited proposals, contracts, invoices, and AI follow-ups.
              </p>

              {/* Upgrade card */}
              <div
                className="rounded-arcade p-4 border-2 border-stamp-500"
                style={{ background: "linear-gradient(135deg, #3D1810 0%, #5C2419 100%)" }}
              >
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-heading text-[14px] text-stamp-200">$12</span>
                  <span className="font-mono text-xs text-stamp-500 tracking-wider">/month</span>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {[
                    "Unlimited AI proposals",
                    "Auto-generated contracts",
                    "Smart invoice follow-ups",
                    "Client portal + file sharing",
                    "Stripe payment links",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 font-mono text-xs text-stamp-400 tracking-wider">
                      <span className="text-ledger-green text-xs">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="btn-insert-coin w-full disabled:opacity-50 disabled:animate-none"
                >
                  {loading ? "LOADING..." : "UPGRADE TO PRO"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}
