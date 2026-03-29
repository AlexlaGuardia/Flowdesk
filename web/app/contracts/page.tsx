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
        <h1 className="page-title">Contracts</h1>
        <p className="text-sm text-ink-500 mt-1">{contracts.length} total</p>
      </div>

      {contracts.length === 0 ? (
        <div className="empty-stamp">
          <p className="empty-stamp-text">No contracts yet. Contracts are auto-generated when a client accepts a proposal.</p>
        </div>
      ) : (
        <div className="card divide-y divide-ledger/50">
          {contracts.map((c) => {
            let content: Record<string, unknown> = {};
            try { content = JSON.parse(c.content_json); } catch {}
            return (
              <div key={c.id} className="p-4 hover:bg-kraft">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink-900">{(content.title as string) || `Contract #${c.id}`}</p>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm text-ink-500 mt-0.5">
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
                        className="btn-primary px-3 py-1.5 text-xs"
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
                        className="px-3 py-1.5 card text-xs font-medium text-void-red hover:bg-kraft"
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
