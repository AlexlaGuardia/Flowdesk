"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";

interface PortalData {
  project: {
    name: string;
    description: string;
    status: string;
    total_amount: number;
    paid_amount: number;
    start_date: string | null;
    due_date: string | null;
  };
  freelancer: { name: string; business_name: string; brand_color: string };
  client: { name: string };
  milestones: Array<{ id: number; name: string; status: string; amount: number; due_date: string | null }>;
  files: Array<{ id: number; filename: string; uploaded_by: string; status: string; feedback: string | null; created_at: string }>;
  invoices: Array<{ invoice_number: string; total: number; status: string; due_date: string; share_token: string }>;
}

export default function ClientPortalPage() {
  const { token } = useParams();
  const [data, setData] = useState<PortalData | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<PortalData>(`/portal/${token}`).then(setData);
  }, [token]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    await fetch(`/api/portal/${token}/upload`, { method: "POST", body: formData });
    setUploading(false);
    api.get<PortalData>(`/portal/${token}`).then(setData);
  };

  if (!data) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>;

  const color = data.freelancer.brand_color || "#6366f1";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium" style={{ color }}>{data.freelancer.business_name || data.freelancer.name}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{data.project.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome, {data.client.name}</p>
        </div>

        {/* Project overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <StatusBadge status={data.project.status} />
            {data.project.due_date && (
              <p className="text-xs text-gray-400">Due {new Date(data.project.due_date).toLocaleDateString()}</p>
            )}
          </div>
          {data.project.description && (
            <p className="text-sm text-gray-600">{data.project.description}</p>
          )}
          {data.project.total_amount > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Payment Progress</span>
                <span className="font-medium text-gray-900">
                  ${data.project.paid_amount.toFixed(2)} / ${data.project.total_amount.toFixed(2)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (data.project.paid_amount / data.project.total_amount) * 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Milestones */}
        {data.milestones.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Milestones</h3>
            <div className="space-y-2">
              {data.milestones.map((ms) => (
                <div key={ms.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      ms.status === "completed" || ms.status === "invoiced" ? "bg-green-500 border-green-500" : "border-gray-300"
                    }`} />
                    <span className="text-sm text-gray-700">{ms.name}</span>
                  </div>
                  {ms.amount > 0 && <span className="text-xs text-gray-500">${ms.amount.toFixed(2)}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Files</h3>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="text-xs font-medium rounded-lg px-3 py-1.5 text-white"
              style={{ backgroundColor: color }}
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
          </div>
          {data.files.length === 0 ? (
            <p className="text-sm text-gray-400">No files yet.</p>
          ) : (
            <div className="space-y-2">
              {data.files.map((f) => (
                <div key={f.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm text-gray-700">{f.filename}</p>
                    <p className="text-xs text-gray-400">{f.uploaded_by} · {new Date(f.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={f.status} />
                    {f.feedback && <span className="text-xs text-gray-500" title={f.feedback}>&#128172;</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoices */}
        {data.invoices.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Invoices</h3>
            <div className="space-y-2">
              {data.invoices.map((inv) => (
                <a
                  key={inv.invoice_number}
                  href={`/i/${inv.share_token}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{inv.invoice_number}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <span className="text-sm font-bold text-gray-900">${inv.total.toFixed(2)}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-gray-300">Powered by FlowDesk</p>
      </div>
    </div>
  );
}
