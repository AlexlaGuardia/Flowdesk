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

  if (!data) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>;

  const { contract, freelancer } = data;
  const content = contract.content;
  const color = freelancer.brand_color || "#6366f1";

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${color}20` }}>
            <svg className="w-6 h-6" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Contract Signed!</h2>
          <p className="text-sm text-gray-500 mt-2">Your signature has been recorded. {freelancer.name} will be in touch.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <p className="text-sm font-medium" style={{ color }}>{freelancer.business_name || freelancer.name}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{(content.title as string) || "Service Agreement"}</h1>
          <p className="text-sm text-gray-500 mt-1">{(content.date as string) || ""}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {Array.isArray(content.scope_of_work) && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Scope of Work</h3>
              <ul className="space-y-1">
                {(content.scope_of_work as string[]).map((item, i) => (
                  <li key={i} className="text-sm text-gray-700">- {item}</li>
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
                    <h3 className="text-sm font-medium text-gray-700 capitalize">{key.replace(/_/g, " ")}</h3>
                    <p className="text-sm text-gray-600 mt-1">{String(val)}</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {(contract.status === "sent" || contract.status === "viewed") && (
          <div className="mt-6">
            <div className="bg-amber-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-700">
                By clicking "Sign Contract" below, you agree to the terms outlined in this agreement.
                Your IP address and timestamp will be recorded as your electronic signature.
              </p>
            </div>
            <button
              onClick={handleSign}
              className="w-full py-3 text-white font-medium rounded-lg transition-colors"
              style={{ backgroundColor: color }}
            >
              Sign Contract
            </button>
          </div>
        )}

        {contract.status === "signed" && (
          <div className="mt-6 bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700 font-medium">
              Signed by {contract.signer_name} on {contract.signed_at ? new Date(contract.signed_at).toLocaleDateString() : ""}
            </p>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-gray-300">Powered by FlowDesk</p>
      </div>
    </div>
  );
}
