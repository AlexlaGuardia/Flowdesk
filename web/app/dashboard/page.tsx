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

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.get<DashboardStats>("/projects/stats/overview").then(setStats);
  }, []);

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.name ? `Hey, ${user.name.split(" ")[0]}` : "Dashboard"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening with your business.</p>
      </div>

      {stats && (
        <>
          {/* Top stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Active Projects" value={stats.projects.active} color="indigo" />
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
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Link
              href="/proposals/new"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">New Proposal</p>
                <p className="text-xs text-gray-400">AI-generated in seconds</p>
              </div>
            </Link>

            <Link
              href="/clients"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Add Client</p>
                <p className="text-xs text-gray-400">Start a new relationship</p>
              </div>
            </Link>

            <Link
              href="/invoices"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Create Invoice</p>
                <p className="text-xs text-gray-400">Get paid faster</p>
              </div>
            </Link>
          </div>

          {/* Project breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Project Pipeline</h3>
            <div className="flex gap-6 text-center">
              {[
                { label: "Draft", value: stats.projects.drafts, color: "text-gray-500" },
                { label: "Proposed", value: stats.projects.proposed, color: "text-blue-600" },
                { label: "Active", value: stats.projects.active, color: "text-green-600" },
                { label: "Completed", value: stats.projects.completed, color: "text-indigo-600" },
              ].map((s) => (
                <div key={s.label}>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Shell>
  );
}
