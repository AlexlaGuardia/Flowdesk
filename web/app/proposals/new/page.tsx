"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Shell from "@/components/Shell";
import { api } from "@/lib/api";
import type { Client, Project } from "@/lib/types";

const STEPS = [
  { key: "client", label: "Client", desc: "Who is this proposal for?" },
  { key: "type", label: "Project Type", desc: "What kind of work?" },
  { key: "scope", label: "Scope", desc: "Describe what you'll deliver" },
  { key: "timeline", label: "Timeline", desc: "When will it be done?" },
  { key: "budget", label: "Budget", desc: "What's the price range?" },
];

export default function NewProposalPage() {
  return <Suspense><NewProposalInner /></Suspense>;
}

function NewProposalInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [form, setForm] = useState({
    project_id: searchParams.get("project") || "",
    client_name: "",
    project_type: "",
    scope_description: "",
    timeline: "",
    budget_range: "",
  });

  useEffect(() => {
    api.get<Client[]>("/clients").then(setClients);
    api.get<Project[]>("/projects").then(setProjects);
  }, []);

  // Auto-fill client name from project
  useEffect(() => {
    if (form.project_id) {
      const p = projects.find((pr) => pr.id === Number(form.project_id));
      if (p?.client) setForm((f) => ({ ...f, client_name: p.client!.name }));
    }
  }, [form.project_id, projects]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.post<{ id: number }>("/proposals/generate", {
        project_id: Number(form.project_id),
        client_name: form.client_name,
        project_type: form.project_type,
        scope_description: form.scope_description,
        timeline: form.timeline,
        budget_range: form.budget_range,
      });
      router.push(`/proposals/${res.id}`);
    } catch {
      setGenerating(false);
    }
  };

  const canNext = () => {
    switch (step) {
      case 0: return form.project_id && form.client_name;
      case 1: return form.project_type;
      case 2: return form.scope_description;
      case 3: return form.timeline;
      case 4: return form.budget_range;
      default: return false;
    }
  };

  return (
    <Shell>
      <button onClick={() => router.back()} className="text-sm text-ink-400 hover:text-ink-700 mb-4 block">
        &larr; Back
      </button>

      <div className="max-w-lg mx-auto">
        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-stamp-600" : "bg-ledger/50"}`}
            />
          ))}
        </div>

        <h1 className="page-title">{STEPS[step].label}</h1>
        <p className="text-sm text-ink-500 mt-1 mb-6">{STEPS[step].desc}</p>

        {/* Step 0: Client */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="label-field">Project</label>
              <select
                value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                className="input-field"
              >
                <option value="">Select a project</option>
                {projects.filter((p) => p.status === "draft" || p.status === "active").map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.client?.name})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Client name</label>
              <input
                type="text" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        )}

        {/* Step 1: Project Type */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {["Web Design", "Branding", "Photography", "Video Production", "Copywriting", "Development", "Social Media", "Other"].map((t) => (
              <button
                key={t}
                onClick={() => setForm({ ...form, project_type: t })}
                className={`p-3 rounded-retro border text-sm font-medium text-left transition-colors ${
                  form.project_type === t
                    ? "border-stamp-600 bg-stamp-50 text-stamp-700"
                    : "border-ledger text-ink-700 hover:border-ledger"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Scope */}
        {step === 2 && (
          <textarea
            value={form.scope_description}
            onChange={(e) => setForm({ ...form, scope_description: e.target.value })}
            rows={5}
            placeholder="Describe the work: deliverables, requirements, any specifics the client needs..."
            className="input-field"
          />
        )}

        {/* Step 3: Timeline */}
        {step === 3 && (
          <div className="grid grid-cols-2 gap-3">
            {["1 week", "2 weeks", "1 month", "2-3 months", "3-6 months", "Ongoing"].map((t) => (
              <button
                key={t}
                onClick={() => setForm({ ...form, timeline: t })}
                className={`p-3 rounded-retro border text-sm font-medium text-left transition-colors ${
                  form.timeline === t
                    ? "border-stamp-600 bg-stamp-50 text-stamp-700"
                    : "border-ledger text-ink-700 hover:border-ledger"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Step 4: Budget */}
        {step === 4 && (
          <div className="grid grid-cols-2 gap-3">
            {["$500-1,000", "$1,000-2,500", "$2,500-5,000", "$5,000-10,000", "$10,000-25,000", "$25,000+"].map((b) => (
              <button
                key={b}
                onClick={() => setForm({ ...form, budget_range: b })}
                className={`p-3 rounded-retro border text-sm font-medium text-left transition-colors ${
                  form.budget_range === b
                    ? "border-stamp-600 bg-stamp-50 text-stamp-700"
                    : "border-ledger text-ink-700 hover:border-ledger"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            className={`px-4 py-2 text-sm text-ink-500 hover:text-ink-700 ${step === 0 ? "invisible" : ""}`}
          >
            Back
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="btn-primary px-6 py-2 text-sm disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!canNext() || generating}
              className="btn-primary px-6 py-2 text-sm disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Proposal"}
            </button>
          )}
        </div>
      </div>
    </Shell>
  );
}
