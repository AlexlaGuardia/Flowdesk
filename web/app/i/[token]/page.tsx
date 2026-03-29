"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface InvoiceView {
  invoice_number: string;
  total: number;
  subtotal: number;
  status: string;
  due_date: string;
  stripe_checkout_session: string | null;
  items: Array<{ description: string; quantity: number; unit_price: number; amount: number }>;
  freelancer: { name: string; business_name: string; brand_color: string };
  project: { name: string };
}

export default function PublicInvoicePage() {
  const { token } = useParams();
  const [data, setData] = useState<InvoiceView | null>(null);

  useEffect(() => {
    api.get<InvoiceView>(`/invoices/view/${token}`).then(setData);
  }, [token]);

  if (!data) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>;

  const color = data.freelancer.brand_color || "#6366f1";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <p className="text-sm font-medium" style={{ color }}>{data.freelancer.business_name || data.freelancer.name}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Invoice {data.invoice_number}</h1>
          <p className="text-sm text-gray-500 mt-1">Due {new Date(data.due_date).toLocaleDateString()}</p>
        </div>

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
              {data.items?.map((item, i) => (
                <tr key={i}>
                  <td className="px-5 py-3 text-gray-700">{item.description}</td>
                  <td className="px-5 py-3 text-right text-gray-600">{item.quantity}</td>
                  <td className="px-5 py-3 text-right text-gray-600">${item.unit_price.toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-gray-900 font-medium">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={3} className="px-5 py-3 text-right font-medium text-gray-700">Total Due</td>
                <td className="px-5 py-3 text-right text-xl font-bold text-gray-900">${data.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {data.status === "paid" ? (
          <div className="mt-6 bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700 font-medium">This invoice has been paid. Thank you!</p>
          </div>
        ) : data.stripe_checkout_session ? (
          <div className="mt-6">
            <a
              href={data.stripe_checkout_session}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 text-center text-white font-medium rounded-lg transition-colors"
              style={{ backgroundColor: color }}
            >
              Pay Now — ${data.total.toFixed(2)}
            </a>
          </div>
        ) : (
          <div className="mt-6 bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Payment link will be available when the invoice is sent.</p>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-gray-300">Powered by FlowDesk</p>
      </div>
    </div>
  );
}
