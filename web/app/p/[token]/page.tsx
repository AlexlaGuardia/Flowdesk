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

  if (!data) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>;

  const { proposal, freelancer, project } = data;
  const content = proposal.content;
  const color = freelancer.brand_color || "#6366f1";

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${color}20` }}>
            <svg className="w-6 h-6" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Proposal Accepted!</h2>
          <p className="text-sm text-gray-500 mt-2">{freelancer.name || freelancer.business_name} has been notified. They'll send a contract next.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium" style={{ color }}>{freelancer.business_name || freelancer.name}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Proposal for {project.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Prepared for {data.client.name}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {content.executive_summary ? (
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Overview</h3>
              <p className="text-sm text-gray-700">{content.executive_summary}</p>
            </div>
          ) : null}

          {content.scope_of_work ? (
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Scope of Work</h3>
              <ul className="space-y-1">
                {content.scope_of_work.map((item, i) => (
                  <li key={i} className="text-sm text-gray-700">- {item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {content.deliverables ? (
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Deliverables</h3>
              <ul className="space-y-1">
                {content.deliverables.map((item, i) => (
                  <li key={i} className="text-sm text-gray-700">&#10003; {item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {content.pricing_table ? (
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Investment</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Item</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {content.pricing_table.map((row, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-gray-700">{row.item}</td>
                        <td className="px-4 py-2 text-right font-medium">{typeof row.price === "number" ? `$${row.price.toLocaleString()}` : row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {content.total_price != null ? (
                <p className="text-right mt-3 text-xl font-bold text-gray-900">
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
              className="flex-1 py-3 text-white font-medium rounded-lg transition-colors"
              style={{ backgroundColor: color }}
            >
              Accept Proposal
            </button>
            <button
              onClick={handleDecline}
              className="px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50"
            >
              Decline
            </button>
          </div>
        )}

        {proposal.status === "accepted" && (
          <div className="mt-6 bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700 font-medium">This proposal has been accepted.</p>
          </div>
        )}

        {proposal.status === "declined" && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">This proposal has been declined.</p>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-gray-300">Powered by FlowDesk</p>
      </div>
    </div>
  );
}
