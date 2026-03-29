"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { Proposal } from "@/lib/types";

export default function ProposalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  interface ProposalContent {
    executive_summary?: string;
    scope_of_work?: string[];
    deliverables?: string[];
    pricing_table?: Array<{ item: string; price: string | number }>;
    total_price?: number | string;
    terms?: string;
    timeline_breakdown?: string[];
  }
  const [content, setContent] = useState<ProposalContent | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get<Proposal>(`/proposals/${id}`).then((p) => {
      setProposal(p);
      try { setContent(JSON.parse(p.content_json)); } catch { setContent(null); }
    });
  }, [id]);

  const handleSend = async () => {
    setSending(true);
    try {
      await api.post(`/proposals/${id}/send`);
      api.get<Proposal>(`/proposals/${id}`).then(setProposal);
    } finally {
      setSending(false);
    }
  };

  const handleRegenerate = async () => {
    await api.post(`/proposals/${id}/regenerate`);
    const p = await api.get<Proposal>(`/proposals/${id}`);
    setProposal(p);
    try { setContent(JSON.parse(p.content_json)); } catch { setContent(null); }
  };

  if (!proposal) return <Shell><p className="text-ink-400">Loading...</p></Shell>;

  return (
    <Shell>
      <button onClick={() => router.back()} className="text-sm text-ink-400 hover:text-ink-700 mb-4 block">
        &larr; Back
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="page-title">Proposal v{proposal.version}</h1>
            <StatusBadge status={proposal.status} />
          </div>
          <p className="text-sm text-ink-500 mt-1">
            For {proposal.client_name} · {proposal.project_type}
          </p>
        </div>
        <div className="flex gap-2">
          {proposal.status === "draft" && (
            <>
              <button onClick={handleRegenerate} className="px-3 py-1.5 card text-xs font-medium text-ink-700 hover:bg-kraft">
                Regenerate
              </button>
              <button
                onClick={handleSend} disabled={sending}
                className="btn-primary px-3 py-1.5 text-xs disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send to Client"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Proposal content */}
      {content ? (
        <div className="card p-6 space-y-6">
          {content.executive_summary ? (
            <div>
              <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-[0.15em] mb-2">Executive Summary</h3>
              <p className="text-sm text-ink-700">{content.executive_summary}</p>
            </div>
          ) : null}

          {content.scope_of_work ? (
            <div>
              <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-[0.15em] mb-2">Scope of Work</h3>
              <ul className="space-y-1">
                {content.scope_of_work.map((item, i) => (
                  <li key={i} className="text-sm text-ink-700 flex gap-2">
                    <span className="text-stamp-600 mt-0.5">-</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {content.deliverables ? (
            <div>
              <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-[0.15em] mb-2">Deliverables</h3>
              <ul className="space-y-1">
                {content.deliverables.map((item, i) => (
                  <li key={i} className="text-sm text-ink-700 flex gap-2">
                    <span className="text-ledger-green mt-0.5">&#10003;</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {content.pricing_table ? (
            <div>
              <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-[0.15em] mb-2">Pricing</h3>
              <div className="border border-ledger rounded-retro overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-kraft">
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold text-ink-700 uppercase text-xs tracking-[0.15em]">Item</th>
                      <th className="text-right px-4 py-2 font-semibold text-ink-700 uppercase text-xs tracking-[0.15em]">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ledger/50">
                    {content.pricing_table.map((row, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-ink-700">{row.item}</td>
                        <td className="px-4 py-2 text-right font-mono text-ink-900 font-medium">
                          {typeof row.price === "number" ? `$${row.price.toLocaleString()}` : row.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {content.total_price != null ? (
                <p className="text-right mt-2 text-lg font-bold font-mono text-ink-900">
                  Total: {typeof content.total_price === "number" ? `$${content.total_price.toLocaleString()}` : content.total_price}
                </p>
              ) : null}
            </div>
          ) : null}

          {content.terms ? (
            <div>
              <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-[0.15em] mb-2">Terms</h3>
              <p className="text-sm text-ink-700">{content.terms}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Share info */}
      {proposal.status !== "draft" && proposal.share_token && (
        <div className="mt-4 bg-parchment rounded-retro border border-ledger p-4">
          <p className="text-xs text-ink-400 mb-1">Share link (sent to client)</p>
          <code className="text-xs text-ink-700 break-all">/p/{proposal.share_token}</code>
        </div>
      )}
    </Shell>
  );
}
