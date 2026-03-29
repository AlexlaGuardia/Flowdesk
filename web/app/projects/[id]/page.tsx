"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { Project } from "@/lib/types";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [msForm, setMsForm] = useState({ name: "", amount: "", due_date: "" });
  const [showMsForm, setShowMsForm] = useState(false);

  const load = () => api.get<Project>(`/projects/${id}`).then(setProject);
  useEffect(() => { load(); }, [id]);

  const addMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(`/projects/${id}/milestones`, {
      name: msForm.name,
      amount: msForm.amount ? Number(msForm.amount) : 0,
      due_date: msForm.due_date || null,
    });
    setMsForm({ name: "", amount: "", due_date: "" });
    setShowMsForm(false);
    load();
  };

  const completeMilestone = async (msId: number) => {
    await api.patch(`/projects/${id}/milestones/${msId}`, { status: "completed" });
    load();
  };

  if (!project) return <Shell><p className="text-gray-400">Loading...</p></Shell>;

  return (
    <Shell>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => router.push("/projects")} className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">
            &larr; Projects
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {project.client?.name}{project.due_date ? ` · Due ${new Date(project.due_date).toLocaleDateString()}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">${project.total_amount.toFixed(2)}</p>
          <p className="text-sm text-green-600">${project.paid_amount.toFixed(2)} paid</p>
        </div>
      </div>

      {project.description && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <p className="text-sm text-gray-600">{project.description}</p>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => router.push(`/proposals/new?project=${id}&client=${project.client_id}`)}
          className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700"
        >
          Generate Proposal
        </button>
        <button
          onClick={() => router.push(`/invoices?project_id=${id}`)}
          className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium rounded-lg text-gray-700 hover:bg-gray-50"
        >
          View Invoices
        </button>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">Milestones</h3>
          <button onClick={() => setShowMsForm(!showMsForm)} className="text-xs text-indigo-600 hover:text-indigo-700">
            + Add
          </button>
        </div>

        {showMsForm && (
          <form onSubmit={addMilestone} className="flex gap-2 mb-4">
            <input
              type="text" required placeholder="Milestone name" value={msForm.name}
              onChange={(e) => setMsForm({ ...msForm, name: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number" step="0.01" placeholder="Amount" value={msForm.amount}
              onChange={(e) => setMsForm({ ...msForm, amount: e.target.value })}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="date" value={msForm.due_date}
              onChange={(e) => setMsForm({ ...msForm, due_date: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Add</button>
          </form>
        )}

        {project.milestones.length === 0 ? (
          <p className="text-sm text-gray-400">No milestones yet.</p>
        ) : (
          <div className="space-y-2">
            {project.milestones.map((ms) => (
              <div key={ms.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => ms.status === "pending" || ms.status === "in_progress" ? completeMilestone(ms.id) : null}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      ms.status === "completed" || ms.status === "invoiced"
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 hover:border-indigo-400"
                    }`}
                  >
                    {(ms.status === "completed" || ms.status === "invoiced") && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div>
                    <p className={`text-sm font-medium ${ms.status === "completed" || ms.status === "invoiced" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                      {ms.name}
                    </p>
                    {ms.due_date && <p className="text-xs text-gray-400">{new Date(ms.due_date).toLocaleDateString()}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {ms.amount > 0 && <span className="text-sm text-gray-600">${ms.amount.toFixed(2)}</span>}
                  <StatusBadge status={ms.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
