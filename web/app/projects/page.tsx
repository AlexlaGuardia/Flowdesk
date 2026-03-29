"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { Project, Client } from "@/lib/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", client_id: "", total_amount: "", start_date: "", due_date: "" });

  const loadProjects = () => {
    const params = filter ? { status: filter } : undefined;
    api.get<Project[]>("/projects", params).then(setProjects);
  };

  useEffect(() => { loadProjects(); }, [filter]);
  useEffect(() => { api.get<Client[]>("/clients").then(setClients); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/projects", {
      ...form,
      client_id: Number(form.client_id),
      total_amount: form.total_amount ? Number(form.total_amount) : 0,
    });
    setForm({ name: "", description: "", client_id: "", total_amount: "", start_date: "", due_date: "" });
    setShowForm(false);
    loadProjects();
  };

  const STATUSES = ["", "draft", "proposed", "active", "completed", "archived"];

  return (
    <Shell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="text-sm text-ink-500 mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary px-4 py-2 text-sm"
        >
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-retro text-xs font-medium transition-colors ${
              filter === s ? "bg-stamp-100 text-stamp-700" : "bg-kraft text-ink-700 hover:bg-kraft"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Project name *</label>
              <input
                type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Client *</label>
              <select
                required value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                className="input-field"
              >
                <option value="">Select a client</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Budget</label>
              <input
                type="number" step="0.01" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                placeholder="0.00"
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Due date</label>
              <input
                type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="label-field">Description</label>
            <textarea
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="input-field"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary px-4 py-2 text-sm">
              Create Project
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-ink-500 hover:text-ink-700">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Project list */}
      {projects.length === 0 ? (
        <div className="empty-stamp">
          <p className="empty-stamp-text">No projects yet. Create your first project to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="block card p-4 hover:border-stamp-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink-900">{p.name}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-sm text-ink-500 mt-1">
                    {p.client?.name || "No client"}{p.due_date ? ` · Due ${new Date(p.due_date).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium font-mono text-ink-900">
                    ${p.total_amount?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}
                  </p>
                  {p.paid_amount > 0 && (
                    <p className="text-xs font-mono text-ledger-green">${p.paid_amount.toFixed(2)} paid</p>
                  )}
                </div>
              </div>
              {p.milestones?.length > 0 && (
                <div className="mt-3 flex gap-1">
                  {p.milestones.map((ms) => (
                    <div
                      key={ms.id}
                      className={`h-1.5 flex-1 rounded-full ${
                        ms.status === "completed" || ms.status === "invoiced" ? "bg-ledger-green" :
                        ms.status === "in_progress" ? "bg-carbon" : "bg-ledger/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </Shell>
  );
}
