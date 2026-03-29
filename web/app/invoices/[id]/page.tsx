"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { Invoice } from "@/lib/types";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [sending, setSending] = useState(false);

  const load = () => api.get<Invoice>(`/invoices/${id}`).then(setInvoice);
  useEffect(() => { load(); }, [id]);

  const handleSend = async () => {
    setSending(true);
    try {
      await api.post(`/invoices/${id}/send`);
      load();
    } finally {
      setSending(false);
    }
  };

  const handleMarkPaid = async () => {
    await api.post(`/invoices/${id}/mark-paid`);
    load();
  };

  const handleVoid = async () => {
    if (!confirm("Void this invoice?")) return;
    await api.post(`/invoices/${id}/void`);
    load();
  };

  if (!invoice) return <Shell><p className="text-gray-400">Loading...</p></Shell>;

  return (
    <Shell>
      <button onClick={() => router.push("/invoices")} className="text-sm text-gray-400 hover:text-gray-600 mb-4 block">
        &larr; Invoices
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{invoice.invoice_number}</h1>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {invoice.client?.name} · Due {new Date(invoice.due_date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          {invoice.status === "draft" && (
            <button onClick={handleSend} disabled={sending}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {sending ? "Sending..." : "Send Invoice"}
            </button>
          )}
          {["sent", "overdue", "viewed"].includes(invoice.status) && (
            <button onClick={handleMarkPaid}
              className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700">
              Mark Paid
            </button>
          )}
          {invoice.status !== "paid" && invoice.status !== "void" && (
            <button onClick={handleVoid}
              className="px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-lg text-red-600 hover:bg-red-50">
              Void
            </button>
          )}
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Description</th>
              <th className="text-right px-5 py-3 font-medium text-gray-600">Qty</th>
              <th className="text-right px-5 py-3 font-medium text-gray-600">Rate</th>
              <th className="text-right px-5 py-3 font-medium text-gray-600">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.items?.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3 text-gray-700">{item.description}</td>
                <td className="px-5 py-3 text-right text-gray-600">{item.quantity}</td>
                <td className="px-5 py-3 text-right text-gray-600">${item.unit_price.toFixed(2)}</td>
                <td className="px-5 py-3 text-right text-gray-900 font-medium">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={3} className="px-5 py-3 text-right font-medium text-gray-700">Total</td>
              <td className="px-5 py-3 text-right text-lg font-bold text-gray-900">${invoice.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Follow-up info */}
      {invoice.followup_stage > 0 && (
        <div className="mt-4 bg-amber-50 rounded-lg p-4">
          <p className="text-sm text-amber-700">
            Follow-up stage {invoice.followup_stage}/3 sent
          </p>
        </div>
      )}
    </Shell>
  );
}
