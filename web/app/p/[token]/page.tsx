"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface ProposalContent {
  executive_summary?: string;
  scope_of_work?: string[];
  deliverables?: string[];
  pricing_table?: Array<{ item: string; price: string | number }>;
  total_price?: number | string;
  terms?: string;
  timeline_breakdown?: string[];
}

interface ProposalView {
  proposal: {
    id: number;
    status: string;
    content: ProposalContent;
    created_at: string;
  };
  freelancer: { name: string; business_name: string; brand_color: string };
  project: { name: string };
  client: { name: string };
}

export default function PublicProposalPage() {
  const { token } = useParams();
  const [data, setData] = useState<ProposalView | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    api.get<ProposalView>(`/proposals/view/${token}`).then(setData);
  }, [token]);

  const handleAccept = async () => {
    await api.post(`/proposals/view/${token}/accept`);
    setAccepted(true);
  };

  const handleDecline = async () => {
    await api.post(`/proposals/view/${token}/decline`);
    setData((d) => d ? { ...d, proposal: { ...d.proposal, status: "declined" } } : null);
  };

  if (!data) return <div className="min-h-screen flex items-center justify-center"><p className="text-ink-400">Loading...</p></div>;

  const { proposal, freelancer, project } = data;
  const content = proposal.content;
  const color = freelancer.brand_color || "#6366f1";

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${color}20` }}>
            <svg className="w-6 h-6" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-ink-900">Proposal Accepted!</h2>
          <p className="text-sm text-ink-500 mt-2">{freelancer.name || freelancer.business_name} has been notified. They'll send a contract next.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium" style={{ color }}>{freelancer.business_name || freelancer.name}</p>
          <h1 className="text-2xl font-bold text-ink-900 mt-1">Proposal for {project.name}</h1>
          <p className="text-sm text-ink-500 mt-1">Prepared for {data.client.name}</p>
        </div>

        {/* Content */}
        <div className="card p-6 space-y-6">
          {content.executive_summary ? (
            <div>
              <h3 className="section-heading mb-2">Overview</h3>
              <p className="text-sm text-ink-700">{content.executive_summary}</p>
            </div>
          ) : null}

          {content.scope_of_work ? (
            <div>
              <h3 className="section-heading mb-2">Scope of Work</h3>
              <ul className="space-y-1">
                {content.scope_of_work.map((item, i) => (
                  <li key={i} className="text-sm text-ink-700">- {item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {content.deliverables ? (
            <div>
              <h3 className="section-heading mb-2">Deliverables</h3>
              <ul className="space-y-1">
                {content.deliverables.map((item, i) => (
                  <li key={i} className="text-sm text-ink-700">&#10003; {item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {content.pricing_table ? (
            <div>
              <h3 className="section-heading mb-2">Investment</h3>
              <div className="border border-ledger rounded-retro overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-kraft">
                    <tr>
                      <th className="text-left px-4 py-2 text-ink-700 uppercase text-xs tracking-[0.15em] font-semibold">Item</th>
                      <th className="text-right px-4 py-2 text-ink-700 uppercase text-xs tracking-[0.15em] font-semibold">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ledger/50">
                    {content.pricing_table.map((row, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-ink-700">{row.item}</td>
                        <td className="px-4 py-2 text-right font-medium font-mono">{typeof row.price === "number" ? `$${row.price.toLocaleString()}` : row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {content.total_price != null ? (
                <p className="text-right mt-3 text-xl font-bold font-mono text-ink-900">
                  Total: {typeof content.total_price === "number" ? `$${content.total_price.toLocaleString()}` : content.total_price}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Actions */}
        {(proposal.status === "sent" || proposal.status === "viewed") && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAccept}
              className="flex-1 py-3 text-white font-medium rounded-retro transition-colors"
              style={{ backgroundColor: color }}
            >
              Accept Proposal
            </button>
            <button
              onClick={handleDecline}
              className="px-6 py-3 border border-ledger text-ink-700 font-medium rounded-retro hover:bg-parchment"
            >
              Decline
            </button>
          </div>
        )}

        {proposal.status === "accepted" && (
          <div className="mt-6 bg-ledger-green-50 rounded-retro p-4 text-center">
            <p className="text-sm text-ledger-green font-medium">This proposal has been accepted.</p>
          </div>
        )}

        {proposal.status === "declined" && (
          <div className="mt-6 bg-parchment rounded-retro p-4 text-center">
            <p className="text-sm text-ink-500">This proposal has been declined.</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="empty-stamp mx-auto rotate-[-4deg]" style={{ padding: "6px 16px" }}>
            <span className="empty-stamp-text text-[9px]">Stampwerk</span>
          </div>
        </div>
      </div>
    </div>
  );
}
