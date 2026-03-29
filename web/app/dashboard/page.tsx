"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { DashboardStats } from "@/lib/types";

function formatMoney(cents: number): string {
  return `$${cents.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const PIPELINE_STAGES = [
  { label: "Draft", key: "drafts" as const, color: "text-ink-500", bar: "bg-ink-300" },
  { label: "Proposed", key: "proposed" as const, color: "text-carbon", bar: "bg-carbon" },
  { label: "Active", key: "active" as const, color: "text-ledger-green", bar: "bg-ledger-green" },
  { label: "Completed", key: "completed" as const, color: "text-stamp-500", bar: "bg-stamp-500" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.get<DashboardStats>("/projects/stats/overview").then(setStats);
  }, []);

  const totalProjects = stats
    ? stats.projects.drafts + stats.projects.proposed + stats.projects.active + stats.projects.completed
    : 0;

  return (
    <Shell>
      {/* Page header */}
      <div className="mb-8 pb-6 border-b-[3px] border-dashed border-ledger">
        <h1 className="page-title">
          {user?.name ? `HEY, ${user.name.split(" ")[0].toUpperCase()}` : "DASHBOARD"}
        </h1>
        <p className="text-xs text-ink-500 mt-2 font-mono tracking-wider uppercase">
          Here&apos;s what&apos;s happening with your business.
        </p>
      </div>

      {stats && (
        <>
          {/* Top stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Active Projects" value={stats.projects.active} color="brand" />
            <StatCard label="Total Clients" value={stats.client_count} color="gray" />
            <StatCard
              label="Revenue"
              value={formatMoney(stats.invoices.revenue)}
              color="green"
            />
            <StatCard
              label="Outstanding"
              value={formatMoney(stats.invoices.outstanding_amount)}
              sub={`${stats.invoices.outstanding} invoice${stats.invoices.outstanding !== 1 ? "s" : ""}`}
              color={stats.invoices.outstanding > 0 ? "amber" : "gray"}
            />
          </div>

          {/* Quick actions */}
          <div className="mb-2">
            <p className="section-heading mb-3">Quick Actions</p>
          </div>
          <div className="grid md:grid-cols-3 gap-3 mb-8">
            <Link
              href="/proposals/new"
              className="card-interactive flex items-center gap-3 p-4 group"
            >
              <div className="w-9 h-9 bg-stamp-50 rounded-retro flex items-center justify-center flex-shrink-0 border border-stamp-100 group-hover:bg-stamp-100 transition-colors">
                <svg className="w-4 h-4 text-stamp-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-mono text-[10px] font-bold text-ink-800 uppercase tracking-wider">New Proposal</p>
                <p className="text-[10px] text-ink-400 mt-0.5">AI-generated in seconds</p>
              </div>
            </Link>

            <Link
              href="/clients"
              className="card-interactive flex items-center gap-3 p-4 group"
            >
              <div className="w-9 h-9 bg-ledger-green-50 rounded-retro flex items-center justify-center flex-shrink-0 border border-ledger-green/20 group-hover:bg-ledger-green/10 transition-colors">
                <svg className="w-4 h-4 text-ledger-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="font-mono text-[10px] font-bold text-ink-800 uppercase tracking-wider">Add Client</p>
                <p className="text-[10px] text-ink-400 mt-0.5">Start a new relationship</p>
              </div>
            </Link>

            <Link
              href="/invoices"
              className="card-interactive flex items-center gap-3 p-4 group"
            >
              <div className="w-9 h-9 bg-manila-50 rounded-retro flex items-center justify-center flex-shrink-0 border border-manila/20 group-hover:bg-manila/10 transition-colors">
                <svg className="w-4 h-4 text-manila" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
              <div>
                <p className="font-mono text-[10px] font-bold text-ink-800 uppercase tracking-wider">Create Invoice</p>
                <p className="text-[10px] text-ink-400 mt-0.5">Get paid faster</p>
              </div>
            </Link>
          </div>

          {/* Project pipeline */}
          <div className="card p-5">
            <h3 className="section-heading mb-5">Project Pipeline</h3>
            <div className="grid grid-cols-4 gap-3">
              {PIPELINE_STAGES.map((stage) => {
                const val = stats.projects[stage.key];
                const pct = totalProjects > 0 ? Math.round((val / totalProjects) * 100) : 0;
                return (
                  <div key={stage.label} className="text-center">
                    <p className={`text-2xl font-bold font-mono ${stage.color}`}>{val}</p>
                    <p className="font-mono text-[8px] text-ink-400 uppercase tracking-[0.15em] mt-1">{stage.label}</p>
                    {/* Mini progress bar */}
                    <div className="mt-2 h-1 bg-ledger/40 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stage.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </Shell>
  );
}
