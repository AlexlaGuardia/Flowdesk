"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface ContractView {
  contract: {
    id: number;
    status: string;
    content: Record<string, unknown>;
    signed_at: string | null;
    signer_name: string | null;
    created_at: string;
  };
  freelancer: { name: string; business_name: string; brand_color: string };
  project: { name: string };
  client: { name: string; email: string };
}

export default function PublicContractPage() {
  const { token } = useParams();
  const [data, setData] = useState<ContractView | null>(null);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    api.get<ContractView>(`/contracts/view/${token}`).then(setData);
  }, [token]);

  const handleSign = async () => {
    await api.post(`/contracts/view/${token}/sign`);
    setSigned(true);
  };

  if (!data) return <div className="min-h-screen flex items-center justify-center"><p className="text-ink-400">Loading...</p></div>;

  const { contract, freelancer } = data;
  const content = contract.content;
  const color = freelancer.brand_color || "#6366f1";

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${color}20` }}>
            <svg className="w-6 h-6" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-ink-900">Contract Signed!</h2>
          <p className="text-sm text-ink-500 mt-2">Your signature has been recorded. {freelancer.name} will be in touch.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="mb-8 pb-6 border-b border-gray-200">
          <p className="text-sm font-semibold tracking-wide" style={{ color }}>{freelancer.business_name || freelancer.name}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{(content.title as string) || "Service Agreement"}</h1>
          <p className="text-sm text-gray-500 mt-1">{(content.date as string) || ""}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-6">
          {Array.isArray(content.scope_of_work) && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Scope of Work</h3>
              <ul className="space-y-1.5">
                {(content.scope_of_work as string[]).map((item, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-gray-400">-</span> {item}</li>
                ))}
              </ul>
            </div>
          )}

          {(() => {
            const clauses = content.clauses;
            if (!clauses || typeof clauses !== "object" || Array.isArray(clauses)) return null;
            return (
              <div className="space-y-4">
                {Object.entries(clauses as Record<string, string>).map(([key, val]) => (
                  <div key={key}>
                    <h3 className="text-sm font-semibold text-gray-700 capitalize">{key.replace(/_/g, " ")}</h3>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{String(val)}</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {(contract.status === "sent" || contract.status === "viewed") && (
          <div className="mt-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-700">
                By clicking &ldquo;Sign Contract&rdquo; below, you agree to the terms outlined in this agreement.
                Your IP address and timestamp will be recorded as your electronic signature.
              </p>
            </div>
            <button
              onClick={handleSign}
              className="w-full py-3 text-white font-medium rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: color }}
            >
              Sign Contract
            </button>
          </div>
        )}

        {contract.status === "signed" && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700 font-medium">
              Signed by {contract.signer_name} on {contract.signed_at ? new Date(contract.signed_at).toLocaleDateString() : ""}
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <a href="https://stampwerk.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-500 transition-colors">
            Powered by <span className="font-semibold">Stampwerk</span>
          </a>
        </div>
      </div>
    </div>
  );
}
