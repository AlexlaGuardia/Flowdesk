"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { Contract } from "@/lib/types";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => { api.get<Contract[]>("/contracts").then(setContracts); }, []);

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
        <p className="text-sm text-gray-500 mt-1">{contracts.length} total</p>
      </div>

      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No contracts yet. Contracts are auto-generated when a client accepts a proposal.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {contracts.map((c) => {
            let content: Record<string, unknown> = {};
            try { content = JSON.parse(c.content_json); } catch {}
            return (
              <div key={c.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{(content.title as string) || `Contract #${c.id}`}</p>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Created {new Date(c.created_at).toLocaleDateString()}
                      {c.signed_at && ` · Signed ${new Date(c.signed_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {c.status === "draft" && (
                      <button
                        onClick={async () => {
                          await api.post(`/contracts/${c.id}/send`);
                          api.get<Contract[]>("/contracts").then(setContracts);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700"
                      >
                        Send
                      </button>
                    )}
                    {c.status !== "signed" && c.status !== "voided" && (
                      <button
                        onClick={async () => {
                          await api.post(`/contracts/${c.id}/void`);
                          api.get<Contract[]>("/contracts").then(setContracts);
                        }}
                        className="px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-lg text-red-600 hover:bg-red-50"
                      >
                        Void
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
